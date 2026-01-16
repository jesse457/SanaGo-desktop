import React from "react";
import { cn } from "../utils/cn";

/**
 * StatCard component for displaying key metrics with an icon and trend.
 * Used across various dashboards (Admin, Revenue, Doctor).
 */
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  icon: React.ElementType;
  color?: "emerald" | "blue" | "amber" | "indigo" | "rose";
}

/**
 * StatCard component for displaying key metrics with an icon and trend.
 * Used across various dashboards (Admin, Revenue, Doctor).
 */
const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  color = "indigo",
}) => {
  const styles = {
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    amber:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    indigo:
      "bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  return (
    <div className="card-base p-6 group hover:border-primary-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl border", styles[color])}>
          <Icon size={24} />
        </div>
        {trend && (
          <div
            className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wider uppercase",
              styles[color],
            )}
          >
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 text-zinc-900 dark:text-zinc-100">
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
        <span className="text-[10px] font-black uppercase opacity-40">
          {unit}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
