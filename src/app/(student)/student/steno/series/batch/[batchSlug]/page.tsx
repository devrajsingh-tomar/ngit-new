"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStenoSeriesListAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Layers, PlayCircle, RefreshCw, Sparkles, BookOpen, Headphones } from "lucide-react";
import { isRealPoster, matchBatch } from "@/lib/steno/stenoUtils";

function getFilteredDeduplicatedSeries(allSeries: any[], batchName: string) {
  let matched = allSeries.filter((s: any) => matchBatch(s.batch, batchName));

  if (matched.length === 0) {
    matched = allSeries.filter((s: any) => {
      const titleVal = (s.title || "").toLowerCase().trim();
      const catVal = (s.category || "").toLowerCase().trim();
      const searchVal = batchName.toLowerCase().trim();
      return searchVal.includes(titleVal) || searchVal.includes(catVal) || titleVal.includes(searchVal);
    });
  }

  const uniqueMap = new Map<string, any>();
  for (const s of matched) {
    const titleKey = (s.title || "").toLowerCase().trim();
    if (!titleKey) continue;

    if (!uniqueMap.has(titleKey)) {
      uniqueMap.set(titleKey, s);
    } else {
      const existing = uniqueMap.get(titleKey);
      const sHasRealPoster = isRealPoster(s.thumbnailUrl);
      const existingHasRealPoster = isRealPoster(existing.thumbnailUrl);

      if (sHasRealPoster && !existingHasRealPoster) {
        uniqueMap.set(titleKey, s);
      } else if (!sHasRealPoster && existingHasRealPoster) {
        // Keep existing item with real poster
      } else {
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const currentTime = new Date(s.updatedAt || s.createdAt || 0).getTime();
        if (currentTime > existingTime) {
          uniqueMap.set(titleKey, s);
        } else {
          const existingPassageCount = Array.isArray(existing?.passages) ? existing.passages.length : 0;
          const currentPassageCount = Array.isArray(s?.passages) ? s.passages.length : 0;
          if (currentPassageCount > existingPassageCount) {
            uniqueMap.set(titleKey, s);
          }
        }
      }
    }
  }

  return Array.from(uniqueMap.values());
}

export default function StudentStenoBatchSeriesPage({ params }: { params: Promise<{ batchSlug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rawBatchName = decodeURIComponent(resolvedParams.batchSlug || "");

  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle browser back button (mobile hardware/gesture back or desktop browser back button)
  useEffect(() => {
    window.history.pushState({ page: "steno-batch-step2" }, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      router.replace("/student/steno/series");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  useEffect(() => {
    loadSeriesForBatch();
  }, [rawBatchName]);

  const loadSeriesForBatch = async () => {
    setLoading(true);
    try {
      const res = await getStenoSeriesListAction({ isPublished: true });
      if (res.success && res.series) {
        const deduplicated = getFilteredDeduplicatedSeries(res.series, rawBatchName);
        setSeriesList(deduplicated);
      }
    } catch (e) {
      console.error("Error loading batch series:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Top Navigation Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-200">
              Step 2 of 3 • Series Topics & Collections
            </span>
            <span className="text-xs font-bold text-slate-400">• Official Steno Batch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {rawBatchName} • सीरीज एवं टॉपिक्स
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xl">
            Select a series topic below to practice audio dictations with speed fluctuation & transcription evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/student/steno/series">
            <Button variant="default" className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold h-10 px-5 text-xs rounded-xl gap-2 shadow-xs">
              <ArrowLeft className="w-4 h-4" /> Back to All Batches (Step 1)
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Series Topics...</p>
        </div>
      ) : seriesList.length === 0 ? (
        <Card className="p-16 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No Series Found for {rawBatchName}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            New series collections for this batch are currently being configured by instructors.
          </p>
          <Link href="/student/steno/series">
            <Button variant="outline" className="mt-2 text-xs font-bold rounded-xl gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Batches (Step 1)
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((series, index) => {
            const passageCount = Array.isArray(series.passages) ? series.passages.length : 0;
            const gradient = index % 3 === 0 ? "from-indigo-600 to-purple-800" : index % 3 === 1 ? "from-emerald-700 to-teal-900" : "from-amber-600 to-rose-700";
            const hasRealPoster = isRealPoster(series.thumbnailUrl);

            return (
              <Card
                key={series._id}
                className="p-0 rounded-3xl border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group border hover:border-indigo-300"
              >
                {/* Step 2 Poster Image Rendering */}
                {hasRealPoster ? (
                  <div className="w-full bg-slate-950 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
                    <img
                      src={series.thumbnailUrl}
                      alt={series.title}
                      className="w-full h-auto max-h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  /* Fallback Gradient if poster is not uploaded */
                  <div className={`w-full h-44 bg-gradient-to-br ${gradient} text-white p-5 flex flex-col justify-between relative overflow-hidden`}>
                    <div className="flex justify-between items-start z-10">
                      <div />
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    </div>

                    <div className="z-10 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                        {series.batch || rawBatchName}
                      </span>
                      <h3 className="text-xl font-black leading-tight drop-shadow-md truncate">
                        {series.title}
                      </h3>
                    </div>

                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  </div>
                )}

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-black text-slate-900">{series.title}</h4>
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {series.description || "Curated dictation practice sets for speed enhancement."}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-indigo-600" /> {passageCount} Dictation Passages Available
                      </p>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-emerald-600" /> 40 to 120 WPM Audio Speed Fluctuation
                      </p>
                    </div>
                  </div>

                  {/* Action Button to Step 3 */}
                  <Link href={`/student/steno/series/${series._id}?batch=${encodeURIComponent(rawBatchName)}`} className="block pt-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 text-xs rounded-2xl gap-2 transition-all shadow-md group-hover:scale-[1.02]">
                      <BookOpen className="w-4 h-4" /> VIEW DICTATION PASSAGES <ArrowRight className="w-4 h-4" />
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
