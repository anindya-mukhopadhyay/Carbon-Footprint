import { GoogleGenAI } from "@google/genai";
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
    const ai = new GoogleGenAI({
      vertexai: true,
      project: env.VERTEX_PROJECT_ID,
      location: env.VERTEX_LOCATION
    });
    const response = await ai.models.generateContent({
      model: env.VERTEX_MODEL,
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
      config: {
        responseMimeType: "application/json",
        temperature: 0.35,
        maxOutputTokens: 2000
      }
    });

    const textResponse = response.candidates?.[0];
    let text = textResponse?.content?.parts?.[0]?.text;
    if (!text) return fallbackCoach(input);

    text = text.trim();
    if (text.startsWith("```")) {
      const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(text);
      if (match && match[1]) {
        text = match[1].trim();
      }
    }

    try {
      return JSON.parse(text) as CoachResult;
    } catch (parseError) {
      console.error("Failed to parse response text as JSON:", text);
      throw parseError;
    }
  } catch (error) {
    console.error("Google Gen AI coach failed, falling back:", error);
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
