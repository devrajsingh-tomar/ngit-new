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

  // Default Steno Batches matching Image 1 design
  const defaultBatches = [
    {
      _id: "upsssc-steno",
      title: "UPSSSC STENO",
      category: "State Exam",
      language: "Hindi",
      bannerText: "STENO SOFTWARE BATCH UPSSSC 1224/333",
      bgGradient: "from-amber-600 to-rose-700",
      description: "Complete UPSSSC dictations with exact board evaluation rules.",
    },
    {
      _id: "ssc-steno-2026",
      title: "SSC STENO 2026",
      category: "Central Exam",
      language: "Hindi & English",
      bannerText: "STENO SOFTWARE BATCH SSC STENO 2026",
      bgGradient: "from-indigo-600 to-purple-800",
      description: "Official SSC Grade C & Grade D pattern shorthand dictations.",
    },
    {
      _id: "allahabad-highcourt-steno",
      title: "ALLAHABAD HIGHCOURT STENO",
      category: "High Court",
      language: "Hindi",
      bannerText: "STENO SOFTWARE BATCH HIGH COURT STENO",
      bgGradient: "from-emerald-700 to-teal-900",
      description: "High Court judgment & legal passage dictations at 80-100 WPM.",
    },
    {
      _id: "hssc-steno-2026",
      title: "HSSC STENO 2026",
      category: "State Exam",
      language: "Hindi & English",
      bannerText: "EXACT HSSC PATTERN DICTATION",
      bgGradient: "from-[#0f172a] to-[#1e293b]",
      description: "Haryana Staff Selection Commission shorthand dictations.",
    },
    {
      _id: "asi-steno",
      title: "ASI STENO",
      category: "Police Exam",
      language: "Hindi",
      bannerText: "STENO SOFTWARE BATCH ASI STENO",
      bgGradient: "from-red-700 to-slate-900",
      description: "Police Department Assistant Sub-Inspector steno tests.",
    },
    {
      _id: "ramdhari-singh-khand-1",
      title: "RAMDHARI SINGH KHAND-1",
      category: "Speed Building",
      language: "Hindi",
      bannerText: "RAMDHARI SINGH KHAND-1 PRACTICE",
      bgGradient: "from-amber-700 to-red-900",
      description: "Standard Speed Building Dictations by Ramdhari Singh.",
    },
  ];

  const displayList = seriesList.length > 0 ? seriesList : defaultBatches;

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Header Banner (Matching Image 1) */}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((batch, index) => {
            const gradient = batch.bgGradient || (index % 3 === 0 ? "from-indigo-600 to-purple-800" : index % 3 === 1 ? "from-emerald-700 to-teal-900" : "from-amber-600 to-rose-700");
            return (
              <Card key={batch._id} className="p-0 rounded-3xl border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group">
                {/* Banner Thumbnail (Image 1 Style) */}
                <div className={`h-44 bg-gradient-to-br ${gradient} text-white p-5 flex flex-col justify-between relative overflow-hidden`}>
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
                    <h3 className="text-xl font-black leading-tight drop-shadow-md">
                      {batch.title}
                    </h3>
                  </div>

                  {/* Decorative Circle overlay */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                </div>

                {/* Card Body Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">{batch.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {batch.description || "Curated dictation practice sets with real-time transcription evaluation."}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-indigo-600" /> All speeds available
                      </p>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Keyboard className="w-4 h-4 text-indigo-600" /> SSC typing interface
                      </p>
                    </div>
                  </div>

                  {/* Action Button (Image 1) */}
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
