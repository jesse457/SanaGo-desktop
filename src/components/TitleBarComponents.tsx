import {
  Activity,
  Beaker,
  Pill,
  Bed,
  Calendar,
  Info,
  Minus,
  Square,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../utils/cn";

// --- Helpers ---
const getIconStyle = (type: string) => {
  const map: Record<string, any> = {
    lab_result: {
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    lab_order: { icon: Beaker, color: "text-blue-500", bg: "bg-blue-500/10" },
    pharmacy_order: {
      icon: Pill,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    patient_admission: {
      icon: Bed,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    appointment_reminder: {
      icon: Calendar,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    default: { icon: Info, color: "text-zinc-500", bg: "bg-zinc-500/10" },
  };
  return map[type] || map.default;
};

// --- Components ---

export const NetworkIndicator = ({ isOnline }: { isOnline: boolean }) => (
  <div
    className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
      isOnline
        ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20 "
        : "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse",
    )}
  >
    {isOnline ? (
      <>
        <Wifi size={14}  />
        <span>ONLINE</span>
      </>
    ) : (
      <>
        <WifiOff size={14} />
        <span>OFFLINE</span>
      </>
    )}
  </div>
);

export const NotificationItemRow = ({
  notification,
}: {
  notification: any;
}) => {
  const { icon: Icon, color, bg } = getIconStyle(notification.data.type);
  const isUnread = !notification.read_at;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 border-b last:border-0 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative",
        isUnread && "bg-blue-50/50 dark:bg-blue-900/10",
      )}
    >
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500" />
      )}

      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          bg,
        )}
      >
        <Icon size={14} className={color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <p
            className={cn(
              "text-[11px] font-medium truncate dark:text-zinc-200",
              isUnread ? "font-bold text-zinc-900" : "text-zinc-600",
            )}
          >
            {notification.data.message}
          </p>
          <span className="text-[9px] text-zinc-400 shrink-0 ml-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 line-clamp-1">
          {notification.data.patient_name || "System Alert"}
        </p>
      </div>
    </div>
  );
};

export const WindowControls = () => {
  // Assuming these are attached to window via preload script
  const handleAction = (action: "minimize" | "maximize" | "close") => {
    if (window.electronAPI) window.electronAPI[action]();
  };

  const btnClass =
    "p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded-md group";

  return (
    <div className="flex items-center gap-1 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
      <button onClick={() => handleAction("minimize")} className={btnClass}>
        <Minus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white" />
      </button>
      <button onClick={() => handleAction("maximize")} className={btnClass}>
        <Square className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white" />
      </button>
      <button
        onClick={() => handleAction("close")}
        className={cn(btnClass, "hover:bg-rose-500 dark:hover:bg-rose-600")}
      >
        <X className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white dark:text-zinc-400" />
      </button>
    </div>
  );
};
