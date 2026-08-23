"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoPassagesAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Search, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StenoDictationLibraryPage() {
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<string>("All");

  useEffect(() => {
    loadPassages();
  }, [languageFilter]);

  const loadPassages = async () => {
    setLoading(true);
    const query = languageFilter !== "All" ? { language: languageFilter } : undefined;
    const res = await getStenoPassagesAction(query);
    if (res.success && res.passages) {
      setPassages(res.passages);
    } else {
      toast.error(res.error || "Failed to load dictations");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="w-6 h-6 text-indigo-600" /> Audio Dictation Library
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Select an audio dictation passage to practice shorthand listening & live transcription.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["All", "Hindi", "English"].map((lang) => (
            <Button
              key={lang}
              onClick={() => setLanguageFilter(lang)}
              variant={languageFilter === lang ? "default" : "outline"}
              size="sm"
              className={`h-8 text-xs font-bold rounded-xl ${
                languageFilter === lang ? "bg-indigo-600 text-white" : "border-slate-200 text-slate-600"
              }`}
            >
              {lang}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading dictations...
        </div>
      ) : passages.length === 0 ? (
        <Card className="py-16 text-center text-slate-400 rounded-3xl border-dashed">
          No dictations found matching your filter. Check back soon for new uploads!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {passages.map((p) => (
            <Card key={p._id} className="p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                  {p.language} • {p.targetWpm || 80} WPM
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{p.difficulty || "Intermediate"}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 leading-snug">{p.title}</h3>
              <p className="text-xs text-slate-400 truncate">Category: {p.category || "General Dictation"}</p>
              <Link href={`/steno/passage/${p._id}`}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs rounded-xl gap-2 mt-2">
                  <Play className="w-4 h-4" /> Open Dictation Workspace
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
