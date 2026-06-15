import { useState, useTransition } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { calculateCarbon, type CarbonInput, type CarbonResult } from "@/lib/api";
import { defaultProfile, estimateCarbon } from "@/data/mock";
import { formatKg } from "@/lib/utils";

type CalculatorProps = {
  onProfileChange: (profile: CarbonInput, result: CarbonResult) => void;
};

export function Calculator({ onProfileChange }: CalculatorProps) {
  const [profile, setProfile] = useState(defaultProfile);
  const [result, setResult] = useState(() => estimateCarbon(defaultProfile));
  const [isPending, startTransition] = useTransition();

  function updateNumber(key: keyof CarbonInput, value: string) {
    const numericValue = Number(value);
    setProfile((current) => ({
      ...current,
      [key]: Number.isFinite(numericValue) ? numericValue : 0
    }));
  }

  async function runCalculation() {
    const fallback = estimateCarbon(profile);
    setResult(fallback);
    onProfileChange(profile, fallback);

    startTransition(() => {
      void calculateCarbon(profile)
        .then((apiResult) => {
          setResult(apiResult);
          onProfileChange(profile, apiResult);
        })
        .catch(() => {
          setResult(fallback);
        });
    });
  }

  return (
    <section id="calculator" aria-labelledby="calculator-title" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <Badge>Smart calculator</Badge>
        <CardTitle id="calculator-title" className="mt-4">
          Build your daily footprint from real habits.
        </CardTitle>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-soil/70">
          Estimate transportation, home energy, food, shopping, electronics, and online order
          emissions. The backend can enrich this with Firestore history, OCR receipts, and region
          specific factors.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-soil">
            Transport mode
            <select
              value={profile.transportMode}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  transportMode: event.target.value as CarbonInput["transportMode"]
                }))
              }
              className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-soil"
            >
              <option value="car">Private car</option>
              <option value="bike">Bike</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="flight">Flight</option>
              <option value="rideshare">Ride sharing</option>
              <option value="ev">EV vehicle</option>
            </select>
          </label>

          <NumberField label="Distance per day (km)" value={profile.distanceKm} onChange={(value) => updateNumber("distanceKm", value)} />
          <NumberField label="Electricity (kWh/day)" value={profile.electricityKwh} onChange={(value) => updateNumber("electricityKwh", value)} />
          <NumberField label="Solar generated (kWh/day)" value={profile.solarKwh} onChange={(value) => updateNumber("solarKwh", value)} />
          <NumberField label="LPG (kg/day)" value={profile.lpgKg} onChange={(value) => updateNumber("lpgKg", value)} />
          <NumberField label="Natural gas (therms/day)" value={profile.naturalGasTherms} onChange={(value) => updateNumber("naturalGasTherms", value)} />

          <label className="grid gap-2 text-sm font-bold text-soil">
            Diet pattern
            <select
              value={profile.diet}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  diet: event.target.value as CarbonInput["diet"]
                }))
              }
              className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-soil"
            >
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="mixed">Mixed diet</option>
              <option value="high_meat">High meat consumption</option>
            </select>
          </label>

          <NumberField label="Shopping spend/day" value={profile.shoppingSpend} onChange={(value) => updateNumber("shoppingSpend", value)} />
          <NumberField label="Online orders/day" value={profile.onlineOrders} onChange={(value) => updateNumber("onlineOrders", value)} />
          <NumberField label="Clothing items/month" value={profile.clothingItems} onChange={(value) => updateNumber("clothingItems", value)} />
          <NumberField label="Electronics spend/day" value={profile.electronicsSpend} onChange={(value) => updateNumber("electronicsSpend", value)} />
        </div>

        <Button className="mt-6" onClick={() => void runCalculation()} disabled={isPending}>
          {isPending ? "Calculating..." : "Calculate footprint"}
        </Button>
      </Card>

      <Card className="bg-soil text-paper">
        <Badge className="border-paper/20 bg-paper/10 text-sun">Live impact</Badge>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Metric label="Daily" value={formatKg(result.dailyKg)} />
          <Metric label="Weekly" value={formatKg(result.weeklyKg)} />
          <Metric label="Monthly" value={formatKg(result.monthlyKg)} />
          <Metric label="Annual" value={formatKg(result.annualKg)} />
        </div>

        <div className="mt-8 h-72" aria-label="Carbon footprint category pie chart">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={result.categoryBreakdown} dataKey="kg" nameKey="name" innerRadius={65} outerRadius={105}>
                {result.categoryBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)} kg`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-5 grid gap-3" aria-label="Personalized quick recommendations">
          {result.recommendations.map((recommendation) => (
            <li key={recommendation} className="rounded-2xl bg-paper/10 p-3 text-sm leading-6">
              {recommendation}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: string) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-soil">
      {label}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-soil"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-paper/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}
