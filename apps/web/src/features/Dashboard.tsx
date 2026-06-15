import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { heatmapDays, impactTrend } from "@/data/mock";
import type { CarbonResult } from "@/lib/api";
import { cn, formatKg } from "@/lib/utils";

type DashboardProps = {
  result: CarbonResult;
};

export function Dashboard({ result }: DashboardProps) {
  const trees = Math.round(result.annualKg / 21.77);
  const moneySaved = Math.round((100 - result.sustainabilityScore) * 19.5);
  const co2Saved = Math.max(0, 3200 - result.annualKg);

  return (
    <section id="dashboard" aria-labelledby="dashboard-title" className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="relative overflow-hidden bg-gradient-to-br from-skyglass to-mint">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-sun/40 blur-3xl" aria-hidden />
          <Badge>Interactive dashboard</Badge>
          <CardTitle id="dashboard-title" className="mt-4">
            Your climate cockpit.
          </CardTitle>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <ImpactTile label="Carbon score" value={`${result.sustainabilityScore}/100`} />
            <ImpactTile label="CO2 saved" value={formatKg(co2Saved)} />
            <ImpactTile label="Trees equivalent" value={`${trees}`} />
            <ImpactTile label="Money saved" value={`$${moneySaved}`} />
          </div>
        </Card>

        <Card>
          <CardTitle>Reduction progress</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={impactTrend}>
                <defs>
                  <linearGradient id="footprint" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1B6F78" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#1B6F78" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A2E2322" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area dataKey="footprint" stroke="#1B6F78" fill="url(#footprint)" name="Footprint kg" />
                <Area dataKey="saved" stroke="#4FA36C" fill="#DDF4D7" name="Saved kg" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Colorblind-safe footprint heat map</CardTitle>
          <div className="mt-5 grid grid-cols-7 gap-2" aria-label="Daily emission intensity heat map">
            {heatmapDays.map((day) => (
              <div
                key={day.day}
                title={`Day ${day.day}: ${day.value} kg CO2e`}
                className={cn(
                  "grid aspect-square place-items-center rounded-xl text-xs font-bold text-soil",
                  day.level === "high" && "bg-clay/80",
                  day.level === "medium" && "bg-sun/80",
                  day.level === "low" && "bg-mint"
                )}
              >
                {day.day}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Category comparison</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={result.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A2E2322" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kg" fill="#3F6F4E" radius={[12, 12, 0, 0]} name="kg CO2e/day" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  );
}

function ImpactTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/65 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-tide">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-soil">{value}</p>
    </div>
  );
}
