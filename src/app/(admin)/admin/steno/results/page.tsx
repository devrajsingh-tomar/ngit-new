"use client";

import { useEffect, useState } from "react";
import { getStenoLeaderboardAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    const res = await getStenoLeaderboardAction();
    if (res.success && res.leaderboard) {
      setResults(res.leaderboard);
    } else {
      toast.error(res.error || "Failed to load results");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-rose-600" /> Student Steno Results
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Inspect student transcriptions, full/half mistake breakdowns, and evaluated scores.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" /> Loading student results...
        </div>
      ) : results.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No student transcription attempts recorded yet.
        </Card>
      ) : (
        <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Passage</th>
                  <th className="px-6 py-3.5">Speed</th>
                  <th className="px-6 py-3.5">Accuracy</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr key={r._id}>
                    <td className="px-6 py-4 font-bold text-slate-900">{r.userId?.name || "Student"}</td>
                    <td className="px-6 py-4 text-slate-600">{r.passageId?.title || "Dictation"}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{r.speedWpm} WPM</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{r.accuracy}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
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
        </Card>
      )}
    </div>
  );
}
