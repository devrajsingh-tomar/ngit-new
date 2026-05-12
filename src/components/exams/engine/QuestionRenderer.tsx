"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { QuestionRendererProps } from "./types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  // Standard A/R Options
  const DEFAULT_AR_OPTIONS = [
    { en: "Both A and R are true. R is the correct explanation of A." },
    { en: "Both A and R are true but R is not the correct explanation of A." },
    { en: "A is true but R is false." },
    { en: "A is false but R is true." },
    { en: "Both A and R are false." }
  ];

  // Helper to get number of options
  const displayOptions = (question.type === "ASSERTION_REASON" && (!question.options || question.options.length === 0))
    ? DEFAULT_AR_OPTIONS.map((opt, i) => ({ text: opt }))
    : (question.options || []);

  const optionCount = displayOptions.length;
  const optionLabels = Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i));

  const handleMultipleChoiceChange = (choice: string) => {
    if (question.type === "MCQ_MULTIPLE") {
      const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
      if (currentValues.includes(choice)) {
        onChange(currentValues.filter(v => v !== choice));
      } else {
        onChange([...currentValues, choice]);
      }
    } else {
      onChange(choice);
    }
  };

  const isChecked = (choice: string) => {
    if (question.type === "MCQ_MULTIPLE") {
      return Array.isArray(value) && value.includes(choice);
    }
    return value === choice;
  };

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

      {/* Question Content Area */}
      <div className={cn("flex-1 overflow-y-auto no-scrollbar relative z-10 p-4 md:p-8", question.type === "TYPING" && "overflow-hidden")}>
        <div className={cn("mx-auto space-y-8", question.type === "TYPING" ? "max-w-full h-full" : "max-w-6xl")}>
            
            {question.type === "TYPING" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[400px]">
                    {/* Left: Master Passage */}
                    <div className="flex flex-col h-full space-y-4">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-amber-600 text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">Master Passage</Badge>
                            <div className="text-sm font-bold text-slate-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: question.content.en }} />
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-amber-50 rounded-3xl border-2 border-amber-200 text-lg md:text-xl font-mono text-slate-800 leading-[1.8] shadow-inner select-none">
                            {question.shortAnswer || question.content.en}
                        </div>
                    </div>

                    {/* Right: Candidate Response Area */}
                    <div className="flex flex-col h-full space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Candidate Response Area</Label>
                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-lg text-[10px] font-black shrink-0">ACTIVE TYPING ZONE</Badge>
                        </div>
                        <textarea
                            className="flex-1 w-full rounded-3xl bg-white border-4 border-slate-200 p-6 text-lg md:text-xl font-mono focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none resize-none shadow-inner"
                            placeholder="Start typing the passage here..."
                            value={value || ""}
                            onChange={(e) => onChange(e.target.value)}
                            onPaste={(e) => e.preventDefault()}
                            onDrop={(e) => e.preventDefault()}
                            spellCheck={false}
                            autoComplete="off"
                        />
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic ml-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Cloud-synced: Your response is being saved in real-time.
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* 1. Question Text & Specialized Displays */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
                        {/* Primary Content (English or Single) */}
                        <div className="space-y-8">
                            <div className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                                <div dangerouslySetInnerHTML={{ __html: question.content.en }} />
                            </div>

                            {/* ASSERTION / REASON FOCUS */}
                            {question.type === "ASSERTION_REASON" && (
                                <div className="space-y-6">
                                    <div className="p-8 bg-indigo-50/50 rounded-[2rem] border-2 border-indigo-100 shadow-sm">
                                        <div className="space-y-2">
                                            <Badge className="bg-indigo-600 text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Assertion (A)</Badge>
                                            <div className="text-xl font-bold text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.assertion?.en || "" }} />
                                        </div>
                                        <div className="mt-6 pt-6 border-t-2 border-indigo-100/50 space-y-2">
                                            <Badge className="bg-purple-600 text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Reason (R)</Badge>
                                            <div className="text-xl font-bold text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.reason?.en || "" }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MATCH MATRIX FOCUS */}
                            {question.type === "MATCH_THE_FOLLOWING" && (
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                                     <div className="flex items-center justify-between px-4">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Column I (Items)</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Column II (Matches)</span>
                                     </div>
                                     <div className="space-y-3">
                                        {question.options?.map((opt, i) => (
                                            <div key={i} className="flex gap-4 items-stretch group">
                                                <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/50 transition-all flex items-center gap-4">
                                                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs text-white shrink-0">{i+1}</span>
                                                    <div className="text-white font-bold text-lg" dangerouslySetInnerHTML={{ __html: opt.text.en }} />
                                                </div>
                                                <div className="w-8 flex items-center justify-center">
                                                    <div className="w-full h-px bg-white/10" />
                                                </div>
                                                <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/50 transition-all flex items-center gap-4">
                                                    <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-black text-xs text-primary shrink-0">{String.fromCharCode(65 + i)}</span>
                                                    <div className="text-white font-bold text-lg" dangerouslySetInnerHTML={{ __html: opt.pair?.en || "" }} />
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center pt-2 italic">Select the correct matching sequence from the options below</p>
                                </div>
                            )}
                        </div>

                        {/* Secondary Content (Hindi) */}
                        {question.content.hi && question.content.hi !== question.content.en && (
                            <div className="space-y-8 lg:border-l-2 lg:border-slate-100 lg:pl-16">
                                <div className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                                    <div dangerouslySetInnerHTML={{ __html: question.content.hi }} />
                                </div>
                                {question.type === "ASSERTION_REASON" && (
                                    <div className="space-y-6">
                                        <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                                            <div className="space-y-2">
                                                <Badge variant="outline" className="text-slate-500 border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">कथन (Assertion)</Badge>
                                                <div className="text-xl font-bold text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.assertion?.hi || question.assertion?.en || "" }} />
                                            </div>
                                            <div className="mt-6 pt-6 border-t-2 border-slate-200/50 space-y-2">
                                                <Badge variant="outline" className="text-slate-500 border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">कारण (Reason)</Badge>
                                                <div className="text-xl font-bold text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.reason?.hi || question.reason?.en || "" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Options / Interaction Area */}
                    <div className="pt-12 border-t-2 border-slate-100">
                        
                        {/* MCQ / Matching / AssertionReason - Choice Grid */}
                        {["MCQ_SINGLE", "MCQ_MULTIPLE", "ASSERTION_REASON"].includes(question.type) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {displayOptions.map((opt: any, i: number) => {
                                    const label = String.fromCharCode(65 + i);
                                    const active = isChecked(label);
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => handleMultipleChoiceChange(label)}
                                            className={cn(
                                                "flex items-center gap-6 p-6 rounded-3xl border-4 transition-all cursor-pointer group",
                                                active 
                                                    ? "border-primary bg-blue-50/50 shadow-xl shadow-blue-500/10 scale-[1.02]" 
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:scale-[1.01]"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all",
                                                active ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                            )}>
                                                {label}
                                            </div>
                                            <div className="text-lg md:text-xl font-bold text-slate-700 leading-snug" dangerouslySetInnerHTML={{ __html: opt.text.en }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Specialized Match Matrix (Match the Following) UI */}
                        {question.type === "MATCH_THE_FOLLOWING" && (
                            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 md:p-12 shadow-sm space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Column A</h4>
                                        <div className="space-y-4">
                                            {(question.options || []).map((opt: any, i: number) => (
                                                <div key={i} className="h-20 flex items-center gap-4 bg-slate-50 px-6 rounded-2xl border-2 border-slate-100 font-bold text-slate-700">
                                                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">{i + 1}</span>
                                                    <div dangerouslySetInnerHTML={{ __html: opt.text?.en }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Column B (Select Match)</h4>
                                        <div className="space-y-4">
                                            {(question.options || []).map((opt: any, i: number) => {
                                                const currentMatches = String(value || "").split(", ").filter(Boolean);
                                                const currentMatch = currentMatches.find(m => m.startsWith(`${i+1}-`))?.split("-")[1] || "";
                                                
                                                return (
                                                    <div key={i} className="h-20 flex items-center gap-3">
                                                        <select 
                                                            className="w-full h-full bg-white border-4 border-slate-100 rounded-2xl px-6 font-black text-slate-700 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                                            value={currentMatch}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const newMapping = `${i+1}-${val}`;
                                                                const filtered = currentMatches.filter(m => !m.startsWith(`${i+1}-`));
                                                                if (val) filtered.push(newMapping);
                                                                onChange(filtered.sort().join(", "));
                                                            }}
                                                        >
                                                            <option value="">Choose Match...</option>
                                                            {(question.options || []).map((o: any, idx: number) => {
                                                                const pairText = typeof o.pair === 'object' ? o.pair.en : o.pair;
                                                                return (
                                                                    <option key={idx} value={String.fromCharCode(65 + idx)}>
                                                                        {String.fromCharCode(65 + idx)}. {pairText}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-100 flex items-center gap-3 text-slate-400 font-bold italic text-[10px]">
                                    <HelpCircle className="w-4 h-4" />
                                    Pair each item from Column A with the correct option from the dropdowns in Column B.
                                </div>
                            </div>
                        )}

                        {/* True / False Selection */}
                        {question.type === "TRUE_FALSE" && (
                            <div className="flex flex-col md:flex-row gap-8 max-w-3xl mx-auto">
                                {["True", "False"].map((choice) => {
                                    const active = value === choice;
                                    return (
                                        <button
                                            key={choice}
                                            onClick={() => onChange(choice)}
                                            className={cn(
                                                "flex-1 h-28 rounded-[2rem] text-3xl font-black transition-all border-4",
                                                active 
                                                    ? "bg-emerald-500 text-white border-emerald-600 shadow-2xl shadow-emerald-500/20 scale-[1.05]" 
                                                    : "bg-white text-slate-300 border-slate-100 hover:border-emerald-100"
                                            )}
                                        >
                                            {choice}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Input Based Response Area (Non-Typing) */}
                        {["NUMERIC", "SHORT_ANSWER", "DESCRIPTIVE"].includes(question.type) && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Candidate Response Area</Label>
                                </div>
                                {question.type === "DESCRIPTIVE" ? (
                                    <textarea
                                        className="w-full min-h-[350px] rounded-[2.5rem] bg-slate-50 border-4 border-slate-100 p-10 text-xl font-medium focus:ring-8 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                        placeholder="Type your detailed answer here..."
                                        value={value || ""}
                                        onChange={(e) => onChange(e.target.value)}
                                    />
                                ) : (
                                    <input
                                        type={question.type === "NUMERIC" ? "number" : "text"}
                                        className="w-full h-24 rounded-3xl bg-slate-50 border-4 border-slate-100 px-10 text-3xl font-black text-primary focus:ring-8 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none"
                                        placeholder={question.type === "NUMERIC" ? "0.00" : "Enter your answer text..."}
                                        value={value || ""}
                                        onChange={(e) => onChange(e.target.value)}
                                    />
                                )}
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic ml-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Cloud-synced: Your response is being saved in real-time.
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Quick Selection Hub & Action Footer */}
      <div className="mt-auto border-t-2 border-slate-400 bg-white p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6 relative z-20 shrink-0">
        
        {/* MCQ Style Quick Selector */}
        {["MCQ_SINGLE", "MCQ_MULTIPLE", "MATCH_THE_FOLLOWING", "ASSERTION_REASON"].includes(question.type) && (
            <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-5xl overflow-x-auto no-scrollbar py-2">
                {optionLabels.map((choice) => {
                    const active = isChecked(choice);
                    return (
                        <label key={choice} className="flex flex-col items-center gap-1 cursor-pointer group shrink-0">
                            <input
                                type={question.type === "MCQ_MULTIPLE" ? "checkbox" : "radio"}
                                name="answer"
                                className="peer hidden"
                                checked={active}
                                onChange={() => handleMultipleChoiceChange(choice)}
                            />
                            <div className={cn(
                                "w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 transition-all flex items-center justify-center font-black text-xl",
                                active ? "border-primary bg-primary text-white shadow-xl scale-110" : "border-slate-300 text-slate-400 group-hover:border-primary/50"
                            )}>
                                {choice}
                            </div>
                        </label>
                    );
                })}
            </div>
        )}

        {/* Exam Navigation Buttons */}
        <div className="flex items-center justify-between w-full gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline"
                    onClick={onMark}
                    className="h-10 md:h-14 px-3 md:px-10 border-2 border-slate-400 rounded-xl text-slate-700 font-bold text-[10px] md:text-base uppercase tracking-wider"
                >
                    Mark & Next
                </Button>
                <Button 
                    variant="outline"
                    onClick={onReset}
                    className="h-10 md:h-14 px-3 md:px-10 border-2 border-slate-400 rounded-xl text-slate-700 font-bold text-[10px] md:text-base uppercase tracking-wider"
                >
                    Clear
                </Button>
            </div>
            
            <Button 
                onClick={onSave}
                className={cn(
                  "h-10 md:h-14 px-6 md:px-16 rounded-xl text-white font-black text-[11px] md:text-xl uppercase tracking-widest shadow-2xl transition-all",
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
