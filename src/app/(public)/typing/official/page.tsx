import React from "react";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import Link from "next/link";
import { ChevronRight, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TypingExamsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ lang?: string }> }) {
  const searchParams = await searchParamsPromise;
  await connectDB();
  const exams = await GovExam.find({ active: true }).sort({ title: 1 });

  // Get test counts per exam and attach to exam object
  const examsWithCounts = await Promise.all(exams.map(async (exam) => {
    const count = await TypingExam.countDocuments({ 
      govExamId: exam._id,
      status: { $ne: "Inactive" }
    });
    return { 
      ...exam.toObject(), 
      _id: exam._id.toString(),
      testCount: count 
    };
  }));

  // Filter to only show exams with at least 1 active test
  // and sort by test count (highest first) so available exams are on top
  const activeExams = examsWithCounts
    .filter(exam => exam.testCount > 0)
    .sort((a, b) => b.testCount - a.testCount);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-2">
            Official Pattern Tests
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Government <span className="text-indigo-600">Typing Exams</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Select your target government exam to practice with official patterns, exact difficulty levels, and realistic interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeExams.map((exam) => (
            <Link key={exam._id.toString()} href={`/typing/official/${exam.slug}${searchParams.lang ? `?lang=${searchParams.lang}` : ''}`}>
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden flex flex-col h-full text-center">
                {/* Decorative Background for Logo */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50/80 to-transparent z-0"></div>
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-100/50 rounded-full blur-3xl z-0 transition-transform group-hover:scale-150 duration-500"></div>

                <div className="relative z-10 flex flex-col items-center flex-grow">
                  
                  {/* Status Badges */}
                  <div className="w-full flex items-center justify-between mb-6">
                       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                       </div>
                       <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                         {exam.testCount} Tests
                       </div>
                  </div>

                  {/* Mega Logo */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 mb-6 rounded-3xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center p-4 group-hover:shadow-xl group-hover:border-indigo-100 transition-all duration-300 group-hover:scale-105">
                    {exam.logo ? (
                      <img src={exam.logo} alt={exam.title} className="object-contain w-full h-full drop-shadow-sm" />
                    ) : (
                      <Award className="w-14 h-14 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    )}
                  </div>
                  
                  {/* Text Content */}
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-3">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed max-w-[280px] mx-auto flex-grow">
                    {exam.description || `Practice officially patterned typing tests designed specifically for ${exam.title}.`}
                  </p>
                  
                  <div className="mt-auto w-full">
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-indigo-600 transition-all shadow-xl group-hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                      Start Practice <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {exams.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium">
              No active government exams found.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
