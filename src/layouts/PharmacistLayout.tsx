import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import PharmacistSidebar from "../components/PharmacistSidebar";
import TitleBar from "../components/TitleBar";
import ContextMenu from "../components/ContextMenu";
import { useAuth } from "../providers/AuthProvider"; // Ensure you have this hook

const PharmacistLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth(); // Get current user for TitleBar notifications

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 selection:bg-blue-500/30">
      
      {/* TITLE BAR (Pass user for notifications) */}
      <TitleBar>
        <div className="flex items-center gap-2 pr-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            Node: Pharmacist
          </span>
        </div>
      </TitleBar>

      <div className="flex flex-1 overflow-hidden relative">
        <PharmacistSidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto app-scrollbar relative bg-zinc-50 dark:bg-black/20">
          <div className="max-w-7xl mx-auto h-full">
            {/* Animate outlet transitions */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      
      <ContextMenu />
    </div>
  );
};

export default PharmacistLayout;