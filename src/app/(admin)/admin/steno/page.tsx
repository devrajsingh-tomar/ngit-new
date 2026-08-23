"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStenoOverviewAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Headphones,
  Layers,
  Award,
  FileText,
  Type,
  Sliders,
  Trophy,
  Users,
  BarChart3,
  Clock,
  Flame,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: {
      totalStudents: 0,
      totalDictations: 0,
      totalAttempts: 0,
      totalMockTests: 0,
      avgWpm: 0,
      avgAccuracy: 0,
    },
    recentAttempts: [],
    highestScores: [],
    popularPassages: [],
  });

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    const res = await getAdminStenoOverviewAction();
    if (res.success) {
      setData(res);
    } else {
      toast.error(res.error || "Failed to load admin overview");
    }
    setLoading(false);
  };

  const { stats, recentAttempts, highestScores, popularPassages } = data;

  const adminNavCards = [
    { title: "Dictation Passages", href: "/admin/steno/passages", icon: Headphones, desc: "Audio/video dictations & transcripts" },
    { title: "Steno Series", href: "/admin/steno/series", icon: Layers, desc: "Dictation course collections" },
    { title: "Exam Presets", href: "/admin/steno/exams", icon: Award, desc: "SSC, High Court & UPSSSC presets" },
    { title: "Mock Tests", href: "/admin/steno/mock-tests", icon: FileText, desc: "Official pattern test papers" },
    { title: "Custom Tests", href: "/admin/steno/custom-tests", icon: Clock, desc: "Student practice test overviews" },
    { title: "Attempts / Results", href: "/admin/steno/results", icon: BarChart3, desc: "Student transcriptions & error reports" },
    { title: "Fonts Manager", href: "/admin/steno/fonts", icon: Type, desc: "Kruti Dev, Mangal, Remington GAIL" },
    { title: "Error Rules", href: "/admin/steno/error-rules", icon: Sliders, desc: "Full & half mistake rules" },
    { title: "Leaderboard", href: "/admin/steno/leaderboard", icon: Trophy, desc: "Global ranking & scoreboards" },
  ];

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mic className="w-6 h-6 text-indigo-600" /> Steno Management Control Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Admin oversight for dictations, series collections, exam presets, student evaluations, and analytics.
          </p>
        </div>

        <Button onClick={loadOverview} variant="outline" size="sm" className="rounded-xl h-9 text-xs font-bold gap-1 border-slate-200">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </Button>
      </div>

      {/* KPI Stats Cards (Step 20) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white text-center">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Students</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : stats.totalStudents}</h3>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black">
            <Headphones className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Dictations</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : stats.totalDictations}</h3>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white text-center">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black">
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Attempts</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : stats.totalAttempts}</h3>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white text-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Mock Tests</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : stats.totalMockTests}</h3>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black">
            <Mic className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Average WPM</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{loading ? "..." : `${stats.avgWpm} WPM`}</h3>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white text-center">
          <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Avg Accuracy</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{loading ? "..." : `${stats.avgAccuracy}%`}</h3>
        </Card>
      </div>

      {/* Admin Sub-Module Quick Nav */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {adminNavCards.map((card, idx) => (
          <Link key={idx} href={card.href}>
            <Card className="p-5 rounded-3xl border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-md flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{card.title}</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Analytics Grid: Recent Activity, Popular Passages, Highest Scores (Step 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts */}
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 lg:col-span-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Recent Student Attempts
          </h3>

          {recentAttempts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No recent attempts recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Dictation</th>
                    <th className="pb-2 text-center">Net Speed</th>
                    <th className="pb-2 text-center">Accuracy</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAttempts.map((r: any) => (
                    <tr key={r._id}>
                      <td className="py-3 font-bold text-slate-900">{r.userId?.name || "Student"}</td>
                      <td className="py-3 text-slate-600 truncate max-w-[150px]">{r.passageId?.title || "Dictation"}</td>
                      <td className="py-3 text-center font-bold text-indigo-600">{r.speedWpm} WPM</td>
                      <td className="py-3 text-center font-bold text-emerald-600">{r.accuracy}%</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          r.status === "Passed" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Popular Passages & Highest Scores */}
        <div className="space-y-6">
          {/* Popular Passages */}
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Popular Dictation Passages
            </h3>
            {popularPassages.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No passage stats available.</p>
            ) : (
              <div className="space-y-2">
                {popularPassages.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold">
                    <span className="text-slate-800 truncate max-w-[180px]">{item.title}</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-black">
                      {item.attemptsCount} attempts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Highest Scores */}
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Top Performer Scores
            </h3>
            {highestScores.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No high scores recorded.</p>
            ) : (
              <div className="space-y-2">
                {highestScores.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold">
                    <span className="text-slate-900 font-bold">#{idx + 1} {r.userId?.name || "Student"}</span>
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-black">
                      {r.score} pts ({r.accuracy}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
