"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStenoStore } from "@/store/useStenoStore";
import { evaluateStenoTranscriptionDetailed, DetailedStenoEvaluationResult } from "./utils/stenoCalculations";
import { handleHindiTextareaKeyDown } from "./utils/hindiKeystrokeMap";
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
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface StenoEngineModuleProps {
  passage: {
    _id?: string;
    title: string;
    audioUrl: string;
    videoUrl?: string;
    transcriptText: string;
    targetWpm?: number;
    language?: "Hindi" | "English";
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
  onComplete?: (result: any) => void;
}

export const StenoEngineModule: React.FC<StenoEngineModuleProps> = ({
  passage,
  presetRules,
  initialFont,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
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

  // Editor Appearance Controls
  const [fontFamily, setFontFamily] = useState(initialFont || settings.fontFamily || "Kruti Dev 010");
  const [fontSize, setFontSize] = useState(16); // 14px to 24px
  const [eyeCareBg, setEyeCareBg] = useState("#ffffff"); // Swatches: White, Mint, Blue, Peach, Sepia

  const [fluctuationEnabled, setFluctuationEnabled] = useState(false);
  const [transcriptionUnlocked, setTranscriptionUnlocked] = useState(false);
  const [evaluation, setEvaluation] = useState<DetailedStenoEvaluationResult | null>(null);

  // Timer & Pause State
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(50 * 60);

  // Available speeds from passage config or defaults
  const availableSpeeds = passage.availableSpeeds || [40, 50, 60, 70, 80, 90, 100, 110, 120];

  useEffect(() => {
    if (initialFont) setFontFamily(initialFont);
  }, [initialFont]);

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

  // Countdown timer effect
  useEffect(() => {
    if (!transcriptionUnlocked || isPaused || isFinished) return;
    const timer = setInterval(() => {
      setRemainingTimeSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [transcriptionUnlocked, isPaused, isFinished]);

  const togglePlayMedia = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
      setTranscriptionUnlocked(true);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (wpmSpeed: number) => {
    const baseTarget = passage.targetWpm || 80;
    const rate = Math.min(2.0, Math.max(0.5, wpmSpeed / baseTarget));
    setAudioSpeed(rate);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
    }
  };

  const handleSubmitTranscription = () => {
    if (!userTranscription.trim()) {
      toast.error("Please type your transcription before submitting!");
      return;
    }
    if (mediaRef.current) {
      mediaRef.current.pause();
    }
    setIsPlaying(false);
    finishStenoSession();

    const timeMin = Math.max(0.1, (currentTime || duration || 300) / 60);
    const res = evaluateStenoTranscriptionDetailed(userTranscription, passage.transcriptText, timeMin, presetRules);
    setEvaluation(res);

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
      onContextMenu={(e) => isFullscreen && e.preventDefault()}
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-[#0b132b] text-slate-100 p-4 sm:p-6 overflow-y-auto space-y-4"
          : "max-w-7xl mx-auto p-2 sm:p-4 space-y-6"
      }
    >
      {/* Official Government Examination Top Header Bar */}
      <div className="bg-slate-900 text-white border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Exam Badge & Title */}
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

        {/* Center: Live Timer Countdown Badge & Controls */}
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

          {/* Full Screen Mode Toggle Button */}
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold h-9 px-3.5 text-xs rounded-xl gap-1.5"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-indigo-400" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen Exam Mode"}
          </Button>
        </div>

        {/* Right: Candidate Profile Details */}
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

      {/* Dictation Player Bar */}
      <Card className="p-4 rounded-3xl border-slate-200 bg-white text-slate-900 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" /> Dictation Media Engine
          </span>
          <span className="text-xs font-bold text-slate-500">
            Target Dictation Speed: <strong className="text-indigo-600 font-black">{passage.targetWpm || 80} WPM</strong>
          </span>
        </div>

        {passage.videoUrl ? (
          <video
            ref={mediaRef as any}
            src={passage.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full max-h-56 rounded-2xl bg-black"
          />
        ) : (
          <audio
            ref={mediaRef as any}
            src={passage.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={togglePlayMedia}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-10 w-10 flex items-center justify-center p-0 shrink-0 shadow-md"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </Button>

          <div className="flex-1 w-full space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
              <span>Time: {formatCountdown(currentTime)}</span>
              <span>Total: {formatCountdown(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {availableSpeeds.slice(0, 4).map((wpm) => (
              <button
                key={wpm}
                onClick={() => handleSpeedChange(wpm)}
                className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white transition-all"
              >
                {wpm} WPM
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Split Grid Exam Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Official Answer Sheet Textarea Canvas */}
        <Card className="lg:col-span-3 p-6 rounded-3xl border-slate-200 bg-white text-slate-900 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Type your transcription below:
              </span>
              <span className="text-xs font-bold text-slate-500">
                Typed Words: <strong className="text-indigo-600 font-black">{userTranscription.trim().split(/\s+/).filter(Boolean).length}</strong>
              </span>
            </div>

            {/* Main Textarea with Eye-Care Background Tint & Scalable Font Size */}
            <textarea
              value={userTranscription}
              onChange={(e) => setUserTranscription(e.target.value)}
              onKeyDown={(e) => {
                handleHindiTextareaKeyDown(e, fontFamily, userTranscription, setUserTranscription);
              }}
              placeholder="Start typing your transcribed shorthand matter here..."
              rows={isFullscreen ? 18 : 14}
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                backgroundColor: eyeCareBg,
              }}
              className="w-full p-5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium text-slate-900 leading-relaxed resize-y transition-all shadow-inner"
            />
          </div>

          {/* Bottom Status & Submit Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-slate-200">
              FONT: {fontFamily.toUpperCase()} | BACKSPACE: ENABLED
            </span>

            <Button
              onClick={handleSubmitTranscription}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 text-xs rounded-2xl shadow-lg gap-2 w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4" /> SUBMIT EXAM
            </Button>
          </div>
        </Card>

        {/* Right Column: Exam Settings & Action Panel */}
        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border-slate-200 bg-white text-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">
              EXAM SETTINGS
            </h3>

            {/* Settings Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs font-bold text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Layout preset:</span>
                <span className="text-slate-900 font-black">SSC GRADE D STENO</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Backspace keys:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-200">
                  ENABLED
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Selected Font:</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-black text-slate-900 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Mangal">MANGAL</option>
                  <option value="Kruti Dev 010">KRUTI DEV 010</option>
                  <option value="Mangal Remington GAIL">REMINGTON GAIL</option>
                  <option value="Mangal Inscript">INSCRIPT</option>
                  <option value="Arial">ARIAL</option>
                </select>
              </div>

              {/* Font Size Scaling Controls (A- 16px A+) */}
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

              {/* Eye-Care Color Swatches */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-black uppercase">Eye-care Filter:</span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setEyeCareBg("#ffffff")}
                    title="White Default"
                    className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#ffffff" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-white`}
                  />
                  <button
                    onClick={() => setEyeCareBg("#e8f5e9")}
                    title="Soft Mint"
                    className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#e8f5e9" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#e8f5e9]`}
                  />
                  <button
                    onClick={() => setEyeCareBg("#e3f2fd")}
                    title="Soft Blue"
                    className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#e3f2fd" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#e3f2fd]`}
                  />
                  <button
                    onClick={() => setEyeCareBg("#fff3e0")}
                    title="Soft Peach"
                    className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#fff3e0" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#fff3e0]`}
                  />
                  <button
                    onClick={() => setEyeCareBg("#f5f5f1")}
                    title="Sepia"
                    className={`w-6 h-6 rounded-lg border-2 ${eyeCareBg === "#f5f5f1" ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-300"} bg-[#f5f5f1]`}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Action Control Buttons */}
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
