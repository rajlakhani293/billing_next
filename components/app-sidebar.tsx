"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardIcon, InventoryIcon, NextJsIcon, PanelRight, SettingIcon } from "@/components/AppIcon"
import { useSidebar } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: DashboardIcon
    },
    {
      title: "Inventory",
      url: "#",
      icon: InventoryIcon,
      items: [
        {
          title: "Items",
          url: "/inventory/items",
        },
        {
          title: "Categories",
          url: "/inventory/categories",
        },
        {
          title: "Units",
          url: "/inventory/units",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingIcon
    }
  ],
}

import { usePathname } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const pathname = usePathname()

  const navMain = React.useMemo(() => {
    return data.navMain.map((item) => {
      const isChildActive = item.items?.some((subItem) => pathname === subItem.url)
      const isSelfActive = pathname === item.url
      
      return {
        ...item,
        isActive: isSelfActive,
        isExpanded: isSelfActive || isChildActive,
        items: item.items?.map(subItem => ({
           ...subItem,
           isActive: pathname === subItem.url
        }))
      }
    })
  }, [pathname])
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {state === "collapsed" ? (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors relative group border cursor-e-resize"
            >
              <NextJsIcon className="size-6 group-hover:opacity-0 transition-opacity cursor-e-resize" />
              <PanelRight className="size-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-e-resize" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2">
            <div className="text-lg font-medium">Billing</div>
            <SidebarTrigger/>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
