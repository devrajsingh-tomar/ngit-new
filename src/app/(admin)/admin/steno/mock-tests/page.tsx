"use client";

import { useEffect, useState } from "react";
import { getStenoExamsAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminStenoMockTestsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams);
    } else {
      toast.error(res.error || "Failed to load mock test presets");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" /> Admin Steno Mock Tests
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure official mock exam papers and pattern test sets.
          </p>
        </div>
        <Link href="/admin/steno/exams">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs rounded-xl gap-1">
            <Plus className="w-4 h-4" /> Manage Exam Presets
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" /> Loading mock tests...
        </div>
      ) : exams.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No mock tests configured yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam._id} className="p-5 rounded-3xl border-slate-200 shadow-sm bg-white space-y-3">
              <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-100">
                {exam.language} • {exam.targetWpm} WPM
              </span>
              <h3 className="text-base font-black text-slate-900">{exam.name}</h3>
              <p className="text-xs text-slate-400">Duration: {exam.dictationDurationMinutes}m / {exam.transcriptionDurationMinutes}m</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
