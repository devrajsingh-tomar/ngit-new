"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClassicTypingEngineModule } from "@/modules/typing/ClassicTypingEngineModule";
import { ModernTypingEngineModule } from "@/modules/typing/ModernTypingEngineModule";
import { toast } from "sonner";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ArrowRight, Keyboard, FileText, Timer } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function TypingExamPage() {
  const params = useParams();
  const id = params?.id as string;
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isAgreed, setIsAgreed] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const initialLang = searchParams?.get("lang") || "English";
  const initialLayout = searchParams?.get("layout") || "English";

  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>(initialLang as any);
  const [selectedLayout, setSelectedLayout] = useState<'English' | 'Inscript' | 'Kruti Dev 010' | 'Remington GAIL'>(
    (initialLayout || (initialLang === 'Hindi' ? 'Inscript' : 'English')) as any
  );


  useEffect(() => {
    if (initialLang) setSelectedLanguage(initialLang as any);
    if (initialLayout) setSelectedLayout(initialLayout as any);
  }, [initialLang, initialLayout]);

  const engineConfig = React.useMemo(() => {
    // If a rule preset exists, it overrides the individual exam settings.
    // Otherwise, if the exam belongs to a GovExam, inherit from the GovExam's rule preset!
    const preset = exam?.rulePresetId || exam?.govExamId?.rulePresetId;
    const duration = exam?.govExamCategoryId?.duration || exam?.govExamId?.defaultDuration || exam?.duration || 10;
    
    return {
      title: exam?.title || "",
      duration: duration,
      backspaceMode: preset?.backspaceMode || exam?.backspaceMode || "full",
      highlightMode: preset?.highlightMode || exam?.highlightMode || "word",
      wordLimit: preset?.wordLimit || exam?.wordLimit || 0,
      autoScroll: preset?.autoScroll !== undefined ? preset.autoScroll : (exam?.autoScroll !== undefined ? exam.autoScroll : true),
      showScrollbar: preset?.showScrollbar !== undefined ? preset.showScrollbar : (exam?.showScrollbar !== undefined ? exam.showScrollbar : true),
      examMode: preset?.examMode || exam?.examMode || "General",
      sourcePosition: exam?.sourcePosition || "top",
      
      // Extended Rules from Preset
      paragraphLock: preset?.paragraphLock || false,
      fixedFormatting: preset?.fixedFormatting || false,
      allowTabs: preset?.allowTabs || false,
      allowParagraphs: preset?.allowParagraphs || false,
      autoStart: preset?.autoStart || false,
      pauseOnIdle: preset?.pauseOnIdle || false,
      hardStop: preset?.hardStop !== undefined ? preset.hardStop : true,
      autoSubmit: preset?.autoSubmit !== undefined ? preset.autoSubmit : true,
      disableCopyPaste: preset?.disableCopyPaste !== undefined ? preset.disableCopyPaste : true,
      disableRightClick: preset?.disableRightClick !== undefined ? preset.disableRightClick : true,
      fullscreenMode: preset?.fullscreenMode || false,
      blurDetection: preset?.blurDetection || false,
      keyboardRestriction: preset?.keyboardRestriction || false,
      
      language: selectedLanguage,
      layout: selectedLayout as any
    };
  }, [exam, selectedLanguage, selectedLayout]);

  const categoryId = searchParams?.get("govExamCategoryId");
  const govExamId = searchParams?.get("govExamId");

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const paramsList = [];
    if (categoryId) paramsList.push(`govExamCategoryId=${categoryId}`);
    if (govExamId) paramsList.push(`govExamId=${govExamId}`);
    const queryString = paramsList.length > 0 ? `?${paramsList.join("&")}` : "";
    fetch(`/api/typing/exams/${id}${queryString}`)
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 401) {
            throw new Error("AUTH_REQUIRED");
          }
          if (res.status === 403 && (errData.requiresPayment || errData.requiresSubscription)) {
            throw new Error("PAYMENT_REQUIRED");
          }
          throw new Error(errData.error || "Server responded with an error");
        }
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          if (data && data._id) {
            setExam(data);
            
            // If we have language and layout in URL (from Step-by-Step flow), jump to engine
            if (initialLang && initialLayout && session) {
               setStep(3);
            }
          } else {
            console.error("Received invalid data from exams API:", data);
            toast.error("Could not load exam details");
          }
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Fetch error in TypingExamPage:", err);
          setLoading(false);
          if (err.message === "AUTH_REQUIRED") {
            toast.error("Please login to access this exam");
            router.push(`/student/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
          } else if (err.message === "PAYMENT_REQUIRED") {
            toast.error("This is a premium exam. Please purchase a subscription to access.");
            router.push("/student/typing/subscribe");
          } else {
            toast.error(err.message || "Failed to connect to examination server");
          }
        }
      });
    return () => { isMounted = false; };
  }, [id, initialLang, initialLayout, session, router]);

  const handleComplete = useCallback(async (results: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!session) {
        toast.error("Please login to submit your exam results");
        router.push(`/student/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        return;
      }

      const response = await fetch("/api/typing/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: results.examId || id,
          ...results
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Exam submitted successfully!");
        router.push(`/typing/results/${data.resultId}`);
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (error) {
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, isSubmitting, router, session]);

  if (loading || status === "loading") return (
    <div className="flex justify-center py-20 min-h-screen bg-[#f5f4ef] items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  );

  if (!exam) return (
    <div className="min-h-screen bg-[#f5f4ef] flex items-center justify-center">
      <p className="text-xl font-bold">Exam not found or not active.</p>
    </div>
  );

  const handleNextStep = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#f5f4ef] py-12 text-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
            <div>
              <p className="text-sm font-bold text-slate-800 mb-2">Configure your exam settings</p>
              <h1 className="text-4xl md:text-5xl font-black">{exam.title}</h1>
            </div>
            <Link href="/typing/official" className="text-sm font-bold mt-4 md:mt-0 flex items-center gap-2 hover:underline">
              Choose any other exam <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <hr className="border-t border-slate-900 mb-10" />

          <div className="bg-[#fcf5ec] rounded-lg p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-stretch gap-10">
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-24 h-24 bg-[#ffcc00] rounded-full opacity-80" />
            
            {/* Left Column: Info & Actions */}
            <div className="flex-1 relative z-10 flex flex-col">
              <span className="inline-block w-fit px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">Exam Module Activated</span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8">Ready to <br/><span className="text-slate-500">Test Your Speed?</span></h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Timer className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Test Duration</p>
                        <p className="text-xl font-black">{engineConfig.duration} Minutes</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Keyboard className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Selected Layout</p>
                        <p className="text-xl font-black">{selectedLanguage} - {selectedLayout}</p>
                    </div>
                </div>
              </div>

              {!session ? (
                <div className="bg-white/50 backdrop-blur-sm border border-slate-200 p-6 rounded-3xl mb-8">
                    <p className="text-sm font-bold text-slate-600 mb-4">You need to be logged in to save your results and view rankings.</p>
                    <button 
                        onClick={() => router.push(`/student/login?callbackUrl=${encodeURIComponent(window.location.href)}`)}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Login as Student
                    </button>
                </div>
              ) : (
                <button 
                  onClick={handleNextStep}
                  className="group w-fit flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-black transition-all hover:gap-6 shadow-xl shadow-slate-900/20 mt-auto"
                >
                  Continue to Instructions <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Right Column: Configuration Area */}
            <div className="w-full lg:w-[450px] relative z-10">
              <div className="h-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 flex flex-col">
                <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                    Choose Language
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button 
                        onClick={() => { setSelectedLanguage('English'); setSelectedLayout('English'); }}
                        className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            selectedLanguage === 'English' ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                        )}
                    >
                        <span className="text-xl font-black">EN</span>
                        <span className="text-[10px] font-black uppercase">English</span>
                    </button>
                    <button 
                        onClick={() => setSelectedLanguage('Hindi')}
                        className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            selectedLanguage === 'Hindi' ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                        )}
                    >
                        <span className="text-xl font-black">हि</span>
                        <span className="text-[10px] font-black uppercase">Hindi</span>
                    </button>
                </div>

                {selectedLanguage === 'Hindi' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                            Select Keyboard Layout
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'Inscript', name: 'Mangal Inscript', sub: 'Government Standard (Mangal Font)' },
                                { id: 'Kruti Dev 010', name: 'Kruti Dev 010', sub: 'Kruti Dev 010 Remington Layout' },
                                { id: 'Remington GAIL', name: 'Remington GAIL', sub: 'Remington GAIL Layout' }
                            ].map((lay) => (
                                <button 
                                    key={lay.id}
                                    onClick={() => setSelectedLayout(lay.id as any)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center cursor-pointer",
                                        selectedLayout === lay.id ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div>
                                        <p className="font-black text-sm">{lay.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                                            {lay.sub}
                                        </p>
                                    </div>
                                    {selectedLayout === lay.id && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                <div className="mt-auto pt-8 flex items-center gap-3 text-slate-400">
                    <Keyboard className="w-5 h-5" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                        Verify your keyboard layout before starting
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#f5f4ef] py-12 text-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center border border-slate-100">
               <FileText className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Examination</p>
              <h3 className="text-2xl font-black leading-none">
                Id- {exam.passageId?._id?.substring(0, 5)} - {exam.passageId?.title || "Exam Passage"}
              </h3>
            </div>
          </div>

          <h2 className="text-4xl font-black mb-6">Instructions:</h2>
          <hr className="border-t border-slate-900 mb-8" />

          {/* Instructions Box */}
          <div className="bg-white p-8 md:p-12 border border-slate-200 mb-10 text-sm font-medium text-slate-800 leading-relaxed space-y-5">
            <p>1. The candidates will be provided with the master text passage of about <span className="font-bold">{exam.passageId?.wordCount || 500} words</span> in <span className="font-bold">{exam.language}</span>.</p>
            <p>2. The typing can be of either word based typing or key strokes based typing.</p>
            <p>3. For example, 35 w.p.m. is about 10500 key depressions per hour and 30 w.p.m. corresponds to about 9000 key depression per hour.</p>
            <p>4. Time duration of <span className="font-bold">{exam.language}</span> typing test is <span className="font-bold">{(engineConfig.duration || 10).toString().padStart(2, '0')}:00 minute</span>.</p>
            <p>5. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself with typed passage, you are not required to end or submit your test.</p>
            <p>6. <span className="font-bold">Candidates are not required to repeat the passage</span>, if he/she has completed the passage once and has time in his/her disposal, however they are allowed to revise and correct their mistakes and inaccuracies, if any, during the prescribed time</p>
            <p>7. After every Punctuation mark, only One space is to be inserted, e.g. after comma, full stop, mark of interrogation etc. However, candidates are advised to follow the Question paper scrupulously in this regard.</p>
            <p>8. The combination of alphanumeric keys followed by one space is termed as one "Word".</p>
            <p>9. Once you have completed typing of the given passage and you do not find any errors or mistakes in it, you may submit it by pressing the submit button. After submission no editing or change in the typed passage is possible.</p>
            <p>10. If your computer is locked/switched off or for any type of technical help, please inform a nearby invigilator immediately.</p>
            <p>11. In any case of auto restart of the computer, you will be again provided with the full time to type the given passage.</p>
            <p>12. After typing given number of words in the master text passage the space bar will not allow further typing of additional words.</p>
          </div>

          {/* Confirmation */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="confirm" 
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="confirm" className="text-sm font-bold cursor-pointer select-none">
                I have enabled {exam.language} Keyboard on my system. <Link href="#" className="text-blue-600 hover:underline">How to install?</Link>
              </label>
            </div>

            <button 
              id="start-typing-btn"
              disabled={!isAgreed}
              onClick={() => { setStep(3); window.scrollTo(0, 0); }}
              className="bg-[#cfcfcf] text-white font-black py-4 px-12 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed enabled:bg-slate-900 enabled:hover:bg-black transition-all shadow-xl shadow-slate-900/10"
            >
              Start Official Exam
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="font-black text-slate-700 text-lg uppercase tracking-widest">Recording Performance Metrics...</p>
        </div>
      )}

      {!session && step === 3 && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[101] flex flex-col items-center justify-center p-6 text-center">
           <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mb-6">
              <Keyboard className="w-10 h-10 text-rose-600" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-2">Authentication Required</h2>
           <p className="text-slate-500 max-w-md mb-8">You need to be logged in as a student to participate in official exams and record your performance.</p>
           <button 
              onClick={() => router.push(`/student/login?callbackUrl=${encodeURIComponent(window.location.href)}`)}
              className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200"
           >
              Login as Student
           </button>
        </div>
      )}

      {exam?.typingEngineType === "modern" ? (
        <ModernTypingEngineModule 
          exam={exam}
          passage={exam.passageId?.content || "Passage not linked properly."} 
          config={engineConfig}
          onComplete={handleComplete}
          userName={session?.user?.name || "STUDENT"}
          userImage={session?.user?.image || undefined}
        />
      ) : (
        <ClassicTypingEngineModule 
          exam={exam}
          passage={exam.passageId?.content || "Passage not linked properly."} 
          config={engineConfig}
          onComplete={handleComplete}
          userName={session?.user?.name || "STUDENT"}
          userImage={session?.user?.image || undefined}
        />
      )}
    </div>
  );
}
