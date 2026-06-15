import { calculateCarbonLocally, type CarbonInput } from "./carbon.js";

export function simulateCarbonTwin(profile: CarbonInput) {
  const baseline = calculateCarbonLocally(profile).annualKg;

  const scenarios = [
    {
      id: "current",
      name: "Current habits",
      annualKg: baseline,
      savingsKg: 0,
      confidence: 0.93,
      actions: ["Continue daily tracking", "Upload bills to improve factor accuracy"]
    },
    {
      id: "public-transport",
      name: "Public transport 3x weekly",
      annualKg: baseline * 0.82,
      savingsKg: baseline * 0.18,
      confidence: 0.88,
      actions: ["Replace three private car commutes", "Use Maps transit routing before rideshare"]
    },
    {
      id: "lower-meat",
      name: "Reducing meat consumption",
      annualKg: baseline * 0.75,
      savingsKg: baseline * 0.25,
      confidence: 0.86,
      actions: ["Plan four vegetarian dinners", "Prioritize local seasonal produce"]
    },
    {
      id: "renewable-energy",
      name: "Switching to renewable energy",
      annualKg: baseline * 0.66,
      savingsKg: baseline * 0.34,
      confidence: 0.82,
      actions: ["Adopt green tariff or community solar", "Run appliances during solar windows"]
    }
  ];

  return {
    scenarios: scenarios.map((scenario) => ({
      ...scenario,
      annualKg: Math.max(0, scenario.annualKg),
      savingsKg: Math.max(0, scenario.savingsKg)
    }))
  };
}
