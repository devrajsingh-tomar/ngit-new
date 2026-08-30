"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoPassagesAction, getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Filter, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoPracticePage() {
  const [passages, setPassages] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [language, setLanguage] = useState("All");
  const [category, setCategory] = useState("All");
  const [targetWpm, setTargetWpm] = useState<number | undefined>(undefined);
  const [seriesId, setSeriesId] = useState("All");

  useEffect(() => {
    loadData();
  }, [language, category, targetWpm, seriesId]);

  const loadData = async () => {
    setLoading(true);
    const [pRes, sRes] = await Promise.all([
      getStenoPassagesAction({ language, category, targetWpm, seriesId }),
      getStenoSeriesListAction(),
    ]);

    if (pRes.success && pRes.passages) setPassages(pRes.passages);
    if (sRes.success && sRes.series) setSeriesList(sRes.series);
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-1 sm:p-2">
      {/* Top Banner inside Student Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="w-6 h-6 text-indigo-600" /> Dictation Practice Library
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Filter dictation passages by language, speed, category, and series to practice.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-3xl border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-indigo-600" /> Filter Passages
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700"
          >
            <option value="All">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>

          <select
            value={targetWpm || ""}
            onChange={(e) => setTargetWpm(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700"
          >
            <option value="">All Speeds</option>
            <option value="80">80 WPM</option>
            <option value="100">100 WPM</option>
            <option value="120">120 WPM</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Legal">Legal</option>
            <option value="Editorial">Editorial</option>
            <option value="PYQ">PYQ</option>
            <option value="Essay">Essay</option>
          </select>

          <select
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700"
          >
            <option value="All">All Series</option>
            {seriesList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Passages Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading practice dictations...
        </div>
      ) : passages.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No passages found for the selected filter parameters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passages.map((p) => (
            <Card key={p._id} className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                    {p.language} • {p.targetWpm} WPM
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{p.category || "General"}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{p.transcriptText}</p>
              </div>

              <Link href={`/student/steno/passage/${p._id}`} className="pt-2">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs rounded-xl gap-1.5 shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Practice
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
