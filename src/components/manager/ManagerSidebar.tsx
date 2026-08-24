"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Keyboard,
    Mic,
    Headphones,
    Layers,
    Award,
    FileText,
    Type,
    Sliders,
    Trophy,
    BarChart3,
    Clock,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const managerMenuGroups = [
    {
        groupLabel: "Overview",
        items: [
            { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        groupLabel: "Typing Management",
        items: [
            { label: "Typing Dashboard", href: "/manager/typing", icon: Keyboard },
            { label: "Typing Results", href: "/manager/typing/results", icon: BarChart3 },
        ]
    },
    {
        groupLabel: "Steno Management",
        items: [
            { label: "Steno Control Center", href: "/manager/steno", icon: Mic },
            { label: "Dictation Passages CMS", href: "/manager/steno/passages", icon: Headphones },
            { label: "Steno Series Collections", href: "/manager/steno/series", icon: Layers },
            { label: "Exam Presets", href: "/manager/steno/exams", icon: Award },
            { label: "Official Mock Tests", href: "/manager/steno/mock-tests", icon: FileText },
            { label: "Custom Tests", href: "/manager/steno/custom-tests", icon: Clock },
            { label: "Fonts Manager", href: "/manager/steno/fonts", icon: Type },
            { label: "Mistake Penalty Rules", href: "/manager/steno/error-rules", icon: Sliders },
            { label: "Attempts & Results", href: "/manager/steno/results", icon: BarChart3 },
            { label: "Global Leaderboard", href: "/manager/steno/leaderboard", icon: Trophy },
        ]
    }
];

interface ManagerSidebarProps {
    className?: string;
    onClose?: () => void;
}

export default function ManagerSidebar({ className, onClose }: ManagerSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("w-64 bg-white border-r flex flex-col h-full shadow-sm", className)} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header / Brand */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <Link href="/manager/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        N
                    </div>
                    <div className="leading-tight">
                        <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">NGIT</h1>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.18em] mt-1">MANAGER WORKSPACE</p>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} aria-label="Close sidebar" className="md:hidden p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors border bg-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            {/* Nav Items */}
            <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide space-y-6">
                {managerMenuGroups.map((group) => (
                    <div key={group.groupLabel} className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                            {group.groupLabel}
                        </h4>
                        {group.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group",
                                        isActive
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
