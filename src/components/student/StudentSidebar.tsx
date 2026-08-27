"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  PlayCircle,
  BookOpen,
  Trophy,
  TrendingUp,
  ClipboardList,
  Award,
  UserCircle,
  CreditCard,
  GraduationCap,
  X,
  Menu,
  Keyboard,
  ChevronRight,
  ChevronDown,
  Mic,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const menuItems = [
  { label: "Dashboard", href: "/student", icon: Home },
  { label: "Online Admission", href: "/enroll", icon: GraduationCap },
  { label: "Practical Tools", href: "/student/tools", icon: Code2 },
  { label: "Global Leaderboard", href: "/student/leaderboard", icon: Award },
  { label: "Typing Exams", href: "/student/typing", icon: Keyboard },
  {
    label: "Steno / Short Hand",
    href: "/student/steno/dashboard",
    icon: Mic,
    subItems: [
      { label: "Steno Dashboard", href: "/student/steno/dashboard" },
      { label: "My Profile", href: "/student/steno/my-tests" },
      { label: "Steno Batches", href: "/student/steno/series" },
      { label: "Steno Leaderboard", href: "/student/steno/leaderboard" },
    ],
  },

  { label: "Payments", href: "/student/fees", icon: CreditCard },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardList },
  { label: "Certificates", href: "/student/certificates", icon: Award },
  { label: "Profile", href: "/student/settings", icon: UserCircle },
];

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentSidebar({ isOpen, onClose }: StudentSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [stenoExpanded, setStenoExpanded] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/steno")) {
      setStenoExpanded(true);
    }
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-slate-950 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-white/5",
          "lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <Link href="/student" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-black tracking-tight text-white leading-none">Student</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Portal v2.0</p>
            </div>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const hasSub = !!item.subItems;
            const isActive =
              pathname === item.href ||
              (item.href !== "/student" && pathname.startsWith(item.href));

            if (hasSub) {
              return (
                <div key={item.href} className="space-y-1">
                  <button
                    onClick={() => setStenoExpanded(!stenoExpanded)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group",
                      isActive
                        ? "bg-gradient-to-r from-primary via-primary to-secondary text-white shadow-xl shadow-primary/30"
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-slate-600"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {stenoExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Submenu links */}
                  {stenoExpanded && (
                    <div className="pl-9 pr-2 space-y-1 pt-1 border-l-2 border-slate-800 ml-5">
                      {item.subItems?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "block px-3 py-2 rounded-xl text-xs font-bold transition-all",
                              isSubActive
                                ? "bg-white/10 text-white font-extrabold"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group",
                  isActive
                    ? "bg-gradient-to-r from-primary via-primary to-secondary text-white shadow-xl shadow-primary/30"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-600"
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section at Bottom */}
        <div className="p-4 border-t border-white/5">
          <Link
            href="/student/settings"
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
            onClick={onClose}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden relative shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-sm">
                  {session?.user?.name?.[0] || "S"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate leading-none mb-1">
                {session?.user?.name || "Student"}
              </p>
              <p className="text-[10px] font-bold text-slate-500 truncate leading-none uppercase tracking-widest">
                View Profile
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </aside>
    </>
  );
}
