import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

// --- Updated Interface ---
interface BreadcrumbItem {
  label: string;
  path?: string; // Standardized to 'path'
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

/**
 * Breadcrumbs component for navigation history.
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] mb-2 gap-2 overflow-hidden whitespace-nowrap text-zinc-400">
      {/* Root / Home Link */}
      <Link
        to="/"
        className="flex items-center hover:text-primary-600 transition-colors shrink-0 group"
      >
        <Home size={12} className="mr-1.5 group-hover:scale-110 transition-transform" />
        <span>SanaGo</span>
      </Link>

      {items.map((item, index) => {
        // Determine if this is the last item (the current page)
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight size={10} className="text-zinc-500 shrink-0 opacity-50" />
            
            {/* If a path is provided and it's not the last item, render a Link */}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-primary-600 transition-colors shrink-0"
              >
                {item.label}
              </Link>
            ) : (
              /* Otherwise, render a static span (active state) */
              <span 
                className={cn(
                  "shrink-0",
                  isLast ? "text-primary-600 dark:text-primary-400 font-bold" : ""
                )}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;