import { twMerge } from "tailwind-merge";
import { DownIcon, NextJsIcon, PanelLeft, PanelRight } from "../AppIcon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type SidebarItemData = {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    children?: SidebarItemData[];
};

type NavItemProps = {
    icon?: React.ReactNode;
    label: string;
    href?: string;
    isCollapsed: boolean;
    activeTooltip: string | null;
    setActiveTooltip: (v: string | null) => void;
    onLinkClick?: () => void;
    isActive?: boolean;
};

type SidebarDropdownProps = {
    icon?: React.ReactNode;
    label: string;
    children?: React.ReactNode;
    isCollapsed: boolean;
    activeTooltip: string | null;
    setActiveTooltip: (v: string | null) => void;
    isOpen: boolean;
    onToggle: () => void;
    isActive?: boolean;
};

interface SidebarDropdownItemProps {
    href: string;
    icon?: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

interface SidebarContainerProps {
    isCollapsed: boolean;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    
    // Content props
    title?: string;
    logo?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    header?: React.ReactNode;

    // callbacks
    toggleSidebar: () => void;
}


export const SidebarContainer: React.FC<SidebarContainerProps> = ({
    isCollapsed,
    sidebarRef,
    logo,
    children,
    footer,
    header,
    toggleSidebar,
}) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <aside
            ref={sidebarRef}
            className={twMerge(
                `flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out `,
                isCollapsed ? "w-[68px]" : "w-[264px]"
            )}
        >
            {/* Clickable right border for resize */}
            <div 
                className={`absolute right-0 top-0 h-full w-1 hover:bg-gray-100 transition-colors z-10 ${isCollapsed ? "cursor-e-resize" : "cursor-w-resize"}`}
                onClick={toggleSidebar}
            />
                {/* Header Section */}
                {header ? (
                    <div className="shrink-0 transition-all duration-300 overflow-hidden">
                        {header}
                    </div>
                ) : (
                <div
                    className={twMerge(
                        "flex items-center justify-between p-4 h-16 shrink-0 border-b",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    {/* Logo / Title Wrapper */}
                    {!isCollapsed && (
                        <div
                            className="flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 w-auto opacity-100"
                        >
                            {logo && <div className="shrink-0">{logo}</div>}
                        </div>
                    )}

                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className={`btn btn-circle btn-ghost items-center justify-center p-1.5 rounded-lg border transition-colors ${isCollapsed ? "cursor-e-resize" : "cursor-w-resize"}`}
                    >
                        {isCollapsed ? (
                            isHovering ? <PanelRight className="size-6 cursor-e-resize" /> : <NextJsIcon className="size-6 cursor-e-resize" />
                        ) : (
                            <PanelLeft className="size-6 cursor-w-resize" />
                        )}
                    </button>
                </div>
                )}

                {/* Scrollable Content Area */}
                <div
                    className={twMerge(
                        "flex-1 px-3 py-2 no-scrollbar",
                        isCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"
                    )}
                >
                    <ul className="space-y-1 min-h-full flex flex-col">{children}</ul>
                </div>

                {/* Optional Footer Section (User Profile, etc) */}
                {footer && (
                    <div className={twMerge(
                        "p-3 border-t border-gray-200 flex-shrink-0",
                         isCollapsed ? "flex justify-center" : ""
                    )}>
                        {footer}
                    </div>
                )}
            </aside>
    );
};

export const NavItem: React.FC<NavItemProps> = ({
    icon, label, isCollapsed, href = "#",
    activeTooltip, setActiveTooltip, onLinkClick, isActive
}) => {
    const handleClick = () => {
        setActiveTooltip(null);
        if (onLinkClick) onLinkClick();
    };

    return (
        <li
            className="relative group sidebar-interactive"
            onMouseEnter={() => { if (activeTooltip && activeTooltip !== label) setActiveTooltip(null); }}
        >
            {/* Icon - non-clickable when collapsed */}
            <div
                className={twMerge(
                    `flex items-center rounded-lg px-3 py-2 transition-all duration-300`,
                    "gap-3",
                    isActive
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed ? "cursor-default" : "cursor-pointer"
                )}
            >
                <span className="shrink-0">{icon}</span>
                <span className={twMerge(
                    "overflow-hidden whitespace-nowrap transition-all duration-300 text-sm font-medium",
                    "w-auto opacity-100",
                    isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                )}>
                    {label}
                </span>
            </div>

            {/* Full link - only when expanded */}
            {!isCollapsed && (
                <Link
                    href={href}
                    onClick={handleClick}
                    aria-hidden="true"
                />
            )}

            {isCollapsed && (
                <Link
                    href={href}
                    onClick={handleClick}
                    className={twMerge(
                        `hidden lg:block absolute left-full top-0 ml-5 whitespace-nowrap rounded-md border px-2 py-0.5 shadow-lg z-50
             before:absolute before:-left-5 before:top-0 before:h-full before:w-5 before:content-[''] before:bg-transparent
             transition-all duration-200 ease-in-out origin-left
             invisible opacity-0 -translate-x-2 scale-95 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 cursor-pointer`,
                        isActive ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200"
                    )}
                >
                    <p className={twMerge(
                        "p-2 flex items-center gap-x-2 text-xs font-semibold uppercase tracking-wider",
                        isActive ? "text-blue-900" : "text-gray-600"
                    )}>
                       {icon} {label}
                    </p>
                </Link>
            )}
        </li>
    );
};

export const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
    icon, label, children,
    isCollapsed,
    activeTooltip, setActiveTooltip, isOpen, onToggle,
    isActive = false
}) => {

    const [hasClicked, setHasClicked] = useState(false);
    const isActiveTooltip = activeTooltip === label;
    const showExpanded = !isCollapsed;

    const contentRef = useRef<HTMLDivElement | null>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const [renderExpanded, setRenderExpanded] = useState<boolean>(showExpanded && isOpen);
    const [shouldAnimateOpen, setShouldAnimateOpen] = useState(false);

    const liRef = useRef<HTMLLIElement>(null);
    const popupRef = useRef<HTMLUListElement>(null);
    const [popupPlacement, setPopupPlacement] = useState<'top' | 'bottom'>('top');

    // 3. Smart Positioning Logic
    useEffect(() => {
        if (isActiveTooltip && liRef.current && popupRef.current) {
            
            const triggerRect = liRef.current.getBoundingClientRect();
            const popupHeight = popupRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - triggerRect.top;
            if (spaceBelow < (popupHeight + 20)) {
                setPopupPlacement('bottom');
            } else {
                setPopupPlacement('top');
            }
        }
    }, [isActiveTooltip]); 

    const handleToggle = (e: React.MouseEvent) => {
        if (isCollapsed) {
            if (activeTooltip === label) {
                
                if (!hasClicked) {
                    e.preventDefault();
                    setHasClicked(true);
                } else {
                    setActiveTooltip(null);
                    setHasClicked(false);
                }
            } else {
                e.preventDefault();
                setActiveTooltip(label);
                setHasClicked(true);
            }
        } else {
            onToggle();
        }
    };

    useEffect(() => {
        const update = () => {
            if (contentRef.current) {
                setContentHeight(contentRef.current.scrollHeight);
            }
        };
        update();
        const ro = new ResizeObserver(update);
        if (contentRef.current) ro.observe(contentRef.current);
        window.addEventListener("resize", update);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
        };
    }, [children]);

    useEffect(() => {
        if (showExpanded) {
            setRenderExpanded(true);
        } else {
            const t = setTimeout(() => setRenderExpanded(false), 320);
            return () => clearTimeout(t);
        }
    }, [showExpanded]);

    useEffect(() => {
        if (showExpanded && isOpen) {
            setRenderExpanded(true);
            setShouldAnimateOpen(false);
            const t = setTimeout(() => setShouldAnimateOpen(true), 20);
            return () => clearTimeout(t);
        }
    }, [showExpanded, isOpen]);

    // New changes

    useEffect(() => {
        if (activeTooltip !== label) {
            setHasClicked(false);
        }
    }, [activeTooltip, label]);

    return (
        <li 
        
            ref={liRef}
            className="relative group sidebar-interactive"
            onMouseEnter={() => { 
                if (isCollapsed) {
                    setActiveTooltip(label); 
                    setHasClicked(false); 
                } 
            }}

            onMouseLeave={() => { 
                if (isCollapsed) setActiveTooltip(null); 
            }}
        >
            <button
                onClick={handleToggle}
                className={twMerge(
                    `flex w-full items-center cursor-pointer rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 justify-between gap-3`,
                    isActiveTooltip ? "bg-gray-100 text-gray-900" : "",
                    isActive ? "bg-blue-50 text-blue-900 font-medium" : ""
                )}
            >
                <div className="flex items-center gap-3">
                    <span className="shrink-0">{icon}</span>
                    {!isCollapsed && (
                    <span className={twMerge(
                        "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                        "w-auto opacity-100",
                        isCollapsed ? "lg:w-0 lg:opacity-0" : "lg:w-auto lg:opacity-100"
                    )}>
                        {label}
                    </span>
                    )}
                </div>

                <div className={twMerge(
                    "transition-transform duration-300 ease-in-out",
                    isOpen ? "rotate-180" : "",
                    isCollapsed ? "hidden" : "block"
                )}>
                    <DownIcon className="size-4" />
                </div>
            </button>

            {renderExpanded && (
                <div
                    className="relative overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                    style={{
                        maxHeight: (showExpanded && isOpen && shouldAnimateOpen) ? `${contentHeight}px` : "0px",
                        opacity: (showExpanded && isOpen && shouldAnimateOpen) ? 1 : 0
                    }}
                >
                    <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gray-200" />
                    <ul>
                        <div ref={contentRef} className="pl-8">
                            {children}
                        </div>
                    </ul>
                </div>
            )}

            {isCollapsed && (
                <ul
                    ref={popupRef}
                    className={twMerge(
                        `hidden lg:block absolute left-full ml-5 w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg z-50
                        before:absolute before:-left-5 before:top-0 before:h-full before:w-5 before:content-['']
                        transition-all duration-200 ease-in-out origin-left`,
                        popupPlacement === 'top' 
                            ? "top-0" 
                            : "bottom-0",
                        isActiveTooltip
                            ? "visible opacity-100 translate-x-0 scale-100"
                            : "invisible opacity-0 -translate-x-2 scale-95" 
                    )}
                >
                    {popupPlacement === 'top' && (
                        <li className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 whitespace-nowrap">
                        {label}
                    </li>
                    )}
                    {children}
                    {popupPlacement === 'bottom' && (
                        <li className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1 whitespace-nowrap">
                       {label}
                    </li>
                    )}
                </ul>
            )}
        </li>
    );
};

export const SidebarDropdownItem: React.FC<SidebarDropdownItemProps> = ({
    href,
    icon,
    label,
    isActive = false,
    onClick,
}) => {
    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className={twMerge(
                    `flex items-center gap-x-3 rounded-md px-3 py-2 text-sm transition-colors`,
                    isActive
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
            >
                <span className="shrink-0">{icon}</span>
                <span className="overflow-hidden whitespace-nowrap transition-all duration-300">
                    {label}
                </span>
            </Link>
        </li>
    );
};