"use client";

import NotificationBell from "../shared/NotificationBell";
import { Search, LogOut, User, Settings, Shield, Menu, PlayCircle, Trophy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface StudentNavbarProps {
    onMenuToggle: () => void;
}

const quickLinks = [
    { label: "Back to Website", href: "/", icon: Home, color: "text-primary bg-primary/5 hover:bg-primary/10 border-primary/20" },
];

export default function StudentNavbar({ onMenuToggle }: StudentNavbarProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/student/courses?s=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 shrink-0 sticky top-0">
            {/* Main row */}
            <div className="flex items-center justify-between px-6 md:px-10 h-20 gap-6">
                {/* Left — Hamburger + Search */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0 border border-slate-200"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden md:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find lessons, assessments, or materials..."
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-11 pr-4 h-11 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all font-bold outline-none placeholder:text-slate-400 placeholder:font-medium"
                        />
                    </form>
                </div>

                {/* Right — Quick Links + Bell + Profile */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Quick access pills — hidden on very small screens */}
                    <div className="hidden sm:flex items-center gap-3">
                        {quickLinks.map(link => {
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <Link key={link.href} href={link.href}>
                                    <span className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 border-2 border-primary"
                                            : cn("border-2 border-transparent", link.color.split(' ')[0], link.color.split(' ')[1], "hover:scale-105")
                                    )}>
                                        <link.icon className="w-3.5 h-3.5" />
                                        <span className="hidden lg:inline">{link.label}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="w-px h-8 bg-slate-100 hidden sm:block mx-2" />

                    <div className="p-1 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                        <NotificationBell />
                    </div>

                    <div className="w-px h-8 bg-slate-100 mx-2" />

                    <div className="relative">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 hover:bg-white group p-1 pr-4 rounded-2xl transition-all border-2 border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-lg flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover relative z-10" />
                                        ) : (
                                            <span className="relative z-10">{session?.user?.name?.[0] || "S"}</span>
                                        )}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-black text-slate-900 leading-none group-hover:text-primary transition-colors flex items-center gap-1.5">
                                            {session?.user?.name || "Student"}
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                                            Learner ID #4920
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 rounded-[2.5rem] p-4 shadow-2xl border-slate-100/50 backdrop-blur-xl bg-white/95" align="end" sideOffset={12}>
                                <DropdownMenuLabel className="font-normal p-6 bg-slate-950 rounded-[2rem] mb-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-900 font-black text-xl shrink-0 border-2 border-white/20 overflow-hidden">
                                            {session?.user?.image ? (
                                                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                session?.user?.name?.[0]
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-base font-black leading-none text-white tracking-tight">{session?.user?.name}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-2 truncate opacity-80">{session?.user?.email}</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none shadow-none text-[9px] font-black uppercase tracking-widest py-1 px-3">
                                                    Verified Student
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                
                                <div className="space-y-1 px-1">
                                    <DropdownMenuItem className="rounded-2xl p-4 font-black text-sm text-slate-600 focus:text-primary focus:bg-primary/5 cursor-pointer flex items-center gap-4 transition-all" asChild>
                                        <Link href="/student/settings">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                                                <User className="h-5 w-5" />
                                            </div>
                                            Profile Overview
                                        </Link>
                                    </DropdownMenuItem>
    
                                    <DropdownMenuItem className="rounded-2xl p-4 font-black text-sm text-slate-600 focus:text-primary focus:bg-primary/5 cursor-pointer flex items-center gap-4 transition-all" asChild>
                                        <Link href="/student/attendance">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50/50 flex items-center justify-center text-purple-600 border border-purple-100/50">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            Attendance Logs
                                        </Link>
                                    </DropdownMenuItem>
    
                                </div>
    
                                <DropdownMenuSeparator className="my-4 bg-slate-100 h-0.5 rounded-full" />
    
                                <div className="px-1">
                                    <DropdownMenuItem
                                        className="rounded-2xl p-4 font-black text-sm text-rose-600 focus:text-white focus:bg-rose-600 cursor-pointer flex items-center gap-4 transition-all"
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 group-focus:bg-rose-500 group-focus:text-white">
                                            <LogOut className="h-5 w-5" />
                                        </div>
                                        Sign out securely
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Mobile quick-access bar (full width second row) */}
            <div className="sm:hidden flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Search lessons, tests..."
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl pl-3 pr-3 h-9 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium min-w-0"
                />
                {quickLinks.map(link => (
                    <Link key={link.href} href={link.href} className="shrink-0">
                        <span className={cn(
                            "flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all",
                            pathname.startsWith(link.href) ? "bg-primary text-white" : link.color
                        )}>
                            <link.icon className="w-3.5 h-3.5" />
                            {link.label}
                        </span>
                    </Link>
                ))}
            </div>
        </header>
    );
}
