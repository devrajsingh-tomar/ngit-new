"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getStenoPassageByIdAction, submitStenoResultAction } from "@/app/actions/steno";
import { StenoEngineModule } from "@/modules/steno/StenoEngineModule";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoPassagePage({ params }: { params: Promise<{ id: string }> }) {
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

  const handleComplete = async (evaluationResult: any) => {
    toast.loading("Submitting evaluation attempt...");
    const submitRes = await submitStenoResultAction({
      passageId: resolvedParams.id,
      typedTranscription: evaluationResult.wordBreakdown.map((w: any) => w.typed).join(" "),
      speedWpm: evaluationResult.netWpm,
      accuracy: evaluationResult.accuracy,
      fullErrors: evaluationResult.spellingErrors + evaluationResult.addedWords + evaluationResult.skippedWords,
      halfErrors: evaluationResult.matraErrors + evaluationResult.punctuationErrors,
      totalErrors: evaluationResult.totalErrors,
      score: evaluationResult.finalScore,
      status: evaluationResult.status,
      timeSpentSeconds: 300,
    });

    if (submitRes.success && submitRes.resultId) {
      toast.dismiss();
      toast.success("Attempt saved!");
      router.push(`/student/steno/result/${submitRes.resultId}`);
    } else {
      toast.dismiss();
      toast.error(submitRes.error || "Failed to submit attempt");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Passage Workspace...
      </div>
    );
  }

  if (!passage) {
    return (
      <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
        Passage record not found.
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <StenoEngineModule passage={passage} onComplete={handleComplete} />
    </div>
  );
}
