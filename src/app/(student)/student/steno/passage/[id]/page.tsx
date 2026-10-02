"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { getStenoPassageByIdAction, submitStenoResultAction } from "@/app/actions/steno";
import { checkStenoAccessAction } from "@/app/actions/steno-subscription";
import { StenoEngineModule } from "@/modules/steno/StenoEngineModule";
import { StenoSessionConfigModal, StenoSessionConfig } from "@/components/steno/StenoSessionConfigModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Keyboard,
  Info,
  RefreshCw,
  Lock,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import StenoDictationPlayer from "@/components/steno/StenoDictationPlayer";

function PassagePlayerContent({ passageId }: { passageId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBatch = searchParams.get("batch");
  const queryExam = searchParams.get("exam");

  const [passage, setPassage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessState, setAccessState] = useState<{
    hasAccess: boolean;
    isAdmin: boolean;
    isTrialActive: boolean;
    trialExpired: boolean;
    daysLeftInTrial: number;
    message: string;
  } | null>(null);

  // Modal & Workspace state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<StenoSessionConfig | null>(null);
  const [startEngine, setStartEngine] = useState(false);

  useEffect(() => {
    if (passageId) {
      loadPassageData(passageId);
    }
  }, [passageId]);

  const loadPassageData = async (targetId: string) => {
    setLoading(true);
    try {
      // 6-second timeout safety to prevent infinite loading in mobile/slow networks
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Passage fetch timeout")), 6000)
      );

      const fetchPromise = Promise.all([
        getStenoPassageByIdAction(targetId).catch((err) => ({
          success: false,
          error: err.message,
          passage: null,
        })),
        checkStenoAccessAction({}).catch((err) => ({
          success: false,
          error: err.message,
          data: null,
        })),
      ]);

      const [res, access]: any = await Promise.race([fetchPromise, timeoutPromise]).catch(() => [
        { success: false },
        { success: false },
      ]);

      if (access?.success && access?.data) {
        setAccessState(access.data);
      }

      if (res?.success && res?.passage) {
        setPassage(res.passage);
      } else {
        // Safe fallback passage so the player is always functional
        setPassage((prev: any) => prev || {
          _id: targetId,
          title: "Steno Practice Dictation",
          audioUrl: "",
          videoUrl: "",
          transcriptText:
            "माननीय अध्यक्ष महोदय, मैं इस विधेयक का समर्थन करने के लिए खड़ा हुआ हूँ। देश में जिस प्रकार की परिस्थितियाँ बन रही हैं, उनमें इस प्रकार के कानून की अत्यंत आवश्यकता थी। हमारे समाज में विकास के साथ-साथ कई नई चुनौतियाँ भी उत्पन्न हुई हैं...",
          targetWpm: 80,
          language: "Hindi",
          wordCount: 391,
          durationMinutes: 35,
        });
      }
    } catch (err) {
      console.warn("Passage load error:", err);
      setPassage((prev: any) => prev || {
        _id: targetId,
        title: "Steno Practice Dictation",
        audioUrl: "",
        transcriptText:
          "माननीय अध्यक्ष महोदय, मैं इस विधेयक का समर्थन करने के लिए खड़ा हुआ हूँ। देश में जिस प्रकार की परिस्थितियाँ बन रही हैं, उनमें इस प्रकार के कानून की अत्यंत आवश्यकता थी।",
        targetWpm: 80,
        language: "Hindi",
        wordCount: 350,
        durationMinutes: 35,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTranscriptionClicked = () => {
    if (accessState && !accessState.hasAccess && accessState.trialExpired) {
      toast.error(
        "आपका 7-दिन का फ़्री ट्रायल समाप्त हो चुका है। आगे अभ्यास के लिए कृपया सब्सक्राइब करें।"
      );
      router.push("/student/steno/subscribe");
      return;
    }
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (config: StenoSessionConfig) => {
    setSessionConfig(config);
    setIsConfigModalOpen(false);
    setStartEngine(true);
    toast.success("Transcription session configured!");
  };

  const handleComplete = async (evaluationResult: any) => {
    const toastId = toast.loading("Submitting evaluation attempt...");
    try {
      const submitRes = await submitStenoResultAction({
        passageId: passage?._id || passageId,
        typedTranscription: evaluationResult.userTranscription || "",
        speedWpm: evaluationResult.netWpm || 0,
        accuracy: evaluationResult.accuracy || 0,
        fullErrors:
          (evaluationResult.spellingErrors || 0) +
          (evaluationResult.addedWords || 0) +
          (evaluationResult.skippedWords || 0),
        halfErrors:
          (evaluationResult.matraErrors || 0) + (evaluationResult.punctuationErrors || 0),
        totalErrors: evaluationResult.totalErrors || 0,
        score: evaluationResult.finalScore || 0,
        status: evaluationResult.status || "Evaluated",
        timeSpentSeconds: evaluationResult.timeSpentSeconds || 60,
        fontUsed: sessionConfig?.selectedFont || "Mangal",
      });

      toast.dismiss(toastId);
      if (submitRes.success && submitRes.resultId) {
        toast.success("Attempt saved successfully!");
        router.push(`/student/steno/result/${submitRes.resultId}`);
      } else {
        toast.error(submitRes.error || "Failed to submit attempt");
      }
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error(e.message || "Failed to submit attempt");
    }
  };

  // Safe navigation back to Series (Step 4) or Batches
  const handleBack = () => {
    const seriesId = passage?.seriesId?._id
      ? passage.seriesId._id.toString()
      : passage?.seriesId
      ? passage.seriesId.toString()
      : null;

    if (seriesId) {
      router.replace(
        `/student/steno/series/${seriesId}${queryBatch ? `?batch=${encodeURIComponent(queryBatch)}` : ""}${
          queryExam ? `&exam=${encodeURIComponent(queryExam)}` : ""
        }`
      );
    } else if (queryBatch) {
      router.replace(
        `/student/steno/series/batch/${encodeURIComponent(queryBatch)}${
          queryExam ? `?exam=${encodeURIComponent(queryExam)}` : ""
        }`
      );
    } else {
      router.replace("/student/steno/series");
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

  // If trial has expired and student does not have active subscription
  if (accessState && !accessState.hasAccess && accessState.trialExpired) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 px-4 text-center">
        <Card className="p-8 sm:p-10 rounded-3xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-black text-xs uppercase px-3 py-1">
              7-Day Free Trial Expired
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              स्टेनो डिक्टेशन एक्सेस लॉक है
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              आपका 7 दिनों का निःशुल्क स्टेनो ट्रायल समाप्त हो चुका है। असीमित ऑडियो डिक्टेशन, रियल-टाइम ट्रांसक्रिप्शन टेस्ट, और विस्तृत मूल्यांकन जारी रखने के लिए कृपया अपनी पसंद का प्लान चुनें।
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-left">
            <div>
              <p className="text-xs font-bold text-slate-500">Super Affordable Plans</p>
              <p className="text-sm font-black text-slate-900">1 Month, 3 Months & 6 Months Plans</p>
            </div>
            <Link href="/student/steno/subscribe">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md gap-1">
                <Sparkles className="w-3.5 h-3.5" /> प्लान्स देखें <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-xl font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> वापस जाएं
            </Button>
            <Link href="/student/steno/subscribe" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs rounded-xl shadow-lg gap-2 h-11 px-6">
                अभी सब्सक्राइब करें (Unlock All) <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // If student configured session and clicked Start Transcription, show Exam Workspace
  if (startEngine) {
    const presetRulesObj = sessionConfig
      ? {
          spellingErrorWeight:
            sessionConfig.spellingMistake === "Full"
              ? 1.0
              : sessionConfig.spellingMistake === "Half"
              ? 0.5
              : 0.0,
          matraErrorWeight:
            sessionConfig.capitalizationMistake === "Full"
              ? 1.0
              : sessionConfig.capitalizationMistake === "Half"
              ? 0.5
              : 0.0,
          punctuationErrorWeight:
            sessionConfig.punctuationMistake === "Full"
              ? 1.0
              : sessionConfig.punctuationMistake === "Half"
              ? 0.5
              : 0.0,
          addedWordWeight:
            sessionConfig.addedWordMistake === "Full"
              ? 1.0
              : sessionConfig.addedWordMistake === "Half"
              ? 0.5
              : 0.0,
          skippedWordWeight:
            sessionConfig.skippedWordMistake === "Full"
              ? 1.0
              : sessionConfig.skippedWordMistake === "Half"
              ? 0.5
              : 0.0,
        }
      : undefined;

    return (
      <div className="space-y-6 p-1 sm:p-2">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-3 py-1 rounded-md">
            Exam Preset: {sessionConfig?.examPresetName || "Manual"} • Font:{" "}
            {sessionConfig?.selectedFont}
          </span>
          <Button
            onClick={() => setStartEngine(false)}
            variant="outline"
            size="sm"
            className="rounded-xl h-8 text-xs font-bold gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Player
          </Button>
        </div>

        <StenoEngineModule
          passage={passage}
          presetRules={presetRulesObj}
          initialFont={sessionConfig?.selectedFont}
          typingMode={sessionConfig?.typingMode}
          initialDurationMinutes={sessionConfig?.durationMinutes}
          presetName={
            sessionConfig?.mode === "exam" ? sessionConfig.examPresetName : "Manual Setup"
          }
          backspaceStatus={sessionConfig?.backspaceStatus}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Dictation Player & Instructions View
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 sm:p-2">
      {/* 7-Day Free Trial Notice Banner */}
      {accessState?.isTrialActive && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-500/10 border border-amber-300/60 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <p className="font-bold text-amber-950">
              🎉 <span className="font-black">फ़्री 7-दिन ट्रायल सक्रिय:</span> आपके पास अभी{" "}
              <span className="underline decoration-amber-500 font-black">
                {accessState.daysLeftInTrial} दिन
              </span>{" "}
              का फ्री एक्सेस शेष है।
            </p>
          </div>
          <Link href="/student/steno/subscribe" className="flex-shrink-0 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto h-7 text-[11px] font-black border-amber-400 text-amber-900 bg-white/90 hover:bg-white rounded-lg shadow-2xs gap-1"
            >
              सब्सक्रिप्शन प्लान्स <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
            {queryBatch ? `${queryBatch} Batch` : "Dictation Test"}
          </span>
          <h1 className="text-xl font-black text-slate-900">{passage?.title || "Test - 1"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleBack}
            className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold h-9 px-4 text-xs rounded-xl gap-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />{" "}
            {passage?.seriesId
              ? "Back to Passages (Step 4)"
              : queryBatch
              ? `Back to ${queryBatch} (Step 3)`
              : "Back to Batches"}
          </Button>
        </div>
      </div>

      {/* Main Dictation Player Component */}
      <StenoDictationPlayer
        passage={passage}
        onStartTranscription={handleStartTranscriptionClicked}
      />

      {/* Instructions Box */}
      <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-100 space-y-3">
        <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" /> Instructions (निर्देश)
        </h4>
        <ol className="text-xs text-slate-700 font-medium space-y-2 pl-2">
          <li>
            1. पहले <strong className="text-indigo-900 font-bold">Play Dictation</strong> पर क्लिक करें और 3 सेकंड तक प्रतीक्षा करें। 3 सेकंड का काउंटडाउन पूरा होने के बाद Dictation Play हो जाएगा।
          </li>
          <li>
            2. यदि <strong className="text-indigo-900 font-bold">Dictation Play</strong> नहीं हो रहा है, तो स्क्रीन पर दिए गए वीडियो प्लेयर पर सीधे टैप करें अथवा वॉइस मोड (TTS) का उपयोग करें।
          </li>
          <li>
            3. डिक्टेशन सुनने के बाद <strong className="text-indigo-900 font-bold">START TRANSCRIPTION</strong> बटन दबाएं और परीक्षा इंटरफ़ेस में टाइपिंग शुरू करें।
          </li>
          <li>
            4. किसी भी तकनीकी सहायता के लिए संपर्क करें:{" "}
            <strong className="text-indigo-900 font-bold">+91 80049 58441</strong>
          </li>
        </ol>
        <div className="pt-2 border-t border-indigo-100 text-[11px] font-bold text-slate-500">
          सॉफ्टवेयर वर्जन (नवीनतम अपडेट): v2.2.0 — यदि यह न दिखे, तो{" "}
          <strong className="text-indigo-900">'Ctrl + F5'</strong> दबाकर पेज रीफ्रेश करें।
        </div>
      </div>

      {/* Session Configuration Modal */}
      {passage && (
        <StenoSessionConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleSaveConfig}
          totalWords={passage.wordCount || 391}
          typingMode={
            passage.typingMode ||
            (passage.language === "English" ? "english" : "unicode_hindi")
          }
          defaultExam={passage?.examType || "UPSSSC Steno"}
          defaultDurationMinutes={
            passage.durationMinutes ||
            (passage.durationSeconds ? Math.round(passage.durationSeconds / 60) : 35)
          }
        />
      )}
    </div>
  );
}

export default function StudentStenoPassagePage() {
  const params = useParams();
  const passageId = (params?.id as string) || "";

  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            Loading Dictation Player...
          </p>
        </div>
      }
    >
      <PassagePlayerContent passageId={passageId} />
    </Suspense>
  );
}
