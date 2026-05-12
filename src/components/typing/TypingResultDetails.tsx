"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
    Keyboard, 
    XCircle, 
    Scissors, 
    AlertCircle, 
    Timer, 
    Download, 
    Target, 
    ArrowLeft, 
    Calendar, 
    Globe, 
    ShieldCheck, 
    User, 
    BookOpen, 
    CheckCircle2, 
    TrendingUp, 
    FileText, 
    ArrowRight, 
    Clock,
    Zap,
    Trophy
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const passageContent = result.examId?.passageId?.content || "";
  const originalWords = passageContent ? passageContent.trim().split(/\s+/) : [];
  const submittedWords = result.submittedText?.trim().split(/\s+/) || [];
  
  const totalStrokes = result.submittedText?.length || 0;
  let correctStrokes = 0;
  let wrongStrokes = 0;
  let correctWords = 0;
  let wrongWords = 0;

  submittedWords.forEach((word: string, idx: number) => {
    const original = originalWords[idx];
    if (!original) {
      wrongStrokes += word.length + 1;
      wrongWords++;
      return;
    }

    if (word === original) {
      correctWords++;
      correctStrokes += word.length + 1;
    } else {
      wrongWords++;
      const mLen = Math.min(word.length, original.length);
      for (let i = 0; i < mLen; i++) {
        if (word[i] === original[i]) correctStrokes++;
        else wrongStrokes++;
      }
      wrongStrokes += Math.abs(word.length - original.length);
      wrongStrokes++;
    }
  });

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
  const isUPSSSC = result.examId?.examMode === "UPSSSC";
  const isAHC = result.examId?.examMode === "AHC";
  const isUPPolice = result.examId?.examMode === "UP_POLICE";
  
  const timeTakenMins = (result.timeTaken || 0) / 60;
  const timeDurationMins = result.examId?.duration || 10;
  
  const grossWpm = timeTakenMins > 0 ? (totalStrokes / 5 / timeTakenMins).toFixed(2) : "0.00";
  const netWpm = timeTakenMins > 0 ? (correctStrokes / 5 / timeTakenMins).toFixed(2) : "0.00";
  
  const lang = result.examId?.language?.toLowerCase() || "";
  const isHindi = lang.includes("hindi") || lang.includes("mangal") || lang.includes("kruti");
  const passingWpm = isHindi ? 25 : (isUPPolice ? 35 : 30);

  const accuracy = totalStrokes > 0 ? ((correctStrokes / totalStrokes) * 100).toFixed(2) : "0.00";
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
    <div className="min-h-screen bg-[#f1f5f9] py-8 md:py-12 print:py-0 print:bg-white font-sans">
      <div className="max-w-6xl mx-auto px-4 print:px-0">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Examination <span className="text-primary">Analysis</span></h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Official Result Generation System</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-black shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95"
            >
                <Download className="w-4 h-4" /> Export Report
            </button>
            <Link href="/student/typing">
                <Button className="h-12 px-8 rounded-2xl gap-3">
                    View All Results <ArrowRight className="w-4 h-4" />
                </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className={cn(
            "p-12 text-white relative overflow-hidden",
            isQualified ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-rose-600 to-red-700"
          )}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-64 -mt-64 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-white/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative w-32 h-32 rounded-[2.5rem] bg-white border-4 border-white/30 shadow-2xl overflow-hidden shrink-0">
                            {result.userId?.image ? (
                                <img src={result.userId.image} alt="Candidate" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <span className="text-4xl font-black text-slate-300">{result.userId?.name?.[0] || "S"}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5" /> Candidate Official Scorecard
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            {result.userId?.name || "Student Name"}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl text-xs font-bold">
                                <Calendar className="w-4 h-4 text-white/60" /> {format(new Date(result.createdAt), "PPP")}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl text-xs font-bold">
                                <Globe className="w-4 h-4 text-white/60" /> {result.examId?.language || "English"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl min-w-[280px]">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                    strokeDasharray={364} strokeDashoffset={364 - (364 * Math.min(100, parseFloat(netWpm)) / 100)} 
                                    className="text-white transition-all duration-1000 ease-out" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black">{netWpm}</span>
                            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Net WPM</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-full py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-[0.3em] text-center shadow-lg transition-transform hover:scale-105",
                        isQualified ? "bg-white text-emerald-600" : "bg-white text-rose-600"
                    )}>
                        {isQualified ? "Qualified" : "Not Qualified"}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-10 md:p-16 space-y-16">
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 italic">Exam <span className="text-primary">Scorecard</span></h3>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm bg-white">
                    <MetricRow label="Candidate Name" value={result.userId?.name || "N/A"} icon={User} />
                    <MetricRow label="Examination" value={result.examId?.title || "N/A"} icon={Keyboard} />
                    <MetricRow label="Test Date" value={format(new Date(result.createdAt), "dd/MM/yyyy")} icon={Calendar} />
                    <MetricRow label="Passage Name" value={result.examId?.passageId?.title || "N/A"} icon={FileText} />
                    <MetricRow label="Total Time" value={`${timeDurationMins}:00 Min`} icon={Timer} />
                    <MetricRow label="Time Taken" value={formatTime(result.timeTaken || 0)} icon={Clock} color="indigo" />
                    
                    <MetricRow label="Total Words (Passage)" value={originalWords.length} icon={BookOpen} />
                    <MetricRow label="Typed Words" value={submittedWords.length} icon={ArrowRight} />
                    <MetricRow label="Correct Words" value={correctWords} icon={CheckCircle2} color="emerald" />
                    <MetricRow label="Wrong Words" value={wrongWords} icon={XCircle} color="rose" />
                    
                    <MetricRow label="Total Strokes" value={totalStrokes} icon={Zap} />
                    <MetricRow label="Correct Strokes" value={correctStrokes} icon={CheckCircle2} color="emerald" />
                    <MetricRow label="Wrong Strokes" value={wrongStrokes} icon={XCircle} color="rose" />

                    <MetricRow label="Gross Speed" value={`${grossWpm} WPM`} icon={TrendingUp} />
                    <MetricRow label="Accuracy" value={`${accuracy}%`} icon={Target} color="amber" />
                    <MetricRow label="Net Speed" value={`${netWpm} WPM`} icon={Trophy} color="emerald" highlight />
                    
                    <MetricRow label="Backspaces" value={result.backspaces || 0} icon={ArrowLeft} />
                    <MetricRow label="Full Mistakes" value={fullMistakes} icon={AlertCircle} color="rose" />
                    <MetricRow label="Half Mistakes" value={halfMistakes} icon={Scissors} color="amber" />
                </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 shrink-0">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 leading-none">
                      Calculation Parameters {(isUPSSSC || isAHC || isUPPolice) && `(${isAHC ? "AHC" : isUPPolice ? "UP Police ASI/CO" : "UPSSSC / Junior Assistant"} Standard)`}
                    </p>
                    <p className="text-lg font-bold text-slate-800 leading-snug">
                        {isUPPolice 
                            ? "Net Speed is calculated by taking (Total Correct Words / Time Taken). For UP Police, a word is counted after every space typed."
                            : (isUPSSSC || isAHC)
                                ? "Net Speed is calculated as [(Total Keystrokes / 5) - Full Mistakes] divided by Time. One word is considered equivalent to 5 keystrokes."
                                : "Standard Calculation: Net Speed = [Words Typed - Weighted Errors] / Time. Errors are weighted as 1.0 for Full Mistakes and 0.5 for Half Mistakes."
                        }
                    </p>
                    <div className="flex gap-4 pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-rose-500" /> Full Mistake: {fullMistakes}</div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-amber-500" /> Half Mistake: {halfMistakes}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 italic">Typing <span className="text-primary">Transcript</span></h3>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Original Text</span>
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                        </div>
                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 min-h-[400px]">
                            <p className="text-xl leading-[2.5] opacity-60 italic" style={{ fontFamily: getFontFamily() }}>
                                {originalWords.map((word: string, i: number) => (
                                    <span key={i}>{word} </span>
                                ))}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-6">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Your Transcript</span>
                            <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <div className="p-10 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/40 min-h-[400px]">
                            <p className="text-xl leading-[2.5] font-semibold" style={{ fontFamily: getFontFamily() }}>
                                {submittedWords.map((word: string, i: number) => {
                                    const isCorrect = word === originalWords[i];
                                    return (
                                        <span 
                                            key={i} 
                                            className={cn(
                                                "transition-colors",
                                                isCorrect ? "text-slate-900" : "text-rose-500 font-black bg-rose-50 px-1 rounded-lg ring-1 ring-rose-100 underline decoration-rose-300 underline-offset-[12px] decoration-4"
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
            </div>
          </div>
          
          <div className="bg-slate-900 p-8 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Digitally Generated Certificate • NGIT Study Zone</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, icon: Icon, color, highlight }: any) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50/50",
        rose: "text-rose-600 bg-rose-50/50",
        indigo: "text-indigo-600 bg-indigo-50/50",
        amber: "text-amber-600 bg-amber-50/50",
        default: "text-slate-500 bg-slate-50/30"
    };

    return (
        <div className={cn(
            "flex flex-col p-6 border-b border-r border-slate-100 group transition-all",
            highlight ? "bg-slate-950 text-white border-slate-800" : "hover:bg-slate-50/50"
        )}>
            <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                    highlight ? "bg-white/10 text-primary" : (colorClasses[color || 'default'])
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    highlight ? "text-slate-500" : "text-slate-400"
                )}>{label}</p>
            </div>
            <p className={cn(
                "text-xl font-black tracking-tight",
                highlight ? "text-white" : "text-slate-900"
            )}>{value}</p>
        </div>
    );
}
