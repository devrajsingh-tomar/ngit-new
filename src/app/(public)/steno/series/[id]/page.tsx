"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoSeriesByIdAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Headphones, Play, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StenoSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeriesDetail();
  }, [resolvedParams.id]);

  const loadSeriesDetail = async () => {
    setLoading(true);
    const res = await getStenoSeriesByIdAction(resolvedParams.id);
    if (res.success && res.series) {
      setSeries(res.series);
    } else {
      toast.error(res.error || "Failed to load series details");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mr-2" /> Loading series playlist...
      </div>
    );
  }

  if (!series) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold">Series not found.</p>
        <Link href="/steno/series">
          <Button variant="outline" className="mt-4 rounded-xl">Back to Series List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <Link href="/steno/series" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Series
      </Link>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
          {series.language || "Hindi"} Series Playlist
        </span>
        <h1 className="text-2xl font-black text-slate-900">{series.title}</h1>
        <p className="text-xs text-slate-500">{series.description || "Collection of audio dictations for this course."}</p>
      </div>

      {/* Playlist Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Series Exercises ({series.passages?.length || 0})</h3>

        {series.passages?.length === 0 ? (
          <Card className="py-12 text-center text-slate-400 rounded-3xl">No passages added to this series yet.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {series.passages?.map((p: any, idx: number) => (
              <Card key={p._id || idx} className="p-5 rounded-2xl border-slate-200 flex items-center justify-between gap-4 hover:border-emerald-300 transition-all">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-emerald-600 uppercase">Track #{idx + 1}</span>
                  <h4 className="text-sm font-black text-slate-900">{p.title || `Dictation #${idx + 1}`}</h4>
                  <p className="text-xs text-slate-400">Target WPM: {p.targetWpm || 80} WPM</p>
                </div>
                <Link href={`/steno/passage/${p._id}`}>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs rounded-xl gap-1">
                    <Play className="w-3.5 h-3.5" /> Start
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
