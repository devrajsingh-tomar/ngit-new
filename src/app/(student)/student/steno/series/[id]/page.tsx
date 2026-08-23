"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoSeriesByIdAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Play, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeries();
  }, [resolvedParams.id]);

  const loadSeries = async () => {
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
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" /> Loading Series Details...
      </div>
    );
  }

  if (!series) {
    return (
      <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
        Series collection not found.
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
            {series.category} • {series.language}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">{series.title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{series.description}</p>
        </div>

        <Link href="/student/steno/series">
          <Button variant="outline" className="rounded-xl h-9 text-xs font-bold gap-1 border-slate-200">
            <ArrowLeft className="w-4 h-4" /> Back to Series
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Series Dictations ({series.passages?.length || 0})
        </h2>

        {series.passages?.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
            No dictations assigned to this series yet.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.passages?.map((p: any) => (
              <Card key={p._id} className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                    {p.language} • {p.targetWpm} WPM
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{p.title}</h3>
                </div>

                <Link href={`/student/steno/passage/${p._id}`} className="pt-2">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs rounded-xl gap-1.5 shadow-xs">
                    <Play className="w-3.5 h-3.5 fill-white" /> Start Practice
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
