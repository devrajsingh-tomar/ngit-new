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
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoDashboardPage() {
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
    <div className="space-y-8 p-1 sm:p-2">
      {/* Top Banner inside Student Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30">
            Student Shorthand Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Steno Student Workspace</h1>
          <p className="text-xs text-slate-300">
            Listen to dictations, type shorthand transcriptions, attempt mock exams, and evaluate your speed.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link href="/student/steno/dictation">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-5 text-xs rounded-xl shadow-md gap-1.5">
              <Headphones className="w-4 h-4" /> Start Dictation
            </Button>
          </Link>
          <Link href="/student/steno/mock-tests">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold h-10 px-5 text-xs rounded-xl gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" /> Attempt Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards Grid inside Student Portal */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/student/steno/practice">
          <Card className="p-5 rounded-3xl border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-md space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Practice Drills</h4>
              <p className="text-[11px] text-slate-400 font-medium">Filter dictation passages</p>
            </div>
          </Card>
        </Link>

        <Link href="/student/steno/dictation">
          <Card className="p-5 rounded-3xl border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-md space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Dictation Player</h4>
              <p className="text-[11px] text-slate-400 font-medium">Audio & transcription engine</p>
            </div>
          </Card>
        </Link>

        <Link href="/student/steno/mock-tests">
          <Card className="p-5 rounded-3xl border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-md space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Mock Tests</h4>
              <p className="text-[11px] text-slate-400 font-medium">SSC & High Court rules</p>
            </div>
          </Card>
        </Link>

        <Link href="/student/steno/my-tests">
          <Card className="p-5 rounded-3xl border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-md space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">My Custom Tests</h4>
              <p className="text-[11px] text-slate-400 font-medium">Student custom test sets</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Student Performance Statistics */}
      <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Student Performance Statistics
          </h3>
          <Button onClick={loadDashboardData} variant="ghost" size="sm" className="h-7 text-xs text-slate-400">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400">Tests Attempted</p>
            <p className="text-xl font-black text-slate-900 mt-1">{stats.testsAttempted}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400">Average Speed</p>
            <p className="text-xl font-black text-indigo-600 mt-1">{stats.avgWpm} WPM</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400">Best Speed</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{stats.bestWpm} WPM</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400">Avg Accuracy</p>
            <p className="text-xl font-black text-purple-600 mt-1">{stats.avgAccuracy}%</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400">Best Accuracy</p>
            <p className="text-xl font-black text-amber-500 mt-1">{stats.bestAccuracy}%</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400">Recent Rank</p>
            <p className="text-xl font-black text-rose-600 mt-1">{stats.recentRank}</p>
          </div>
        </div>
      </Card>

      {/* Continue Practice & Recommended Passages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Practice Box */}
        <Card className="p-6 rounded-3xl border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-xs space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md">
                Continue Practice
              </span>
              <RotateCcw className="w-4 h-4 text-indigo-500" />
            </div>

            {continuePractice?.passageId ? (
              <div>
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {continuePractice.passageId.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Target Speed: <strong className="text-indigo-600 font-bold">{continuePractice.passageId.targetWpm} WPM</strong>
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-base font-black text-slate-900">Start Your First Practice</h4>
                <p className="text-xs text-slate-500 mt-1">Select from recommended dictations below.</p>
              </div>
            )}
          </div>

          <Link href={continuePractice?.passageId?._id ? `/student/steno/passage/${continuePractice.passageId._id}` : "/student/steno/practice"} className="pt-4">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs rounded-xl gap-1.5 shadow-md">
              <Play className="w-4 h-4 fill-white" /> Continue Passage
            </Button>
          </Link>
        </Card>

        {/* Recommended Passages Filter Grid */}
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-600" /> Recommended Dictation Passages
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700"
              >
                <option value="All">All Languages</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>

              <select
                value={targetWpm || ""}
                onChange={(e) => setTargetWpm(e.target.value ? Number(e.target.value) : undefined)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700"
              >
                <option value="">All Speeds</option>
                <option value="80">80 WPM</option>
                <option value="100">100 WPM</option>
                <option value="120">120 WPM</option>
              </select>
            </div>
          </div>

          {recommendedPassages.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No passages match the selected filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedPassages.map((p: any) => (
                <Link key={p._id} href={`/student/steno/passage/${p._id}`}>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xs space-y-2 group">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {p.language} • {p.targetWpm} WPM
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{p.category || "Legal"}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
