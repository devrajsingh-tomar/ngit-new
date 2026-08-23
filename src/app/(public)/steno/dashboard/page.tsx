"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStudentStenoDashboardDataAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Headphones,
  Award,
  Zap,
  Play,
  RotateCcw,
  Trophy,
  Target,
  Gauge,
  CheckCircle2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function StenoDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: {
      testsAttempted: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      bestAccuracy: 0,
      recentRank: "N/A",
    },
    continuePractice: null,
    recommendedPassages: [],
  });

  // Filter state for Recommended Practice
  const [language, setLanguage] = useState("All");
  const [exam, setExam] = useState("All");
  const [targetWpm, setTargetWpm] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadDashboardData();
  }, [language, exam, targetWpm]);

  const loadDashboardData = async () => {
    setLoading(true);
    const res = await getStudentStenoDashboardDataAction({
      language,
      exam,
      targetWpm,
    });
    if (res.success && res.data) {
      setData(res.data);
    } else {
      toast.error(res.error || "Failed to load dashboard data");
    }
    setLoading(false);
  };

  const { stats, continuePractice, recommendedPassages } = data;

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-indigo-400/30">
            Student Performance Hub
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">
            Stenography & Shorthand Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time dictation stats, accuracy tracking, error breakdown, and custom exam preparation.
          </p>
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link href="/steno/practice">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-4 text-xs rounded-xl shadow-md gap-1.5">
              <Zap className="w-4 h-4" /> Practice
            </Button>
          </Link>
          <Link href="/steno/dictation">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-4 text-xs rounded-xl shadow-md gap-1.5">
              <Headphones className="w-4 h-4" /> Dictation
            </Button>
          </Link>
          <Link href="/steno/mock-tests">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-11 px-4 text-xs rounded-xl shadow-md gap-1.5">
              <Award className="w-4 h-4" /> Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Student Statistics Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" /> Student Performance Statistics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tests Attempted</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.testsAttempted}</h3>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average WPM</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.avgWpm} WPM</h3>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Best WPM</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.bestWpm} WPM</h3>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Accuracy</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{stats.avgAccuracy}%</h3>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Best Accuracy</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{stats.bestAccuracy}%</h3>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Rank</p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">{stats.recentRank}</h3>
          </Card>
        </div>
      </div>

      {/* Continue Practice Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-600" /> Continue Practice
        </h2>

        {continuePractice ? (
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                Last Session / Recommended
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {continuePractice.passageId?.title || "Hindi Legal Dictation - 80 WPM"}
              </h3>
              <p className="text-xs text-slate-400">
                Language: {continuePractice.passageId?.language || "Hindi"} • Target Speed:{" "}
                {continuePractice.passageId?.targetWpm || 80} WPM
              </p>
            </div>

            <Link href={continuePractice.passageId?._id ? `/steno/passage/${continuePractice.passageId._id}` : "/steno/dictation"}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 text-xs rounded-2xl gap-2 shadow-md">
                <Play className="w-4 h-4" /> Resume Dictation Practice
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6 text-center text-slate-400 rounded-3xl border-dashed">
            No previous practice recorded. Choose a recommended dictation below to begin!
          </Card>
        )}
      </div>

      {/* Recommended Practice Section with Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Recommended Practice Dictations
          </h2>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-2">
              <Filter className="w-3 h-3 text-indigo-600" /> Filters:
            </div>

            {/* Language Filter */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Languages</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>

            {/* Exam Filter */}
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Legal">Legal</option>
              <option value="Editorial">Editorial</option>
              <option value="General Dictation">General</option>
            </select>

            {/* WPM Filter */}
            <select
              value={targetWpm || ""}
              onChange={(e) => setTargetWpm(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="">All Speeds</option>
              <option value="80">80 WPM</option>
              <option value="100">100 WPM</option>
              <option value="120">120 WPM</option>
            </select>
          </div>
        </div>

        {/* Passages Cards Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Updating recommended dictations...
          </div>
        ) : recommendedPassages.length === 0 ? (
          <Card className="py-12 text-center text-slate-400 rounded-3xl border-dashed">
            No dictations match your selected filters. Try adjusting the filters above.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedPassages.map((p: any) => (
              <Card key={p._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                    {p.language} • {p.targetWpm || 80} WPM
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{p.difficulty || "Intermediate"}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-400 truncate">Category: {p.category || "General Dictation"}</p>
                <Link href={`/steno/passage/${p._id}`}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs rounded-xl gap-2 mt-2">
                    <Play className="w-4 h-4" /> Start Dictation
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
