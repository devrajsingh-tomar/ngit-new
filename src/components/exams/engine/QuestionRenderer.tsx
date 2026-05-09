"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { QuestionRendererProps } from "./types";
import { Button } from "@/components/ui/button";

interface Props extends QuestionRendererProps {
  onSave: () => void;
  onReset: () => void;
  onMark?: () => void;
  isLastQuestion?: boolean;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  onSave,
  onReset,
  onMark,
  isLastQuestion
}: Props) {
  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
          <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
              <Image 
                src="/watermark.png" 
                alt="Watermark" 
                fill 
                className="object-contain grayscale"
              />
          </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 p-4 md:p-10">
        {(!question.content.hi || question.content.hi === question.content.en) ? (
            /* Single Column Layout */
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
                <div className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                    <div dangerouslySetInnerHTML={{ __html: question.content.en }} />
                </div>
                <div className="space-y-3 md:space-y-5">
                    {question.options?.map((opt: any, i: number) => (
                        <div key={i} className="text-base md:text-xl font-bold text-slate-700 flex gap-3 md:gap-4 bg-slate-50/80 p-4 md:p-6 rounded-2xl border border-slate-200/50">
                            <span className="text-primary">({String.fromCharCode(65 + i)})</span>
                            <div dangerouslySetInnerHTML={{ __html: opt.text.en || opt.text.hi || "" }} />
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            /* Dual Column Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                {/* Hindi Side */}
                <div className="space-y-4 md:space-y-8">
                    <div className="text-lg md:text-2xl font-black text-slate-900 leading-tight bg-slate-50/50 p-4 md:p-6 rounded-3xl border border-slate-100">
                        <div dangerouslySetInnerHTML={{ __html: question.content.hi }} />
                    </div>
                    <div className="space-y-2 md:space-y-4">
                        {question.options?.map((opt: any, i: number) => (
                            <div key={i} className="text-sm md:text-lg font-bold text-slate-700 flex gap-3 p-3 md:p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className="text-primary/40">({String.fromCharCode(65 + i)})</span>
                                <div dangerouslySetInnerHTML={{ __html: opt.text.hi || "" }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* English Side */}
                <div className="space-y-4 md:space-y-8 lg:border-l lg:border-slate-100 lg:pl-10">
                    <div className="text-lg md:text-2xl font-black text-slate-900 leading-tight bg-slate-50/50 p-4 md:p-6 rounded-3xl border border-slate-100">
                        <div dangerouslySetInnerHTML={{ __html: question.content.en }} />
                    </div>
                    <div className="space-y-2 md:space-y-4">
                        {question.options?.map((opt: any, i: number) => (
                            <div key={i} className="text-sm md:text-lg font-bold text-slate-700 flex gap-3 p-3 md:p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className="text-primary/40">({String.fromCharCode(65 + i)})</span>
                                <div dangerouslySetInnerHTML={{ __html: opt.text.en || "" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Answer Selection & Footer Buttons */}
      <div className="mt-auto border-t-2 border-slate-400 bg-white p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6 relative z-20 shrink-0">
        <div className="flex items-center justify-center gap-6 md:gap-12 w-full max-w-2xl">
          {["A", "B", "C", "D"].map((choice) => (
            <label key={choice} className="flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="answer"
                  className="peer hidden"
                  checked={value === choice}
                  onChange={() => onChange(choice)}
                />
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-300 peer-checked:border-[#3B82F6] peer-checked:bg-[#3B82F6] transition-all flex items-center justify-center shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                </div>
              <span className="text-xs md:text-lg font-black text-slate-500 peer-checked:text-[#3B82F6]">({choice})</span>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline"
                    onClick={onMark}
                    className="h-10 md:h-12 px-3 md:px-8 border-2 border-slate-400 rounded-lg text-slate-700 font-bold text-[10px] md:text-sm uppercase tracking-wider"
                >
                    Mark & Next
                </Button>
                <Button 
                    variant="outline"
                    onClick={onReset}
                    className="h-10 md:h-12 px-3 md:px-8 border-2 border-slate-400 rounded-lg text-slate-700 font-bold text-[10px] md:text-sm uppercase tracking-wider"
                >
                    Clear
                </Button>
            </div>
            
            <Button 
                onClick={onSave}
                className={cn(
                  "h-10 md:h-12 px-6 md:px-12 rounded-lg text-white font-bold text-[11px] md:text-base uppercase tracking-widest shadow-md transition-all",
                  isLastQuestion 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                    : "bg-[#3B82F6] hover:bg-blue-600 shadow-blue-500/20"
                )}
            >
                {isLastQuestion ? "Submit Exam" : "Save & Next"}
            </Button>
        </div>
      </div>
    </div>
  );
}
