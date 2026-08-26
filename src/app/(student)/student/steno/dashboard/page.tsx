"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStudentStenoDashboardDataAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileText,
  Eye,
  TrendingUp,
  FolderKanban,
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
      currentRank: "N/A",
      recentRank: "N/A",
    },
    commonRecurringMistakes: [],
    performanceByCategory: [],
    recentLogs: [],
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

  const { stats, commonRecurringMistakes, performanceByCategory, recentLogs, continuePractice, recommendedPassages } = data;

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Top Banner inside Student Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30">
            Student Shorthand Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Steno Student Dashboard</h1>
          <p className="text-xs text-slate-300">
            Track your shorthand speed, accuracy, recurring typing errors, and real-time rankings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link href="/student/steno/series">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-5 text-xs rounded-xl shadow-md gap-1.5">
              <Layers className="w-4 h-4" /> Steno Batches
            </Button>
          </Link>
          <Link href="/student/steno/my-tests">
            <Button className="bg-white/10 hover:bg-white/20 text-white font-bold h-10 px-5 text-xs rounded-xl border border-white/20 shadow-xs gap-1.5 transition-all">
              <Award className="w-4 h-4 text-amber-400" /> My Profile & Tests
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. TOP STATS OVERVIEW: Current Rank, Avg Accuracy, Avg Speed, Total Attempts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Rank</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.currentRank || "#1"}</p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Among all Steno participants</p>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Accuracy</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.avgAccuracy}%</p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">From all given exams (Best: {stats.bestAccuracy}%)</p>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg WPM Speed</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600">{stats.avgWpm} <span className="text-sm font-bold text-slate-400">WPM</span></p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Net transcription speed (Best: {stats.bestWpm} WPM)</p>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Attempts</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.testsAttempted}</p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Completed transcription exams</p>
          </div>
        </Card>
      </div>

      {/* 2. PERFORMANCE REPORT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Recurring Mistakes */}
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Common Recurring Mistakes
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Repeated Error Analysis
            </span>
          </div>

          {commonRecurringMistakes.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Great job! No frequent recurring mistakes found.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Attempt more tests to generate detailed pattern analysis.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-500 font-medium">
                Words frequently mistyped, omitted, or flagged for matra errors across all your attempts:
              </p>
              <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
                {commonRecurringMistakes.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {item.original}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">
                          {item.typed}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.errorType}</p>
                    </div>
                    <Badge className="bg-rose-100 text-rose-800 font-black text-[10px] border-none shrink-0">
                      {item.count}x Missed / Wrong
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Performance By Category */}
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-600" /> Performance By Category
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Category Breakdown
            </span>
          </div>

          {performanceByCategory.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No category performance data yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Attempt dictations across various exam categories.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {performanceByCategory.map((cat: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-900">{cat.category}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {cat.attemptsCount} Attempts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Speed:</span>
                      <span className="font-black text-indigo-600">{cat.avgWpm} WPM</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Accuracy:</span>
                      <span className="font-black text-emerald-600">{cat.avgAccuracy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 3. RECENT TRANSCRIPTION LOGS */}
      <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Recent Transcription Logs
          </h3>
          <Link href="/student/steno/my-tests" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All in My Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No transcription attempts logged yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Start your first dictation practice from below.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3 pl-4 rounded-l-xl">Test Title</th>
                  <th className="p-3 text-center">Dictation Speed</th>
                  <th className="p-3 text-center">Speed (WPM)</th>
                  <th className="p-3 text-center">Accuracy</th>
                  <th className="p-3 text-center">Total Errors</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 pr-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 pl-4 font-bold text-slate-900 max-w-[200px] truncate">
                      {log.testTitle}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-600">
                      {log.dictationWpm} WPM
                    </td>
                    <td className="p-3 text-center font-black text-indigo-600">
                      {log.netWpm} WPM
                    </td>
                    <td className="p-3 text-center font-black text-emerald-600">
                      {log.accuracy}%
                    </td>
                    <td className="p-3 text-center font-black text-rose-600">
                      {log.totalErrors}
                    </td>
                    <td className="p-3 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <Link href={`/student/steno/result/${log._id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl text-[11px] font-bold gap-1 text-indigo-600 hover:text-indigo-700">
                          <Eye className="w-3.5 h-3.5" /> View Result
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. CONTINUE PRACTICE & RECOMMENDED PASSAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <p className="text-xs text-slate-500 mt-1">Select from recommended dictations.</p>
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

