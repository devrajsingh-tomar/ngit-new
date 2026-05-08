"use client";

import React from "react";
import Image from "next/image";
import { User, Clock, CheckCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  examName: string;
  userName: string;
  loginId: string;
  timeLeft: number;
  language: string;
  currentQuestionNumber: number;
  totalQuestions: number;
  totalMarks: number;
  totalTime: number;
  currentMark: number;
  logo?: string;
}

export default function ExamHeader({
  examName,
  userName,
  loginId,
  timeLeft,
  language,
  currentQuestionNumber,
  totalQuestions,
  totalMarks,
  totalTime,
  currentMark,
  logo
}: Props) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white border-b-2 border-slate-400 select-none shrink-0">
      {/* Top Bar - Branding & User */}
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 md:w-14 md:h-14">
            {logo ? (
              <Image src={logo} alt="Logo" fill className="object-contain" />
            ) : (
              <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                 <Image src="/logo.png" alt="Logo" width={40} height={40} />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {examName}
            </h1>
            <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Examination Portal v2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Candidate</p>
            <p className="text-xs md:text-sm font-bold text-slate-900 leading-none">{userName}</p>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
             <User className="w-5 h-5 md:w-7 md:h-7 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Info Bar - Stats & Timer */}
      <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[10px] md:text-xs font-bold">
        <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase tracking-wider">Question:</span>
                <span className="text-amber-400">{currentQuestionNumber} / {totalQuestions}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
                <span className="text-slate-400 uppercase tracking-wider">Marks:</span>
                <span className="text-emerald-400">+{currentMark} / {totalMarks}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase tracking-wider">Lang:</span>
                <span className="text-blue-400">{language}</span>
            </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                <span className="text-slate-400 uppercase">Roll No:</span>
                <span className="text-white">{loginId}</span>
            </div>
            <div className={cn(
                "flex items-center gap-2 px-4 py-1 rounded-lg transition-colors font-black text-sm md:text-lg",
                timeLeft < 300 ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
            )}>
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="tabular-nums">{formatTime(timeLeft)}</span>
            </div>
        </div>
      </div>
    </header>
  );
}
