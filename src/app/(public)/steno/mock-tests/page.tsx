"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoExamsAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Play, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function StenoMockTestsPage() {
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
      toast.error(res.error || "Failed to load exam presets");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" /> Government Steno Pattern Mock Exams
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Full-length timed dictations adhering to official admin-configured exam presets.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" /> Loading exam presets...
        </div>
      ) : exams.length === 0 ? (
        <Card className="py-16 text-center text-slate-400 rounded-3xl border-dashed">
          No active mock exam presets found in database.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-100">
                  {exam.language} • {exam.targetWpm} WPM
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Duration: {exam.dictationDurationMinutes}m / {exam.transcriptionDurationMinutes}m
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">{exam.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Backspace Mode: <strong className="uppercase">{exam.backspaceMode}</strong>
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-600 font-medium">
                <p className="flex justify-between">
                  <span>Spelling Weight:</span> <span className="font-bold text-slate-900">{exam.spellingErrorWeight}</span>
                </p>
                <p className="flex justify-between">
                  <span>Matra Error Weight:</span> <span className="font-bold text-slate-900">{exam.matraErrorWeight}</span>
                </p>
                <p className="flex justify-between">
                  <span>Allowed Fonts:</span> <span className="font-bold text-indigo-600">{Array.isArray(exam.allowedFonts) ? exam.allowedFonts.join(", ") : "Kruti Dev, Mangal"}</span>
                </p>
              </div>

              <Link href="/steno/dictation">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 text-xs rounded-xl gap-2 mt-2">
                  <Play className="w-4 h-4" /> Start Mock Examination
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
