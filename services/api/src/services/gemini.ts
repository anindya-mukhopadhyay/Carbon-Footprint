import { VertexAI } from "@google-cloud/vertexai";
import { env } from "../config/env.js";

type CoachInput = {
  message: string;
  locale: string;
  context: { monthlyKg?: number };
};

type CoachResult = {
  answer: string;
  actions: string[];
  estimatedAnnualSavingsKg: number;
};

export async function generateCoachResponse(input: CoachInput): Promise<CoachResult> {
  if (!env.VERTEX_PROJECT_ID) return fallbackCoach(input);

  try {
    const vertex = new VertexAI({
      project: env.VERTEX_PROJECT_ID,
      location: env.VERTEX_LOCATION
    });
    const model = vertex.getGenerativeModel({ model: env.VERTEX_MODEL });
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are EcoTrack AI, a concise sustainability coach. Give practical, non-judgmental,
science-aware advice. Never invent precision. User monthly footprint: ${input.context.monthlyKg ?? "unknown"}
kg CO2e. Locale: ${input.locale}. Question: ${input.message}

Return JSON only:
{"answer":"2-3 sentences","actions":["action 1","action 2","action 3"],"estimatedAnnualSavingsKg":number}`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.35,
        maxOutputTokens: 500
      }
    });

    const text = response.response.candidates?.[0]?.content.parts[0]?.text;
    if (!text) return fallbackCoach(input);
    return JSON.parse(text) as CoachResult;
  } catch (error) {
    console.error("Vertex AI coach failed, falling back:", error);
    return fallbackCoach(input);
  }
}

function fallbackCoach(input: CoachInput): CoachResult {
  return {
    answer: `Start with one repeatable change connected to "${input.message}". Replacing three short car trips each week with transit or active travel is a realistic first step and makes progress easy to measure.`,
    actions: [
      "Choose one predictable weekly trip",
      "Plan the lower-carbon route in advance",
      "Track the change for four weeks"
    ],
    estimatedAnnualSavingsKg: 310
  };
}
