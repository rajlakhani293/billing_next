"use client"

import * as React from "react"
import DynamicIcon from "./DynamicIcon"
import { useSession } from "@/hooks/useSession"
import { 
    SidebarContainer, 
    NavItem, 
    SidebarDropdown, 
    SidebarDropdownItem,
    type SidebarItemData 
} from "./ui/sidebar"

// Transform API data to sidebar item format
const transformMenuData = (menus: any[]): SidebarItemData[] => {
  return menus.map(menu => ({
    label: menu.name || menu.menu_name,
    href: menu.url || menu.menu_url,
    icon: <DynamicIcon name={menu.icon_name || menu.menu_icon_name} size={20} />,
    children: menu.modules?.map((module: any) => ({
      label: module.name || module.module_name,
      href: module.url || module.module_url,
      icon: module.icon_name ? <DynamicIcon name={module.icon_name} size={16} /> : undefined,
    })) || []
  }));
}

export function CustomSidebar({ onToggle }: { onToggle?: (isCollapsed: boolean) => void }) {
  const { menus } = useSession();
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [openDropdowns, setOpenDropdowns] = React.useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  
  const navItems = React.useMemo(() => {
    if (menus && menus.length > 0) {
      return transformMenuData(menus);
    }
    return [];
  }, [menus]);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    setOpenDropdowns(new Set());
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const renderNavItem = (item: SidebarItemData) => {
    const isOpen = openDropdowns.has(item.label);
    
    if (item.children && item.children.length > 0) {
      return (
        <SidebarDropdown
          key={item.label}
          icon={item.icon}
          label={item.label}
          isCollapsed={isCollapsed}
          isMobileOpen={false}
          activeTooltip={activeTooltip}
          setActiveTooltip={setActiveTooltip}
          isOpen={isOpen}
          onToggle={() => toggleDropdown(item.label)}
        >
          {item.children.map((child) => (
            <SidebarDropdownItem
              key={child.label}
              href={child.href || '#'}
              icon={child.icon}
              label={child.label}
            />
          ))}
        </SidebarDropdown>
      );
    }
    
    return (
      <NavItem
        key={item.label}
        icon={item.icon}
        label={item.label}
        href={item.href || '#'}
        isCollapsed={isCollapsed}
        activeTooltip={activeTooltip}
        setActiveTooltip={setActiveTooltip}
      />
    );
  };

  return (
    <SidebarContainer
      isCollapsed={isCollapsed}
      sidebarRef={sidebarRef}
      logo={<img src="next.svg" alt="Next" className="w-30" />}
      toggleSidebar={toggleSidebar}
    >
      {navItems.map(renderNavItem)}
    </SidebarContainer>
  )
}
