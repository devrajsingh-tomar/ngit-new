"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStenoPassageByIdAction, submitStenoResultAction } from "@/app/actions/steno";
import { StenoEngineModule } from "@/modules/steno/StenoEngineModule";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StenoPassageWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [passage, setPassage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassage();
  }, [resolvedParams.id]);

  const loadPassage = async () => {
    setLoading(true);
    const res = await getStenoPassageByIdAction(resolvedParams.id);
    if (res.success && res.passage) {
      setPassage(res.passage);
    } else {
      toast.error(res.error || "Failed to load dictation passage");
    }
    setLoading(false);
  };

  const handleEvaluationComplete = async (result: any) => {
    const submitRes = await submitStenoResultAction({
      passageId: resolvedParams.id,
      typedTranscription: result.wordBreakdown.map((w: any) => w.typed).join(" "),
      speedWpm: result.speedWpm,
      accuracy: result.accuracy,
      fullErrors: result.fullErrors,
      halfErrors: result.halfErrors,
      totalErrors: result.totalErrors,
      score: result.score,
      status: result.status,
      timeSpentSeconds: Math.round(result.speedWpm > 0 ? 300 : 0),
    });

    if (submitRes.success && submitRes.resultId) {
      router.push(`/steno/result/${submitRes.resultId}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-2" /> Initializing Steno Dictation Engine...
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold">Dictation passage not found.</p>
        <Link href="/steno/dictation">
          <Button variant="outline" className="mt-4 rounded-xl">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-2 sm:px-6 space-y-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/steno/dictation" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dictation Library
        </Link>
      </div>

      <StenoEngineModule passage={passage} onComplete={handleEvaluationComplete} />
    </div>
  );
}
