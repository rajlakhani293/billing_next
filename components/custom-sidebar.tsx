"use client"

import * as React from "react"
import DynamicIcon from "./DynamicIcon"
import { useSession } from "@/hooks/useSession"
import { DownIcon, NextJsIcon, PanelLeft, PanelRight, UpIcon } from "./AppIcon"

// Transform API data to nav-main format
const transformMenuData = (menus: any[]) => {
  return menus.map(menu => ({
    title: menu.name || menu.menu_name,
    url: menu.url || menu.menu_url,
    icon: menu.icon_name || menu.menu_icon_name,
    isActive: false,
    items: menu.modules?.map((module: any) => ({
      title: module.name || module.module_name,
      url: module.url || module.module_url,
    })) || []
  }));
}

export function CustomSidebar({ onToggle }: { onToggle?: (isCollapsed: boolean) => void }) {
  const { menus } = useSession();
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showExpandButton, setShowExpandButton] = React.useState(false);
  const navItems = React.useMemo(() => {
    if (menus && menus.length > 0) {
      return transformMenuData(menus);
    }
    return [];
  }, [menus]);


  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    setOpenDropdown(null);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Clickable border for resize */}
      <div 
        className="absolute right-0 top-0 h-full w-0.5 cursor-ew-resize hover:bg-gray-200 transition-all z-10"
        onClick={toggleSidebar}
      />
      {/* Header */}
      <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <NextJsIcon className="size-6" />
            <img src="next.svg" alt="Next" className="h-6 w-auto" />
          </div>
        )}
        <div 
          className={`relative ${isCollapsed ? 'mx-auto' : ''}`}
          onMouseEnter={() => setShowExpandButton(true)}
          onMouseLeave={() => setShowExpandButton(false)}
        >
          {isCollapsed && !showExpandButton ? (
            <div className="p-1.5 border rounded-lg">
              <NextJsIcon className="size-5" />
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-resize"
              style={{ cursor: 'ew-resize' }}
            >
              {isCollapsed ? <PanelRight className="size-5" /> : <PanelLeft className="size-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map((item) => (
          <div key={item.title} className="">
            {item.items && item.items.length > 0 ? (
              // Menu with sub-items
              <div>
                <button
                  onClick={() => toggleDropdown(item.title)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DynamicIcon name={item.icon} size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                  </div>
                  {!isCollapsed && (
                    openDropdown === item.title ? (
                      <UpIcon className="size-4 cursor-pointer" />
                    ) : (
                      <DownIcon className="size-4 cursor-pointer" />
                    )
                  )}
                </button>
                
                {/* Dropdown for collapsed state */}
                {isCollapsed && openDropdown === item.title && (
                  <div className="absolute left-16 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 border-b border-gray-100 mb-1">
                      {item.title}
                    </div>
                    {item.items.map((subItem: any) => (
                      <a
                        key={subItem.title}
                        href={subItem.url}
                        className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        {subItem.title}
                      </a>
                    ))}
                  </div>
                )}
                
                {/* Expanded state dropdown */}
                {!isCollapsed && openDropdown === item.title && (
                  <div className="ml-4">
                    {item.items.map((subItem: any) => (
                      <a
                        key={subItem.title}
                        href={subItem.url}
                        className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      >
                       <div className="flex items-center gap-3">
                        <DynamicIcon name={subItem.icon} size={20} />
                        {subItem.title}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Single menu item
              <a
                href={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <DynamicIcon name={item.icon} size={20} />
                {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
              </a>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
