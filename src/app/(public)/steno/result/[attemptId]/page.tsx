"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getStenoResultByIdAction } from "@/app/actions/steno";
import { StenoResultView } from "@/components/steno/StenoResultView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StenoResultReportPage({ params }: { params: Promise<{ attemptId: string }> }) {
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
      toast.error(res.error || "Failed to load result evaluation");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-2" /> Generating Detailed Evaluation Report...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold">Result record not found.</p>
        <Link href="/steno/my-tests">
          <Button variant="outline" className="mt-4 rounded-xl">Back to My Tests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-2 sm:px-6">
      <StenoResultView result={result} />
    </div>
  );
}
