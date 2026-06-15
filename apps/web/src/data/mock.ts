import type { CarbonInput, CarbonResult, TwinScenario } from "@/lib/api";
import { clamp } from "@/lib/utils";

export const defaultProfile: CarbonInput = {
  transportMode: "car",
  distanceKm: 24,
  electricityKwh: 7.5,
  lpgKg: 0.4,
  naturalGasTherms: 0.2,
  solarKwh: 1.5,
  diet: "mixed",
  shoppingSpend: 18,
  onlineOrders: 1,
  clothingItems: 0,
  electronicsSpend: 4
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

export function estimateCarbon(input: CarbonInput): CarbonResult {
  const transport = input.distanceKm * transportFactors[input.transportMode];
  const energy =
    input.electricityKwh * 0.708 +
    input.lpgKg * 2.98 +
    input.naturalGasTherms * 5.3 -
    input.solarKwh * 0.708;
  const food = dietFactors[input.diet];
  const lifestyle =
    input.shoppingSpend * 0.38 +
    input.onlineOrders * 0.9 +
    input.clothingItems * 6.5 +
    input.electronicsSpend * 0.52;
  const dailyKg = Math.max(0, transport + energy + food + lifestyle);
  const annualKg = dailyKg * 365;
  const sustainabilityScore = clamp(Math.round(100 - annualKg / 120), 1, 100);

  return {
    dailyKg,
    weeklyKg: dailyKg * 7,
    monthlyKg: dailyKg * 30.42,
    annualKg,
    sustainabilityScore,
    categoryBreakdown: [
      { name: "Transport", kg: transport, color: "#1B6F78" },
      { name: "Energy", kg: Math.max(0, energy), color: "#F8B84E" },
      { name: "Food", kg: food, color: "#4FA36C" },
      { name: "Lifestyle", kg: lifestyle, color: "#D46A3A" }
    ],
    recommendations: [
      "Swap two car commutes for bus or train trips this week.",
      "Shift one high-emission meal to a vegetarian alternative.",
      "Run heavy appliances during solar production hours where possible."
    ]
  };
}

export const impactTrend = [
  { month: "Jan", footprint: 930, saved: 80 },
  { month: "Feb", footprint: 890, saved: 124 },
  { month: "Mar", footprint: 820, saved: 172 },
  { month: "Apr", footprint: 780, saved: 226 },
  { month: "May", footprint: 735, saved: 284 },
  { month: "Jun", footprint: 690, saved: 351 }
];

export const heatmapDays = Array.from({ length: 35 }, (_, index) => {
  const value = 10 + ((index * 17) % 60);
  return {
    day: index + 1,
    value,
    level: value > 55 ? "high" : value > 35 ? "medium" : "low"
  };
});

export const starterScenarios: TwinScenario[] = [
  {
    id: "current",
    name: "Current habits",
    description: "",
    newTotalKg: 9125,
    annualKg: 9125,
    savingsKg: 0,
    confidence: 0.93,
    actions: ["Keep tracking receipts", "Set weekly transport goals"]
  },
  {
    id: "public-transport",
    name: "Public transport 3x weekly",
    description: "",
    newTotalKg: 7480,
    annualKg: 7480,
    savingsKg: 1645,
    confidence: 0.88,
    actions: ["Use train on office days", "Bundle rideshare trips"]
  },
  {
    id: "lower-meat",
    name: "Lower meat diet",
    description: "",
    newTotalKg: 6815,
    annualKg: 6815,
    savingsKg: 2310,
    confidence: 0.86,
    actions: ["Plan 4 vegetarian dinners", "Replace beef with lentils"]
  },
  {
    id: "renewable-energy",
    name: "Renewable energy shift",
    description: "",
    newTotalKg: 6020,
    annualKg: 6020,
    savingsKg: 3105,
    confidence: 0.82,
    actions: ["Increase solar share", "Choose green tariff"]
  }
];

export const challenges = [
  {
    title: "No-Car Week",
    progress: 72,
    points: 860,
    description: "Use public transport, cycling, walking, or EV pooling for seven days."
  },
  {
    title: "Plastic-Free Week",
    progress: 58,
    points: 540,
    description: "Avoid single-use plastic purchases and upload receipt proof."
  },
  {
    title: "Energy Saving Month",
    progress: 41,
    points: 1280,
    description: "Reduce household energy consumption by 12 percent."
  }
];

export const leaderboard = [
  { name: "Maya", city: "Kolkata", score: 9820, badge: "Climate Champion" },
  { name: "Anindya", city: "Kolkata", score: 9460, badge: "Planet Protector" },
  { name: "Riya", city: "Bengaluru", score: 9010, badge: "Eco Warrior" },
  { name: "Kabir", city: "Delhi", score: 8750, badge: "Carbon Saver" }
];
