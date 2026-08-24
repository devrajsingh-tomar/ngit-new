"use client";

import { useState } from "react";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import ManagerNavbar from "@/components/manager/ManagerNavbar";
import { cn } from "@/lib/utils";

export default function ManagerLayoutClient({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

    const handleMenuClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md md:hidden transition-all duration-500"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-[70] w-72 bg-white shadow-2xl md:shadow-none transform transition-all duration-500 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] md:relative md:w-64 flex-shrink-0",
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                desktopSidebarCollapsed ? 'md:-ml-64 md:-translate-x-full' : 'md:translate-x-0 md:ml-0'
            )}>
                <ManagerSidebar onClose={() => setSidebarOpen(false)} className="h-full border-r border-slate-100" />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden w-full relative">
                <ManagerNavbar onMenuClick={handleMenuClick} />
                <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-transparent">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
