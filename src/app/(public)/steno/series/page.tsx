"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StenoSeriesListPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    setLoading(true);
    const res = await getStenoSeriesListAction();
    if (res.success && res.series) {
      setSeriesList(res.series);
    } else {
      toast.error(res.error || "Failed to load series");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" /> Dictation Series Bundles
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Progressive dictation courses and speed-building playlist series.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" /> Loading series...
        </div>
      ) : seriesList.length === 0 ? (
        <Card className="py-16 text-center text-slate-400 rounded-3xl border-dashed">
          No series packages available yet. Check back soon!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {seriesList.map((s) => (
            <Card key={s._id} className="p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                {s.language || "Hindi"} Series
              </span>
              <h3 className="text-lg font-black text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{s.description || "Comprehensive steno dictation series."}</p>
              <p className="text-xs font-bold text-slate-400">Passages: {s.passages?.length || 0} Exercises</p>
              <Link href={`/steno/series/${s._id}`}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs rounded-xl gap-2 mt-2">
                  View Series Playlist <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
