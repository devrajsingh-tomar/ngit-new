"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoPassagesAction, getStenoSeriesByIdAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Play, Trophy, Clock, FileText, Keyboard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StudentCategoryDictationsPage({
  params,
}: {
  params: Promise<{ id: string; catId: string }>;
}) {
  const resolvedParams = use(params);
  const [series, setSeries] = useState<any>(null);
  const [passages, setPassages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [resolvedParams.id, resolvedParams.catId]);

  const loadData = async () => {
    setLoading(true);
    const [sRes, pRes] = await Promise.all([
      getStenoSeriesByIdAction(resolvedParams.id),
      getStenoPassagesAction({ seriesId: resolvedParams.id }),
    ]);

    if (sRes.success && sRes.series) {
      setSeries(sRes.series);
    }
    if (pRes.success && pRes.passages) {
      setPassages(pRes.passages);
    }
    setLoading(false);
  };

  const categoryTitles: Record<string, string> = {
    "sansadiya-5min": "संसदीय 5 Min Dictation",
    "sampadkiya-5min": "संपादकीय 5 Min Dictation",
    "sansadiya-10min": "संसदीय 10 Min Dictation",
  };

  const catName = categoryTitles[resolvedParams.catId] || "Dictation Practice Set";

  // Prevent hardcoded headers during buffering
  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          Loading Steno Course Dictation Tests...
        </p>
      </div>
    );
  }

  const seriesName = series?.title || "Steno Course Series";

  const rawList = passages.map((p, idx) => ({
    _id: p._id,
    title: p.title || `Test - ${idx + 1}`,
    wordCount: p.wordCount || 390,
    status: "Not Attempted yet",
  }));

  const filteredTests = rawList.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1 sm:p-2">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>{seriesName}</span>
          <span className="text-slate-400">›</span>
          <span className="text-indigo-600">{catName}</span>
        </h1>

        <Link href={`/student/steno/series/${resolvedParams.id}`}>
          <Button variant="default" className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold h-9 px-4 text-xs rounded-xl gap-2 shadow-xs">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      {rawList.length > 0 && (
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dictation test..."
            className="pl-11 rounded-2xl bg-white border-slate-200 text-xs font-semibold h-11 shadow-xs"
          />
        </div>
      )}

      {/* Dictation Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No Dictation Tests Available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            There are currently no dictations published under this series category.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTests.map((test) => (
            <Card key={test._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900">{test.title}</h3>

                <div className="space-y-2 text-xs font-medium text-slate-600">
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> {test.wordCount} Words
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" /> All Speeds Available
                  </p>
                  <p className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-slate-400" /> SSC typing interface
                  </p>
                  <p className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-300" /> {test.status}
                  </p>
                </div>

                <Link href="/student/steno/leaderboard" className="block pt-1">
                  <span className="text-[11px] font-extrabold text-amber-600 hover:underline flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> View Test Leaderboard & Ranks
                  </span>
                </Link>
              </div>

              <Link href={`/student/steno/passage/${test._id}`} className="block pt-2">
                <Button className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black h-11 text-xs rounded-xl shadow-md gap-2">
                  <Play className="w-4 h-4 fill-white" /> Play Dictation
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

