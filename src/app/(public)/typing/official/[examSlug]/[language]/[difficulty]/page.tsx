import React from "react";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import GovExamCategory from "@/models/GovExamCategory";
import TypingExam from "@/models/TypingExam";
import TypingExamAccess from "@/models/TypingExamAccess";
import StartOrUnlockButton from "@/components/typing/StartOrUnlockButton";
import TypingSubscription from "@/models/TypingSubscription";
import Link from "next/link";
import { ArrowLeft, Clock, Keyboard, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TestSelectionPage({ 
  params: paramsPromise,
  searchParams: searchParamsPromise
}: { 
  params: Promise<{ examSlug: string, language: string, difficulty: string }>,
  searchParams: Promise<{ page?: string }>
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  // Auth check: require student login
  const session = await getServerSession(authOptions);
  if (!session) {
    const callbackUrl = `/typing/official/${params.examSlug}/${params.language}/${params.difficulty}`;
    redirect(`/student/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  await connectDB();

  // Fetch student's active typing subscription
  const activeSub = session ? await TypingSubscription.findOne({
    userId: session.user.id,
    status: "ACTIVE",
    endDate: { $gt: new Date() }
  }).lean() : null;
  const isSubscribed = !!activeSub;

  // Fetch student's unlocked typing exams
  const userAccess = session ? await TypingExamAccess.find({
    userId: session.user.id,
    status: "SUCCESS"
  }).select("examId").lean() : [];
  const unlockedExamIds = new Set(userAccess.map(acc => acc.examId.toString()));

  const exam = await GovExam.findOne({ 
    slug: { $regex: new RegExp(`^${params.examSlug}$`, "i") }, 
    active: true 
  });
  
  if (!exam) return notFound();

  // Determine the 3 free exams for this category (3 oldest active ones under this govExamId or its categories)
  const parentCategories = await GovExamCategory.find({ govExamId: exam._id }).select("_id").lean();
  const categoryIds = parentCategories.map(c => c._id);

  const freeExams = await TypingExam.find({ 
    $or: [
      { govExamId: exam._id },
      { govExamCategoryId: { $in: categoryIds } }
    ],
    status: { $ne: "Inactive" }
  })
    .sort({ createdAt: 1 })
    .limit(3)
    .populate("passageId")
    .lean();
  const freeExamIds = new Set(freeExams.map(e => e._id.toString()));

  const langFormatted = params.language.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const diffFormatted = params.difficulty.charAt(0).toUpperCase() + params.difficulty.slice(1);

  // Build language filter: if 'Hindi' is in URL, match all Hindi variants in DB
  // (Unicode Hindi, Mangal Hindi, Krutidev Hindi, Hindi)
  const isHindi = langFormatted.toLowerCase().includes('hindi');
  const langFilter = isHindi ? { $regex: /hindi/i } : langFormatted;

  const query = {
    $or: [
      { govExamId: exam._id },
      { govExamCategoryId: { $in: categoryIds } }
    ],
    language: langFilter,
    difficulty: diffFormatted,
    status: { $ne: "Inactive" }
  };

  // Fetch typing tests that match the criteria with pagination
  const [typingExams, totalTests] = await Promise.all([
    TypingExam.find(query)
      .populate("passageId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TypingExam.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalTests / limit);

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

        {/* FREE TRYOUT CARDS SECTION */}
        {freeExams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                Free Tryout Tests (No Subscription Required)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {freeExams.map((test, index) => {
                const passageText = (test.passageId as any)?.content || "";
                const wordCount = passageText.trim().split(/\s+/).filter(Boolean).length;
                
                return (
                  <div key={test._id.toString()} className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full -mr-6 -mt-6" />
                    <div className="space-y-2 relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Free Test {index + 1}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          #{test._id.toString().substring(18)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-650 transition-colors">
                        {test.title}
                      </h3>
                      <div className="flex items-center gap-3 pt-1 text-slate-500 text-xs font-bold">
                        <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">{wordCount} Words</span>
                        <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-350" /> {test.duration} Min
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 relative z-10">
                      <Link 
                        href={`/typing/exam/${test._id.toString()}?lang=${langFormatted}&layout=${langFormatted === 'English' ? 'English' : 'Inscript'}`}
                        className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-100 hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.01] cursor-pointer"
                      >
                        Start Free <Play className="w-3 h-3 fill-white shrink-0" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
               <span>Showing {skip + 1}-{Math.min(skip + typingExams.length, totalTests)} of {totalTests} Available Tests</span>
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
                  <th className="px-6 py-4">Access Type</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {typingExams.map((test, index) => {
                  const content = (test.passageId as any)?.content || "";
                  const keystrokes = content.length;
                  const wordCount = content.trim().split(/\s+/).length;

                  const isFree = test.pricing?.type !== "PAID" && freeExamIds.has(test._id.toString());
                  const isPaid = !isFree;
                  const isUnlocked = isSubscribed || unlockedExamIds.has(test._id.toString()) || isFree;
                  const amount = 21; // Online subscription is 21 INR / month

                  return (
                    <tr key={test._id.toString()} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-xs font-bold text-slate-400">
                        {(skip + index + 1).toString().padStart(2, '0')}
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
                      <td className="px-6 py-5">
                        {isPaid ? (
                          isUnlocked ? (
                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                              Subscribed
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider">
                              Requires Subscription
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <StartOrUnlockButton
                          testId={test._id.toString()}
                          isPaid={isPaid}
                          isUnlocked={isUnlocked}
                          amount={amount}
                          duration={test.duration}
                          langFormatted={langFormatted}
                        />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link 
                    href={`?page=${page - 1}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                )}

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = page;
                    if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    if (pageNum <= 0 || pageNum > totalPages) return null;

                    return (
                      <Link 
                        key={pageNum}
                        href={`?page=${pageNum}`}
                        className={`h-9 px-3.5 flex items-center justify-center rounded-lg text-xs font-black transition-all shadow-sm ${
                          page === pageNum 
                          ? "bg-slate-900 text-white shadow-indigo-500/10" 
                          : "bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {page < totalPages ? (
                  <Link 
                    href={`?page=${page + 1}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
