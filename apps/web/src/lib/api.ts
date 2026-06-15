const API_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type CoachResponse = {
  answer: string;
  actions: string[];
  estimatedAnnualSavingsKg: number;
};

export type CarbonInput = {
  transportMode: "car" | "bike" | "bus" | "train" | "flight" | "rideshare" | "ev";
  distanceKm: number;
  electricityKwh: number;
  solarKwh: number;
  lpgKg: number;
  naturalGasTherms: number;
  diet: "vegan" | "vegetarian" | "mixed" | "high_meat";
  shoppingSpend: number;
  onlineOrders: number;
  clothingItems: number;
  electronicsSpend: number;
};

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

export async function askCoach(message: string, profile: CarbonInput, idToken?: string): Promise<CoachResponse> {
  const response = await fetch(`${API_URL}/api/v1/coach`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify({ message, locale: "en", context: profile })
  });

  if (!response.ok) {
    throw new Error("The sustainability coach is temporarily unavailable.");
  }

  return (await response.json()) as CoachResponse;
}

export async function simulateTwin(input: CarbonInput, idToken?: string): Promise<{ scenarios: TwinScenario[] }> {
  const response = await fetch(`${API_URL}/api/v1/twin/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
    body: JSON.stringify({ profile: input })
  });
  if (!response.ok) throw new Error("Twin simulation failed.");
  return response.json();
}

export async function getForecast(profile: CarbonInput, idToken?: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/v1/predictions/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
    body: JSON.stringify({ profile })
  });
  if (!response.ok) throw new Error("Forecast failed.");
  return response.json();
}

export async function calculateCarbon(input: CarbonInput, idToken?: string): Promise<CarbonResult> {
  const response = await fetch(`${API_URL}/api/v1/carbon/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("Calculation failed.");
  return response.json();
}

export type ReceiptAnalysisResult = {
  text: string;
  amount?: number;
  electricityKwh?: number;
  storagePath?: string;
};

export async function uploadReceipt(file: File, idToken: string): Promise<ReceiptAnalysisResult> {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await fetch(`${API_URL}/api/v1/ocr/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to analyze receipt.");
  }

  return (await response.json()) as ReceiptAnalysisResult;
}

export type FootprintEntry = {
  category: "transport" | "energy" | "food" | "lifestyle";
  emissionKg: number;
  source?: "manual" | "receipt" | "integration";
  occurredAt: string;
};

export async function createEntry(entry: FootprintEntry, idToken: string): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/api/v1/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(entry)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save entry.");
  }

  return response.json();
}

export async function getEntries(idToken: string): Promise<FootprintEntry[]> {
  const response = await fetch(`${API_URL}/api/v1/entries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch footprint entries.");
  }

  return response.json();
}

