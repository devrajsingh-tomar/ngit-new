"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoSeriesPage() {
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
      toast.error(res.error || "Failed to load series collections");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-emerald-600" /> Steno Series & Course Collections
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Curated course playlists for legal dictations, UPSSSC, SSC PYQs, and speed building.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" /> Loading series collections...
        </div>
      ) : seriesList.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No series collections published yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((item) => (
            <Card key={item._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                  {item.category || "General"} • {item.language || "Hindi"}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.description}</p>
                <p className="text-xs font-bold text-slate-400 pt-1">
                  Includes: {item.passages?.length || 0} Dictations
                </p>
              </div>

              <Link href={`/student/steno/series/${item._id}`} className="pt-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs rounded-xl gap-1.5 shadow-xs">
                  View Series Passages <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
