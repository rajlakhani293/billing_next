import { CustomSidebar } from "@/components/custom-sidebar";
import { Header } from "@/components/header";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      
      <aside className="h-full flex-shrink-0">
        <CustomSidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0"> 
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}