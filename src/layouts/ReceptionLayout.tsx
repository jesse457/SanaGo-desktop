import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ReceptionSidebar from "../components/ReceptionSidebar";
import TitleBar from "../components/TitleBar";
import ContextMenu from "../components/ContextMenu";
import { useAuth } from "../providers/AuthProvider"; // Required for TitleBar notifications

const ReceptionLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 selection:bg-rose-500/30">

      {/* NATIVE-STYLE TITLE BAR */}
      <TitleBar user={user}>
        <div className="flex items-center gap-2 pr-2">
          {/* Status Indicator for Reception */}
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            Node: Reception
          </span>
        </div>
      </TitleBar>

      <div className="flex flex-1 overflow-hidden relative">
        <ReceptionSidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto app-scrollbar relative bg-zinc-50 dark:bg-black/20">
          <div className="max-w-7xl mx-auto h-full p-4">
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

export default ReceptionLayout;