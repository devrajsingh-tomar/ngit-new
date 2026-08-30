"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Users,
    CreditCard,
    Settings,
    GraduationCap,
    ClipboardList,
    Layout,
    ChevronDown,
    Keyboard,
    Mic,
    Headphones,
    Layers,
    Award,
    Type,
    Sliders,
    Trophy,
    BarChart3,
    Clock,
    Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const menuGroups = [
    {
        groupLabel: "Overview",
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        groupLabel: "Steno Management",
        items: [
            { label: "Steno Overview", href: "/admin/steno", icon: Mic },
            { label: "Target Steno Batches (Step 1)", href: "/admin/steno/batches", icon: Layers },
            { label: "Series Topics (Step 2)", href: "/admin/steno/series", icon: FileText },
            { label: "Dictation Passages (Step 3)", href: "/admin/steno/passages", icon: Headphones },
            { label: "Doubt Solution Videos", href: "/admin/steno/doubt-videos", icon: Video },
            { label: "Exam Presets & Rules", href: "/admin/steno/exams", icon: Award },
            { label: "Student Results", href: "/admin/steno/results", icon: BarChart3 },
        ]
    },

    {
        groupLabel: "Typing Simulator",
        items: [
            { label: "Typing Dashboard", href: "/admin/typing", icon: Keyboard },
            { label: "Student Typing Results", href: "/admin/typing/results", icon: BarChart3 },
        ]
    },
    {
        groupLabel: "Student Affairs",
        items: [
            {
                label: "Student Hub",
                href: "/admin/students",
                icon: Users,
                subItems: [
                    { label: "Registrations", href: "/admin/students" },
                    { label: "Website Users", href: "/admin/students/website-users" },
                    { label: "Enrollments", href: "/admin/students/enrollments" }
                ]
            },
            { label: "Attendance", href: "/admin/attendance", icon: ClipboardList },
            { label: "Payments & Invoices", href: "/admin/payments", icon: CreditCard },
            { label: "Certificates", href: "/admin/certificates", icon: GraduationCap },
        ]
    },
    {
        groupLabel: "Website Editor",
        items: [
            { label: "Homepage Settings", href: "/admin/content", icon: Layout },
            { label: "Blogs & Articles", href: "/admin/blogs", icon: FileText },
        ]
    },
    {
        groupLabel: "System",
        items: [
            { label: "Settings", href: "/admin/settings", icon: Settings },
        ]
    }
];

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export default function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const filteredMenuGroups = menuGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => {
                if (userRole === "STENO_ADMIN") {
                    return item.href.startsWith("/admin/steno");
                }
                if (userRole === "TYPING_ADMIN") {
                    return item.href.startsWith("/admin/typing");
                }
                if (userRole === "CONTENT_MANAGER") {
                    return item.href.startsWith("/admin/steno") || item.href.startsWith("/admin/typing");
                }
                return true;
            }),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <aside className={cn("w-64 bg-white border-r flex flex-col h-full shadow-sm", className)} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        N
                    </div>
                    <div className="leading-tight">
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">NGIT</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Workspace</p>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} aria-label="Close sidebar" className="md:hidden p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors border bg-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide space-y-6">
                {filteredMenuGroups.map((group) => (
                    <div key={group.groupLabel} className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                            {group.groupLabel}
                        </h4>
                        {group.items.map((item) => (
                            <div key={item.label}>
                                {item.subItems ? (
                                    <details className="group" open={pathname.startsWith(item.href)}>
                                        <summary className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer list-none",
                                            (pathname.startsWith(item.href) && pathname !== "/admin")
                                                ? "bg-slate-100 text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}>
                                            <item.icon className={cn("w-4 h-4 transition-colors", (pathname.startsWith(item.href) && pathname !== "/admin") ? "text-indigo-600" : "text-slate-400")} />
                                            <span className="flex-1">{item.label}</span>
                                            <ChevronDown className="w-4 h-4 opacity-50 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <div className="ml-4 pl-4 mt-1 space-y-1 border-l-2 border-slate-100">
                                            {item.subItems.map((subItem) => (
                                                <Link
                                                    key={`${item.label}-${subItem.label}-${subItem.href}`}
                                                    href={subItem.href}
                                                    onClick={onClose}
                                                    className={cn(
                                                        "block px-3 py-2 rounded-lg text-[11px] font-bold transition-all uppercase tracking-wider",
                                                        pathname === subItem.href
                                                            ? "text-indigo-600 bg-indigo-50 shadow-sm"
                                                            : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </details>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group",
                                            pathname === item.href
                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}>
                                        <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
