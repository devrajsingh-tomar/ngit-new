"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStenoStore } from "@/store/useStenoStore";
import { evaluateStenoTranscriptionDetailed, DetailedStenoEvaluationResult } from "./utils/stenoCalculations";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
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
  const [fontFamily, setFontFamily] = useState(initialFont || settings.fontFamily || "Kruti Dev 010");
  const [fluctuationEnabled, setFluctuationEnabled] = useState(false);
  const [transcriptionUnlocked, setTranscriptionUnlocked] = useState(false);
  const [evaluation, setEvaluation] = useState<DetailedStenoEvaluationResult | null>(null);

  // Available speeds from passage config or defaults
  const availableSpeeds = passage.availableSpeeds || [40, 50, 60, 70, 80, 90, 100, 110, 120];

  useEffect(() => {
    if (initialFont) setFontFamily(initialFont);
  }, [initialFont]);

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
    // Convert WPM to HTML5 playbackRate multiplier relative to target WPM
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

    if (onComplete) {
      onComplete(res);
    }
    toast.success("Steno Transcription Evaluated Successfully!");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30">
            {passage.language || "Hindi"} Stenography • Target: {passage.targetWpm || 80} WPM
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2 leading-tight">{passage.title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Listen to the HTML5 audio/video dictation and type your shorthand transcription below.
          </p>
        </div>

        {/* Start Transcription Workflow Gate */}
        {!transcriptionUnlocked && (
          <Button
            onClick={() => setTranscriptionUnlocked(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 rounded-2xl shadow-lg"
          >
            Unlock & Start Transcription
          </Button>
        )}
      </div>

      {/* HTML5 Media Player Card (Step 11) */}
      <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" /> Dictation Media Player
          </span>
          <span className="text-xs font-bold text-slate-500">
            Target Speed: <strong className="text-indigo-600">{passage.targetWpm || 80} WPM</strong>
          </span>
        </div>

        {passage.videoUrl ? (
          <video
            ref={mediaRef as any}
            src={passage.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full max-h-72 rounded-2xl bg-black"
          />
        ) : (
          <audio
            ref={mediaRef as any}
            src={passage.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Player Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={togglePlayMedia}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-12 w-12 flex items-center justify-center p-0 shrink-0 shadow-md"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </Button>

          {/* Progress Bar & Time */}
          <div className="flex-1 w-full space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>Current Time: {formatTime(currentTime)}</span>
              <span>Total Duration: {formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Available Speed Selector & Fluctuation Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" /> Speeds (WPM):
            </span>
            <div className="flex flex-wrap gap-1">
              {availableSpeeds.map((wpm) => (
                <button
                  key={wpm}
                  onClick={() => handleSpeedChange(wpm)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {wpm} WPM
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={fluctuationEnabled}
              onChange={(e) => setFluctuationEnabled(e.target.checked)}
              className="rounded text-indigo-600"
            />
            Simulate Speed Fluctuation
          </label>
        </div>
      </Card>

      {/* Scoped Hindi Font & Editor Toolbar (Step 14) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Type className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">Scoped Steno Font:</span>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              updateSettings({ fontFamily: e.target.value });
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="Kruti Dev 010">Kruti Dev 010 (Remington)</option>
            <option value="Mangal">Mangal Unicode</option>
            <option value="Mangal Remington GAIL">Mangal Remington GAIL</option>
            <option value="Mangal Inscript">Mangal Inscript</option>
            <option value="Arial">Standard English (Arial)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={resetStenoSession}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold rounded-xl border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Workspace
          </Button>
          <Button
            onClick={handleSubmitTranscription}
            size="sm"
            disabled={!transcriptionUnlocked}
            className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Evaluate Transcription
          </Button>
        </div>
      </div>

      {/* Main Workspace Textarea */}
      <Card className="p-4 sm:p-6 rounded-3xl border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" /> Steno Transcription Output Workspace
          </span>
          <span className="text-xs font-bold text-slate-400">
            Typed Words: {userTranscription.trim().split(/\s+/).filter(Boolean).length}
          </span>
        </div>

        <textarea
          value={userTranscription}
          onChange={(e) => setUserTranscription(e.target.value)}
          disabled={!transcriptionUnlocked}
          placeholder={
            transcriptionUnlocked
              ? "Start typing your shorthand transcription here..."
              : "Click 'Unlock & Start Transcription' or play the dictation above to begin typing..."
          }
          rows={12}
          style={{ fontFamily }}
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 leading-relaxed resize-y disabled:opacity-60"
        />
      </Card>

      {/* Comprehensive Evaluation Breakdown Card (Step 12 & Step 13) */}
      {isFinished && evaluation && (
        <Card className="p-6 rounded-3xl border-indigo-100 bg-white shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Detailed Steno Evaluation Report</h3>
                <p className="text-xs text-slate-500 font-medium">Official Preset Marking Rules Evaluation</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                evaluation.status === "Passed"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              {evaluation.status}
            </span>
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gross WPM</p>
              <h4 className="text-2xl font-black text-indigo-600 mt-1">{evaluation.grossWpm} WPM</h4>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net WPM</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">{evaluation.netWpm} WPM</h4>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</p>
              <h4 className="text-2xl font-black text-purple-600 mt-1">{evaluation.accuracy}%</h4>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Score</p>
              <h4 className="text-2xl font-black text-amber-500 mt-1">{evaluation.finalScore} / 100</h4>
            </div>
          </div>

          {/* Detailed Error Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center border-t pt-4">
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Total Words</p>
              <p className="text-sm font-black text-slate-800">{evaluation.totalWords}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Correct</p>
              <p className="text-sm font-black text-emerald-600">{evaluation.correctWords}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Wrong</p>
              <p className="text-sm font-black text-rose-600">{evaluation.wrongWords}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Added Words</p>
              <p className="text-sm font-black text-amber-600">{evaluation.addedWords}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Skipped Words</p>
              <p className="text-sm font-black text-purple-600">{evaluation.skippedWords}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Punctuation</p>
              <p className="text-sm font-black text-indigo-600">{evaluation.punctuationErrors}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border">
              <p className="text-[9px] font-black uppercase text-slate-400">Total Errors</p>
              <p className="text-sm font-black text-rose-600">{evaluation.totalErrors}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
