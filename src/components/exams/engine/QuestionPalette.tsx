"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Props {
  totalQuestions: number;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  answers: Record<string, any>;
  flagged: number[];
  questions: any[];
}

export default function QuestionPalette({
  totalQuestions,
  currentQuestionIndex,
  onQuestionSelect,
  answers,
  flagged,
  questions
}: Props) {
  return (
    <div className="w-full border-2 border-slate-400 bg-white flex flex-col h-full select-none overflow-hidden">
      {/* Exam Finished Button */}
      <div className="p-3">
        <Button className="w-full h-10 md:h-12 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-base md:text-lg shadow-sm">
            Exam Finished
        </Button>
      </div>

      {/* Question Status Section */}
      <div className="border-y-2 border-slate-400">
        <div className="bg-slate-50 py-1.5 px-4 text-center font-bold text-xs md:text-sm border-b border-slate-300">
            Question Status
        </div>
        <div className="p-0 text-[11px] md:text-[13px] font-bold">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-1.5">
                <div className="flex items-center gap-3">
                    <span>Marked</span>
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-indigo-600" />
                </div>
                <span className="w-12 text-right border-l border-slate-200 pl-2 text-indigo-600">
                    {flagged.length}
                </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-1.5">
                <div className="flex items-center gap-3">
                    <span>Attempted</span>
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-600" />
                </div>
                <span className="w-12 text-right border-l border-slate-200 pl-2 text-emerald-600">
                    {Object.keys(answers).length}
                </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-1.5">
                <div className="flex items-center gap-3">
                    <span>Not Attempted</span>
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-rose-600 rounded-sm" />
                </div>
                <span className="w-12 text-right border-l border-slate-200 pl-2 text-rose-600">
                    {totalQuestions - Object.keys(answers).length}
                </span>
            </div>
            <div className="flex items-center justify-between px-4 py-1.5">
                <div className="flex items-center gap-3">
                    <span>Current</span>
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-amber-400 rounded-sm" />
                </div>
                <span className="w-12 text-right border-l border-slate-200 pl-2">
                    {currentQuestionIndex + 1}
                </span>
            </div>
        </div>
      </div>

      {/* Choose Question Header */}
      <div className="bg-slate-50 py-1.5 px-4 text-center font-bold text-xs md:text-sm border-b border-slate-400 uppercase tracking-wider">
          Choose Question
      </div>

      {/* Grid Palette */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 p-3">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const qId = questions[idx]?._id;
            const isAnswered = !!answers[qId];
            const isActive = currentQuestionIndex === idx;
            const isFlagged = flagged.includes(idx);

            return (
              <button
                key={idx}
                onClick={() => onQuestionSelect(idx)}
                className={cn(
                  "w-full aspect-square text-[11px] md:text-xs font-black flex items-center justify-center border-2 transition-all shadow-sm",
                  isActive
                    ? "bg-amber-400 text-slate-900 border-amber-500 scale-110 z-10"
                    : isFlagged
                    ? "bg-indigo-600 text-white border-indigo-800 rounded-tr-[12px]"
                    : isAnswered
                    ? "bg-emerald-600 text-white border-emerald-800 rounded-full"
                    : "bg-rose-600 text-white border-rose-800"
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
