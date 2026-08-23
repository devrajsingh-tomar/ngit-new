"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StenoErrorComparisonView } from "./StenoErrorComparisonView";
import {
  Trophy,
  RotateCcw,
  ArrowLeft,
  Eye,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";

interface StenoResultViewProps {
  result: {
    _id: string;
    passageId?: any;
    examId?: any;
    typedTranscription: string;
    grossWpm?: number;
    netWpm?: number;
    speedWpm: number;
    accuracy: number;
    totalWords?: number;
    correctWords?: number;
    wrongWords?: number;
    addedWords?: number;
    skippedWords?: number;
    spellingErrors?: number;
    matraErrors?: number;
    punctuationErrors?: number;
    totalErrors: number;
    errorPercentage?: number;
    score: number;
    targetWpm?: number;
    status: "Passed" | "Failed" | "Evaluated";
    timeSpentSeconds: number;
    wordBreakdown?: any[];
    createdAt: string;
  };
}

export const StenoResultView: React.FC<StenoResultViewProps> = ({ result }) => {
  const [showDetailedErrors, setShowDetailedErrors] = useState(true);

  const testName = result.passageId?.title || result.examId?.name || "Steno Dictation Test";
  const targetWpm = result.targetWpm || result.passageId?.targetWpm || 80;
  const speedDiff = (result.netWpm || result.speedWpm) - targetWpm;

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              result.status === "Passed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
            }`}
          >
            {result.status}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">{testName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Attempted on: {new Date(result.createdAt).toLocaleString("en-IN")} • Time Taken:{" "}
            {formatSeconds(result.timeSpentSeconds || 300)}
          </p>
        </div>

        {/* Top Action CTAs */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link href={result.passageId?._id ? `/steno/passage/${result.passageId._id}` : "/steno/dictation"}>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-5 text-xs rounded-xl shadow-md gap-1.5">
              <RotateCcw className="w-4 h-4" /> Retry Test
            </Button>
          </Link>
          <Link href="/steno/practice">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold h-11 px-5 text-xs rounded-xl gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Practice
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid (Step 16) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Speed</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{result.grossWpm || result.speedWpm} WPM</h3>
        </Card>

        <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Speed</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{result.netWpm || result.speedWpm} WPM</h3>
        </Card>

        <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{result.accuracy}%</h3>
        </Card>

        <Card className="p-5 rounded-2xl border-slate-200 bg-white text-center shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Score</p>
          <h3 className="text-2xl font-black text-amber-500 mt-1">{result.score} / 100</h3>
        </Card>
      </div>

      {/* Secondary Metrics & Target WPM Difference Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
        <div className="bg-white border p-3 rounded-2xl">
          <p className="text-[9px] font-black uppercase text-slate-400">Target WPM</p>
          <p className="text-sm font-black text-slate-800">{targetWpm} WPM</p>
        </div>
        <div className="bg-white border p-3 rounded-2xl">
          <p className="text-[9px] font-black uppercase text-slate-400">Target Diff</p>
          <p className={`text-sm font-black ${speedDiff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {speedDiff >= 0 ? `+${speedDiff}` : speedDiff} WPM
          </p>
        </div>
        <div className="bg-white border p-3 rounded-2xl">
          <p className="text-[9px] font-black uppercase text-slate-400">Total Words</p>
          <p className="text-sm font-black text-slate-800">{result.totalWords || 0}</p>
        </div>
        <div className="bg-white border p-3 rounded-2xl">
          <p className="text-[9px] font-black uppercase text-slate-400">Correct Words</p>
          <p className="text-sm font-black text-emerald-600">{result.correctWords || 0}</p>
        </div>
        <div className="bg-white border p-3 rounded-2xl">
          <p className="text-[9px] font-black uppercase text-slate-400">Total Errors</p>
          <p className="text-sm font-black text-rose-600">{result.totalErrors}</p>
        </div>
        <div className="bg-white border p-3 rounded-2xl">
          <p className="text-[9px] font-black uppercase text-slate-400">Error %</p>
          <p className="text-sm font-black text-amber-600">{result.errorPercentage || 0}%</p>
        </div>
      </div>

      {/* Detailed Error Type Breakdown Grid */}
      <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Error Breakdown By Type
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-rose-500">Spelling Errors</p>
            <p className="text-lg font-black text-rose-700">{result.spellingErrors || 0}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-amber-500">Matra Errors</p>
            <p className="text-lg font-black text-amber-700">{result.matraErrors || 0}</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-purple-500">Punctuation</p>
            <p className="text-lg font-black text-purple-700">{result.punctuationErrors || 0}</p>
          </div>
          <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-cyan-500">Added Words</p>
            <p className="text-lg font-black text-cyan-700">{result.addedWords || 0}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
            <p className="text-[9px] font-black uppercase text-indigo-500">Skipped Words</p>
            <p className="text-lg font-black text-indigo-700">{result.skippedWords || 0}</p>
          </div>
        </div>
      </Card>

      {/* Toggle View Detailed Errors (Step 17) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowDetailedErrors(!showDetailedErrors)}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1.5"
          >
            <Eye className="w-4 h-4" /> {showDetailedErrors ? "Hide Detailed Errors" : "View Detailed Errors"}
          </Button>
        </div>

        {showDetailedErrors && (
          <StenoErrorComparisonView
            originalText={result.passageId?.transcriptText}
            typedText={result.typedTranscription}
            wordBreakdown={result.wordBreakdown}
          />
        )}
      </div>
    </div>
  );
};
