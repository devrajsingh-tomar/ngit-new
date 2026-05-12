"use client";

import NotificationBell from "../shared/NotificationBell";
import { Search, Menu, LogOut, User, Settings } from "lucide-react";
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

interface AdminNavbarProps {
    onMenuClick?: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
    const { data: session } = useSession();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:block">
                    <NotificationBell />
                </div>
                <div className="w-px h-8 bg-slate-100" />
                
                <div className="relative">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-4 hover:bg-slate-50/80 pl-1.5 pr-3 py-1.5 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-slate-900 tracking-tight">{session?.user?.name || "NGIT Admin"}</p>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.1em] mt-0.5">Administrator</p>
                                </div>
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-200 border-2 border-white group-hover:scale-105 transition-transform">
                                        {session?.user?.name?.[0] || "A"}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-2xl border-slate-100" align="end" sideOffset={8}>
                            <DropdownMenuLabel className="font-bold text-xs text-slate-400 uppercase tracking-widest px-3 mb-1">Account Management</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 focus:text-primary focus:bg-primary/5 cursor-pointer gap-3" asChild>
                                <Link href="/admin/settings">
                                    <User className="w-4 h-4" /> Profile Info
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 focus:text-primary focus:bg-primary/5 cursor-pointer gap-3" asChild>
                                <Link href="/admin/settings">
                                    <Settings className="w-4 h-4" /> System Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem 
                                className="rounded-xl p-3 font-bold text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer gap-3"
                                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                            >
                                <LogOut className="w-4 h-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
