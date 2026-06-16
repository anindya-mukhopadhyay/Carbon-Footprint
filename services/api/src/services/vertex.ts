import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

type Forecast = {
  months: Array<{ month: string; predictedKg: number; lowerKg: number; upperKg: number }>;
  confidence: number;
  narrative: string;
};

export async function forecastEmissions(history: number[]): Promise<Forecast> {
  if (!env.VERTEX_PROJECT_ID || history.length < 2) return deterministicForecast(history);

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
              text: `Forecast the next 3 monthly carbon emissions from this kg CO2e series:
${history.join(", ")}. Return JSON only with months [{month,predictedKg,lowerKg,upperKg}],
confidence from 0 to 1, and a one-sentence narrative. Do not imply causal certainty.`
            }
          ]
        }
      ],
      config: { responseMimeType: "application/json", temperature: 0.2 }
    });

    const text = response.text;
    return text ? (JSON.parse(text) as Forecast) : deterministicForecast(history);
  } catch (error) {
    console.error("Google Gen AI forecast failed, falling back:", error);
    return deterministicForecast(history);
  }
}

function deterministicForecast(history: number[]): Forecast {
  const last = history.at(-1) ?? 612;
  const previous = history.at(-2) ?? last + 24;
  const delta = Math.max(-60, Math.min(60, last - previous));
  const labels = ["Next month", "Month 2", "Month 3"];

  return {
    months: labels.map((month, index) => {
      const predictedKg = Math.max(0, Math.round(last + delta * (index + 1)));
      return {
        month,
        predictedKg,
        lowerKg: Math.round(predictedKg * 0.89),
        upperKg: Math.round(predictedKg * 1.11)
      };
    }),
    confidence: 0.82,
    narrative: "The recent trend suggests a continued gradual reduction if current habits persist."
  };
}
