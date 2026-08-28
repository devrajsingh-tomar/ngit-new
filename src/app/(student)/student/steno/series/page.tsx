"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, RefreshCw, PlayCircle, Keyboard, Sparkles } from "lucide-react";
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
      toast.error(res.error || "Failed to load course batches");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Header Banner */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
          STENO BATCHES
        </h1>
        <p className="text-sm font-bold text-slate-500 max-w-xl mx-auto">
          Practice shorthand dictations and transcription at various speeds.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Steno Batches...
        </div>
      ) : seriesList.length === 0 ? (
        <Card className="p-16 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No Steno Batches Published Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            New official Steno dictation batches are currently being uploaded by our instructors. Please check back shortly!
          </p>
          <Button
            onClick={loadSeries}
            variant="outline"
            className="mt-2 text-xs font-bold rounded-xl gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Batches
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((batch, index) => {
            const gradient = index % 3 === 0 ? "from-indigo-600 to-purple-800" : index % 3 === 1 ? "from-emerald-700 to-teal-900" : "from-amber-600 to-rose-700";
            return (
              <Card key={batch._id} className="p-0 rounded-3xl border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group">
                {/* Banner Thumbnail - Exact 16:9 ratio matching 1024x576 poster dimensions */}
                <div className="w-full aspect-[16/9] relative overflow-hidden bg-slate-950 flex items-center justify-center p-1">
                  {batch.thumbnailUrl ? (
                    <>
                      {/* Ambient Blur Backdrop */}
                      <img
                        src={batch.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                      />
                      {/* Full Complete Thumbnail - Zero Cropping */}
                      <img
                        src={batch.thumbnailUrl}
                        alt={batch.title}
                        className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 z-20 pointer-events-none">
                        <div className="flex justify-between items-start">
                          <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                            {batch.category || "Official Batch"}
                          </span>
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                            STENO SOFTWARE BATCH
                          </span>
                          <h3 className="text-lg font-black text-white leading-tight drop-shadow-md truncate">
                            {batch.title}
                          </h3>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} text-white p-5 flex flex-col justify-between relative overflow-hidden`}>
                      <div className="flex justify-between items-start z-10">
                        <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {batch.category || "Official Batch"}
                        </span>
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      </div>

                      <div className="z-10 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                          STENO SOFTWARE BATCH
                        </span>
                        <h3 className="text-xl font-black leading-tight drop-shadow-md truncate">
                          {batch.title}
                        </h3>
                      </div>

                      {/* Decorative Circle overlay */}
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Card Body Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">{batch.title}</h4>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {batch.description || "Curated dictation practice sets with real-time transcription evaluation."}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-indigo-600" /> {batch.passages?.length || "All"} Dictation Tracks
                      </p>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Keyboard className="w-4 h-4 text-indigo-600" /> SSC & High Court typing interface
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/student/steno/series/${batch._id}`} className="block pt-2">
                    <Button className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-extrabold h-11 text-xs rounded-2xl gap-1.5 transition-all shadow-xs group-hover:bg-indigo-600 group-hover:text-white">
                      EXPLORE COURSE <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

