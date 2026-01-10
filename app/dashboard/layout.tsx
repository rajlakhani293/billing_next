"use client";

import React from "react";
import { ReactNode } from "react";
import { Header } from "@/components/header";
import { CustomSidebar } from "@/components/custom-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = React.useState(68);

  return (
    <div className="relative flex w-screen h-screen overflow-hidden">
      <CustomSidebar onToggle={(isCollapsed) => setSidebarWidth(isCollapsed ? 68 : 264)} />
       <div className="flex flex-col flex-1 transition-all duration-300 w-full min-w-0" style={{ marginLeft: `${sidebarWidth}px` }}>
        {/* HEADER */}
          <Header/>
        {/* MAIN CONTENT */}
        <main
          id="app-main-content"
          className={`flex-1 w-full overflow-x-hidden custom-scrollbar overflow-y-auto transition-all duration-300 custom-main`}
        >
          <div className="mx-auto p-1 min-w-0 flex flex-col h-full">
            {children}
          </div>
        </main>
      </div>
    </div>

  );
}
