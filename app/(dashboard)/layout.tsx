"use client";

import { CustomSidebar } from "@/components/custom-sidebar";
import { Header } from "@/components/header";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSettingsPage = pathname?.startsWith("/settings");

  return (
    <div className="flex h-screen w-full overflow-hidden">
      
      <aside className="h-full shrink-0">
        <CustomSidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0"> 
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-gray-50",
            !isSettingsPage && "m-1 rounded-lg"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}