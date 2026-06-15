import { useEffect, useState, useTransition } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { starterScenarios } from "@/data/mock";
import { getForecast, simulateTwin, type CarbonInput, type TwinScenario } from "@/lib/api";
import { formatKg } from "@/lib/utils";

type CarbonTwinProps = {
  profile: CarbonInput;
};

export function CarbonTwin({ profile }: CarbonTwinProps) {
  const [scenarios, setScenarios] = useState<TwinScenario[]>(starterScenarios);
  const [forecast, setForecast] = useState([
    { month: "Jul", projectedKg: 690, lowerKg: 640, upperKg: 760 },
    { month: "Aug", projectedKg: 664, lowerKg: 612, upperKg: 725 },
    { month: "Sep", projectedKg: 632, lowerKg: 590, upperKg: 704 },
    { month: "Oct", projectedKg: 602, lowerKg: 558, upperKg: 680 },
    { month: "Nov", projectedKg: 575, lowerKg: 532, upperKg: 648 },
    { month: "Dec", projectedKg: 548, lowerKg: 510, upperKg: 620 }
  ]);
  const [confidence, setConfidence] = useState(0.86);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      void Promise.all([simulateTwin(profile), getForecast(profile)])
        .then(([twinResponse, forecastResponse]) => {
          setScenarios(twinResponse.scenarios);
          setForecast(forecastResponse.forecast);
          setConfidence(forecastResponse.confidence);
        })
        .catch(() => undefined);
    });
  }, [profile]);

  return (
    <section id="twin" aria-labelledby="twin-title" className="grid gap-6">
      <Card className="overflow-hidden bg-gradient-to-r from-paper via-mint to-skyglass">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge>Innovation feature</Badge>
            <CardTitle id="twin-title" className="mt-4">
              AI Carbon Twin
            </CardTitle>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-soil/70">
              The digital carbon twin simulates current lifestyle patterns, alternative actions, and
              future emissions so users can preview the impact before changing habits.
            </p>
          </div>
          <Button disabled={isPending}>{isPending ? "Syncing twin..." : "Twin online"}</Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <Badge>{Math.round(scenario.confidence * 100)}% confidence</Badge>
              <CardTitle className="mt-4">{scenario.name}</CardTitle>
              <p className="mt-3 font-display text-4xl font-extrabold text-tide">
                {formatKg(scenario.annualKg)}
              </p>
              <p className="mt-1 text-sm font-bold text-leaf">
                {scenario.savingsKg > 0 ? `${formatKg(scenario.savingsKg)} saved yearly` : "Baseline scenario"}
              </p>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-soil/75">
                {scenario.actions.map((action: string) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card>
          <Badge>Vertex AI forecast</Badge>
          <CardTitle className="mt-4">Six-month prediction</CardTitle>
          <p className="mt-2 text-sm text-soil/70">Confidence score: {Math.round(confidence * 100)}%</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <LineChart data={forecast}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projectedKg" stroke="#1B6F78" strokeWidth={4} name="Projected kg" />
                <Line type="monotone" dataKey="upperKg" stroke="#D46A3A" strokeDasharray="4 4" name="Upper" />
                <Line type="monotone" dataKey="lowerKg" stroke="#4FA36C" strokeDasharray="4 4" name="Lower" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  );
}
