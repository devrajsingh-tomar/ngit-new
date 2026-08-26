"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  Headphones,
  PlayCircle,
  Trophy,
  BarChart3,
  Award,
  ArrowRight,
  Layers,
  FileText,
  CheckCircle2,
  Lock,
  GraduationCap,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function StenoMainLandingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Single Informational Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-5 max-w-2xl z-10">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-400/30">
              India's Premier Stenography & Shorthand Portal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Master Shorthand Dictations & Real-Time Transcriptions
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Prepare for High Court, SSC Grade C & D, UPSSSC, and Railway Stenographer examinations with professional audio dictations, Kruti Dev & Mangal font engine, and automated error calculation.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {isLoggedIn ? (
                <>
                  <Link href="/student/steno/dashboard">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 px-6 rounded-2xl shadow-lg gap-2">
                      <BarChart3 className="w-5 h-5" /> Open Student Steno Dashboard
                    </Button>
                  </Link>
                  <Link href="/student">
                    <Button className="bg-white/10 hover:bg-white/20 text-white font-bold h-12 px-6 rounded-2xl border border-white/20 shadow-xs gap-2 transition-all">
                      <GraduationCap className="w-5 h-5 text-indigo-300" /> Student Portal
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login?callbackUrl=/student/steno/dashboard">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 px-6 rounded-2xl shadow-lg gap-2">
                      <Lock className="w-5 h-5" /> Student Login for Access
                    </Button>
                  </Link>
                  <Link href="/login?callbackUrl=/student/steno/dictation">
                    <Button className="bg-white/10 hover:bg-white/20 text-white font-bold h-12 px-6 rounded-2xl border border-white/20 shadow-xs gap-2 transition-all">
                      <Headphones className="w-5 h-5 text-indigo-300" /> Access Dictation Software
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Engine Highlights Badge Box */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">Steno Audio Engine</h4>
                <p className="text-[10px] text-slate-300">0.5x - 2.0x Dictation Playback</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3 space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Remington & Inscript Layouts</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Half & Full Error Breakdown</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSC & High Court Exam Rules</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Steno Batches & Series Collections</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Curated Legal, Editorial, PYQ, and Speed Building passage collections categorized for targeted speed enhancement.
            </p>
            <Link
              href={isLoggedIn ? "/student/steno/series" : "/login?callbackUrl=/student/steno/series"}
              className="inline-flex items-center text-xs font-bold text-emerald-600 hover:gap-2 transition-all"
            >
              {isLoggedIn ? "Browse Steno Batches & Series" : "Login Required to Access"} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Official Exam Presets & Evaluation</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              SSC Steno Grade C & D, Allahabad High Court, UPSSSC, and HSSC pattern shorthand exams with automated mistake calculations.
            </p>
            <Link
              href={isLoggedIn ? "/student/steno/dashboard" : "/login?callbackUrl=/student/steno/dashboard"}
              className="inline-flex items-center text-xs font-bold text-amber-600 hover:gap-2 transition-all"
            >
              {isLoggedIn ? "Open Student Dashboard" : "Login Required to Access"} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>
        </div>


        {/* Informational Exam Standards & Font Support Banner */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl font-black text-slate-900">Supported Stenography Exam Patterns</h2>
            <p className="text-xs text-slate-500 font-medium">
              Evaluated strictly according to official government board parameters and guidelines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">SSC Grade C & D</span>
              <p className="text-[11px] text-slate-500">80 WPM & 100 WPM • Full & Half mistake rules</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">Allahabad High Court</span>
              <p className="text-[11px] text-slate-500">Legal Dictations • Kruti Dev / Mangal support</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">UPSSSC Steno</span>
              <p className="text-[11px] text-slate-500">Remington GAIL & Inscript layout support</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">Custom Practice</span>
              <p className="text-[11px] text-slate-500">Student custom speed drills & tests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
