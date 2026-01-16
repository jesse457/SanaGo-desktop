import React from "react";
import { cn } from "../utils/cn";

interface ProgressItemProps {
  label: string;
  value: number;
  color?: string;
}

/**
 * ProgressItem component for displaying a label and a progress bar.
 */
const ProgressItem: React.FC<ProgressItemProps> = ({ label, value, color = "bg-primary-500" }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
        {value}%
      </span>
    </div>
    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={cn("h-full transition-all duration-1000 ease-out", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default ProgressItem;
