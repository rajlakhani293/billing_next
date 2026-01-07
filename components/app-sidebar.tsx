"use client"

import * as React from "react"
import {
  FiAlignJustify,
} from "react-icons/fi"
import {
  PanelLeftIcon,
  PanelRightIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { NextJsIcon } from "./AppIcon"
import { useMenus } from "@/hooks/useSession"

// Icon mapping function
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "FiAlignJustify":
      return FiAlignJustify;
    default:
      return FiAlignJustify;
  }
}

// Transform API data to nav-main format
const transformMenuData = (menus: any[]) => {
  return menus.map(menu => ({
    title: menu.name || menu.menu_name,
    url: menu.url || menu.menu_url,
    icon: getIconComponent(menu.icon_name || menu.menu_icon_name),
    isActive: false,
    items: menu.modules?.map((module: any) => ({
      title: module.name || module.module_name,
      url: module.url || module.module_url,
    })) || []
  }));
}

// Custom header component for sidebar
function SidebarHeaderContent() {
  const { state, toggleSidebar } = useSidebar()
  const [showExpandButton, setShowExpandButton] = React.useState(false)

  if (state === "collapsed") {
    return (
      <div 
        className="flex items-center justify-center relative w-full"
        onMouseEnter={() => setShowExpandButton(true)}
        onMouseLeave={() => setShowExpandButton(false)}
      >
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <NextJsIcon className="size-4" />
        </div>
        {showExpandButton && (
          <button
            onClick={toggleSidebar}
            className="bg-white absolute border-gray-200 flex border rounded-lg size-8 items-center justify-center transition-all duration-200 ease-in-out cursor-pointer"
          >
            <PanelRightIcon className="size-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full">
      <img src="next.svg" alt="Next" className="h-6 w-auto" />
      <button
        onClick={toggleSidebar}
        className="text-sidebar-foreground border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-1 transition-colors cursor-pointer"
      >
        <PanelLeftIcon className="size-5" />
      </button>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const menus = useMenus();
  const navItems = React.useMemo(() => {
    if (menus && menus.length > 0) {
      return transformMenuData(menus);
    }
    return [];
  }, [menus]);

  return (
    <Sidebar collapsible="icon" className="transition-all duration-300 ease-in-out" {...props}>
      <SidebarHeader>
        <SidebarHeaderContent />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
