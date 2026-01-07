"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "./AppIcon"
import * as React from "react"
import { createPortal } from "react-dom"

const getTooltipText = (item: any) => {
  if (!item.items || item.items.length === 0) {
    return item.title;
  }
  const moduleNames = item.items.map((subItem: any) => subItem.title).join(' • ');
  return `${item.title} • ${moduleNames}`;
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: any
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { state } = useSidebar()
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0 })
  const buttonRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && buttonRefs.current.get(openDropdown)) {
        if (!buttonRefs.current.get(openDropdown)!.contains(event.target as Node)) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      clearCloseTimeout()
    }
  }, [openDropdown])

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleDropdownToggle = (item: any, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (openDropdown === item.title) {
      setOpenDropdown(null)
    } else {
      const button = buttonRefs.current.get(item.title)
      if (button) {
        const rect = button.getBoundingClientRect()
        setDropdownPosition({
          top: rect.top,
          left: rect.right + 8
        })
      }
      setOpenDropdown(item.title)
    }
  }

  const handleMouseEnter = (item: any) => {
    if (state === "collapsed") {
      clearCloseTimeout()
      const button = buttonRefs.current.get(item.title)
      if (button) {
        const rect = button.getBoundingClientRect()
        setDropdownPosition({
          top: rect.top,
          left: rect.right + 8
        })
      }
      setOpenDropdown(item.title)
    }
  }

  const handleMouseLeave = (item: any) => {
    if (state === "collapsed") {
      clearCloseTimeout()
      closeTimeoutRef.current = setTimeout(() => {
        setOpenDropdown(null)
      }, 200) // 200ms delay
    }
  }

  const handleSingleMenuMouseEnter = (item: any) => {
    if (state === "collapsed") {
      clearCloseTimeout()
      const button = buttonRefs.current.get(item.title)
      if (button) {
        const rect = button.getBoundingClientRect()
        setDropdownPosition({
          top: rect.top,
          left: rect.right + 8
        })
      }
      setOpenDropdown(`single-${item.title}`)
    }
  }

  const handleSingleMenuMouseLeave = (item: any) => {
    if (state === "collapsed") {
      clearCloseTimeout()
      closeTimeoutRef.current = setTimeout(() => {
        setOpenDropdown(null)
      }, 200) // 200ms delay
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          // If no sub-items, render as simple link
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                {state === "collapsed" ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => handleSingleMenuMouseEnter(item)}
                    onMouseLeave={() => handleSingleMenuMouseLeave(item)}
                  >
                    <SidebarMenuButton 
                      ref={(el) => { if (el) buttonRefs.current.set(item.title, el) }}
                      asChild
                    >
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </div>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          }

          // If has sub-items, render as collapsible
          return (
            <SidebarMenuItem key={item.title}>
              {state === "collapsed" ? (
                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item)}
                  onMouseLeave={() => handleMouseLeave(item)}
                >
                  <SidebarMenuButton 
                    ref={(el) => { if (el) buttonRefs.current.set(item.title, el) }}
                    onClick={(e) => handleDropdownToggle(item, e)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.items && item.items.length > 0 && (
                      <ChevronRightIcon className="ml-auto transition-transform duration-200" />
                    )}
                  </SidebarMenuButton>
                </div>
              ) : (
                <Collapsible
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={getTooltipText(item)}
                      onClick={(e) => {
                        // Allow navigation when sidebar is expanded
                        if (!item.url) {
                          e.preventDefault()
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.items && item.items.length > 0 && (
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
      
      {/* Portal for dropdown */}
      {openDropdown && (() => {
        const isSingleMenu = openDropdown.startsWith('single-')
        const itemTitle = isSingleMenu ? openDropdown.replace('single-', '') : openDropdown
        const item = items.find(i => i.title === itemTitle)
        if (!item) return null
        
        return createPortal(
          <div 
            className="fixed min-w-40 rounded-lg border border-gray-200 bg-white shadow-lg p-1"
            style={{
              zIndex: 999999,
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
            onMouseEnter={() => {
              clearCloseTimeout()
              setOpenDropdown(openDropdown)
            }}
            onMouseLeave={() => {
              clearCloseTimeout()
              closeTimeoutRef.current = setTimeout(() => {
                setOpenDropdown(null)
              }, 200)
            }}
          >
            {isSingleMenu ? (
              // Single menu card
              <a
                href={item.url}
                className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setOpenDropdown(null)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </a>
            ) : (
              // Dropdown card with sub-items
              <>
                <div className="text-sm font-medium text-gray-900 px-2 py-1.5 border-b border-gray-100 mb-1">
                  {item.title}
                </div>
                {item.items?.map((subItem) => (
                  <a
                    key={subItem.title}
                    href={subItem.url}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <span>{subItem.title}</span>
                  </a>
                ))}
              </>
            )}
          </div>,
          document.body
        )
      })()}
    </SidebarGroup>
  )
}