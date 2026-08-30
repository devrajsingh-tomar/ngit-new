"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoBatchesAction, getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, RefreshCw, Sparkles, BookOpen, FolderPlus } from "lucide-react";
import { toast } from "sonner";

// Default fallback configuration for standard batches
const DEFAULT_BATCH_FALLBACKS: Record<string, { color: string; topics: string[]; description: string }> = {
  "UPSSSC Steno": {
    color: "from-indigo-600 to-purple-800",
    topics: ["संपादकीय", "निबन्ध", "साहित्य", "कहानी", "संसदीय", "लीगल", "रामधारी खण्ड 1", "रामधारी खण्ड 2", "कुरुक्षेत्र पत्रिका"],
    description: "संपादकीय, निबन्ध, साहित्य, कहानी, संसदीय, लीगल, रामधारी खण्ड 1 व 2, कुरुक्षेत्र पत्रिका संग्रह",
  },
  "UPSI Steno": {
    color: "from-blue-600 to-cyan-800",
    topics: ["पुलिस डिक्टेशन", "कानूनी नियम", "सामान्य आशुलिपि"],
    description: "पुलिस एवं उत्तर प्रदेश उप निरीक्षक आशुलिपि परीक्षा स्पेशल डिक्टेशन",
  },
  "SSC Steno Grade C & D": {
    color: "from-emerald-700 to-teal-900",
    topics: ["SSC PYQ 80 WPM", "SSC PYQ 100 WPM", "संसदीय भाषण"],
    description: "SSC Grade C (100 WPM) & Grade D (80 WPM) ऑफिशियल प्रीवियस ईयर डिक्टेशंस",
  },
  "Allahabad High Court Steno": {
    color: "from-amber-600 to-rose-700",
    topics: ["लीगल जजमेंट", "सिविल केस", "क्रिमिनल केस"],
    description: "हाईकोर्ट एवं जिला न्यायालय लीगल जजमेंट एवं कोर्ट रूम डिक्टेशन संग्रह",
  },
  "रामधारी खण्ड 1": {
    color: "from-rose-600 to-pink-800",
    topics: ["अभ्यास 1-20", "अभ्यास 21-40", "अभ्यास 41-60"],
    description: "रामधारी गुप्ता खण्ड-1 अभ्यास पुस्तिका के संपूर्ण 100+ डिक्टेशन ऑडियो",
  },
  "रामधारी खण्ड 2": {
    color: "from-violet-700 to-purple-900",
    topics: ["अभ्यास 1-20", "अभ्यास 21-40", "अभ्यास 41-60"],
    description: "रामधारी गुप्ता खण्ड-2 अभ्यास पुस्तिका के उन्नत स्तर डिक्टेशन ऑडियो",
  },
  "General Batch": {
    color: "from-slate-700 to-slate-900",
    topics: ["सामान्य अभ्यास"],
    description: "सामान्य आशुलिपि अभ्यास संग्रह",
  },
};

export default function StudentStenoSeriesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [batchRes, seriesRes] = await Promise.all([
      getStenoBatchesAction({ isPublished: true }),
      getStenoSeriesListAction({ isPublished: true }),
    ]);

    if (batchRes.success && batchRes.batches) {
      setBatches(batchRes.batches);
    }
    if (seriesRes.success && seriesRes.series) {
      setSeriesList(seriesRes.series);
    }
    setLoading(false);
  };

  const getBatchSeriesCount = (batchName: string) => {
    return seriesList.filter(
      (s) =>
        (s.batch || "").toLowerCase().includes(batchName.toLowerCase()) ||
        (s.title || "").toLowerCase().includes(batchName.toLowerCase())
    ).length;
  };

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl z-10">
          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-400/30">
            Step 1 of 3 • Select Target Steno Batch
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            STENO BATCHES & EXAM PORTAL
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Select your desired Steno Batch to explore series topics, editorial passages, and official speed dictations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-xs font-bold text-slate-200">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>{batches.length} Official Batches Active</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Steno Batches...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                ALL STENO BATCHES (सारे बैच)
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Click on any batch below to view its Series Topics & Dictation Collections.
              </p>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="text-xs font-bold rounded-xl gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => {
              const seriesCount = getBatchSeriesCount(batch.name);
              const encodeBatch = encodeURIComponent(batch.name);
              const fallback = DEFAULT_BATCH_FALLBACKS[batch.name] || {
                color: "from-indigo-700 to-purple-900",
                topics: ["संपादकीय", "लीगल", "संसदीय"],
                description: batch.description || "Steno Exam Dictation Practice Batch",
              };

              return (
                <Card
                  key={batch._id || batch.name}
                  className="p-0 rounded-3xl border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group border hover:border-indigo-300"
                >
                  {/* Step 1 Poster Image Rendering */}
                  {batch.thumbnailUrl ? (
                    <div className="w-full bg-slate-950 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
                      <img
                        src={batch.thumbnailUrl}
                        alt={batch.name}
                        className="w-full h-auto max-h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    /* Fallback Styled Banner if poster is not uploaded */
                    <div className={`w-full bg-gradient-to-br ${fallback.color} text-white p-6 relative overflow-hidden flex flex-col justify-between h-44`}>
                      <div className="flex justify-between items-start z-10">
                        <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {batch.name}
                        </span>
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      </div>

                      <div className="z-10 space-y-1">
                        <h3 className="text-xl font-black drop-shadow-md leading-tight">
                          {batch.hindiName || batch.name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-200 opacity-90">
                          {batch.name} Official Batch
                        </p>
                      </div>

                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    </div>
                  )}

                  {/* Batch Details & Action */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">{batch.name}</h3>
                        <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {seriesCount > 0 ? `${seriesCount} Series Topics` : "Official Batch"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {batch.description || fallback.description}
                      </p>

                      {/* Topics Tag List */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                          Included Topics / Series:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {fallback.topics.slice(0, 6).map((topic, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-slate-200"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/student/steno/series/batch/${encodeBatch}`} className="block pt-2">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 text-xs rounded-2xl gap-2 transition-all shadow-md group-hover:scale-[1.02]">
                        <BookOpen className="w-4 h-4" /> EXPLORE SERIES & TOPICS <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
