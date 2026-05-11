"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Keyboard, XCircle, Scissors, AlertCircle, Timer, Download, Target, ArrowLeft, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function TypingResultDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorFormulaOn, setErrorFormulaOn] = useState(true);
  const [detailedComparison, setDetailedComparison] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/typing/results/details/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (isMounted) setResult(data);
      } catch (error) {
        console.error("Failed to fetch typing result details:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [params.id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Generating Report...</p>
        </div>
    </div>
  );

  if (!result) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold">Result Not Found</h2>
        <p className="text-slate-500 mt-2">We couldn't locate this specific typing attempt.</p>
        <Link href="/student/typing" className="text-blue-600 underline mt-4 inline-block font-bold">Back to Typing Results</Link>
      </div>
    );
  }

  // Handle case where exam or passage might have been deleted but result exists
  const hasPassageData = !!(result.examId && result.examId.passageId);
  const passageContent = result.examId?.passageId?.content || "";
  const originalWords = passageContent ? passageContent.trim().split(/\s+/) : [];
  const submittedWords = result.submittedText?.trim().split(/\s+/) || [];

  const totalKeystrokesGiven = passageContent?.length || 0;
  const keystrokesTyped = result.submittedText?.length || 0;
  const wordsTyped = submittedWords.length > 0 && submittedWords[0] !== "" ? submittedWords.length : 0;

  let fullMistakes = 0;
  let halfMistakes = 0;
  
  submittedWords.forEach((word: string, idx: number) => {
    const originalWord = originalWords[idx];
    if (word !== originalWord) {
      if (!originalWord || Math.abs(word.length - originalWord.length) > 2) {
        fullMistakes++;
      } else {
        halfMistakes++;
      }
    }
  });

  const totalWrongWords = fullMistakes + halfMistakes;
  const netWrongWords = fullMistakes + (halfMistakes / 2);
  const isUPSSSC = result.examId?.examMode === "UPSSSC";
  const isAHC = result.examId?.examMode === "AHC";
  const isUPPolice = result.examId?.examMode === "UP_POLICE";
  
  // Official Formula: Net Words = (Total Keystrokes / 5) - Mistakes
  // standardWpm uses Keystrokes/5 which is most government standards
  const standardWordsTyped = (keystrokesTyped / 5);
  const netCorrectWords = (isUPSSSC || isAHC)
    ? Math.max(0, standardWordsTyped - totalWrongWords) // Govt subtracts full mistakes from weighted words
    : (isUPPolice ? Math.max(0, wordsTyped - totalWrongWords) : Math.max(0, wordsTyped - netWrongWords));
    
  const timeDurationMins = result.examId?.duration || 10;
  const timeTakenMins = (result.timeTaken || 0) / 60;
  const netWpm = timeTakenMins > 0 ? (netCorrectWords / timeTakenMins).toFixed(2) : "0.00";
  
  const lang = result.examId?.language?.toLowerCase() || "";
  const isHindi = lang.includes("hindi") || lang.includes("mangal") || lang.includes("kruti");
  const passingWpm = isHindi ? 25 : (isUPPolice ? 35 : 30);

  const minKeystrokes = Math.round((timeDurationMins * passingWpm * 5) / 2);
  const isQualified = parseFloat(netWpm) >= passingWpm;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs} min.`;
  };

  const getFontFamily = () => {
    const lang = result.examId?.language?.toLowerCase() || "";
    if (lang.includes("kruti") || lang.includes("kurti")) return "'Kruti Dev 010', Arial, sans-serif";
    if (lang.includes("mangal") || lang.includes("hindi")) return "Mangal, Arial, sans-serif";
    return "Inter, Arial, sans-serif";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 print:py-0 print:bg-white font-sans">
      <div className="max-w-6xl mx-auto px-4 print:px-0">
        
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform border border-slate-100">
                <ArrowLeft className="w-4 h-4" />
            </div>
            Go Back
          </button>
          <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
          >
              <Download className="w-4 h-4" /> Save as PDF
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden print:border-none print:shadow-none print:rounded-none">
          
          <div className={cn(
            "p-10 text-white relative overflow-hidden",
            isQualified ? "bg-emerald-600" : "bg-rose-600"
          )}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    {/* Candidate Info */}
                    <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 shadow-xl min-w-[200px]">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden relative shadow-inner">
                            {result.userId?.image ? (
                                <img src={result.userId.image} alt="Candidate" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black text-white/50">{result.userId?.name?.[0] || "S"}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em] mb-1 leading-none text-center">Candidate Identity</p>
                            <p className="text-lg font-black text-white leading-none text-center">{result.userId?.name || "Student"}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-white/70 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Performance Report</p>
                        <h1 className="text-5xl font-black tracking-tight mb-2">{result.examId?.title || "Exam Result"}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                            <Badge className="bg-white/20 text-white border-none px-4 py-1.5 rounded-full font-bold">
                                <Calendar className="w-3.5 h-3.5 mr-2" /> {format(new Date(result.createdAt), "PPP")}
                            </Badge>
                            <Badge className="bg-white/20 text-white border-none px-4 py-1.5 rounded-full font-bold">
                                <Globe className="w-3.5 h-3.5 mr-2" /> {result.examId?.language}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center border-4 border-white/20 shadow-2xl">
                        <span className="text-4xl font-black">{netWpm}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">WPM</span>
                    </div>
                    <div className={cn(
                        "mt-4 px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg",
                        isQualified ? "bg-white text-emerald-600" : "bg-white text-rose-600"
                    )}>
                        {isQualified ? "QUALIFIED" : "NOT QUALIFIED"}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passage Title</p>
                    <p className="font-black text-slate-900 truncate">{result.examId?.passageId?.title || "N/A"}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Duration</p>
                    <p className="font-black text-slate-900">{timeDurationMins}:00 Min</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Consumed</p>
                    <p className="font-black text-indigo-600">{formatTime(result.timeTaken || 0)}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Master Keys</p>
                    <p className="font-black text-slate-900">{totalKeystrokesGiven}</p>
                </div>
            </div>

            <div className="space-y-10">
                <div className="flex flex-wrap gap-6 print:hidden">
                    <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-pointer hover:border-emerald-200 transition-colors">
                        <input type="checkbox" className="sr-only peer" checked={errorFormulaOn} onChange={() => setErrorFormulaOn(!errorFormulaOn)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="font-black text-xs text-slate-600 uppercase tracking-widest">Keystroke Formula</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-pointer hover:border-indigo-200 transition-colors">
                        <input type="checkbox" className="sr-only peer" checked={detailedComparison} onChange={() => setDetailedComparison(!detailedComparison)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="font-black text-xs text-slate-600 uppercase tracking-widest">Detailed Compare</span>
                    </label>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Gross Progress" value={`${keystrokesTyped} / ${wordsTyped}`} label="Keys / Words" icon={Keyboard} color="blue" />
                    <MetricCard title="Critical Errors" value={fullMistakes} label="Full Mistakes" icon={XCircle} color="rose" />
                    <MetricCard title="Minor Slips" value={halfMistakes} label="Half Mistakes" icon={Scissors} color="amber" />
                    <MetricCard title="Total Errors" value={totalWrongWords} label="Wrong Words" icon={AlertCircle} color="rose" />
                    <MetricCard title="Weighted Errors" value={netWrongWords.toFixed(2)} label="Formula Result" icon={Scissors} color="indigo" />
                    <MetricCard title="Net Accuracy" value={`${((netCorrectWords / (wordsTyped || 1)) * 100).toFixed(1)}%`} label="Precision" icon={Target} color="emerald" />
                    <MetricCard title="Corrections" value={result.backspaces || 0} label="Backspaces Used" icon={ArrowLeft} color="slate" />
                    <MetricCard title="Final Speed" value={netWpm} label="WPM (Net)" icon={Timer} color="emerald" highlight />
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-8 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                          Calculation Logic {(isUPSSSC || isAHC || isUPPolice) && `(${isAHC ? "AHC" : isUPPolice ? "UP Police ASI/CO" : "Junior Assistant"} Standard)`}
                        </p>
                        <p className="text-sm font-bold text-indigo-900 leading-relaxed">
                            {isUPPolice 
                                ? `UP Police Formula: Net Speed = [ Total Words Typed (${wordsTyped}) - Wrong Words (${totalWrongWords}) ] / Time (${timeTakenMins.toFixed(1)} min)`
                                : (isUPSSSC || isAHC)
                                    ? `${isAHC ? "AHC" : "UPSSSC"} Formula: Net Speed = [ (Total Keystrokes (${keystrokesTyped}) / 5) - Wrong Words (${totalWrongWords}) ] / Time (${timeTakenMins.toFixed(1)} min)`
                                    : (keystrokesTyped < minKeystrokes 
                                        ? `Notice: Low volume attempt (< ${minKeystrokes} keys). Net Correct Words = Total Typed (${wordsTyped}) - Weighted Errors (${netWrongWords.toFixed(1)})`
                                        : `Standard Calculation: Net Correct Words = Total Typed (${wordsTyped}) - [ Full Mistakes (${fullMistakes}) + (Half Mistakes (${halfMistakes}) × 0.5) ]`)
                            }
                        </p>
                    </div>
                </div>

                {detailedComparison && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900">Transcript Analysis</h3>
                            <div className="h-[2px] flex-1 bg-slate-100" />
                        </div>

                        {hasPassageData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Passage</span>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase">Original</Badge>
                                    </div>
                                    <div className="p-8 bg-slate-900 rounded-[2rem] shadow-xl text-slate-300 min-h-[300px]">
                                        <p className="text-lg leading-loose opacity-60" style={{ fontFamily: getFontFamily() }}>
                                            {originalWords.map((word: string, i: number) => (
                                                <span key={i}>{word} </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Performance</span>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase border-emerald-200 text-emerald-600">Typed</Badge>
                                    </div>
                                    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-xl text-slate-800 min-h-[300px]">
                                        <p className="text-lg leading-loose" style={{ fontFamily: getFontFamily() }}>
                                            {submittedWords.map((word: string, i: number) => {
                                                const isCorrect = word === originalWords[i];
                                                return (
                                                    <span 
                                                        key={i} 
                                                        className={cn(
                                                            "transition-colors",
                                                            isCorrect ? "text-slate-900" : "text-rose-500 font-bold bg-rose-50 px-1 rounded ring-1 ring-rose-100 decoration-rose-300 underline underline-offset-4"
                                                        )}
                                                    >
                                                        {word}{' '}
                                                    </span>
                                                );
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Passage Analysis Unavailable</p>
                                <p className="text-slate-500 text-sm mt-2 font-medium">The original master text for this exam is no longer available in the system.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    label: string;
    icon: any;
    color: 'blue' | 'rose' | 'amber' | 'indigo' | 'emerald' | 'slate';
    highlight?: boolean;
}

function MetricCard({ title, value, label, icon: Icon, color, highlight }: MetricCardProps) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };

    return (
        <div className={cn(
            "p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 bg-white",
            highlight ? "border-emerald-200 bg-emerald-50/20 shadow-emerald-100 shadow-xl" : "border-slate-100"
        )}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{label}</p>
        </div>
    );
}
