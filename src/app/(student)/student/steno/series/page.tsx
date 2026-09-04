"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStenoBatchesAction, getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, ArrowLeft, RefreshCw, Sparkles, BookOpen, FolderPlus } from "lucide-react";
import { isRealPoster, matchBatch } from "@/lib/steno/stenoUtils";

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

const DEFAULT_STATIC_BATCHES = [
  {
    name: "हिंदी स्टेनो स्पेशल बैच (ठाकुरद्वारा)",
    hindiName: "हिंदी स्टेनो स्पेशल बैच • ठाकुरद्वारा (दिलबहार सर)",
    description: "ठाकुरद्वारा आशुलिपि केंद्र स्पेशल बैच • NGIT Institute के साथ तगड़ी तैयारी व दमदार गाइडेंस",
    thumbnailUrl: "/images/thakurdwara-steno-batch-banner.jpg",
    coachingName: "Dilbahar Sir Steno Institute Thakurdwara",
    instituteCode: "THAKURDWARA_STENO",
    sortOrder: 0,
    isPublished: true,
  },
  {
    name: "UPSSSC Steno",
    hindiName: "यूपीएसएसएससी स्टेनो बैच",
    description: "संपादकीय, निबन्ध, साहित्य, कहानी, संसदीय, लीगल, रामधारी खण्ड 1 व 2, कुरुक्षेत्र पत्रिका संग्रह",
    thumbnailUrl: "https://ngitedu.com/uploads/gallery/1787956467734-3fe88938-2d9d-4471-9a0d-e24dac83cdf4.jpg",
    sortOrder: 1,
    isPublished: true,
  },
  {
    name: "UPSI Steno",
    hindiName: "यूपीएसआई सब-इंस्पेक्टर स्टेनो बैच",
    description: "पुलिस एवं उत्तर प्रदेश उप निरीक्षक आशुलिपि परीक्षा स्पेशल डिक्टेशन",
    thumbnailUrl: "",
    sortOrder: 2,
    isPublished: true,
  },
  {
    name: "SSC Steno Grade C & D",
    hindiName: "एसएससी स्टेनो ग्रेड C & D बैच",
    description: "SSC Grade C (100 WPM) & Grade D (80 WPM) ऑफिशियल प्रीवियस ईयर डिक्टेशंस",
    thumbnailUrl: "",
    sortOrder: 3,
    isPublished: true,
  },
  {
    name: "Allahabad High Court Steno",
    hindiName: "इलाहाबाद हाईकोर्ट स्टेनो बैच",
    description: "हाईकोर्ट एवं जिला न्यायालय लीगल जजमेंट एवं कोर्ट रूम डिक्टेशन संग्रह",
    thumbnailUrl: "",
    sortOrder: 4,
    isPublished: true,
  },
  {
    name: "रामधारी खण्ड 1",
    hindiName: "रामधारी गुप्ता खण्ड-1 विशेष अभ्यास",
    description: "रामधारी गुप्ता खण्ड-1 अभ्यास पुस्तिका के संपूर्ण 100+ डिक्टेशन ऑडियो",
    thumbnailUrl: "",
    sortOrder: 5,
    isPublished: true,
  },
  {
    name: "रामधारी खण्ड 2",
    hindiName: "रामधारी गुप्ता खण्ड-2 विशेष अभ्यास",
    description: "रामधारी गुप्ता खण्ड-2 अभ्यास पुस्तिका के संपूर्ण 100+ डिक्टेशन ऑडियो",
    thumbnailUrl: "",
    sortOrder: 6,
    isPublished: true,
  },
  {
    name: "General Batch",
    hindiName: "सामान्य स्टेनो बैच",
    description: "सामान्य आशुलिपि अभ्यास संग्रह",
    thumbnailUrl: "",
    sortOrder: 7,
    isPublished: true,
  },
];

export default function StudentStenoSeriesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>(DEFAULT_STATIC_BATCHES);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [batchRes, seriesRes] = await Promise.all([
        getStenoBatchesAction({ isPublished: true }),
        getStenoSeriesListAction({ isPublished: true }),
      ]);

      if (batchRes.success && batchRes.batches) {
        const dbBatches = batchRes.batches;
        const mergedMap = new Map<string, any>();

        DEFAULT_STATIC_BATCHES.forEach((def) => {
          mergedMap.set(def.name.toLowerCase().trim(), { ...def });
        });

        dbBatches.forEach((dbB: any) => {
          const key = (dbB.name || "").toLowerCase().trim();
          if (!key) return;
          const existing = mergedMap.get(key) || {};
          mergedMap.set(key, { ...existing, ...dbB });
        });

        const merged = Array.from(mergedMap.values());
        merged.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
        setBatches(merged);
      }
      if (seriesRes.success && seriesRes.series) {
        setSeriesList(seriesRes.series);
      }
    } catch (e) {
      console.error("Error loading steno data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getBatchSeriesCount = (batchName: string) => {
    const searchVal = batchName.toLowerCase().trim();
    const matches = seriesList.filter(
      (s) =>
        (s.batch || "").toLowerCase().includes(searchVal) ||
        (s.title || "").toLowerCase().includes(searchVal)
    );
    const uniqueTitles = new Set(matches.map((s) => (s.title || "").toLowerCase().trim()).filter(Boolean));
    return uniqueTitles.size;
  };

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-400/30">
              Step 1 of 3 • Select Target Steno Batch
            </span>
            <Link href="/steno">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white font-bold h-7 px-3 text-[11px] rounded-full border border-white/20 gap-1 transition-all">
                <ArrowLeft className="w-3 h-3" /> Back to Steno Portal (/steno)
              </Button>
            </Link>
          </div>
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
              const batchPoster = isRealPoster(batch.thumbnailUrl) ? batch.thumbnailUrl : null;
              const seriesForBatch = seriesList.find(
                (s) => isRealPoster(s.thumbnailUrl) && matchBatch(s.batch, batch.name)
              );
              const effectiveThumbnailUrl = batchPoster || seriesForBatch?.thumbnailUrl;
              const hasRealPoster = isRealPoster(effectiveThumbnailUrl);

              return (
                <Card
                  key={batch._id || batch.name}
                  className="p-0 rounded-3xl border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group border hover:border-indigo-300"
                >
                  {/* Step 1 Poster Image Rendering */}
                  {hasRealPoster ? (
                    <div className="w-full bg-slate-950 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
                      <img
                        src={effectiveThumbnailUrl}
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
