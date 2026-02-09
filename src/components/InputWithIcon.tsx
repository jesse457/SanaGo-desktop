import React from "react";
import { LucideIcon } from "lucide-react";

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
  label,
  icon: Icon,
  error,
  containerClassName = "",
  className = "",
  ...props
}) => {
  return (
    <div className={`space-y-2.5 w-full ${containerClassName}`}>
      {/* Label */}
      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative group">
        {/* Icon container */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors duration-200">
            <Icon size={18} />
          </div>
        )}

        {/* Input Field */}
        <input
          className={`
            w-full h-12 pr-4 bg-zinc-50 dark:bg-zinc-800/50 
            border rounded-xl text-sm font-bold 
            transition-all duration-200 shadow-sm
            placeholder:text-zinc-400 placeholder:font-medium
            focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/10 
            ${Icon ? "pl-12" : "pl-4"}
            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-zinc-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-500"
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[10px] font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputWithIcon;