"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, Package, Receipt, Tag } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Tax",
      url: "/settings/taxes",
      icon: Receipt
    },
    {
      title: "Brands", 
      url: "/settings/brands",
      icon: Tag
    }
  ]
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="p-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        </div>
        
        <nav className="px-4 py-2">
          <div className="space-y-1">
            {data.navMain.map((item) => {
              const isActive = pathname === item.url
              const Icon = item.icon
              
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-300/20" 
                      : "hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-white">
        {children}
      </main>
    </div>
  )
}
