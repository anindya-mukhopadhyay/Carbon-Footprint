import { useState } from "react";
import { ArrowRight, BusFront, Leaf, PlugZap, Utensils } from "lucide-react";

const scenarios = [
  { name: "Current habits", value: 7344, icon: Leaf, saving: 0 },
  { name: "Transit 3x weekly", value: 6022, icon: BusFront, saving: 18 },
  { name: "Plant-forward diet", value: 5655, icon: Utensils, saving: 23 },
  { name: "Renewable home", value: 4847, icon: PlugZap, saving: 34 }
];

export function CarbonTwin() {
  const [active, setActive] = useState(1);
  const selected = scenarios[active] ?? scenarios[0]!;

  return (
    <section className="twin-section section-shell" id="carbon-twin" aria-labelledby="twin-title">
      <div className="twin-copy">
        <span className="eyebrow light">AI carbon twin</span>
        <h2 id="twin-title">Meet the future version of your footprint.</h2>
        <p>
          Test lifestyle changes before making them. EcoTrack simulates your trajectory and shows
          which choices create the biggest real-world difference.
        </p>
        <div className="scenario-list" role="list" aria-label="Carbon twin scenarios">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <button
                className={active === index ? "scenario active" : "scenario"}
                key={scenario.name}
                onClick={() => setActive(index)}
                type="button"
              >
                <span className="scenario-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>{scenario.name}</strong>
                  <small>{scenario.saving ? `${scenario.saving}% less per year` : "Baseline"}</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="twin-visual" aria-live="polite">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="planet">
          <span className="planet-glow" />
          <Leaf size={58} aria-hidden="true" />
        </div>
        <div className="twin-stat current">
          <span>Current</span>
          <strong>7,344 kg</strong>
        </div>
        <div className="twin-stat future">
          <span>{selected.name}</span>
          <strong>{selected.value.toLocaleString()} kg</strong>
          <small>{selected.saving ? `-${selected.saving}%` : "Baseline"}</small>
        </div>
        <div className="savings-card">
          <span>Projected annual saving</span>
          <strong>{(7344 - selected.value).toLocaleString()} kg CO₂e</strong>
          <small>Vertex AI forecast · 89% confidence</small>
        </div>
      </div>
    </section>
  );
}
