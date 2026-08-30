"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoSeriesByIdAction, getStenoPassagesAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Headphones, Play, Search, Clock, FileText, Keyboard, RefreshCw, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [series, setSeries] = useState<any>(null);
  const [passages, setPassages] = useState<any[]>([]);
  const [selectedMode, setSelectedMode] = useState<"all" | "unicode_hindi" | "krutidev_010" | "english">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeriesData();
  }, [resolvedParams.id]);

  const loadSeriesData = async () => {
    setLoading(true);
    const [sRes, pRes] = await Promise.all([
      getStenoSeriesByIdAction(resolvedParams.id),
      getStenoPassagesAction({ seriesId: resolvedParams.id }),
    ]);

    if (sRes.success && sRes.series) {
      setSeries(sRes.series);
    } else {
      setSeries(null);
    }

    if (pRes.success && pRes.passages) {
      setPassages(pRes.passages);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          Loading Series Tests...
        </p>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-4">
        <Card className="p-12 rounded-3xl border-dashed bg-white space-y-3">
          <h2 className="text-lg font-black text-slate-800">Series Not Found</h2>
          <p className="text-xs text-slate-500">This Steno series might have been unpublished or removed.</p>
          <Link href="/student/steno/series">
            <Button className="rounded-xl text-xs font-bold gap-1.5 mt-2">
              <ArrowLeft className="w-4 h-4" /> Back to All Batches
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Combine passages from series.passages and direct seriesId matches
  const allPassages: any[] = [];
  if (series.passages && Array.isArray(series.passages)) {
    for (const p of series.passages) {
      if (p && p._id) allPassages.push(p);
    }
  }
  if (passages && Array.isArray(passages)) {
    for (const p of passages) {
      if (!allPassages.some((ap) => ap._id?.toString() === p._id?.toString())) {
        allPassages.push(p);
      }
    }
  }

  const filteredTests = allPassages.filter((t) => {
    // Mode match
    if (selectedMode === "unicode_hindi") {
      if (t.language !== "Hindi" && t.typingMode !== "unicode_hindi") return false;
      if (t.typingMode === "krutidev_010") return false;
    } else if (selectedMode === "krutidev_010") {
      if (t.typingMode !== "krutidev_010") return false;
    } else if (selectedMode === "english") {
      if (t.language !== "English" && t.typingMode !== "english") return false;
    }

    if (searchQuery.trim()) {
      return (t.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });


  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1 sm:p-2">
      {/* Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
              Step 3 of 3 • Dictation Passages
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-100">
              {series.category || "Official Batch"}
            </span>
            <span className="text-xs font-bold text-slate-400">• {series.language || "Hindi"} Steno</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {series.title} • आशुलिपि डिक्टेशन सूची
          </h1>
          {series.description && (
            <p className="text-xs text-slate-500 font-medium max-w-xl">{series.description}</p>
          )}
        </div>

        <Link href={series.batch ? `/student/steno/series/batch/${encodeURIComponent(series.batch)}` : "/student/steno/series"}>
          <Button variant="default" className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold h-10 px-5 text-xs rounded-xl gap-2 shadow-xs shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back to Series
          </Button>
        </Link>
      </div>

      {/* Series Thumbnail Poster (if uploaded) */}
      {series.thumbnailUrl && (
        <div className="w-full rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-950 flex items-center justify-center">
          <img
            src={series.thumbnailUrl}
            alt={series.title}
            className="w-full h-auto max-h-[380px] object-cover"
          />
        </div>
      )}

      {/* Language / Typing Mode Selection Tabs */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedMode("all")}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
              selectedMode === "all"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🌐 All Dictations ({allPassages.length})
          </button>
          <button
            onClick={() => setSelectedMode("unicode_hindi")}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
              selectedMode === "unicode_hindi"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🇮🇳 Hindi - Mangal
          </button>
          <button
            onClick={() => setSelectedMode("krutidev_010")}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
              selectedMode === "krutidev_010"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            ⌨️ Hindi - Kruti Dev 010
          </button>
          <button
            onClick={() => setSelectedMode("english")}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
              selectedMode === "english"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🔤 English
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dictations..."
            className="pl-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-semibold h-9 shadow-xs"
          />
        </div>
      </div>


      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card className="p-16 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">
            {searchQuery ? "No Matching Tests Found" : "No Dictations Added to this Series Yet"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? "Try searching with a different keyword."
              : "New dictations are being uploaded for this series. Please check back shortly!"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card
              key={test._id}
              className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                    {test.targetWpm || 80} WPM • {test.language || "Hindi"}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    {test.category || "General"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {test.title}
                  </h3>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600 font-medium">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FileText className="w-3.5 h-3.5" /> Total Words:
                    </span>
                    <strong className="font-bold text-slate-800">{test.wordCount || 400}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> Duration:
                    </span>
                    <strong className="font-bold text-indigo-600">{test.durationMinutes || Math.round((test.durationSeconds || 2100) / 60)} Mins</strong>
                  </p>

                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Keyboard className="w-3.5 h-3.5" /> Interface:
                    </span>
                    <strong className="font-bold text-slate-700">Exam Mode</strong>
                  </p>
                </div>

                <Link href="/student/steno/leaderboard" className="block pt-0.5">
                  <span className="text-[11px] font-extrabold text-amber-600 hover:underline flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> View Test Leaderboard & Ranks
                  </span>
                </Link>
              </div>

              <Link href={`/student/steno/passage/${test._id}`} className="block pt-2">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 text-xs rounded-2xl shadow-md gap-2">
                  <Play className="w-4 h-4 fill-white" /> Play Dictation / Start Test
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

