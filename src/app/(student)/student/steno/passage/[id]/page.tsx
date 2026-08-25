"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getStenoPassageByIdAction, submitStenoResultAction } from "@/app/actions/steno";
import { StenoEngineModule } from "@/modules/steno/StenoEngineModule";
import { StenoSessionConfigModal, StenoSessionConfig } from "@/components/steno/StenoSessionConfigModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Keyboard, Info, Volume2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import StenoDictationPlayer from "@/components/steno/StenoDictationPlayer";

export default function StudentStenoPassagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [passage, setPassage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Workspace state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<StenoSessionConfig | null>(null);
  const [startEngine, setStartEngine] = useState(false);

  useEffect(() => {
    loadPassage();
  }, [resolvedParams.id]);

  const loadPassage = async () => {
    setLoading(true);
    const res = await getStenoPassageByIdAction(resolvedParams.id);
    if (res.success && res.passage) {
      setPassage(res.passage);
    } else {
      // Fallback passage for test-1 to test-5 if ID is placeholder
      setPassage({
        _id: resolvedParams.id,
        title: "Test - 1",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        transcriptText: "माननीय अध्यक्ष महोदय, मैं इस विधेयक का समर्थन करने के लिए खड़ा हुआ हूँ। देश में जिस प्रकार की परिस्थितियाँ बन रही हैं, उनमें इस प्रकार के कानून की अत्यंत आवश्यकता थी। हमारे समाज में विकास के साथ-साथ कई नई चुनौतियाँ भी उत्पन्न हुई हैं...",
        targetWpm: 80,
        language: "Hindi",
        wordCount: 391,
      });
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
      passageId: passage?._id || resolvedParams.id,
      typedTranscription: evaluationResult.wordBreakdown.map((w: any) => w.typed).join(" "),
      speedWpm: evaluationResult.netWpm,
      accuracy: evaluationResult.accuracy,
      fullErrors: evaluationResult.spellingErrors + evaluationResult.addedWords + evaluationResult.skippedWords,
      halfErrors: evaluationResult.matraErrors + evaluationResult.punctuationErrors,
      totalErrors: evaluationResult.totalErrors,
      score: evaluationResult.finalScore,
      status: evaluationResult.status,
      timeSpentSeconds: (sessionConfig?.durationMinutes || 35) * 60,
    });

    if (submitRes.success && submitRes.resultId) {
      toast.dismiss();
      toast.success("Attempt saved successfully!");
      router.push(`/student/steno/result/${submitRes.resultId}`);
    } else {
      toast.dismiss();
      toast.error(submitRes.error || "Failed to submit attempt");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Dictation Player...
      </div>
    );
  }

  // If student configured session and clicked Start Transcription, show Final Exam Workspace
  if (startEngine) {
    const presetRulesObj = sessionConfig
      ? {
          spellingErrorWeight: sessionConfig.spellingMistake === "Full" ? 1.0 : sessionConfig.spellingMistake === "Half" ? 0.5 : 0.0,
          matraErrorWeight: sessionConfig.capitalizationMistake === "Full" ? 1.0 : sessionConfig.capitalizationMistake === "Half" ? 0.5 : 0.0,
          punctuationErrorWeight: sessionConfig.punctuationMistake === "Full" ? 1.0 : sessionConfig.punctuationMistake === "Half" ? 0.5 : 0.0,
          addedWordWeight: sessionConfig.addedWordMistake === "Full" ? 1.0 : sessionConfig.addedWordMistake === "Half" ? 0.5 : 0.0,
          skippedWordWeight: sessionConfig.skippedWordMistake === "Full" ? 1.0 : sessionConfig.skippedWordMistake === "Half" ? 0.5 : 0.0,
        }
      : undefined;

    return (
      <div className="space-y-6 p-1 sm:p-2">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-3 py-1 rounded-md">
            Exam Preset: {sessionConfig?.examPresetName || "Manual"} • Font: {sessionConfig?.selectedFont}
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
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Dictation Player & Instructions View
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 sm:p-2">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">{passage.title || "Test - 1"}</h1>
        <Button
          onClick={() => window.history.back()}
          className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold h-9 px-4 text-xs rounded-xl gap-2 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Main Dictation Player Component */}
      <StenoDictationPlayer
        passage={passage}
        onStartTranscription={() => setIsConfigModalOpen(true)}
      />

      {/* Instructions Box */}
      <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-100 space-y-3">
        <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" /> Instructions
        </h4>
        <ol className="text-xs text-slate-700 font-medium space-y-2 pl-2">
          <li>1. पहले <strong className="text-indigo-900 font-bold">Play Dictation</strong> पर क्लिक करें और 3 सेकंड तक प्रतीक्षा करें। इसके बाद Dictation Play हो जाएगा।</li>
          <li>2. यदि <strong className="text-indigo-900 font-bold">Dictation Play</strong> नहीं हो रहा है, तो आपके इंटरनेट कनेक्शन में समस्या हो सकती है। पहले अपना इंटरनेट कनेक्शन जाँचें।</li>
          <li>3. यदि फिर भी समस्या बनी रहती है, तो इस नंबर पर संपर्क करें: <strong className="text-indigo-900 font-bold">+91 80049 58441</strong></li>
        </ol>
        <div className="pt-2 border-t border-indigo-100 text-[11px] font-bold text-slate-500">
          सॉफ्टवेयर वर्जन (नवीनतम अपडेट): v1.1.3 (जुलाई 18, 2026) — यदि यह न दिखे, तो <strong className="text-indigo-900">'Ctrl + F5'</strong> दबाकर पेज रीफ्रेश करें।
        </div>
      </div>

      {/* Session Configuration Modal */}
      <StenoSessionConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
        totalWords={passage.wordCount || 391}
      />
    </div>
  );
}
