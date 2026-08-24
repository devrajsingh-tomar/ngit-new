"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Keyboard,
  Mic,
  ArrowRight,
  Headphones,
  Layers,
  Award,
  FileText,
  BarChart3,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function ManagerDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="bg-[#f8fafc] space-y-8 min-h-screen">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dedicated Manager Control Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Welcome, <span className="text-indigo-300">{session?.user?.name || "Manager"}</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl">
            You are in the NGIT Dedicated Content Manager Workspace. Manage Typing tests & evaluations alongside Shorthand / Steno dictations and official exam collections.
          </p>
        </div>
      </div>

      {/* Two Major Management Module Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] px-1">
          Primary Content Management Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1: Typing Management */}
          <Card className="p-8 rounded-[2.5rem] border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-inner">
                <Keyboard className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Typing Management
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Manage typing tests, student evaluation results, speed scoring rules, and typing content across English and Hindi layouts.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">Exam Presets</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">Speed Evaluations</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">Student Reports</span>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100">
              <Link href="/manager/typing">
                <Button className="w-full h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-600/20 gap-2 group-hover:gap-3 transition-all">
                  Open Typing Management <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Module 2: Steno Management */}
          <Card className="p-8 rounded-[2.5rem] border-slate-200 bg-white hover:border-purple-400 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-inner">
                <Mic className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  Steno Management
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Manage audio/video dictations, series collections, official SSC & High Court exam presets, fonts, mistake penalty rules, and student evaluation reports.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">Dictation CMS</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">Series Collections</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mistake Rules</span>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100">
              <Link href="/manager/steno">
                <Button className="w-full h-13 rounded-2xl bg-purple-600 hover:bg-purple-700 font-bold text-sm shadow-lg shadow-purple-600/20 gap-2 group-hover:gap-3 transition-all">
                  Open Steno Management <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Action Navigation Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] px-1">
          Quick Management Shortcuts
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/manager/steno/passages">
            <Card className="p-5 rounded-3xl border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Dictation CMS</h4>
                <p className="text-[10px] text-slate-400 font-medium">Audio & Text</p>
              </div>
            </Card>
          </Link>

          <Link href="/manager/steno/series">
            <Card className="p-5 rounded-3xl border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Steno Series</h4>
                <p className="text-[10px] text-slate-400 font-medium">Collections</p>
              </div>
            </Card>
          </Link>

          <Link href="/manager/steno/exams">
            <Card className="p-5 rounded-3xl border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Exam Presets</h4>
                <p className="text-[10px] text-slate-400 font-medium">SSC / HC / UP</p>
              </div>
            </Card>
          </Link>

          <Link href="/manager/typing/results">
            <Card className="p-5 rounded-3xl border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Typing Results</h4>
                <p className="text-[10px] text-slate-400 font-medium">Student Reports</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
