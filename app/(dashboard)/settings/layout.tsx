"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Settings, Package } from "lucide-react"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="p-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        </div>
        
        <nav className="px-4 py-2">
          <div className="space-y-1">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Settings className="h-4 w-4" />
              General Settings
            </Link>
            
            <Link
              href="/settings/items"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Package className="h-4 w-4" />
              Items
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
