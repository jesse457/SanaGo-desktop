import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import TitleBar from "../components/TitleBar";
import ContextMenu from "../components/ContextMenu";

const DoctorLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-main text-main transition-colors duration-300">
      {/* NATIVE-STYLE TITLE BAR */}
      <TitleBar>
        <div className="flex items-center gap-2 pr-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 opacity-50">
            Node: Clinical
          </span>
        </div>
      </TitleBar>

      <div className="flex flex-1 overflow-hidden relative">
        <DoctorSidebar collapsed={isCollapsed} setCollapsed={setIsCollapsed} />

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

export default DoctorLayout;
