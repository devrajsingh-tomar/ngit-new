import React from "react";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import GovExamCategory from "@/models/GovExamCategory";
import TypingExam from "@/models/TypingExam";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LanguageSelectionPage({ 
  params: paramsPromise, 
  searchParams: searchParamsPromise 
}: { 
  params: Promise<{ examSlug: string }>,
  searchParams: Promise<{ category?: string }> 
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const categorySlug = searchParams.category;

  // Auth check: require student login
  const session = await getServerSession(authOptions);
  if (!session) {
    const callbackUrl = `/typing/official/${params.examSlug}${categorySlug ? `?category=${categorySlug}` : ''}`;
    redirect(`/student/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  await connectDB();
  const exam = await GovExam.findOne({ 
    slug: { $regex: new RegExp(`^${params.examSlug}$`, "i") }, 
    active: true 
  });
  
  if (!exam) return notFound();

  // Fetch active subcategories under this GovExam
  const subCategories = await GovExamCategory.find({ govExamId: exam._id, active: true }).sort({ name: 1 }).lean();

  // If subcategories exist and candidate hasn't chosen one, show Subcategory selection
  if (subCategories.length > 0 && !categorySlug) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <Link href="/typing/official" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Exams
          </Link>

          <div className="text-center space-y-3">
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Step 2 of 5</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Select Sub-Category for {exam.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {subCategories.map((sub) => (
              <Link key={sub._id.toString()} href={`/typing/official/${exam.slug}?category=${sub.slug}`}>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 text-2xl flex items-center justify-center rounded-full mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                     🎓
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mb-3">
                    Duration: {sub.duration} Min • Mode: {sub.examMode}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {sub.examMode === "AHC" ? `Marks: ${sub.totalMarks}` : `WPM: ≥${sub.minWpm}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Find which languages actually have tests for this exam
  // Group all Hindi variants (Unicode Hindi, Krutidev Hindi, Mangal Hindi) under "Hindi"
  const rawLanguages = await TypingExam.distinct("language", { 
    govExamId: exam._id,
    status: { $ne: "Inactive" }
  });

  const hasEnglish = rawLanguages.length === 0 || rawLanguages.some((l: string) => l.toLowerCase().includes("english"));
  const hasHindi = rawLanguages.length === 0 || rawLanguages.some((l: string) => l.toLowerCase().includes("hindi"));

  const allLanguages = [
    { id: "English", name: "English Typing", icon: "⌨️", description: "Standard QWERTY layout practice" },
    { id: "Hindi", name: "Hindi (Mangal)", icon: "अ", description: "Standard government Mangal layout" }
  ];

  const languages = allLanguages.filter(lang => 
    lang.id === "English" ? hasEnglish : hasHindi
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <Link href={categorySlug ? `/typing/official/${exam.slug}` : "/typing/official"} className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        <div className="text-center space-y-3">
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Choose Language</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Select Language for {exam.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {languages.map((lang) => (
            <Link key={lang.id} href={`/typing/official/${exam.slug}/${lang.id.toLowerCase().replace(/\s+/g, '-')}${categorySlug ? `?category=${categorySlug}` : ''}`}>
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 text-3xl flex items-center justify-center rounded-full mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                  {lang.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {lang.name}
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {lang.description}
                </p>
              </div>
            </Link>
          ))}
          {languages.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active tests available for this exam yet.</p>
               <p className="text-slate-500 mt-2 font-medium">Please check back later or try another exam.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
