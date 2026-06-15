export type FootprintInput = {
  carKm: number;
  publicTransitKm: number;
  flightsHours: number;
  electricityKwh: number;
  lpgKg: number;
  diet: "vegan" | "vegetarian" | "mixed" | "high-meat";
  shoppingSpend: number;
};

export type CarbonBreakdown = {
  transport: number;
  energy: number;
  food: number;
  lifestyle: number;
  monthly: number;
  annual: number;
};

const DIET_MONTHLY_KG: Record<FootprintInput["diet"], number> = {
  vegan: 85,
  vegetarian: 125,
  mixed: 210,
  "high-meat": 310
};

export function calculateFootprint(input: FootprintInput): CarbonBreakdown {
  const transport =
    input.carKm * 4.33 * 0.192 +
    input.publicTransitKm * 4.33 * 0.065 +
    input.flightsHours * 90;
  const energy = input.electricityKwh * 0.42 + input.lpgKg * 2.98;
  const food = DIET_MONTHLY_KG[input.diet];
  const lifestyle = input.shoppingSpend * 0.18;
  const monthly = transport + energy + food + lifestyle;

  return {
    transport: round(transport),
    energy: round(energy),
    food: round(food),
    lifestyle: round(lifestyle),
    monthly: round(monthly),
    annual: round(monthly * 12)
  };
}

export function calculateScore(monthlyKg: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - (monthlyKg / 1000) * 65)));
}

export function treesEquivalent(savedKg: number): number {
  return Math.max(0, Math.round(savedKg / 21));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
