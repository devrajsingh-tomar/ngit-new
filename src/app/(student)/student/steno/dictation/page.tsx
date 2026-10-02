"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoPassagesAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, RefreshCw, Layers, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentStenoDictationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAndRedirect();
  }, []);

  const loadAndRedirect = async () => {
    setLoading(true);
    try {
      const res = await getStenoPassagesAction();
      if (res.success && res.passages && res.passages.length > 0) {
        router.replace(`/student/steno/passage/${res.passages[0]._id}`);
        return;
      }
    } catch (err) {
      console.warn("Failed to load initial passage:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-xs font-black uppercase tracking-wider text-slate-600">
          Loading Dictation Player...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
      <Card className="p-8 sm:p-12 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Headphones className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Steno Dictation Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          कृपया अभ्यास करने के लिए अपने लक्ष्य बैच और डिक्टेशन पैसेज का चयन करें।
        </p>
        <Link href="/student/steno/series" className="inline-block pt-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-md gap-2">
            <Layers className="w-4 h-4" /> Browse Steno Batches (Step 1) <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
