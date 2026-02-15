
import { GoogleGenAI } from "@google/genai";
import { AnalysisData, Persona, ObjectionTemplate } from "../types";

// Constants
const CHUNK_SIZE_MB = 10; // Reduced chunk size for better stability
const BYTES_PER_MB = 1024 * 1024;
const CHUNK_SIZE = CHUNK_SIZE_MB * BYTES_PER_MB;
const MAX_CONCURRENT_REQUESTS = 3; // Process up to 3 chunks in parallel

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Handle both data URL formats and raw base64
      const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper for retry logic with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> => {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 || 
        error?.status === 'RESOURCE_EXHAUSTED' || 
        (error?.message && error.message.includes('429')) ||
        (error?.message && error.message.includes('quota'));

      if (isRateLimit && i < maxRetries - 1) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded after rate limit handling.");
};

// Helper for concurrent processing
async function processInParallel<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const executing = new Set<Promise<void>>();

  for (const [index, item] of items.entries()) {
    const p = task(item, index).then(result => {
      results[index] = result;
    });

    executing.add(p);
    
    // Clean up finished promises
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

const SYSTEM_INSTRUCTION = `
SYSTEM ROLE:
You are an enterprise-grade Sales Intelligence Engine built for clarity and impact.
You provide evidence-based, transcript-backed revenue analysis.

CORE LANGUAGE RULES (NON-NEGOTIABLE):
1. USE PLAIN, SIMPLE ENGLISH.
2. NO CORPORATE JARGON.
   - Bad: "Revenue leakage due to insufficient discovery."
   - Good: "Deal at risk because customer needs weren't confirmed."
   - Bad: "Lack of value articulation."
   - Good: "Rep didn't explain why the product is worth the price."
3. Be direct, brutal, and concise.

PRIMARY OBJECTIVE:
Generate three different analysis views from the SAME transcript:
1. REP VIEW (Performance & Skill Improvement)
2. MANAGER VIEW (Coaching & Risk)
3. SENIOR MANAGEMENT VIEW (Strategic Revenue)

Each view must interpret the same data through a different business lens.

GLOBAL RULES:
- Every claim must reference transcript evidence.
- If evidence is weak → state uncertainty clearly.
- Do NOT estimate revenue impact unless logic is explainable.
- Scores are 0-100 (50 is average, <30 is fail, >90 is elite).

====================================================
NAME EXTRACTION RULES (CRITICAL)
====================================================

Step 1:
Scan transcript for explicit self-introduction such as:
- “Hi, this is [Name]”
- “This is [Name] from…”
- “My name is [Name]”
- "Speaking" (after being addressed by name)

Step 2:
If name is explicitly stated → use that exact name (First Name Last Name if available, or just First Name).

Step 3:
If name is NOT clearly stated:
Use label: "Sales Representative"

Under NO circumstances:
- Guess the rep’s name based on file name or metadata.
- Fabricate or assume identity.

====================================================
REP VIEW ADDITIONS
====================================================

SECTION F — Best Recommended Sentences (For Immediate Use)
Generate 10 high-impact sales-intelligent sentences tailored to:
- The specific objections raised
- The weaknesses identified
- The call context
- The prospect persona (if known)

Rules:
- Sentences must be practical and usable verbatim.
- Avoid generic phrases.
- Do not invent objections not present.
- If transcript lacks clarity → base sentences on documented weaknesses only.
- If insufficient context → state: “Recommendations limited due to insufficient call depth.”

Format: Array of strings.

SECTION G — Next Call Preparation Plan
Create a structured preparation blueprint:
1. Objective for Next Call (1 sentence)
2. Top 3 Risks to Correct
3. 3 Strategic Questions to Ask Prospect
4. Objection Pre-Handling Strategy
5. Strong Closing Line to Use
6. Confidence Reset Reminder (Behavioral, not motivational)

====================================================
KNOWLEDGE BASE EXPANSION (AUTO-LEARNING)
====================================================

Identify any unique objections raised by the prospect in this call.
Compare them against the "Objection Library" provided in the context.
If the objection is NEW or SIGNIFICANTLY different from existing templates:
1. Categorize it.
2. Extract the exact trigger phrase (what the prospect said).
3. Write an IDEAL response script (what the rep SHOULD have said to win).

If no new objections are found, return an empty array.
`;

const transcribeChunk = async (chunk: Blob, chunkIndex: number, totalChunks: number): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await blobToBase64(chunk);

  return retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: chunk.type || 'audio/mp3', 
                  data: base64Data
                }
              },
              {
                text: `TRANSCRIPTION TASK (Chunk ${chunkIndex + 1}/${totalChunks}):
                Transcribe the audio exactly as spoken. 
                Identify speakers as SALES_REP and PROSPECT. 
                Include timestamps in [MM:SS] format at the start of each line.
                If this is a continuation, maintain the timestamp continuity from previous chunks if context allows, otherwise start relative.
                Format: "[MM:SS] SPEAKER_NAME: [Text]"
                Do not add markdown formatting, just plain text.`
              }
            ]
          }
        ]
      });

      return response.text || "";
  }, 5, 2000); // 5 Retries, starting at 2s delay
};

const transcribeLargeAudio = async (
    file: File, 
    onProgress: (msg: string, progress: number) => void
): Promise<string> => {
  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
  
  console.log(`Starting transcription: ${file.name}, Size: ${totalSize}, Chunks: ${totalChunks}`);

  // Prepare chunks
  const chunks: { index: number; blob: Blob }[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    chunks.push({
      index: i,
      blob: file.slice(start, end, file.type)
    });
  }

  let completedChunks = 0;

  // Process chunks in parallel with concurrency limit
  const chunkTranscripts = await processInParallel(
    chunks, 
    MAX_CONCURRENT_REQUESTS, 
    async (chunkData) => {
      const { index, blob } = chunkData;
      
      try {
        const text = await transcribeChunk(blob, index, totalChunks);
        completedChunks++;
        
        // Calculate progress: Transcription represents 0-70% of the total process
        const percentage = Math.round((completedChunks / totalChunks) * 70);
        onProgress(`Transcribing segment ${completedChunks}/${totalChunks}...`, percentage);
        
        return text;
      } catch (err) {
        console.error(`Error transcribing chunk ${index + 1}`, err);
        return `\n[--- Segment ${index + 1} Failed ---]\n`;
      }
    }
  );

  return chunkTranscripts.join("\n\n");
};

export const analyzeCall = async (
  input: File | string,
  personas: Persona[],
  objectionTemplates: ObjectionTemplate[],
  onProgress?: (status: string, progress: number) => void
): Promise<AnalysisData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let transcriptText = "";

  // 1. UPLOAD & TRANSCRIPTION PHASE (0-70%)
  if (input instanceof File) {
    if (onProgress) onProgress("Initializing audio processing...", 0);
    transcriptText = await transcribeLargeAudio(input, onProgress || (() => {}));
  } else {
    transcriptText = input;
    if (onProgress) onProgress("Processing text input...", 50);
  }

  // 2. ANALYSIS PHASE (70-100%)
  if (onProgress) onProgress("Analyzing conversation patterns...", 75);

  const ANALYSIS_PROMPT = `
    Analyze the following sales call transcript with extreme scrutiny.

    CONTEXT - KNOWLEDGE BASE:
    Personas: ${JSON.stringify(personas)}
    Objection Library: ${JSON.stringify(objectionTemplates)}

    TRANSCRIPT START:
    ${transcriptText}
    TRANSCRIPT END.

    Generate the 3-View Analysis (Rep, Manager, Executive) as defined in the system instructions.
    Extract explicit context (Product, Price, Role, Rep Name) where available.
    Also perform Knowledge Base Expansion to identify NEW objections.
    
    IMPORTANT: Provide the output in strictly defined JSON format.
  `;

  // Schema Definition
  const responseSchema = {
    type: "OBJECT",
    properties: {
      transcription: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            speaker: { type: "STRING", enum: ["SALES_REP", "PROSPECT"] },
            text: { type: "STRING" },
            timestamp: { type: "STRING" }
          }
        }
      },
      context: {
        type: "OBJECT",
        properties: {
          purpose: { type: "STRING" },
          product: { type: "STRING" },
          price: { type: "STRING" },
          prospectRole: { type: "STRING" },
          matchedPersona: { type: "STRING" },
          extractedRepName: { type: "STRING" }
        }
      },
      discoveredObjections: {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: {
                category: { type: "STRING" },
                trigger: { type: "STRING" },
                response: { type: "STRING" }
            }
        }
      },
      repView: {
        type: "OBJECT",
        properties: {
          performanceSnapshot: {
            type: "OBJECT",
            properties: {
              totalScore: { type: "NUMBER" },
              summary: { type: "STRING" },
              strongestSkill: { type: "STRING" },
              damagingMistake: { type: "STRING" }
            }
          },
          skillBreakdown: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                skill: { type: "STRING" },
                score: { type: "NUMBER" },
                evidence: { type: "STRING" },
                reasoning: { type: "STRING" },
                improvement: { type: "STRING" }
              }
            }
          },
          missedOpportunities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                signal: { type: "STRING" },
                quote: { type: "STRING" },
                context: { type: "STRING" }
              }
            }
          },
          callRewrite: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                original: { type: "STRING" },
                better: { type: "STRING" },
                reason: { type: "STRING" }
              }
            }
          },
          bestRecommendedSentences: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          nextCallPreparationPlan: {
            type: "OBJECT",
            properties: {
              objective: { type: "STRING" },
              topRisks: { type: "ARRAY", items: { type: "STRING" } },
              strategicQuestions: { type: "ARRAY", items: { type: "STRING" } },
              objectionStrategy: { type: "STRING" },
              closingLine: { type: "STRING" },
              confidenceReset: { type: "STRING" }
            }
          }
        }
      },
      managerView: {
        type: "OBJECT",
        properties: {
          dealRiskAssessment: {
            type: "OBJECT",
            properties: {
              probability: { type: "NUMBER" },
              riskLevel: { type: "STRING", enum: ["Low", "Medium", "High"] },
              primaryDriver: { type: "STRING" }
            }
          },
          coachingPriority: {
            type: "OBJECT",
            properties: {
              level: { type: "STRING", enum: ["Immediate", "Short-term", "Long-term"] },
              focusArea: { type: "STRING" }
            }
          },
          patternAnalysis: {
            type: "OBJECT",
            properties: {
              issueType: { type: "STRING", enum: ["Skill", "Mindset", "Process"] },
              rootCause: { type: "STRING" }
            }
          },
          revenueRiskSignals: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                flag: { type: "STRING" },
                quote: { type: "STRING" },
                impact: { type: "STRING" }
              }
            }
          },
          coachingPlan: {
            type: "OBJECT",
            properties: {
              drills: { type: "ARRAY", items: { type: "STRING" } },
              roleplay: { type: "STRING" },
              kpi: { type: "STRING" }
            }
          }
        }
      },
      executiveView: {
        type: "OBJECT",
        properties: {
          revenueIntelligence: {
            type: "OBJECT",
            properties: {
              salesEffectivenessScore: { type: "NUMBER" },
              revenueLeakageRisk: { type: "STRING" },
              forecastReliability: { type: "STRING" }
            }
          },
          structuralWeakness: {
            type: "OBJECT",
            properties: {
              diagnosis: { type: "STRING" },
              impact: { type: "STRING" }
            }
          },
          dealImpact: {
            type: "OBJECT",
            properties: {
              revenueExposure: { type: "STRING" },
              reasoning: { type: "STRING" }
            }
          },
          organizationalPattern: {
            type: "OBJECT",
            properties: {
              observation: { type: "STRING" },
              validity: { type: "STRING" }
            }
          },
          executiveAction: {
            type: "OBJECT",
            properties: {
              recommendation: { type: "STRING" },
              rationale: { type: "STRING" }
            }
          }
        }
      }
    }
  };

  const modelId = "gemini-3-pro-preview";

  try {
    // Intermediate step to show progress is moving for the analysis part
    setTimeout(() => {
        if(onProgress) onProgress("Generating insights & coaching plan...", 85);
    }, 2000);

    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: modelId,
            contents: [
                {
                role: "user",
                parts: [{ text: ANALYSIS_PROMPT }],
                },
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
    }, 3, 5000); // 3 Retries for final analysis, starting at 5s delay

    if(onProgress) onProgress("Finalizing report...", 100);

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = JSON.parse(text);

    // Map new fields to legacy fields for backward compatibility with other components
    const mappedData: AnalysisData = {
        ...parsed,
        discoveredObjections: parsed.discoveredObjections || [],
        scores: {
            overall: parsed.repView.performanceSnapshot.totalScore,
            discovery: parsed.repView.skillBreakdown.find((s:any) => s.skill.includes('Discovery'))?.score || 0,
            objectionHandling: parsed.repView.skillBreakdown.find((s:any) => s.skill.includes('Objection'))?.score || 0,
            valueArticulation: parsed.repView.skillBreakdown.find((s:any) => s.skill.includes('Value'))?.score || 0,
            closingReadiness: parsed.repView.skillBreakdown.find((s:any) => s.skill.includes('Closing'))?.score || 0,
            justification: parsed.repView.performanceSnapshot.summary
        },
        dealHealth: {
            status: parsed.managerView.dealRiskAssessment.riskLevel === 'Low' ? 'HOT' : parsed.managerView.dealRiskAssessment.riskLevel === 'Medium' ? 'WARM' : 'COLD',
            reason: parsed.managerView.dealRiskAssessment.primaryDriver,
            probability: parsed.managerView.dealRiskAssessment.probability
        },
        managerSummary: [
            parsed.managerView.patternAnalysis.rootCause,
            `Risk: ${parsed.managerView.dealRiskAssessment.primaryDriver}`,
            `Action: ${parsed.managerView.coachingPriority.focusArea}`
        ],
        coaching: {
            callKillers: [],
            winningLines: [],
            right: [],
            wrong: [],
            rewrite: parsed.repView.callRewrite?.[0]?.better || "No rewrite available",
            missedQuestion: parsed.managerView.coachingPlan.roleplay
        },
        prospectReaction: {
            impressed: [],
            confused: [],
            trustBusters: [],
            acceleration: []
        }
    };

    return mappedData;

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};
