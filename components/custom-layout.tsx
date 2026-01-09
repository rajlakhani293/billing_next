"use client"

import * as React from "react"
import { CustomSidebar } from "./custom-sidebar"

export function CustomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const contentMargin = isCollapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomSidebar onToggle={setIsCollapsed}/>
      <div className={`flex-1 flex flex-col transition-all duration-300 ${contentMargin}`}>
        {children}
      </div>
    </div>
  )
}
