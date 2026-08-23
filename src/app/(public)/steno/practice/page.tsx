"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Headphones, Play, ShieldAlert, Award } from "lucide-react";

export default function StenoPracticePage() {
  const practiceDrills = [
    { title: "80 WPM Hindi Legal Dictation - Practice 1", wpm: 80, language: "Hindi", category: "Legal" },
    { title: "100 WPM Hindi Editorial Dictation - Practice 2", wpm: 100, language: "Hindi", category: "Editorial" },
    { title: "80 WPM English General Dictation - Practice 1", wpm: 80, language: "English", category: "General" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" /> Steno Speed Building Practice
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Free speed building drills and daily shorthand dictation exercises.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {practiceDrills.map((drill, idx) => (
          <Card key={idx} className="p-5 rounded-3xl border-slate-200 space-y-4 hover:shadow-md transition-all">
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md border border-indigo-100">
              {drill.language} • {drill.wpm} WPM
            </span>
            <h3 className="text-base font-black text-slate-900">{drill.title}</h3>
            <p className="text-xs text-slate-400">Category: {drill.category}</p>
            <Link href="/steno/dictation">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs rounded-xl gap-2 mt-2">
                <Play className="w-3.5 h-3.5" /> Start Practice
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
