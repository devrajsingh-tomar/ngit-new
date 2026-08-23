"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoSeriesByIdAction, getStenoPassagesAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Headphones, MessageCircle, ChevronRight, RefreshCw, Feather } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [series, setSeries] = useState<any>(null);
  const [passages, setPassages] = useState<any[]>([]);
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
      // Fallback series info for pre-configured batches
      const titles: Record<string, string> = {
        "upsssc-steno": "UPSSSC STENO",
        "ssc-steno-2026": "SSC STENO 2026",
        "allahabad-highcourt-steno": "ALLAHABAD HIGHCOURT STENO",
        "hssc-steno-2026": "HSSC STENO 2026",
        "asi-steno": "ASI STENO",
        "ramdhari-singh-khand-1": "RAMDHARI SINGH KHAND-1",
      };
      setSeries({
        _id: resolvedParams.id,
        title: titles[resolvedParams.id] || "ALLAHABAD HIGHCOURT STENO",
      });
    }

    if (pRes.success && pRes.passages) {
      setPassages(pRes.passages);
    }
    setLoading(false);
  };

  // Categories matching Image 2 design
  const defaultCategories = [
    {
      _id: "sansadiya-5min",
      title: "संसदीय 5 Min Dictation",
      count: passages.filter((p) => p.category === "Legal" || true).length || 5,
      bgGradient: "from-amber-600 to-amber-800",
    },
    {
      _id: "sampadkiya-5min",
      title: "संपादकीय 5 Min Dictation",
      count: 80,
      bgGradient: "from-indigo-600 to-blue-800",
    },
    {
      _id: "sansadiya-10min",
      title: "संसदीय 10 Min Dictation",
      count: 3,
      bgGradient: "from-amber-700 to-red-900",
    },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Series Categories...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1 sm:p-2">
      {/* Header Bar (Matching Image 2) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {series?.title || "ALLAHABAD HIGHCOURT STENO"} Series
        </h1>

        <Link href="/student/steno/series">
          <Button variant="default" className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold h-10 px-5 text-xs rounded-xl gap-2 shadow-xs">
            <ArrowLeft className="w-4 h-4" /> Back to Series
          </Button>
        </Link>
      </div>

      {/* Official Telegram Group Link Note (Matching Image 2) */}
      <Card className="p-4 max-w-xs rounded-2xl border-slate-200 bg-white shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900">Official Telegram Group</h4>
          <p className="text-[10px] font-extrabold text-sky-600 hover:underline cursor-pointer uppercase tracking-wider">
            CLICK HERE TO JOIN GROUP TO DISCUSS DOUBTS
          </p>
        </div>
      </Card>

      {/* Categories Grid (Matching Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {defaultCategories.map((cat) => (
          <Card key={cat._id} className="p-0 rounded-3xl border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group">
            {/* Banner Image / Graphic */}
            <div className={`h-36 bg-gradient-to-br ${cat.bgGradient} text-white p-4 flex items-center justify-center text-center relative`}>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <Feather className="w-8 h-8 text-amber-300" />
              </div>
            </div>

            {/* Category Details */}
            <div className="p-5 pt-0 space-y-4">
              <h3 className="text-lg font-black text-slate-900 leading-snug">{cat.title}</h3>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-indigo-600" /> {cat.count} DICTATIONS
                </span>

                <Link href={`/student/steno/series/${resolvedParams.id}/category/${cat._id}`}>
                  <span className="text-xs font-black text-indigo-600 group-hover:gap-1 flex items-center gap-0.5 transition-all">
                    OPEN <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
