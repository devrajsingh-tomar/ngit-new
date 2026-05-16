import React from "react";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import Link from "next/link";
import { ArrowLeft, Zap, Target, Flame } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DifficultySelectionPage({ params: paramsPromise }: { params: Promise<{ examSlug: string, language: string }> }) {
  const params = await paramsPromise;
  await connectDB();
  const exam = await GovExam.findOne({ 
    slug: { $regex: new RegExp(`^${params.examSlug}$`, "i") }, 
    active: true 
  });
  
  if (!exam) return notFound();

  const langFormatted = params.language.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Find which difficulties actually have tests for this exam + language
  const availableDifficulties = await TypingExam.distinct("difficulty", { 
    govExamId: exam._id,
    language: langFormatted,
    status: "Active"
  });

  const allDifficulties = [
    { 
      id: "Easy", 
      name: "Easy", 
      icon: <Zap className="w-8 h-8 text-emerald-500" />,
      color: "hover:border-emerald-500 hover:shadow-emerald-500/10",
      bgHover: "group-hover:bg-emerald-50",
      metrics: { wpm: "25-35", words: "250-350", complexity: "Beginner", pressure: "Low" }
    },
    { 
      id: "Medium", 
      name: "Medium", 
      icon: <Target className="w-8 h-8 text-amber-500" />,
      color: "hover:border-amber-500 hover:shadow-amber-500/10",
      bgHover: "group-hover:bg-amber-50",
      metrics: { wpm: "35-45", words: "350-500", complexity: "Standard", pressure: "Moderate" }
    },
    { 
      id: "Hard", 
      name: "Hard", 
      icon: <Flame className="w-8 h-8 text-rose-500" />,
      color: "hover:border-rose-500 hover:shadow-rose-500/10",
      bgHover: "group-hover:bg-rose-50",
      metrics: { wpm: "45+", words: "500+", complexity: "Advanced", pressure: "High" }
    }
  ];

  const difficulties = allDifficulties.filter(diff => availableDifficulties.includes(diff.id));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <Link href={`/typing/official/${exam.slug}`} className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Language Selection
        </Link>

        <div className="text-center space-y-3">
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Step 3 of 4</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Select Difficulty Level
          </h1>
          <p className="text-slate-500 font-medium">
            {exam.title} • {langFormatted} Typing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {difficulties.map((diff) => (
            <Link key={diff.id} href={`/typing/official/${exam.slug}/${params.language}/${diff.id.toLowerCase()}`}>
              <div className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all duration-300 group cursor-pointer h-full flex flex-col items-center text-center hover:shadow-lg ${diff.color}`}>
                <div className={`w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-all ${diff.bgHover}`}>
                  {diff.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">
                  {diff.name}
                </h3>
                <div className="w-full space-y-3">
                   <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="font-bold text-slate-400 uppercase">Expected Speed</span>
                      <span className="font-black text-slate-900">{diff.metrics.wpm} WPM</span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="font-bold text-slate-400 uppercase">Word Count</span>
                      <span className="font-black text-slate-900">{diff.metrics.words}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="font-bold text-slate-400 uppercase">Complexity</span>
                      <span className="font-black text-slate-900">{diff.metrics.complexity}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400 uppercase">Exam Pressure</span>
                      <span className={`font-black ${diff.id === 'Hard' ? 'text-rose-600' : diff.id === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>{diff.metrics.pressure}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
      </div>
    </div>
  );
}
