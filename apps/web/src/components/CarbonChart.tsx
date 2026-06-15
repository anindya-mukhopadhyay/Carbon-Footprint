import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
type CarbonChartProps = {
  data: {
    month: string;
    actual: number | null;
    target: number;
    forecast: number | null;
  }[];
};

export function CarbonChart({ data }: CarbonChartProps) {
  return (
    <div className="chart-wrap" role="img" aria-label="Carbon emissions trend from January to July">
      <ResponsiveContainer width="100%" height={275}>
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="carbonArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f7d5c" stopOpacity={0.23} />
              <stop offset="100%" stopColor="#2f7d5c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#dfe7df" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#637168" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#637168" }} domain={[450, 800]} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dce7df",
              boxShadow: "0 8px 24px rgba(18,55,42,.12)"
            }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#236346"
            strokeWidth={3}
            fill="url(#carbonArea)"
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#e1a23c"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#517e92"
            strokeWidth={3}
            strokeDasharray="7 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
