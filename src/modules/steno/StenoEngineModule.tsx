"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStenoStore } from "@/store/useStenoStore";
import { evaluateStenoTranscriptionDetailed, DetailedStenoEvaluationResult } from "./utils/stenoCalculations";
import { handleHindiTextareaKeyDown, KRUTI_DEV_ALT_CODES, STENO_TYPING_MODES, resolveStenoTypingMode, StenoTypingModeType } from "./utils/hindiKeystrokeMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Type,
  CheckCircle2,
  Award,
  FileText,
  Clock,
  Gauge,
  SlidersHorizontal,
  LogOut,
  ArrowLeft,
  Eye,
  Minus,
  Plus,
  Edit3,
  UserCheck,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Lock,
  Keyboard,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface StenoEngineModuleProps {
  passage: {
    _id?: string;
    title: string;
    audioUrl?: string;
    videoUrl?: string;
    transcriptText: string;
    targetWpm?: number;
    language?: "Hindi" | "English" | string;
    availableSpeeds?: number[];
  };
  presetRules?: {
    spellingErrorWeight?: number;
    matraErrorWeight?: number;
    punctuationErrorWeight?: number;
    addedWordWeight?: number;
    skippedWordWeight?: number;
    maxAllowedErrorPercent?: number;
  };
  initialFont?: string;
  typingMode?: StenoTypingModeType | string;
  initialDurationMinutes?: number;
  presetName?: string;
  backspaceStatus?: "Enabled" | "Disabled" | string;
  onComplete?: (result: any) => void;
}

export const StenoEngineModule: React.FC<StenoEngineModuleProps> = ({
  passage,
  presetRules,
  initialFont,
  typingMode,
  initialDurationMinutes,
  presetName,
  backspaceStatus,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { data: session } = useSession();
  const {
    userTranscription,
    setUserTranscription,
    settings,
    setAudioSpeed,
    updateSettings,
    isFinished,
    finishStenoSession,
    resetStenoSession,
  } = useStenoStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Full Screen Exam Mode State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAltModal, setShowAltModal] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Backspace Permission State
  const [backspaceAllowed, setBackspaceAllowed] = useState(backspaceStatus !== "Disabled");

  useEffect(() => {
    if (backspaceStatus) {
      setBackspaceAllowed(backspaceStatus !== "Disabled");
    }
  }, [backspaceStatus]);

  // Canonical Typing Mode & Appearance Controls
  const [currentModeType, setCurrentModeType] = useState<StenoTypingModeType>(() => {
    return resolveStenoTypingMode(typingMode || initialFont || settings.fontFamily).type;
  });

  const activeModeConfig = resolveStenoTypingMode(currentModeType);

  const [fontSize, setFontSize] = useState(16); // 14px to 24px
  const [eyeCareBg, setEyeCareBg] = useState("#ffffff"); // Swatches: White, Mint, Blue, Peach, Sepia

  useEffect(() => {
    if (typingMode || initialFont) {
      setCurrentModeType(resolveStenoTypingMode(typingMode || initialFont).type);
    }
  }, [typingMode, initialFont]);


  const [fluctuationEnabled, setFluctuationEnabled] = useState(false);
  const [transcriptionUnlocked, setTranscriptionUnlocked] = useState(false);
  const [evaluation, setEvaluation] = useState<DetailedStenoEvaluationResult | null>(null);

  // Timer & Pause State
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState((initialDurationMinutes || 35) * 60);

  // Memoized typed word count
  const typedWordsCount = React.useMemo(() => {
    return (userTranscription || "").trim() ? (userTranscription || "").trim().split(/\s+/).filter(Boolean).length : 0;
  }, [userTranscription]);

  // Helper to insert Alt-Code or character directly into textarea
  const handleInsertAltChar = (char: string) => {

    if (!textareaRef.current) {
      setUserTranscription(userTranscription + char);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const before = userTranscription.substring(0, start);
    const after = userTranscription.substring(end);
    const newText = before + char + after;
    setUserTranscription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
    toast.success(`Inserted "${char}"`);
  };


  // Available speeds from passage config or defaults
  const availableSpeeds = passage?.availableSpeeds || [40, 50, 60, 70, 80, 90, 100, 110, 120];

  // Handle Fullscreen toggle

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const checkCapsLock = (e: any) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    checkCapsLock(e);
    if (e.key === "Backspace" && !backspaceAllowed) {
      e.preventDefault();
      toast.error("Backspace is disabled for this examination!", { id: "backspace-disabled" });
      return;
    }
    handleHindiTextareaKeyDown(e, activeModeConfig.type, userTranscription, setUserTranscription);
  };

  useEffect(() => {
    if (isPaused || isFinished) return;
    const timer = setInterval(() => {
      setRemainingTimeSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTranscription();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isFinished]);

  const handleSubmitTranscription = () => {
    if (!userTranscription.trim()) {
      toast.error("Please type your transcription before submitting!");
      return;
    }
    finishStenoSession();

    const totalAllocatedSeconds = (initialDurationMinutes || 35) * 60;
    const elapsedSeconds = Math.max(1, totalAllocatedSeconds - remainingTimeSeconds);
    const timeMin = Math.max(0.1, elapsedSeconds / 60);
    const originalText = passage?.transcriptText || (passage as any)?.text || "माननीय अध्यक्ष महोदय, मैं इस विधेयक का समर्थन करने के लिए खड़ा हुआ हूँ।";
    const evalData = evaluateStenoTranscriptionDetailed(userTranscription, originalText, timeMin, presetRules);
    const res = {
      ...evalData,
      timeSpentSeconds: elapsedSeconds,
      userTranscription,
    };
    setEvaluation(evalData);

    if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (onComplete) {
      onComplete(res);
    }
    toast.success("Steno Examination Submitted & Evaluated Successfully!");
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-[#0b132b] text-slate-100 p-4 sm:p-6 overflow-y-auto space-y-4"
          : "max-w-7xl mx-auto p-2 sm:p-4 space-y-6"
      }
    >
      <div className="bg-slate-900 text-white border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase px-3.5 py-1 rounded-xl shadow-md flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> STENO EXAM MODE
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white truncate max-w-xs sm:max-w-md leading-tight">
              {passage.title}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              OFFICIAL SPEED: {passage.targetWpm || 80} WPM • {passage.language || "Hindi"} SHORTHAND
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-rose-950/80 border border-rose-500/40 px-4 py-2 rounded-2xl shadow-inner">
            <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-base font-black text-rose-300 font-mono tracking-widest">
              {formatCountdown(remainingTimeSeconds)}
            </span>
          </div>

          <Button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 text-xs rounded-xl shadow-sm gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>

          <Button
            onClick={toggleFullscreen}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold h-9 px-3.5 text-xs rounded-xl gap-1.5"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-indigo-400" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen Exam Mode"}
          </Button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md border border-white/10 overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.[0]?.toUpperCase() || "PS"
            )}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-black text-white uppercase">{session?.user?.name || "CANDIDATE"}</p>
            <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 uppercase tracking-wider">
              AUTHENTICATED CANDIDATE
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6 rounded-3xl border-slate-200 bg-white text-slate-900 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Type your transcription below:
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  Typed Words: <strong className="text-indigo-600 font-black">{typedWordsCount}</strong>
                </span>
              </div>
            </div>

            {isCapsLockOn && activeModeConfig.type === "krutidev_010" && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold animate-bounce">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                ⚠️ Warning: CAPS LOCK is ON! Kruti Dev typing gives wrong characters when Caps Lock is enabled. Please turn Caps Lock OFF.
              </div>
            )}

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <textarea
                ref={textareaRef}
                value={userTranscription}
                onChange={(e) => {
                  setUserTranscription(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={checkCapsLock}
                onClick={checkCapsLock}
                disabled={isPaused}
                placeholder="Type your official steno transcription here..."
                style={{
                  fontFamily: activeModeConfig.fontFamily,
                  fontSize: `${fontSize}px`,
                  backgroundColor: eyeCareBg,
                  lineHeight: "1.8",
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="w-full h-[460px] p-6 focus:outline-none resize-none font-medium leading-relaxed transition-all disabled:opacity-50 disabled:cursor-not-allowed selection:bg-indigo-500 selection:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Type className="w-3.5 h-3.5" /> Engine Mode: {activeModeConfig.label} ({activeModeConfig.fontFamily})
            </span>
            <span className="text-slate-400">
              Session ID: #{passage._id?.substring(passage._id.length - 6).toUpperCase() || "STENO-LIVE"}
            </span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border-slate-200 bg-white shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Exam Settings
              </h3>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Layout preset:</span>
                <span className="text-slate-900 font-extrabold truncate max-w-[120px]">
                  {presetName || "Manual Setup"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Backspace keys:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                  backspaceAllowed 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                    : "bg-rose-100 text-rose-800 border-rose-200"
                }`}>
                  {backspaceAllowed ? "ENABLED" : "DISABLED"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Typing Mode:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {activeModeConfig.label}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-black uppercase">Font Size:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-black flex items-center justify-center transition-colors"
                  >
                    A-
                  </button>
                  <span className="px-3 text-xs font-black text-indigo-600 font-mono">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize((prev) => Math.min(26, prev + 2))}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-black flex items-center justify-center transition-colors"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-black uppercase">Eye-care Filter:</span>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setEyeCareBg("#ffffff")} title="White Default" className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#ffffff" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-white`} />
                  <button onClick={() => setEyeCareBg("#e8f5e9")} title="Soft Mint" className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#e8f5e9" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#e8f5e9]`} />
                  <button onClick={() => setEyeCareBg("#e3f2fd")} title="Soft Blue" className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#e3f2fd" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#e3f2fd]`} />
                  <button onClick={() => setEyeCareBg("#fff3e0")} title="Soft Peach" className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#fff3e0" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#fff3e0]`} />
                  <button onClick={() => setEyeCareBg("#f5f5f1")} title="Sepia" className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#f5f5f1" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#f5f5f1]`} />
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2.5">
            <Button
              onClick={handleSubmitTranscription}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 text-xs rounded-2xl shadow-lg gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> SUBMIT EXAM
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={resetStenoSession}
                variant="outline"
                className="h-10 text-xs font-bold rounded-xl border-slate-200 bg-white hover:bg-slate-50 gap-1 text-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RESTART
              </Button>

              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="h-10 text-xs font-bold rounded-xl border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900 gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> BACK
              </Button>
            </div>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full h-10 text-xs font-bold rounded-xl border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-rose-700 gap-1.5"
            >
              <LogOut className="w-4 h-4" /> EXIT WORKSPACE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

