"use client";

import React from "react";
import ExamHeader from "./ExamHeader";
import QuestionPalette from "./QuestionPalette";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  exam: any;
  user: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  language: string;
  onLanguageChange: (lang: any) => void;
  onQuestionSelect: (index: number) => void;
  answers: Record<string, any>;
  flagged: number[];
}

export default function ExamLayout({
  children,
  exam,
  user,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  language,
  onQuestionSelect,
  answers,
  flagged
}: Props) {
  const [showPalette, setShowPalette] = React.useState(false);

  return (
    <div className="h-screen bg-white flex flex-col font-sans select-none overflow-hidden relative">
      <ExamHeader
        examName={exam?.title || "Mock Test"}
        userName={user?.name || "Anonymous"}
        loginId={user?.loginId || "A13DE8BF"}
        timeLeft={timeLeft}
        language="HINDI/ENGLISH"
        currentQuestionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        totalMarks={exam?.settings?.totalMarks || 100}
        totalTime={exam?.settings?.timeLimit || 90}
        currentMark={exam?.questions?.[currentQuestionIndex]?.marks || 1}
        logo={exam?.logo}
      />

      <main className="flex-1 flex w-full border-x-0 md:border-x-2 border-b-2 border-slate-400 mx-auto max-w-[1400px] overflow-hidden relative">
        {/* Left Panel: Question Area */}
        <div className="flex-1 relative overflow-y-auto no-scrollbar bg-white h-full">
            {children}
        </div>

        {/* Mobile Palette Toggle Button */}
        <div className="fixed bottom-24 right-4 z-50 md:hidden">
            <Button 
                onClick={() => setShowPalette(!showPalette)}
                className="w-12 h-12 rounded-full shadow-2xl bg-[#3B82F6] hover:bg-blue-600 text-white p-0 flex items-center justify-center border-4 border-white"
            >
                {showPalette ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
        </div>

        {/* Right Panel: Palette (Desktop: fixed, Mobile: sliding overlay) */}
        <aside className={cn(
            "fixed inset-y-0 right-0 z-40 w-[280px] md:w-[300px] bg-white border-l-2 border-slate-400 transform transition-transform duration-300 md:relative md:translate-x-0 md:z-auto md:h-full",
            showPalette ? "translate-x-0" : "translate-x-full"
        )}>
          <QuestionPalette
            totalQuestions={totalQuestions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={(idx) => {
                onQuestionSelect(idx);
                setShowPalette(false);
            }}
            answers={answers}
            flagged={flagged}
            questions={exam?.questions || []}
          />
        </aside>

        {/* Backdrop for Mobile Palette */}
        {showPalette && (
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                onClick={() => setShowPalette(false)}
            />
        )}
      </main>
    </div>
  );
}
