import { z } from "zod";
import { env } from "../config/env.js";

export const carbonInputSchema = z.object({
  transportMode: z.enum(["car", "bike", "bus", "train", "flight", "rideshare", "ev"]),
  distanceKm: z.number().min(0),
  electricityKwh: z.number().min(0),
  solarKwh: z.number().min(0),
  lpgKg: z.number().min(0),
  naturalGasTherms: z.number().min(0),
  diet: z.enum(["vegan", "vegetarian", "mixed", "high_meat"]),
  shoppingSpend: z.number().min(0),
  onlineOrders: z.number().min(0),
  clothingItems: z.number().min(0),
  electronicsSpend: z.number().min(0)
});

export type CarbonInput = z.infer<typeof carbonInputSchema>;

export type TwinScenario = {
  id: string;
  name: string;
  description: string;
  savingsKg: number;
  newTotalKg: number;
  actions: string[];
  confidence: number;
  annualKg: number;
};

export type CarbonResult = {
  dailyKg: number;
  weeklyKg: number;
  monthlyKg: number;
  annualKg: number;
  sustainabilityScore: number;
  categoryBreakdown: { name: string; kg: number; color: string }[];
  recommendations: string[];
  scenarios?: TwinScenario[];
};

const transportFactors = {
  car: 0.192,
  bike: 0.021,
  bus: 0.089,
  train: 0.041,
  flight: 0.255,
  rideshare: 0.145,
  ev: 0.053
};

const dietFactors = {
  vegan: 2.8,
  vegetarian: 3.8,
  mixed: 5.4,
  high_meat: 7.2
};

export async function calculateCarbon(input: CarbonInput): Promise<CarbonResult> {
  return calculateCarbonLocally(input);
}

export function calculateCarbonLocally(input: CarbonInput): CarbonResult {
  const transport = input.distanceKm * transportFactors[input.transportMode];
  const energy = Math.max(0, input.electricityKwh * 0.708 + input.lpgKg * 2.98 + input.naturalGasTherms * 5.3 - input.solarKwh * 0.708);
  const food = dietFactors[input.diet];
  const lifestyle = input.shoppingSpend * 0.38 + input.onlineOrders * 0.9 + input.clothingItems * 6.5 + input.electronicsSpend * 0.52;
  const dailyKg = Math.max(0, transport + energy + food + lifestyle);
  const annualKg = dailyKg * 365;
  const sustainabilityScore = Math.min(100, Math.max(1, Math.round(100 - annualKg / 120)));

  return {
    dailyKg,
    weeklyKg: dailyKg * 7,
    monthlyKg: dailyKg * 30.42,
    annualKg,
    sustainabilityScore,
    categoryBreakdown: [
      { name: "Transport", kg: transport, color: "#1B6F78" },
      { name: "Energy", kg: energy, color: "#F8B84E" },
      { name: "Food", kg: food, color: "#4FA36C" },
      { name: "Lifestyle", kg: lifestyle, color: "#D46A3A" }
    ],
    recommendations: []
  };
}
