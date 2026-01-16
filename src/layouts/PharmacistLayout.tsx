import React, { useState } from "react";
import PharmacistSidebar from "../components/PharmacistSidebar";
import TitleBar from "../components/TitleBar";
import ContextMenu from "../components/ContextMenu";
import { Outlet } from "react-router-dom";

const PharmacistLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* NATIVE-STYLE TITLE BAR */}
      <TitleBar>
        <div className="flex items-center gap-2 pr-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 opacity-50">
            Node: Pharmacist
          </span>
        </div>
      </TitleBar>

      <div className="flex flex-1 overflow-hidden relative">
        <PharmacistSidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto app-scrollbar relative bg-zinc-50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto h-full">
            {/* Animate outlet transitions if desired */}
            <div className="animate-in fade-in duration-500">
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