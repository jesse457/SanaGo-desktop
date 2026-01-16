import React, { useState } from "react";
import ReceptionSidebar from "../components/ReceptionSidebar";
import TitleBar from "../components/TitleBar";
import ContextMenu from "../components/ContextMenu";
import { Outlet } from "react-router-dom";

const ReceptionLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-main text-main transition-colors duration-300">

      {/* NATIVE-STYLE TITLE BAR */}
      <TitleBar>
        <div className="flex items-center gap-2 pr-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 opacity-70">
            Node: Reception / Front-Desk
          </span>
        </div>
      </TitleBar>

      <div className="flex flex-1 overflow-hidden relative">
        <ReceptionSidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto app-scrollbar relative bg-zinc-50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ContextMenu />
    </div>
  );
};

export default ReceptionLayout;