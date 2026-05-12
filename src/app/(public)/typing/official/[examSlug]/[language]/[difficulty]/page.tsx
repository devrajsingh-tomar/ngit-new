import React from "react";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import Link from "next/link";
import { ArrowLeft, Clock, Keyboard, Play } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TestSelectionPage({ params: paramsPromise }: { params: Promise<{ examSlug: string, language: string, difficulty: string }> }) {
  const params = await paramsPromise;
  await connectDB();
  const exam = await GovExam.findOne({ 
    slug: { $regex: new RegExp(`^${params.examSlug}$`, "i") }, 
    active: true 
  });
  
  if (!exam) return notFound();

  const langFormatted = params.language.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const diffFormatted = params.difficulty.charAt(0).toUpperCase() + params.difficulty.slice(1);

  // Fetch typing tests that match the criteria
  const typingExams = await TypingExam.find({
    govExamId: exam._id,
    language: langFormatted,
    difficulty: diffFormatted,
    status: "Active"
  }).populate("passageId").sort({ createdAt: -1 });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <Link href={`/typing/official/${exam.slug}/${params.language}`} className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Difficulty Selection
        </Link>

        <div className="text-center space-y-3">
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Step 4 of 4</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Available Tests
          </h1>
          <p className="text-slate-500 font-medium">
            {exam.title} • {langFormatted} • {diffFormatted}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Search & Filters */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
            <div className="relative w-full md:w-96">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Play className="w-4 h-4 rotate-90" />
               </div>
               <input 
                type="text" 
                placeholder="Search tests by title or ID..." 
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
               />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
               <span>Showing {typingExams.length} Available Tests</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">SR NO</th>
                  <th className="px-6 py-4">Test ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Word Count</th>
                  <th className="px-6 py-4">Keystrokes</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {typingExams.map((test, index) => {
                  const content = (test.passageId as any)?.content || "";
                  const keystrokes = content.length;
                  const wordCount = content.trim().split(/\s+/).length;

                  return (
                    <tr key={test._id.toString()} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-xs font-bold text-slate-400">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                          #{test._id.toString().substring(18)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                            <Keyboard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{test.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{test.examMode} Pattern</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600">
                        {wordCount} Words
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600">
                        {keystrokes}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-xs font-bold text-slate-600">
                          <Clock className="w-3.5 h-3.5 mr-2 text-slate-300" />
                          {test.duration} Min
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/typing/exam/${test._id}?lang=${langFormatted}&layout=${langFormatted === 'English' ? 'English' : 'Inscript'}`}>
                          <button className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95">
                            Start <Play className="w-3 h-3 ml-2" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {typingExams.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Keyboard className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Tests Found</h3>
                <p className="text-slate-500 text-sm">We are adding new tests for this category soon.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
