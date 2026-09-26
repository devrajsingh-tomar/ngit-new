"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Zap,
  Headphones,
  Award,
  Layers,
  Clock,
  Trophy,
  Mic,
} from "lucide-react";

const stenoNavTabs = [
  { label: "Steno Dashboard", href: "/student/steno/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/student/steno/practice", icon: Zap },
  { label: "Dictation Player", href: "/student/steno/dictation", icon: Headphones },
  { label: "Mock Tests", href: "/student/steno/mock-tests", icon: Award },
  { label: "Steno Series", href: "/student/steno/series", icon: Layers },
  { label: "My Tests", href: "/student/steno/my-tests", icon: Clock },
  { label: "Leaderboard", href: "/student/steno/leaderboard", icon: Trophy },
];

export default function StenoNavHeader() {
  const pathname = usePathname();

  // Hide the internal tabs bar on the main public landing page (/steno)
  if (pathname === "/steno" || pathname === "/steno/") {
    return null;
  }

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2.5">
          {stenoNavTabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/steno" && pathname?.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
