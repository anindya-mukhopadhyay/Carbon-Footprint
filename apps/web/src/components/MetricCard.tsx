import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  positive?: boolean;
  icon: LucideIcon;
  tone: "forest" | "mint" | "amber" | "blue";
};

export function MetricCard({
  label,
  value,
  unit,
  delta,
  positive = true,
  icon: Icon,
  tone
}: MetricCardProps) {
  const DeltaIcon = positive ? ArrowDownRight : ArrowUpRight;

  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon" aria-hidden="true">
          <Icon size={19} />
        </span>
      </div>
      <div className="metric-value">
        {value} <small>{unit}</small>
      </div>
      <div className="metric-delta">
        <DeltaIcon size={15} aria-hidden="true" />
        <span>{delta}</span>
      </div>
    </article>
  );
}
