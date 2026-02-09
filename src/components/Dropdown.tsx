import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
  buttonClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  items, 
  className = "",
  buttonClassName = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-3 px-4 py-2.5 
          bg-white dark:bg-zinc-800 
          border border-zinc-200 dark:border-zinc-700 
          hover:border-blue-500/50 dark:hover:border-blue-500/50
          rounded-xl shadow-sm hover:shadow-md 
          transition-all duration-200 ease-out group 
          min-w-[140px] w-full text-sm font-bold text-zinc-700 dark:text-zinc-200
          ${isOpen ? 'ring-2 ring-blue-500/10 border-blue-500' : ''}
          ${buttonClassName}
        `}
      >
        <span className="truncate">{label}</span>
        <ChevronDown 
          size={16} 
          className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-full min-w-[180px] origin-top-right rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1.5 flex flex-col gap-0.5">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.onClick)}
                className={`
                  w-full text-left flex items-center gap-2.5 px-3 py-2.5 
                  rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300
                  hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400
                  transition-colors ${item.className || ""}
                `}
              >
                {item.icon && <span className="text-zinc-400 group-hover:text-blue-500">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;