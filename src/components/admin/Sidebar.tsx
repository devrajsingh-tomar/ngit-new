"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Shapes,
    Library,
    Users,
    CreditCard,
    Settings,
    Image as ImageIcon,
    Calendar,
    GraduationCap,
    ClipboardList,
    Layout,
    ChevronDown,
    BrainCircuit,
    Bell,
    Video,
    Keyboard,
    MonitorPlay
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuGroups = [
    {
        groupLabel: "Overview",
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        groupLabel: "Assessments",
        items: [
            {
                label: "Typing Simulator",
                href: "/admin/typing",
                icon: Keyboard,
                subItems: [
                    { label: "Dashboard", href: "/admin/typing" },
                    { label: "Student Results", href: "/admin/typing/results" }
                ]
            },
            { label: "Certificates", href: "/admin/certificates", icon: GraduationCap },
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

    return (
        <aside className={cn("w-64 bg-white border-r flex flex-col h-full shadow-[shadow-sm]", className)} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">N</div>
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
                {menuGroups.map((group) => (
                    <div key={group.groupLabel} className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                            {group.groupLabel}
                        </h4>
                        {group.items.map((item) => (
                            <div key={item.label}>
                                {item.subItems ? (
                                    <details className="group" open={pathname.startsWith(item.href)}>
                                        <summary className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer list-none",
                                            (pathname.startsWith(item.href) && pathname !== "/admin")
                                                ? "bg-slate-100 text-primary shadow-sm"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}>
                                            <item.icon className={cn("w-4 h-4 transition-colors", (pathname.startsWith(item.href) && pathname !== "/admin") ? "text-primary" : "text-slate-400")} />
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
                                                            ? "text-primary bg-primary/5 shadow-sm"
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
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
                                            pathname === item.href
                                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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

            <div className="p-4 border-t bg-slate-50/50">
                <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-colors">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-bold text-slate-700">All Systems Operational</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
