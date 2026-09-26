"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStenoExamsAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowLeft, ArrowRight, Sparkles, BookOpen, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { isRealPoster } from "@/lib/steno/stenoUtils";

// Default Government Steno Exam Presets for Step 2
const DEFAULT_STENO_GOVT_EXAMS = [
  {
    _id: "upsssc_steno",
    name: "UPSSSC Steno",
    authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
    thumbnailUrl: "https://ngitedu.com/uploads/gallery/1787956467734-3fe88938-2d9d-4471-9a0d-e24dac83cdf4.jpg",
    description: "संपादकीय, निबन्ध, साहित्य, कहानी, संसदीय, लीगल, रामधारी खण्ड 1 व 2, कुरुक्षेत्र पत्रिका संग्रह",
    targetWpm: 80,
    dictationDurationMinutes: 5,
    transcriptionDurationMinutes: 40,
    mistakeExemptionCount: 20,
  },
  {
    _id: "upsi_steno",
    name: "UPSI Steno",
    authorityName: "उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड",
    thumbnailUrl: "/images/steno-weekly-test-banner.jpg",
    description: "पुलिस एवं उत्तर प्रदेश उप निरीक्षक आशुलिपि परीक्षा स्पेशल डिक्टेशन",
    targetWpm: 80,
    dictationDurationMinutes: 5,
    transcriptionDurationMinutes: 40,
    mistakeExemptionCount: 15,
  },
  {
    _id: "ssc_steno",
    name: "SSC Steno Grade C & D",
    authorityName: "Staff Selection Commission",
    thumbnailUrl: "/images/steno-test-guide-banner.jpg",
    description: "SSC Grade C (100 WPM) & Grade D (80 WPM) ऑफिशियल प्रीवियस ईयर डिक्टेशंस",
    targetWpm: 80,
    dictationDurationMinutes: 10,
    transcriptionDurationMinutes: 50,
    mistakeExemptionCount: 25,
  },
  {
    _id: "hc_steno",
    name: "Allahabad High Court Steno",
    authorityName: "High Court of Judicature at Allahabad",
    thumbnailUrl: "/images/steno-analytics-banner.jpg",
    description: "हाईकोर्ट एवं जिला न्यायालय लीगल जजमेंट एवं कोर्ट रूम डिक्टेशन संग्रह",
    targetWpm: 80,
    dictationDurationMinutes: 5,
    transcriptionDurationMinutes: 30,
    mistakeExemptionCount: 10,
  },
];

function StudentStenoExamsContent() {
  const searchParams = useSearchParams();
  const rawBatch = searchParams.get("batch") || "हिंदी स्टेनो स्पेशल बैच (ठाकुरद्वारा)";
  const [exams, setExams] = useState<any[]>(DEFAULT_STENO_GOVT_EXAMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await getStenoExamsAction();
      if (res.success && Array.isArray(res.exams) && res.exams.length > 0) {
        const mergedMap = new Map<string, any>();
        DEFAULT_STENO_GOVT_EXAMS.forEach((def) => {
          mergedMap.set(def.name.toLowerCase().trim(), { ...def });
        });
        res.exams.forEach((dbExam: any) => {
          const key = (dbExam.name || "").toLowerCase().trim();
          if (!key) return;
          const existing = mergedMap.get(key) || {};
          mergedMap.set(key, { ...existing, ...dbExam });
        });
        setExams(Array.from(mergedMap.values()));
      }
    } catch (e) {
      console.error("Failed to load exams:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" /> Step 2 of 4 • Select Target Government Exam
            </span>
            <span className="bg-white/10 text-slate-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-white/10">
              {rawBatch}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            GOVERNMENT STENO EXAMS (Step 2)
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Select your target government steno exam (UPSSSC Steno, UPSI Steno, SSC Steno, High Court Steno) to view its Series Topics.
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              SELECT GOVERNMENT EXAM (सरकारी आशुलिपिक परीक्षाएं)
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Click on any target government exam below to explore its Series Topics & Dictation Collections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, index) => {
            const hasPoster = isRealPoster(exam.thumbnailUrl);
            const gradients = [
              "from-indigo-700 to-purple-900",
              "from-blue-700 to-cyan-900",
              "from-emerald-700 to-teal-900",
              "from-amber-700 to-rose-900",
            ];
            const fallbackGradient = gradients[index % gradients.length];

            return (
              <Card
                key={exam._id || exam.name}
                className="p-0 rounded-3xl bg-white shadow-md overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group border border-slate-200 hover:border-indigo-400"
              >
                {/* Step 2 Poster Image Rendering */}
                {hasPoster ? (
                  <div className="w-full bg-slate-950 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
                    <img
                      src={exam.thumbnailUrl}
                      alt={exam.name}
                      className="w-full h-auto max-h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-white" /> TARGET GOVT EXAM
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Fallback Styled Banner */
                  <div className={`w-full bg-gradient-to-br ${fallbackGradient} text-white p-6 relative overflow-hidden flex flex-col justify-between h-44`}>
                    <div className="flex justify-between items-start z-10">
                      <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Target Govt Exam
                      </span>
                      {exam.authorityName && (
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                          {exam.authorityName}
                        </span>
                      )}
                    </div>

                    <div className="z-10 space-y-1">
                      <h3 className="text-xl font-black drop-shadow-md leading-tight">
                        {exam.name}
                      </h3>
                    </div>

                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  </div>
                )}

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900">{exam.name}</h3>
                      {exam.authorityName && (
                        <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {exam.authorityName}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {exam.description || "Official Government Steno Exam Dictations & Rules"}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exam.targetWpm && (
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" /> {exam.targetWpm} WPM
                        </span>
                      )}
                      {exam.dictationDurationMinutes && (
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {exam.dictationDurationMinutes} min dictation
                        </span>
                      )}
                      {exam.mistakeExemptionCount !== undefined && (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                          {exam.mistakeExemptionCount} छूट
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button: Navigate to Step 3 */}
                  <Link
                    href={`/student/steno/series/batch/${encodeURIComponent(rawBatch)}?exam=${encodeURIComponent(exam.name)}`}
                    className="block pt-2"
                  >
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 text-xs rounded-2xl gap-2 transition-all shadow-md group-hover:scale-[1.02]">
                      <BookOpen className="w-4 h-4" /> EXPLORE SERIES TOPICS (Step 3) <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StudentStenoExamsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-slate-400">Loading Government Exams...</div>}>
      <StudentStenoExamsContent />
    </Suspense>
  );
}
