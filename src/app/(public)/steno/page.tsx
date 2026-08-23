"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Headphones, PlayCircle, Trophy, BarChart3, Award, ArrowRight, Layers, FileText, CheckCircle2 } from "lucide-react";

export default function StenoMainHubPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl z-10">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-400/30">
              India's Premier Stenography & Shorthand Portal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Master Shorthand Dictations & Real-Time Transcriptions
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Prepare for High Court, SSC Grade C & D, UPSSSC, and Railways Stenographer exams with audio dictations, Kruti Dev / Mangal font support, and automated evaluation.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <Link href="/steno/dictation">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 px-6 rounded-2xl shadow-lg gap-2">
                  <Headphones className="w-5 h-5" /> Start Dictation Practice
                </Button>
              </Link>
              <Link href="/steno/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold h-12 px-6 rounded-2xl gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" /> Student Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">Steno Audio Engine</h4>
                <p className="text-[10px] text-slate-300">0.5x - 2.0x Dictation Speed</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3 space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Remington & Inscript Layouts</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Half & Full Mistake Breakdown</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSC & High Court Exam Rules</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Audio Dictations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curated legal, editorial, and official audio dictations recorded at 80 WPM, 100 WPM, and 120 WPM.
            </p>
            <Link href="/steno/dictation" className="inline-flex items-center text-xs font-bold text-indigo-600 hover:gap-2 transition-all">
              Explore Dictations <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Dictation Series</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Step-by-step series packages designed for progressive speed building and exam preparation.
            </p>
            <Link href="/steno/series" className="inline-flex items-center text-xs font-bold text-emerald-600 hover:gap-2 transition-all">
              View All Series <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Steno Mock Exams</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Timed exam simulations adhering to official SSC, High Court, and UPSSSC evaluation rules.
            </p>
            <Link href="/steno/mock-tests" className="inline-flex items-center text-xs font-bold text-amber-600 hover:gap-2 transition-all">
              Attempt Mock Tests <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
