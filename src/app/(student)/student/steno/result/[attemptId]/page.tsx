"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoResultByIdAction } from "@/app/actions/steno";
import { StenoResultView } from "@/components/steno/StenoResultView";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
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
      toast.error(res.error || "Failed to load evaluation report");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" /> Loading Detailed Evaluation Report...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <p className="text-slate-500 font-bold">Result record not found.</p>
        <Link href="/student/steno/my-tests">
          <Button variant="outline" className="rounded-xl">Back to My Tests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <StenoResultView result={result} />
    </div>
  );
}
