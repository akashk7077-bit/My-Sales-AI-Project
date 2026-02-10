import { GoogleGenAI, Schema } from "@google/genai";
import { AnalysisData, Persona, ObjectionTemplate } from "../types";

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const SYSTEM_INSTRUCTION = `
You are an elite Sales Call Auditor AI built for Sales Team Leads and Revenue Heads.
You analyze sales calls with extreme precision.
You NEVER hallucinate.
If data is missing, you clearly say: "Insufficient evidence from call."

STRICT RULES:
1. Do NOT assume intent, budget, or interest unless explicitly stated in the call.
2. Base every insight strictly on spoken evidence.
3. Quote exact phrases from the call wherever possible.
4. Separate facts from interpretation clearly.

Your output must be a valid JSON object matching the requested schema.
`;

export const analyzeAudio = async (
  file: File,
  personas: Persona[],
  objectionTemplates: ObjectionTemplate[]
): Promise<AnalysisData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Audio = await blobToBase64(file);

  const ANALYSIS_PROMPT = `
Analyze the attached sales call recording.
Generate a structured report based on the following steps:

CONTEXT - KNOWLEDGE BASE:
Use the following defined Personas to identify the prospect if applicable:
${JSON.stringify(personas)}

Use the following Objection Handling Library to suggest ideal responses if specific objections are detected:
${JSON.stringify(objectionTemplates)}

STEP 1: TRANSCRIPTION
- Transcribe the full call. Label speakers as SALES_REP or PROSPECT.

STEP 2: CALL CONTEXT EXTRACTION
- Identify purpose, product, price, prospect role, and authority signals.
- **MATCHED PERSONA**: Based on the prospect's role, industry, and pain points, identify which defined Persona they match best. If none, state "Unknown".

STEP 3: SALES FRAMEWORK ANALYSIS
- Analyze Discovery Quality, Objection Handling, Value Communication, and Control & Flow.
- **OBJECTIONS**: For each objection, check if it matches a trigger in the Objection Library. If yes, populate the 'suggestedLibraryResponse' field with the library's response.

STEP 4: SCORING (0-10)
- Score the call on Discovery, Objections, Value, Closing, and Overall.

STEP 5: DEAL HEALTH
- Classify as HOT, WARM, COLD, or UNQUALIFIED.

STEP 6: COACHING INSIGHTS
- What went right? What went wrong?
- Rewrite 2-3 lines of what should have been said.
- Identify one killer follow-up question missed.

STEP 7: MANAGER SUMMARY
- 6-8 bullet points for an executive summary.

RETURN ONLY JSON.
`;

  // We use gemini-3-pro-preview for high reasoning capabilities on complex sales analysis
  const modelId = "gemini-3-pro-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Audio,
              },
            },
            {
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // We define a schema to ensure the UI can render it safely
        responseSchema: {
            type: "OBJECT",
            properties: {
                transcription: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            speaker: { type: "STRING", enum: ["SALES_REP", "PROSPECT"] },
                            text: { type: "STRING" }
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
                        authoritySignals: { type: "STRING" },
                        matchedPersona: { type: "STRING", description: "The name of the Persona from the provided list that matches the prospect, or 'Unknown'" }
                    }
                },
                framework: {
                    type: "OBJECT",
                    properties: {
                        discovery: {
                            type: "OBJECT",
                            properties: {
                                painPointsIdentified: { type: "BOOLEAN" },
                                openEndedQuestions: { type: "BOOLEAN" },
                                businessImpactDiscussed: { type: "BOOLEAN" },
                                summary: { type: "STRING" }
                            }
                        },
                        objections: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    type: { type: "STRING" },
                                    quote: { type: "STRING" },
                                    responseQuality: { type: "STRING", enum: ["Strong", "Average", "Weak"] },
                                    missedOpportunity: { type: "STRING" },
                                    suggestedLibraryResponse: { type: "STRING", description: "The ideal response from the Objection Library if a match was found." }
                                }
                            }
                        },
                        value: {
                            type: "OBJECT",
                            properties: {
                                benefitsVsFeatures: { type: "STRING" },
                                outcomesDiscussed: { type: "STRING" },
                                emotionalTriggers: { type: "ARRAY", items: { type: "STRING" } }
                            }
                        },
                        control: {
                            type: "OBJECT",
                            properties: {
                                talkTimeRatio: { type: "STRING" },
                                leadOrReact: { type: "STRING" },
                                interruptions: { type: "STRING" }
                            }
                        }
                    }
                },
                scores: {
                    type: "OBJECT",
                    properties: {
                        discovery: { type: "NUMBER" },
                        objectionHandling: { type: "NUMBER" },
                        valueArticulation: { type: "NUMBER" },
                        closingReadiness: { type: "NUMBER" },
                        overall: { type: "NUMBER" },
                        justification: { type: "STRING" }
                    }
                },
                dealHealth: {
                    type: "OBJECT",
                    properties: {
                        status: { type: "STRING", enum: ["HOT", "WARM", "COLD", "UNQUALIFIED"] },
                        reason: { type: "STRING" }
                    }
                },
                coaching: {
                    type: "OBJECT",
                    properties: {
                        right: { type: "ARRAY", items: { type: "STRING" } },
                        wrong: { type: "ARRAY", items: { type: "STRING" } },
                        rewrite: { type: "STRING" },
                        missedQuestion: { type: "STRING" }
                    }
                },
                managerSummary: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                }
            }
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisData;

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};
