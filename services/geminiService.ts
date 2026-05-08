
import { GoogleGenAI } from "@google/genai";
import { AnalysisData, Persona, ObjectionTemplate } from "../types";

// Constants
const CHUNK_SIZE_MB = 8; // Reduced chunk size for better stability APIs
const BYTES_PER_MB = 1024 * 1024;
const CHUNK_SIZE = CHUNK_SIZE_MB * BYTES_PER_MB;
const MAX_CONCURRENT_REQUESTS = 5; // Process up to 5 chunks in parallel

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
3. Be direct, brutal, and concise.

PRIMARY OBJECTIVE:
Generate detailed analysis views from the SAME transcript:
1. REP VIEW (Performance & Skill Improvement)
2. MANAGER VIEW (Coaching & Risk)

GLOBAL RULES:
- Every claim must reference transcript evidence.
- Scores are 0-100 (50 is average, <30 is fail, >90 is elite).
- MANDATORY: YOU MUST FILL EVERY ARRAY AND OBJECT IN THE JSON SCHEMA. NEVER LEAVE 'missedOpportunities', 'callRewrite', 'revenueRiskSignals', or 'competitorAnalysis' EMPTY. If a competitor is missing, treat the "Status Quo" or "Do Nothing" as the competitor. If no mistakes are obvious, nitpick to find at least two minor missed opportunities and rewrites.

====================================================
MANAGER VIEW DETAILS
====================================================
- dealRiskAssessment: Probability (0-100), risk level (Low, Medium, High), and primary driver.
- coachingPriority: Assess what needs immediate, short-term, or long-term coaching.
- patternAnalysis: Root cause of the issues identified (Skill, Mindset, Process).
- revenueRiskSignals: Extract AT LEAST 2 quotes where the prospect hesitated or risk appeared, and explain the impact.
- coachingPlan: Tactical drills, roleplay scenario, KPI, and training plan.
- competitorAnalysis: ALWAYS return at least 1 item. Identify the competitor or current solution ("Status Quo"). Quote context, summarize rep's response, and rate effectiveness.

====================================================
REP VIEW DETAILS
====================================================
- performanceSnapshot: Overall score, summary, strongest skill, and damaging mistake.
- skillBreakdown: Grade all core skills (Discovery, Objection Handling, Value Articulation, Closing).
- missedOpportunities: Output AT LEAST 2 missed buying signals or places the rep could have dug deeper.
- callRewrite: Output AT LEAST 2 tactical rewrites (what the rep said vs what they should have said).
- bestRecommendedSentences: Generate EXACTLY 5 practical, high-impact sentences the rep should use next time.
- nextCallPreparationPlan: 
   1. Objective
   2. Top Risks
   3. Strategic Questions
   4. Objection Strategy
   5. Strong Closing Line 
   6. Confidence Reset

====================================================
NAME EXTRACTION RULES (CRITICAL)
====================================================
Scan transcript for explicit self-introduction. If clear, use it. If NOT, use "Sales Representative". Do not guess based on metadata. Pay extra attention to name spelling, especially Indian names (e.g. Varshika not Vrshika).

====================================================
KNOWLEDGE BASE EXPANSION (AUTO-LEARNING)
====================================================
Identify unique objections raised by the prospect. Return an array of objects (category, trigger, response). If none, invent the most likely unspoken objection based on context.
`;

const transcribeChunk = async (chunk: Blob, chunkIndex: number, totalChunks: number, fileName: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing for audio transcription");
  
  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await blobToBase64(chunk);
  
  console.log(`Sending chunk ${chunkIndex + 1}/${totalChunks} (Size: ${chunk.size}, File: ${fileName}) to model gemini-2.5-flash`);

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
                text: `TRANSCRIPTION TASK (Chunk ${chunkIndex + 1}/${totalChunks} of file ${fileName}):
                Transcribe the audio exactly as spoken. 
                Identify speakers as SALES_REP and PROSPECT. 
                Include timestamps in [MM:SS] format at the start of each line.
                Format: "[MM:SS] SPEAKER_NAME: [Text]"
                Do not add markdown formatting, just plain text.
                Pay close attention to name pronunciation and spelling (e.g. Varshika instead of Vrshika).`
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
  const MAX_SIZE_FOR_SINGLE_UPLOAD = 25 * 1024 * 1024;
  
  if (file.size < MAX_SIZE_FOR_SINGLE_UPLOAD) {
    console.log(`File is small (${file.size} bytes), uploading as single file.`);
    onProgress("Transcribing audio...", 35);
    return await transcribeChunk(file, 0, 1, file.name);
  }

  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
  
  console.log(`Starting transcription: ${file.name}, Size: ${totalSize}, Chunks: ${totalChunks}`);

  // Prepare chunks
  const chunks: { index: number; blob: Blob }[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunkBlob = file.slice(start, end, file.type);
    console.log(`Chunk ${i}: Size ${chunkBlob.size} bytes, Type: ${chunkBlob.type}, Filename: ${file.name}`);
    chunks.push({
      index: i,
      blob: chunkBlob
    });
  }

  let completedChunks = 0;

  // Process chunks in parallel with concurrency limit (reduced to 2 for stability)
  const chunkTranscripts = await processInParallel(
    chunks, 
    2, 
    async (chunkData) => {
      const { index, blob } = chunkData;
      
      try {
        const text = await transcribeChunk(blob, index, totalChunks, file.name);
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
  const apiKey = process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
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
    
    STRICT CONTEXT EXTRACTION:
    1. Product Pitched: Identify the specific product or service being sold.
    2. Price Point: Extract the exact price or budget mentioned (be precise).
    3. Latest Designation: Identify the prospect's most current role or title mentioned.
    4. Rep Name: Extract as per extraction rules.

    Also perform Knowledge Base Expansion to identify NEW objections.
    
    IMPORTANT: Provide the output in strictly defined JSON format. MUST be valid JSON, with all string values properly escaped.
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
              kpi: { type: "STRING" },
              trainingPlan: { type: "ARRAY", items: { type: "STRING" } }
            }
          },
          competitorAnalysis: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                competitor: { type: "STRING" },
                context: { type: "STRING" },
                repResponse: { type: "STRING" },
                effectiveness: { type: "STRING", enum: ["Effective", "Ineffective", "Neutral"] }
              }
            }
          }
        }
      }
    }
  };

  const modelId = "gemma-4-31b-it";

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
                maxOutputTokens: 8192,
            },
        });
    }, 3, 5000); // 3 Retries for final analysis, starting at 5s delay

    if(onProgress) onProgress("Finalizing report...", 100);

    const text = response.text;
    if (!text) throw new Error("No response from Gemma");

    let cleanText = text.trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    
    const parsed = JSON.parse(cleanText);

    // Map new fields to legacy fields for backward compatibility with other components
    // We use defensive coding to ensure nested objects exist even if LLM returns partial data
    const mv = parsed.managerView || {};
    const rv = parsed.repView || {};
    const perf = rv.performanceSnapshot || {};
    const skills = rv.skillBreakdown || [];
    const risk = mv.dealRiskAssessment || {};
    const patterns = mv.patternAnalysis || {};
    const coaching = mv.coachingPriority || {};

    const mappedData: AnalysisData = {
        ...parsed,
        transcription: parsed.transcription || [],
        discoveredObjections: parsed.discoveredObjections || [],
        managerView: {
            ...mv,
            competitorAnalysis: mv.competitorAnalysis || []
        },
        repView: {
            ...rv,
            skillBreakdown: skills,
            missedOpportunities: rv.missedOpportunities || [],
            callRewrite: rv.callRewrite || [],
            bestRecommendedSentences: rv.bestRecommendedSentences || [],
            nextCallPreparationPlan: rv.nextCallPreparationPlan || {
                objective: "Not specified",
                topRisks: [],
                strategicQuestions: [],
                objectionStrategy: "Not specified",
                closingLine: "Not specified",
                confidenceReset: "Not specified"
            }
        },
        scores: {
            overall: perf.totalScore || 0,
            discovery: skills.find((s:any) => s.skill.includes('Discovery'))?.score || 0,
            objectionHandling: skills.find((s:any) => s.skill.includes('Objection'))?.score || 0,
            valueArticulation: skills.find((s:any) => s.skill.includes('Value'))?.score || 0,
            closingReadiness: skills.find((s:any) => s.skill.includes('Closing'))?.score || 0,
            justification: perf.summary || ""
        },
        dealHealth: {
            status: risk.riskLevel === 'Low' ? 'HOT' : risk.riskLevel === 'Medium' ? 'WARM' : 'COLD',
            reason: risk.primaryDriver || "Insufficient data",
            probability: risk.probability || 0
        },
        managerSummary: [
            patterns.rootCause || "Pattern analysis unavailable",
            `Risk: ${risk.primaryDriver || 'N/A'}`,
            `Action: ${coaching.focusArea || 'N/A'}`
        ],
        coaching: {
            callKillers: [],
            winningLines: [],
            right: [],
            wrong: [],
            rewrite: rv.callRewrite?.[0]?.better || "No rewrite available",
            missedQuestion: mv.coachingPlan?.roleplay || ""
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

export const generateCombinedReview = async (analyses: AnalysisData[]): Promise<AnalysisData> => {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const modelId = process.env.GEMMA_MODEL || "gemma-4-31b-it";

  const payload = analyses.map((a, i) => ({
    callIndex: i + 1,
    scores: a.scores,
    dealHealth: a.dealHealth,
    extractedRepName: a.context?.extractedRepName,
    managerView: a.managerView,
    repView: a.repView
  }));

  const prompt = `You are a Chief Revenue Officer. I have provided JSON data representing the analysis of ${analyses.length} distinct sales calls.
  Please analyze this combined data to spot overarching trends, common weaknesses, and an aggregated deal health summary.

  Input Data:
  ${JSON.stringify(payload, null, 2)}

  Produce your output as a JSON object strictly matching the structure of a single "AnalysisData" object, representing the aggregated insights of all calls combined.
  Return ONLY the JSON. No markdown backticks.

  Required structure (same as analyzeCall output):
  {
      "context": {
          "purpose": "Combined batch analysis of ${analyses.length} calls",
          "product": "Various",
          "price": "Various",
          "prospectRole": "Various"
      },
      "managerView": {
          "dealRisk": { "riskLevel": "High/Medium/Low", "probability": 50, "primaryDriver": "Aggregated primary driver" },
          "structuralPatterns": { "rootCause": "...", "trend": "...", "proof": "..." },
          "coachingPlan": { "focusArea": "...", "roleplay": "..." },
          "competitorAnalysis": []
      },
      "repView": {
          "performance": { "totalScore": 0, "summary": "Aggregated summary..." },
          "skillBreakdown": [ { "skill": "Discovery", "score": 0, "gaps": ["..."], "strengths": ["..."] } ],
          "callRewrite": [ { "original": "-", "better": "...", "reason": "..." } ]
      }
  }
  `;

  return retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI for combined review");

      let cleanText = text.trim();
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanText);
      
      const mv = parsed.managerView || {};
      const rv = parsed.repView || {};
      const perf = rv.performance || { totalScore: 0 };
      const risk = mv.dealRisk || { riskLevel: 'Medium', probability: 0 };
      const skills = rv.skillBreakdown || [];

      // Map to proper AnalysisData shape
      return {
          ...parsed,
          transcription: [], // No single transcription
          repView: rv,
          managerView: mv,
          scores: {
             overall: perf.totalScore || 0,
             discovery: skills.find((s:any) => s.skill.includes('Discovery'))?.score || 0,
             objectionHandling: skills.find((s:any) => s.skill.includes('Objection'))?.score || 0,
             valueArticulation: skills.find((s:any) => s.skill.includes('Value'))?.score || 0,
             closingReadiness: skills.find((s:any) => s.skill.includes('Closing'))?.score || 0,
             justification: perf.summary || ""
          },
          dealHealth: {
             status: risk.riskLevel === 'Low' ? 'HOT' : risk.riskLevel === 'Medium' ? 'WARM' : 'COLD',
             reason: risk.primaryDriver || "Insufficient data",
             probability: risk.probability || 0
          }
      };
  }, 3, 2000);
};

import { ChatMessage } from '../types';

export const askSalesCoach = async (
  transcript: import('../types').TranscriptSegment[],
  chatHistory: ChatMessage[],
  newMessage: string,
  analysisData: AnalysisData,
  personas: Persona[]
): Promise<string> => {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const modelId = process.env.GEMMA_MODEL || "gemma-4-31b-it";

  const formattedTranscript = transcript.map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join("\n");
  
  const systemInstruction = `You are an elite Sales Coach analyzing a specific sales call transcript.
You are chatting with the sales rep who took this call. Your answers should be tactical, actionable, and specific to the transcript.
Be encouraging but direct. Use specific quotes and timestamps from the transcript to ground your advice.

CONTEXT:
Personas: ${JSON.stringify(personas)}
Call Score: ${analysisData.repView?.performanceSnapshot?.totalScore || 0}
Biggest Vulnerability: ${analysisData.repView?.performanceSnapshot?.damagingMistake || 'N/A'}

TRANSCRIPT:
${formattedTranscript}
`;

  const contents: any[] = [
    { role: 'user', parts: [{ text: "Hello! I'm the sales rep. I'd like to ask some questions about this call." }] },
    { role: 'model', parts: [{ text: "Of course! I'm ready to help you analyze this call. What would you like to know?" }] }
  ];

  for (const msg of chatHistory) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  try {
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: modelId,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Coach Chat failed", error);
    throw error;
  }
};

