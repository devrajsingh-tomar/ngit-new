"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getStenoExamsAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, Sparkles, Layers } from "lucide-react";

function StudentStenoExamsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawBatch = searchParams.get("batch") || "हिंदी स्टेनो स्पेशल बैच (ठाकुरद्वारा)";

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams.filter((e: any) => e.isActive !== false));
    }
    setLoading(false);
  };

  const handleSelectExam = (examId: string) => {
    router.push(`/student/steno/series/batch/${encodeURIComponent(rawBatch)}?examId=${examId}`);
  };

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" /> Step 2 of 4 • Select Target Exam Pattern
            </span>
            <span className="bg-white/10 text-slate-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-white/10">
              {rawBatch}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            SELECT GOVERNMENT STENO EXAM PATTERN (STEP 2)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Select the target government steno exam rules (UPSSSC, High Court, UP SI, SSC) to practice series dictations with official error weights & evaluation rules.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <Link href="/student/steno/series">
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white font-bold h-10 px-5 text-xs rounded-xl border border-white/20 gap-2 shadow-xs">
              <ArrowLeft className="w-4 h-4" /> Back to All Batches (Step 1)
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Exam Patterns...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card className="p-16 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No Exam Patterns Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Government exam preset rules are being updated by administrators.
          </p>
          <Link href={`/student/steno/series/batch/${encodeURIComponent(rawBatch)}`}>
            <Button className="mt-2 bg-indigo-600 text-white text-xs font-bold rounded-xl gap-1.5">
              Proceed Directly to Series Topics (Step 3) <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                AVAILABLE TARGET EXAM PATTERNS ({exams.length})
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Click on any exam pattern below to set your evaluation rules and proceed to Series Topics.
              </p>
            </div>
            <Button onClick={loadExams} variant="outline" size="sm" className="text-xs font-bold rounded-xl gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <Card
                key={exam._id}
                className="p-0 rounded-3xl bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group border border-slate-200 hover:border-indigo-400"
              >
                <div>
                  {/* Step 2 Poster Image Rendering if uploaded */}
                  {exam.thumbnailUrl && exam.thumbnailUrl.trim() !== "" ? (
                    <div className="w-full bg-slate-950 overflow-hidden relative border-b border-slate-100 flex items-center justify-center max-h-56">
                      <img
                        src={exam.thumbnailUrl}
                        alt={exam.name}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-white" /> OFFICIAL EXAM PATTERN
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Fallback Header Banner */
                    <div className="w-full bg-gradient-to-br from-indigo-800 to-slate-900 text-white p-5 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-start z-10">
                        <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Official Exam Pattern
                        </span>
                        {exam.authorityName && (
                          <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                            {exam.authorityName}
                          </span>
                        )}
                      </div>
                      <div className="z-10 mt-3 space-y-1">
                        <h3 className="text-xl font-black drop-shadow-md leading-tight">
                          {exam.name}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* Exam Rules Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-black text-slate-900">{exam.name}</h3>
                      {exam.authorityName && (
                        <span className="bg-indigo-50 text-indigo-700 text-[11px] font-extrabold px-3 py-1 rounded-xl border border-indigo-100">
                          {exam.authorityName}
                        </span>
                      )}
                    </div>

                    {/* Official Exam Rules Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold text-slate-700">
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span>• Backspace:</span>
                        <strong className="text-indigo-700 font-extrabold uppercase">
                          {exam.backspaceMode === "full" ? "Enabled (सुधार मान्य)" : exam.backspaceMode}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span>• Transcription Duration:</span>
                        <strong className="text-indigo-700 font-extrabold">{exam.transcriptionDurationMinutes || 40} Mins</strong>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span>• Total Words:</span>
                        <strong className="text-indigo-700 font-extrabold">{exam.totalWords || 420} Words</strong>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span>• Dictation Duration:</span>
                        <strong className="text-indigo-700 font-extrabold">{exam.dictationDurationMinutes || 5} Mins</strong>
                      </div>

                      <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-emerald-900 font-bold">• Mistake Exemption:</span>
                        <strong className="text-emerald-700 font-black">{exam.mistakeExemptionCount ?? 20} अशुद्धियों की छूट</strong>
                      </div>

                      <div className="flex items-center justify-between bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
                        <span className="text-indigo-900 font-bold">• Qualifying Speed:</span>
                        <strong className="text-indigo-700 font-black">{exam.targetWpm || 80} WPM (अनिवार्य)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="p-6 pt-0">
                  <Button
                    onClick={() => handleSelectExam(exam._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-12 text-xs rounded-2xl gap-2 transition-all shadow-md group-hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SELECT THIS EXAM & GO TO SERIES TOPICS (STEP 3) <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentStenoExamsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-slate-400">Loading Exam Patterns...</div>}>
      <StudentStenoExamsContent />
    </Suspense>
  );
}
