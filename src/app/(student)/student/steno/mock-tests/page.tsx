"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStenoExamsAction, getStenoPassagesAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoMockTestsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [eRes, pRes] = await Promise.all([
      getStenoExamsAction(),
      getStenoPassagesAction(),
    ]);

    if (eRes.success && eRes.exams) setExams(eRes.exams);
    if (pRes.success && pRes.passages) setPassages(pRes.passages);
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-1 sm:p-2">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" /> Official Steno Mock Exams
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Timed mock examinations adhering to official SSC Grade C & D, High Court, and UPSSSC board marking rules.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" /> Loading mock exams...
        </div>
      ) : exams.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No mock exams configured yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const linkedPassage = passages.find((p) => p.targetWpm === exam.targetWpm) || passages[0];
            return (
              <Card key={exam._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-amber-300 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-100">
                      {exam.language} • {exam.targetWpm} WPM
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{exam.dictationDurationMinutes} Mins</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{exam.name}</h3>
                  <p className="text-xs text-slate-500">
                    Transcription Time: {exam.transcriptionDurationMinutes} Mins • Max Allowed Errors: {exam.maxAllowedErrorPercent}%
                  </p>
                  <p className="text-xs font-bold text-slate-400 pt-1">
                    Backspace: <strong className="text-slate-700 font-bold uppercase">{exam.backspaceMode || "Full"}</strong>
                  </p>
                </div>

                <Link href={linkedPassage ? `/student/steno/passage/${linkedPassage._id}` : "/student/steno/practice"} className="pt-2">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs rounded-xl gap-1.5 shadow-xs">
                    <Play className="w-3.5 h-3.5 fill-white" /> Attempt Mock Test
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
