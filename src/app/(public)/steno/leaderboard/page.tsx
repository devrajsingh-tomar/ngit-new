"use client";

import { useEffect, useState } from "react";
import {
  getStenoLeaderboardAction,
  getStenoPassagesAction,
  getStenoSeriesListAction,
} from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, Filter, Award, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export default function StenoLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State (Step 18)
  const [language, setLanguage] = useState("All");
  const [targetWpm, setTargetWpm] = useState<number | undefined>(undefined);
  const [passageId, setPassageId] = useState("All");
  const [seriesId, setSeriesId] = useState("All");
  const [dateRange, setDateRange] = useState("all_time");

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [language, targetWpm, passageId, seriesId, dateRange]);

  const loadFilterOptions = async () => {
    const [pRes, sRes] = await Promise.all([
      getStenoPassagesAction(),
      getStenoSeriesListAction(),
    ]);
    if (pRes.success && pRes.passages) setPassages(pRes.passages);
    if (sRes.success && sRes.series) setSeriesList(sRes.series);
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    const res = await getStenoLeaderboardAction({
      language,
      targetWpm,
      passageId,
      seriesId,
      dateRange,
    });

    if (res.success && res.leaderboard) {
      setLeaderboard(res.leaderboard);
    } else {
      toast.error(res.error || "Failed to load leaderboard");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Steno Leaderboard & Rankings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Public scoreboard ranking top stenography students by accuracy, transcription speed, and total score.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-2xl border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Privacy Protected: No Private Student Info Exposed
        </div>
      </div>

      {/* Leaderboard Filters Bar (Step 18) */}
      <Card className="p-4 rounded-3xl border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-indigo-600" /> Filter Leaderboard Rankings
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Language Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700"
            >
              <option value="All">All Languages</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Speed Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Target Speed</label>
            <select
              value={targetWpm || ""}
              onChange={(e) => setTargetWpm(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700"
            >
              <option value="">All Speeds</option>
              <option value="80">80 WPM</option>
              <option value="100">100 WPM</option>
              <option value="120">120 WPM</option>
            </select>
          </div>

          {/* Series Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Series Collection</label>
            <select
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700"
            >
              <option value="All">All Series</option>
              {seriesList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Passage Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Dictation Passage</label>
            <select
              value={passageId}
              onChange={(e) => setPassageId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700"
            >
              <option value="All">All Passages</option>
              {passages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700"
            >
              <option value="all_time">All Time</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Leaderboard Table Display (Step 18) */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" /> Loading public rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="py-16 text-center text-slate-400 rounded-3xl border-dashed">
          No rankings found for the selected filter criteria.
        </Card>
      ) : (
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Passage / Course</th>
                  <th className="px-6 py-3.5 text-center">Net Speed</th>
                  <th className="px-6 py-3.5 text-center">Accuracy</th>
                  <th className="px-6 py-3.5 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-black text-amber-600 text-sm">
                      {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm overflow-hidden">
                          {item.studentImage ? (
                            <img src={item.studentImage} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            item.studentName?.[0]?.toUpperCase() || "S"
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{item.studentName}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{item.language} Steno</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{item.passageTitle}</td>
                    <td className="px-6 py-4 text-center font-black text-indigo-600 text-sm">{item.speedWpm} WPM</td>
                    <td className="px-6 py-4 text-center font-black text-emerald-600 text-sm">{item.accuracy}%</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-black">
                        {item.score} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
