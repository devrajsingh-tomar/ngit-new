"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { TypingEngineModule } from "@/modules/typing/TypingEngineModule";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, ArrowLeft, Target, Zap, AlertCircle, Lock } from "lucide-react";

import { ClassicTypingEngineModule } from "@/modules/typing/ClassicTypingEngineModule";
import { useSession } from "next-auth/react";

function TypingPracticeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // e.g., 'book', 'word', 'essay', 'current'
  const cat = searchParams.get("cat");
  const val = searchParams.get("val");
  const lang = searchParams.get("lang") || "English";
  const layout = searchParams.get("layout") || "English";
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  const engineConfig = useMemo(() => ({
    title: content?.title || "Practice Session",
    duration: content?.duration || 10,
    backspaceMode: content?.backspaceMode || "full",
    highlightMode: content?.highlightMode || "word",
    wordLimit: 0,
    language: lang,
    layout: layout as any
  }), [content, lang, layout]);

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
        try {
            const res = await fetch(`/api/typing/practice?type=${type}&cat=${cat}&val=${val}`);
            if (!res.ok) throw new Error("Failed to load content");
            const data = await res.json();
            if (isMounted) {
                setContent(data);
                setLoading(false);
            }
        } catch (error) {
            if (isMounted) {
                toast.error("Failed to load practice content");
                router.push('/typing');
            }
        }
    };
    fetchContent();
    return () => { isMounted = false; };
  }, [type, cat, val, router]);

  const handleComplete = (res: any) => {
    setResults(res);
    toast.success("Practice Completed!");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-slate-500 font-bold animate-pulse">PREPARING YOUR DRILL...</p>
    </div>
  );

  // Auth guard: redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 rounded-[3rem] border-none shadow-2xl bg-white text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Login Required</h2>
          <p className="text-slate-500 font-medium mb-8">You need to be logged in as a student to access typing practice sessions.</p>
          <Button 
            onClick={() => router.push(`/student/login?callbackUrl=${encodeURIComponent(window.location.href)}`)}
            className="w-full h-14 rounded-2xl font-black text-base"
          >
            Login as Student
          </Button>
        </Card>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full p-8 rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
                <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Drill Completed!</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your Performance Metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
             <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100 group hover:border-indigo-200 transition-all">
                <Zap className="w-6 h-6 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-5xl font-black text-slate-900 mb-1">{Math.round(results.wpm)}</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Net WPM</div>
             </div>
             <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100 group hover:border-emerald-200 transition-all">
                <Target className="w-6 h-6 text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-5xl font-black text-slate-900 mb-1">{Math.round(results.accuracy)}%</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Accuracy</div>
             </div>
             <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100 group hover:border-rose-200 transition-all">
                <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-5xl font-black text-slate-900 mb-1">{results.errorCount}</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Mistakes</div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button 
                onClick={() => setResults(null)}
                className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-200 gap-3"
             >
                <RotateCcw className="w-5 h-5" /> Try Again
             </Button>
             <Button 
                variant="outline"
                onClick={() => router.push('/typing')}
                className="h-16 px-10 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 font-black text-lg gap-3"
             >
                <ArrowLeft className="w-5 h-5" /> Back to Library
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isBook = type?.toLowerCase() === 'book';

  return (
    <div className="min-h-screen bg-white">
      {isBook ? (
          <ClassicTypingEngineModule 
            exam={content?.rawExamData || content} 
            passage={content?.content || ""} 
            config={engineConfig}
            onComplete={handleComplete}
          />
      ) : (
          <TypingEngineModule 
            passage={content?.content || ""} 
            config={engineConfig}
            onComplete={handleComplete}
          />
      )}
    </div>
  );
}

export default function TypingPracticePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TypingPracticeContent />
        </Suspense>
    )
}
