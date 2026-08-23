"use client";

import { useEffect, useState } from "react";
import { getStenoLeaderboardAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Trophy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const res = await getStenoLeaderboardAction();
    if (res.success && res.leaderboard) {
      setLeaderboard(res.leaderboard);
    } else {
      toast.error(res.error || "Failed to load leaderboard");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Admin Steno Leaderboard & Rankings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Global rankings of students based on speed (WPM) and evaluation accuracy.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" /> Loading rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No student attempts registered on the leaderboard.
        </Card>
      ) : (
        <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Passage</th>
                  <th className="px-6 py-3.5 text-center">Speed</th>
                  <th className="px-6 py-3.5 text-center">Accuracy</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td className="px-6 py-4 font-black text-amber-600">#{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.userId?.name || "Student"}</td>
                    <td className="px-6 py-4 text-slate-600">{item.passageId?.title || "Dictation"}</td>
                    <td className="px-6 py-4 text-center font-black text-indigo-600">{item.speedWpm} WPM</td>
                    <td className="px-6 py-4 text-center font-black text-emerald-600">{item.accuracy}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        item.status === "Passed" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {item.status}
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
