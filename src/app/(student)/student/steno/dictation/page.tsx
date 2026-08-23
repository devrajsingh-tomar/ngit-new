"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoPassagesAction } from "@/app/actions/steno";
import { StenoEngineModule } from "@/modules/steno/StenoEngineModule";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StudentStenoDictationPage() {
  const router = useRouter();
  const [passage, setPassage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamplePassage();
  }, []);

  const loadSamplePassage = async () => {
    setLoading(true);
    const res = await getStenoPassagesAction();
    if (res.success && res.passages && res.passages.length > 0) {
      setPassage(res.passages[0]);
    } else {
      toast.error("No dictation passages available right now");
    }
    setLoading(false);
  };

  const handleEvaluationComplete = (result: any) => {
    toast.success("Transcription evaluated! Saving result...");
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Dictation Player Engine...
      </div>
    );
  }

  if (!passage) {
    return (
      <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
        No active dictation passages found. Please contact admin to upload dictations.
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <StenoEngineModule passage={passage} onComplete={handleEvaluationComplete} />
    </div>
  );
}
