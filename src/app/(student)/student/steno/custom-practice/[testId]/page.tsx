"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStenoCustomTestByIdAction, submitStenoResultAction } from "@/app/actions/steno";
import { StenoEngineModule } from "@/modules/steno/StenoEngineModule";
import { StenoSessionConfigModal, StenoSessionConfig } from "@/components/steno/StenoSessionConfigModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Keyboard, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StudentCustomPracticePreStartPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [customTest, setCustomTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Flow State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<StenoSessionConfig | null>(null);
  const [startEngine, setStartEngine] = useState(false);

  useEffect(() => {
    loadCustomTest();
  }, [resolvedParams.testId]);

  const loadCustomTest = async () => {
    setLoading(true);
    const res = await getStenoCustomTestByIdAction(resolvedParams.testId);
    if (res.success && res.customTest) {
      setCustomTest(res.customTest);
    } else {
      toast.error(res.error || "Failed to load custom practice test");
    }
    setLoading(false);
  };

  const handleSaveConfig = (config: StenoSessionConfig) => {
    setSessionConfig(config);
    setIsConfigModalOpen(false);
    setStartEngine(true);
    toast.success("Transcription session configured!");
  };

  const handleComplete = async (evaluationResult: any) => {
    toast.loading("Submitting evaluation attempt...");
    const submitRes = await submitStenoResultAction({
      passageId: customTest?.passageId?._id || customTest?.passageId,
      typedTranscription: evaluationResult.userTranscription || "",
      speedWpm: evaluationResult.netWpm,
      accuracy: evaluationResult.accuracy,
      fullErrors: evaluationResult.spellingErrors + evaluationResult.addedWords + evaluationResult.skippedWords,
      halfErrors: evaluationResult.matraErrors + evaluationResult.punctuationErrors,
      totalErrors: evaluationResult.totalErrors,
      score: evaluationResult.finalScore,
      status: evaluationResult.status,
      timeSpentSeconds: evaluationResult.timeSpentSeconds || 60,
    });

    if (submitRes.success && submitRes.resultId) {
      toast.dismiss();
      toast.success("Custom test attempt saved!");
      router.push(`/student/steno/result/${submitRes.resultId}`);
    } else {
      toast.dismiss();
      toast.error(submitRes.error || "Failed to submit attempt");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Custom Test...
      </div>
    );
  }

  if (!customTest) {
    return (
      <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
        Custom practice test not found.
      </Card>
    );
  }

  const passageObj = customTest.passageId || {
    title: customTest.title,
    transcriptText: "माननीय न्यायाधीश महोदय...",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    targetWpm: customTest.targetWpm || 80,
    language: customTest.language || "Hindi",
  };

  // Convert configured rules for evaluation engine
  const presetRulesObj = sessionConfig
    ? {
        spellingErrorWeight: sessionConfig.spellingMistake === "Full" ? 1.0 : sessionConfig.spellingMistake === "Half" ? 0.5 : 0.0,
        matraErrorWeight: sessionConfig.capitalizationMistake === "Full" ? 1.0 : sessionConfig.capitalizationMistake === "Half" ? 0.5 : 0.0,
        punctuationErrorWeight: sessionConfig.punctuationMistake === "Full" ? 1.0 : sessionConfig.punctuationMistake === "Half" ? 0.5 : 0.0,
        addedWordWeight: sessionConfig.addedWordMistake === "Full" ? 1.0 : sessionConfig.addedWordMistake === "Half" ? 0.5 : 0.0,
        skippedWordWeight: sessionConfig.skippedWordMistake === "Full" ? 1.0 : sessionConfig.skippedWordMistake === "Half" ? 0.5 : 0.0,
      }
    : undefined;

  // If student configured session and clicked Start Transcription, show Transcription Engine workspace
  if (startEngine) {
    return (
      <div className="space-y-6 p-1 sm:p-2">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
              Configured Mode: {sessionConfig?.mode === "exam" ? sessionConfig.examPresetName : "Manual Setup"}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Duration: {sessionConfig?.durationMinutes} Mins
            </span>
          </div>

          <Button
            onClick={() => setStartEngine(false)}
            variant="outline"
            size="sm"
            className="rounded-xl h-8 text-xs font-bold gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Config Page
          </Button>
        </div>

        <StenoEngineModule
          passage={passageObj}
          presetRules={presetRulesObj}
          initialFont={sessionConfig?.selectedFont || customTest.hindiFont}
          initialDurationMinutes={sessionConfig?.durationMinutes}
          presetName={sessionConfig?.mode === "exam" ? sessionConfig.examPresetName : "Manual Setup"}
          backspaceStatus={sessionConfig?.backspaceStatus}
          onComplete={handleComplete}
        />
      </div>
    );
  }


  // Pre-Start Informative Page (Image 2)
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 sm:p-2">
      {/* Top Left Navigation Button */}
      <Link href="/student/steno/my-tests">
        <Button variant="default" className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold h-10 px-5 text-xs rounded-xl shadow-md gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Steno Tests
        </Button>
      </Link>

      {/* Main Informative Card (Image 2) */}
      <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-md space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{customTest.title}</h2>
          <Link href="/student/steno/my-tests">
            <Button variant="default" className="bg-[#1e293b] text-white hover:bg-slate-800 font-bold h-9 px-4 text-xs rounded-xl gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
        </div>

        {/* Dark Navy Banner */}
        <div className="bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#0b132b] text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b] text-slate-900 flex items-center justify-center font-black shadow-md shrink-0">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#f59e0b]">
                  CUSTOM STENO TEST (SELF DICTATION MODE)
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Type your transcript and evaluate your speed & accuracy against your passage!
              </p>
            </div>
          </div>

          <span className="bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">
            SELF PRACTICE
          </span>
        </div>

        {/* Main Action Button */}
        <Button
          onClick={() => setIsConfigModalOpen(true)}
          className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black h-14 text-sm sm:text-base rounded-2xl shadow-lg tracking-wider gap-2"
        >
          <Keyboard className="w-5 h-5" /> START TRANSCRIPTION
        </Button>
      </Card>

      {/* Instructions Box (Image 2) */}
      <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-100 space-y-3">
        <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" /> Instructions
        </h4>
        <ol className="text-xs text-slate-700 font-medium space-y-2 pl-2">
          <li>1. Click <strong className="text-indigo-900 font-bold">Play Dictation</strong> and wait 3 seconds. Dictation will start playing automatically.</li>
          <li>2. If dictation is not playing, there may be an issue with your internet connection. Please check your connection first.</li>
          <li>3. If the problem still persists, contact us at: <strong className="text-indigo-900 font-bold">+91 80049 58441</strong></li>
        </ol>
        <div className="pt-2 border-t border-indigo-100 text-[11px] font-bold text-slate-500">
          Software Version (Latest): v1.1.3 (July 18, 2026) — If not visible, press <strong className="text-indigo-900">Ctrl + F5</strong> to refresh the page.
        </div>
      </div>

      {/* Session Configuration Modal (Image 3 & Image 4) */}
      <StenoSessionConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
        totalWords={customTest.passageId?.wordCount || 45}
      />
    </div>
  );
}
