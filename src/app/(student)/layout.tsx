"use client";

import { useState } from "react";
import { ReactNode } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentNavbar from "@/components/student/StudentNavbar";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const isStenoRoute = pathname ? (pathname.startsWith("/student/steno") || pathname.includes("/steno")) : false;

    if (isStenoRoute) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col min-w-0 relative print:h-auto print:overflow-visible">
                <StudentNavbar onMenuToggle={() => {}} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth bg-transparent print:overflow-visible print:h-auto">
                    <div className="w-full max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden print:h-auto print:overflow-visible">
            {/* Sidebar — always visible on lg, drawer on mobile */}
            <StudentSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative print:h-auto print:overflow-visible">
                <StudentNavbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
                <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-transparent print:overflow-visible print:h-auto">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
