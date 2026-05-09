"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User, Clock, CheckCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHeaderFooterData } from "@/app/actions/layoutContent";

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
  userImage?: string;
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
  logo: initialLogo,
  userImage
}: Props) {
  const [instituteLogo, setInstituteLogo] = useState<string | null>(null);

  useEffect(() => {
    getHeaderFooterData().then(res => {
      if (res.success && res.header.logoImage) {
        setInstituteLogo(res.header.logoImage);
      }
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white border-b-2 border-slate-400 select-none shrink-0">
      {/* Top Bar - Branding & User */}
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Institute Logo */}
            <div className="relative w-10 h-10 md:w-16 md:h-16 shrink-0">
              {instituteLogo ? (
                <Image src={instituteLogo} alt="Institute Logo" fill className="object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                  <Image src="/logo.png" alt="Default Logo" width={48} height={48} className="opacity-50" />
                </div>
              )}
            </div>

            {/* Exam Specific Logo */}
            {initialLogo && (
              <div className="flex items-center gap-3">
                <div className="w-px h-10 md:h-12 bg-slate-200" />
                <div className="relative w-10 h-10 md:w-16 md:h-16 shrink-0">
                  <Image src={initialLogo} alt="Exam Logo" fill className="object-contain" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-sm md:text-xl font-black text-slate-900 uppercase tracking-tight leading-none truncate">
              {examName}
            </h1>
            <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Examination Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Candidate</p>
            <p className="text-xs md:text-sm font-bold text-slate-900 leading-none">{userName}</p>
          </div>
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center overflow-hidden relative shadow-sm">
             {userImage ? (
                <Image src={userImage} alt="Candidate" fill className="object-cover" />
             ) : (
                <User className="w-6 h-6 md:w-10 md:h-10 text-slate-300" />
             )}
          </div>
        </div>
      </div>

      {/* Info Bar - Stats & Timer */}
      <div className="bg-[#1e293b] text-white px-4 py-2 flex items-center justify-between text-[10px] md:text-xs font-bold border-y border-slate-700">
        <div className="flex items-center gap-4 md:gap-10">
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                <span className="text-slate-400 uppercase tracking-wider text-[9px] md:text-[10px]">Question No:</span>
                <span className="text-white bg-slate-800 px-2 py-0.5 rounded text-sm">{currentQuestionNumber} of {totalQuestions}</span>
            </div>
            <div className="hidden md:flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-slate-400 uppercase tracking-wider">Max Marks:</span>
                <span className="text-emerald-400">{totalMarks}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                <span className="text-slate-400 uppercase tracking-wider text-[9px] md:text-[10px]">Exam Language:</span>
                <span className="text-blue-400 uppercase">{language}</span>
            </div>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
            <div className="hidden lg:flex flex-col items-end gap-0.5">
                <span className="text-slate-400 uppercase text-[9px]">Candidate ID:</span>
                <span className="text-white font-black tracking-wider">{loginId}</span>
            </div>
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm font-black text-base md:text-xl",
                timeLeft < 300 
                  ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-600/20" 
                  : "bg-slate-800 text-emerald-400 border border-slate-700"
            )}>
                <Clock className={cn("w-4 h-4 md:w-6 md:h-6", timeLeft < 300 ? "text-white" : "text-emerald-500")} />
                <span className="tabular-nums tracking-tight">
                  <span className="text-[10px] text-slate-400 mr-2 font-bold uppercase hidden md:inline">Time Left:</span>
                  {formatTime(timeLeft)}
                </span>
            </div>
        </div>
      </div>
    </header>
  );
}
