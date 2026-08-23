"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";

export default function StenoAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Allow public landing page /steno without login requirement
  if (pathname === "/steno" || pathname === "/steno/") {
    return <>{children}</>;
  }

  // Loading session state
  if (status === "loading") {
    return (
      <div className="py-20 text-center text-slate-400 min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse space-y-2">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500">Checking Steno Authentication...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show clean login required prompt card
  if (status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto my-12 p-4">
        <Card className="p-8 sm:p-12 text-center rounded-[2.5rem] border-slate-200 bg-white shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100">
              Student Portal Access Only
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Login Required</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Access to Steno dictation engine, transcription workspace, mock tests, and performance results is reserved for authenticated students.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 px-8 rounded-2xl shadow-md gap-2">
                Login to Access Steno Software <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/steno" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto font-bold h-12 px-6 rounded-2xl border-slate-200">
                Back to Steno Info Page
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
