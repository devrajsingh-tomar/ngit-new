"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStenoBatchesAction, getStenoSeriesListAction, getStenoExamsAction } from "@/app/actions/steno";
import { checkStenoAccessAction } from "@/app/actions/steno-subscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, ArrowLeft, RefreshCw, Sparkles, BookOpen, FolderPlus, Lock, Award } from "lucide-react";
import { isRealPoster, matchBatch, isNewlyUploaded } from "@/lib/steno/stenoUtils";


export default function StudentStenoSeriesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [examsList, setExamsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessState, setAccessState] = useState<{
    hasAccess: boolean;
    isAdmin: boolean;
    isTrialActive: boolean;
    trialExpired: boolean;
    daysLeftInTrial: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let fetchedBatches: any[] = [];
      let fetchedSeries: any[] = [];

      // 1. Fetch Batches safely from database with resilient API fallback
      try {
        const batchRes = await getStenoBatchesAction({ isPublished: undefined });
        if (batchRes && Array.isArray(batchRes.batches) && batchRes.batches.length > 0) {
          fetchedBatches = batchRes.batches.filter((b: any) => b.isPublished !== false);
        } else {
          const apiRes = await fetch("/api/steno/batches", { cache: "no-store" });
          const apiData = await apiRes.json();
          if (apiData.success && Array.isArray(apiData.batches)) {
            fetchedBatches = apiData.batches;
          }
        }
      } catch (err) {
        console.error("Action error, trying /api/steno/batches fallback:", err);
        try {
          const apiRes = await fetch("/api/steno/batches", { cache: "no-store" });
          const apiData = await apiRes.json();
          if (apiData.success && Array.isArray(apiData.batches)) {
            fetchedBatches = apiData.batches;
          }
        } catch (apiErr) {
          console.error("API fallback failed:", apiErr);
        }
      }

      // 2. Fetch Exams safely to check which batches have Step 2 exams
      try {
        let exams: any[] = [];
        const examRes = await getStenoExamsAction({ isActive: true });
        if (examRes?.success && Array.isArray(examRes.exams) && examRes.exams.length > 0) {
          exams = examRes.exams;
        } else {
          const apiRes = await fetch("/api/steno/exams?isActive=true", { cache: "no-store" });
          const apiData = await apiRes.json();
          const list = apiData.data || apiData.exams || [];
          if (Array.isArray(list)) {
            exams = list;
          }
        }
        setExamsList(exams);
      } catch (err) {
        console.error("Failed to load exams from server:", err);
      }

      // 2. Fetch Series list safely
      try {
        const seriesRes = await getStenoSeriesListAction({ isPublished: true });
        if (seriesRes?.success && Array.isArray(seriesRes.series)) {
          fetchedSeries = seriesRes.series;
        }
      } catch (err) {
        console.error("Failed to load series from server:", err);
      }
      setSeriesList(fetchedSeries);

      // 3. Fetch Steno subscription access state safely
      try {
        const access = await checkStenoAccessAction({});
        if (access?.success && access.data) {
          setAccessState(access.data as any);
        }
      } catch (err) {
        console.error("Failed to check steno access:", err);
      }

      // Only use real batches from database (strictly no dummy fallbacks)
      const merged = [...fetchedBatches];

      // Helper to check if a batch is Thakurdwara Special Batch
      const isThakurdwaraBatch = (b: any) => {
        const name = (b.name || "").toLowerCase();
        const coaching = (b.coachingName || "").toLowerCase();
        const code = (b.instituteCode || "").toUpperCase();
        return name.includes("thakurdwara") || 
               name.includes("ठाकुरद्वारा") || 
               coaching.includes("thakurdwara") || 
               code === "THAKURDWARA_STENO";
      };

      // Helper to get newest uploaded content timestamp for a batch
      const getBatchLatestTimestamp = (batchName: string, sList: any[]) => {
        let maxTime = 0;
        for (const s of sList) {
          if (matchBatch(s.batch, batchName)) {
            const sTime = new Date(s.updatedAt || s.createdAt || 0).getTime();
            if (sTime > maxTime) maxTime = sTime;
            if (Array.isArray(s.passages)) {
              for (const p of s.passages) {
                const pTime = new Date(p.createdAt || p.updatedAt || 0).getTime();
                if (pTime > maxTime) maxTime = pTime;
              }
            }
          }
        }
        return maxTime;
      };

      try {
        // Sort Batches:
        // 1. Thakurdwara Special Batch ALWAYS stays hardcoded at first position (index 0) if it exists in DB
        // 2. All other batches sorted by newest uploaded content timestamp descending (timeB - timeA)
        merged.sort((a, b) => {
          const isThakurdwaraA = isThakurdwaraBatch(a);
          const isThakurdwaraB = isThakurdwaraBatch(b);

          if (isThakurdwaraA && !isThakurdwaraB) return -1;
          if (!isThakurdwaraA && isThakurdwaraB) return 1;
          if (isThakurdwaraA && isThakurdwaraB) return 0;

          const timeA = getBatchLatestTimestamp(a.name, fetchedSeries);
          const timeB = getBatchLatestTimestamp(b.name, fetchedSeries);

          if (timeA !== timeB) {
            return timeB - timeA;
          }

          // Fallback to sortOrder or creation date
          const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 99;
          const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 99;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
        });
      } catch (sortErr) {
        console.error("Sorting error fallback:", sortErr);
      }

      setBatches(merged);
    } catch (e) {
      console.error("Error loading steno data:", e);
      setBatches([]);
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
              Step 1 of 4 • Select Target Steno Batch
            </span>
            <Link href="/steno">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white font-bold h-7 px-3 text-[11px] rounded-full border border-white/20 gap-1 transition-all">
                <ArrowLeft className="w-3 h-3" /> Back to Steno Portal (/steno)
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            STENO BATCHES & EXAM PORTAL (Step 1)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Select your desired Steno Batch to choose your target Government Exam (UPSSSC Steno, UPSI Steno, SSC Steno, Allahabad High Court Steno) and explore official dictation series.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-xs font-bold text-slate-200">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>{batches.length} Official Batches Active</span>
        </div>
      </div>

      {/* Trial Expired Alert Banner */}
      {accessState?.trialExpired && !accessState.hasAccess && (
        <div className="bg-gradient-to-r from-rose-500/15 via-red-500/10 to-orange-500/15 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950">
                ⚠️ आपका 7-दिन का निःशुल्क ट्रायल समाप्त हो चुका है (Trial Expired)
              </h3>
              <p className="text-xs text-rose-800 font-medium">
                डिक्टेशन टेस्ट, ट्रांसक्रिप्शन मूल्यांकन और सभी बैच अनलॉक रखने के लिए कृपया NGIT Steno प्लान सब्सक्राइब करें।
              </p>
            </div>
          </div>
          <Link href="/student/steno/subscribe" className="w-full sm:w-auto flex-shrink-0">
            <Button className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-black text-xs h-9 px-5 rounded-xl shadow-md gap-2">
              <Sparkles className="w-3.5 h-3.5" /> अभी सब्सक्राइब करें (₹99 से शुरू) <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Trial Active Banner */}
      {accessState?.isTrialActive && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 border border-amber-300 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <p className="text-xs font-bold text-amber-950">
              🎉 <span className="font-black">7-दिन फ़्री ट्रायल सक्रिय:</span> आपके पास अभी{" "}
              <span className="underline decoration-amber-500 font-black">{accessState.daysLeftInTrial} दिन</span> का फ्री एक्सेस शेष है। सभी बैच और डिक्टेशन टेस्ट एक्सेस कर सकते हैं।
            </p>
          </div>
          <Link href="/student/steno/subscribe" className="flex-shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto h-7 text-[11px] font-black border-amber-400 text-amber-900 bg-white/90 hover:bg-white rounded-lg shadow-2xs gap-1">
              सब्सक्रिप्शन प्लान्स देखें <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

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

          {batches.length === 0 ? (
            <Card className="p-16 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-700">कोई स्टेनो बैच अभी उपलब्ध नहीं है</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                प्रशासक द्वारा बनाए गए सभी सक्रिय बैच यहां प्रदर्शित होंगे।
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch, index) => {
              const seriesCount = getBatchSeriesCount(batch.name);
              const encodeBatch = encodeURIComponent(batch.name);
              const posterUrl = batch.thumbnailUrl && typeof batch.thumbnailUrl === "string" && batch.thumbnailUrl.trim() !== ""
                ? batch.thumbnailUrl.trim()
                : null;
              const batchSeries = seriesList.filter((s) => matchBatch(s.batch, batch.name));
              const realTopics = Array.from(new Set(batchSeries.map((s) => s.title).filter(Boolean)));
              const hasRecentDictations = batchSeries.some(
                (s) => isNewlyUploaded(s.updatedAt || s.createdAt) || (Array.isArray(s.passages) && s.passages.some((p: any) => isNewlyUploaded(p.createdAt)))
              ) || index === 0;

              const batchExams = examsList.filter((e) => matchBatch(e.batch, batch.name));
              const targetUrl = `/student/steno/exams?batch=${encodeBatch}`;

              const fallbackColors = [
                "from-indigo-700 to-purple-900",
                "from-blue-700 to-cyan-900",
                "from-emerald-700 to-teal-900",
                "from-amber-700 to-rose-900",
                "from-rose-700 to-pink-900",
                "from-violet-700 to-purple-900",
              ];
              const bannerBg = fallbackColors[index % fallbackColors.length];

              return (
                <Card
                  key={batch._id || batch.name}
                  className={`p-0 rounded-3xl bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group border ${
                    hasRecentDictations ? "border-2 border-indigo-300 hover:border-indigo-400" : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {/* Step 1 Poster Image Rendering - links to Step 2 Govt Exams or Step 3 Series */}
                  <Link href={targetUrl} className="block">
                    {posterUrl ? (
                      <div className="h-44 sm:h-52 w-full bg-slate-900 overflow-hidden relative border-b border-slate-100 flex items-center justify-center p-2">
                        <img
                          src={posterUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 pointer-events-none"
                        />
                        <img
                          src={posterUrl}
                          alt={batch.name}
                          className="relative z-10 w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                        />
                        {hasRecentDictations && (
                          <div className="absolute top-3 left-3 z-20">
                            <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 animate-pulse">
                              <Sparkles className="w-3 h-3 fill-white" /> NEW CONTENT AVAILABLE
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Fallback Styled Banner if poster is not uploaded */
                      <div className={`w-full bg-gradient-to-br ${bannerBg} text-white p-6 relative overflow-hidden flex flex-col justify-between h-44 sm:h-52`}>
                        <div className="flex justify-between items-start z-10">
                          <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {batch.name}
                          </span>
                          {hasRecentDictations && (
                            <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs animate-pulse flex items-center gap-1">
                              <Sparkles className="w-3 h-3 fill-white" /> NEW CONTENT
                            </span>
                          )}
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
                  </Link>

                  {/* Batch Details & Single Action Button */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">{batch.name}</h3>
                        <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600" />
                          {batchExams.length > 0
                            ? `${batchExams.length} Govt Exams (Step 2)`
                            : "Target Govt Exams (Step 2)"}
                        </span>
                      </div>

                      {batch.description && (
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                          {batch.description}
                        </p>
                      )}

                      {/* Real Topics Tag List (Only shown if real series exist in DB, no dummy fallbacks) */}
                      {realTopics.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            Included Topics / Series:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {realTopics.slice(0, 6).map((topic, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-slate-200"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Single Clean Action Button leading directly to Step 2 Govt Exams */}
                    <div className="pt-2">
                      <Link href={targetUrl} className="block">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 text-xs rounded-2xl gap-2 transition-all shadow-md group-hover:scale-[1.01]">
                          <Award className="w-4 h-4 text-amber-300" /> ओपन बैच • सरकारी परीक्षाएं देखें (Step 2) <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
