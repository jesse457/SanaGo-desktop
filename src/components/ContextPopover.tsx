import React, { useState, useRef } from "react";
import { Activity, Clock, FileText, HeartPulse, User } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

// --- Types & Interfaces ---

interface PatientData {
  name: string;
  id: string;
  lastVisit?: string;
  condition?: string;
  note?: string;
}

interface StaffData {
  name: string;
  role: string;
  // Add other staff specific fields if needed
}

// Discriminated Union: This ensures if type is 'patient', data MUST match PatientData
type ContextPopoverProps = {
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right"; // Currently only 'top' logic is implemented
} & (
  | { type: "patient"; data: PatientData }
  | { type: "staff"; data: StaffData }
);

interface Coords {
  top: number;
  left: number;
}

/**
 * ContextPopover: A premium "hover card" that provides quick details
 * when hovering over specific elements (like Patient ID or Staff Name).
 */
const ContextPopover: React.FC<ContextPopoverProps> = ({
  children,
  type,
  data,
  position = "top",
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Assuming useTheme returns { theme: 'light' | 'dark' | 'system' }
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Calculate position logic for "top"
      // Note: If you want to support other 'position' props, add logic here
      const top = rect.top + scrollY - 140; // Approx height of popover
      const left = rect.left + scrollX + rect.width / 2 - 130; // Approx half width centered

      setCoords({ top, left });
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}

      {visible && (
        <div
          ref={popoverRef}
          className={`fixed z-[1000] w-64 p-5 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none backdrop-blur-xl ${
            isDark
              ? "bg-zinc-900/95 border-zinc-800 text-zinc-300"
              : "bg-white/95 border-zinc-200 text-zinc-700"
          }`}
          style={{ top: coords.top, left: coords.left }}
        >
          {type === "patient" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-none">
                    {data.name}
                  </h4>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1 inline-block">
                    ID: {data.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                    Last Visit
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Clock size={12} className="text-zinc-400" />
                    {data.lastVisit || "2 days ago"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                    Condition
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <Activity size={12} />
                    {data.condition || "Stable"}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-500/10">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2">
                  Recent Note
                </p>
                <p className="text-[11px] font-medium leading-relaxed italic line-clamp-2">
                  "
                  {data.note ||
                    "Patient reported slight headache during last checkup. Prescribed Paracetamol."}
                  "
                </p>
              </div>
            </div>
          )}

          {type === "staff" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-none">
                    {data.name}
                  </h4>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1 inline-block">
                    {data.role}
                  </span>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                  Current Duty
                </p>
                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  On-site (Emergency Ward)
                </div>
              </div>
            </div>
          )}

          {/* Arrow */}
          <div
            className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default ContextPopover;