"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoResultByIdAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, FileText, Award } from "lucide-react";
import { toast } from "sonner";

export default function StenoTranscriptionAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const resolvedParams = use(params);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [resolvedParams.attemptId]);

  const loadResult = async () => {
    setLoading(true);
    const res = await getStenoResultByIdAction(resolvedParams.attemptId);
    if (res.success && res.result) {
      setResult(res.result);
    } else {
      toast.error(res.error || "Failed to load transcription record");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-2" /> Loading transcription file...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold">Transcription record not found.</p>
        <Link href="/steno/my-tests">
          <Button variant="outline" className="mt-4 rounded-xl">Back to My Tests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <Link href="/steno/my-tests" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to My Tests
      </Link>

      <Card className="p-6 rounded-3xl border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md border border-indigo-100">
              Saved Transcription Attempt
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-2">{result.passageId?.title || "Steno Dictation"}</h1>
            <p className="text-xs text-slate-400">Attempted on: {new Date(result.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
            result.status === "Passed" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}>
            {result.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border">
            <p className="text-[10px] font-black uppercase text-slate-400">Speed</p>
            <p className="text-lg font-black text-indigo-600">{result.speedWpm} WPM</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border">
            <p className="text-[10px] font-black uppercase text-slate-400">Accuracy</p>
            <p className="text-lg font-black text-emerald-600">{result.accuracy}%</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border">
            <p className="text-[10px] font-black uppercase text-slate-400">Full Errors</p>
            <p className="text-lg font-black text-rose-600">{result.fullErrors}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border">
            <p className="text-[10px] font-black uppercase text-slate-400">Half Errors</p>
            <p className="text-lg font-black text-amber-600">{result.halfErrors}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" /> Submitted Transcription Text
          </h4>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
            {result.typedTranscription || "No transcription text recorded."}
          </div>
        </div>
      </Card>
    </div>
  );
}
