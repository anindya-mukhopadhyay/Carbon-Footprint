import { useState, useMemo, useCallback } from "react";
import { Calculator as CalculatorIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateFootprint,
  calculateScore,
  type CarbonBreakdown,
  type FootprintInput
} from "@/lib/carbon";
import { formatCarbon } from "@/lib/utils";

const defaults: FootprintInput = {
  carKm: 120,
  publicTransitKm: 30,
  flightsHours: 1,
  electricityKwh: 210,
  lpgKg: 12,
  diet: "mixed",
  shoppingSpend: 140
};

/**
 * Calculator Component
 * @description A smart calculator that estimates the user's carbon footprint
 * based on input variables across transport, home energy, food, and purchases.
 * Computes live scores and provides real-time sustainability insights.
 * @returns {JSX.Element} The rendered calculator section.
 */
export function Calculator() {
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState<CarbonBreakdown>(() => calculateFootprint(defaults));

  const updateNumber = useCallback((field: keyof FootprintInput, value: string) => {
    setForm((current) => ({ ...current, [field]: Math.max(0, Number(value) || 0) }));
  }, []);

  const score = useMemo(() => calculateScore(result.monthly), [result.monthly]);

  return (
    <section className="calculator-section section-shell" id="calculator" aria-labelledby="calc-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Smart calculator</span>
          <h2 id="calc-title">Know your number. Change your trajectory.</h2>
        </div>
        <p>
          A transparent, standards-based estimate across transport, home energy, food, and
          purchases.
        </p>
      </div>
      <div className="calculator-grid">
        <form
          className="calculator-form"
          onSubmit={(event) => {
            event.preventDefault();
            setResult(calculateFootprint(form));
          }}
        >
          <div className="field-grid">
            <label>
              Car travel per week
              <span className="input-with-unit">
                <input
                  min="0"
                  type="number"
                  value={form.carKm}
                  onChange={(event) => updateNumber("carKm", event.target.value)}
                />
                <span>km</span>
              </span>
            </label>
            <label>
              Public transit per week
              <span className="input-with-unit">
                <input
                  min="0"
                  type="number"
                  value={form.publicTransitKm}
                  onChange={(event) => updateNumber("publicTransitKm", event.target.value)}
                />
                <span>km</span>
              </span>
            </label>
            <label>
              Flights per month
              <span className="input-with-unit">
                <input
                  min="0"
                  type="number"
                  value={form.flightsHours}
                  onChange={(event) => updateNumber("flightsHours", event.target.value)}
                />
                <span>hours</span>
              </span>
            </label>
            <label>
              Monthly electricity
              <span className="input-with-unit">
                <input
                  min="0"
                  type="number"
                  value={form.electricityKwh}
                  onChange={(event) => updateNumber("electricityKwh", event.target.value)}
                />
                <span>kWh</span>
              </span>
            </label>
            <label>
              Monthly LPG
              <span className="input-with-unit">
                <input
                  min="0"
                  type="number"
                  value={form.lpgKg}
                  onChange={(event) => updateNumber("lpgKg", event.target.value)}
                />
                <span>kg</span>
              </span>
            </label>
            <label>
              Monthly shopping
              <span className="input-with-unit">
                <span aria-hidden="true">$</span>
                <input
                  min="0"
                  type="number"
                  value={form.shoppingSpend}
                  onChange={(event) => updateNumber("shoppingSpend", event.target.value)}
                />
              </span>
            </label>
          </div>
          <fieldset className="diet-options">
            <legend>Typical diet</legend>
            {(["vegan", "vegetarian", "mixed", "high-meat"] as const).map((diet) => (
              <label key={diet}>
                <input
                  checked={form.diet === diet}
                  name="diet"
                  type="radio"
                  value={diet}
                  onChange={() => setForm((current) => ({ ...current, diet }))}
                />
                <span>{diet.replace("-", " ")}</span>
              </label>
            ))}
          </fieldset>
          <Button type="submit" aria-label="Calculate footprint">
            <CalculatorIcon size={18} aria-hidden="true" />
            Calculate my footprint
          </Button>
        </form>
        <div className="calculator-result" aria-live="polite">
          <span className="result-label">Your estimated footprint</span>
          <div className="result-number">
            {formatCarbon(result.monthly)}
            <span>kg CO₂e / month</span>
          </div>
          <div
            className="score-ring"
            style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}
          >
            <div>
              <strong>{score}</strong>
              <span>Eco score</span>
            </div>
          </div>
          <div className="result-comparison">
            <Sparkles size={18} aria-hidden="true" />
            <p>
              Your fastest opportunity is transport. Two transit swaps a week could save roughly
              <strong> 310 kg CO₂e yearly</strong>.
            </p>
          </div>
          <dl className="result-periods">
            <div>
              <dt>Daily</dt>
              <dd>{formatCarbon(result.monthly / 30)} kg</dd>
            </div>
            <div>
              <dt>Weekly</dt>
              <dd>{formatCarbon((result.monthly * 12) / 52)} kg</dd>
            </div>
            <div>
              <dt>Annual</dt>
              <dd>{formatCarbon(result.annual)} kg</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
