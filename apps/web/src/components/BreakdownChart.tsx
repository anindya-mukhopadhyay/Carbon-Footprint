import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type BreakdownChartProps = {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
};

export function BreakdownChart({ data }: BreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="breakdown-layout">
      <div className="donut" role="img" aria-label="Emissions breakdown by category">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={57}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>kg CO₂e</span>
        </div>
      </div>
      <ul className="legend-list" aria-label="Emissions categories">
        {data.map((item) => (
          <li key={item.name}>
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
            <strong>{item.value} kg</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

