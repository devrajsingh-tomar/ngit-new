"use client";

import { useEffect, useState, use } from "react";
import { 
    ChevronLeft, 
    Trophy, 
    Clock, 
    Target, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    TrendingUp,
    Timer,
    Zap,
    BookOpen,
    HelpCircle,
    BarChart3,
    Calendar,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getDetailedResult } from "@/app/actions/mockTestResults";
import { sanitizeHtml } from "@/lib/sanitizer";

export default function ResultAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<{result: any, answers: any[]} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResult();
    }, [id]);

    const loadResult = async () => {
        setLoading(true);
        const res = await getDetailedResult(id);
        if (res.success) {
            setData({ result: res.result, answers: res.answers });
        } else {
            toast.error(res.error || "Failed to load result analysis");
        }
        setLoading(false);
    };

    if (loading) {
        // ... loading state unchanged ...
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Processing Performance Data...</p>
            </div>
        );
    }

    if (!data || !data.result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-900">Analysis Unavailable</h2>
                <Link href="/student/results" className="mt-4">
                    <Button variant="outline">Back to History</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link href="/student/results">
                        <Button variant="ghost" className="rounded-xl gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors mb-4">
                            <ChevronLeft className="w-5 h-5" /> Back to History
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{data.result.mockTestId?.title} Analysis</h1>
                    <p className="text-slate-500 font-medium text-lg mt-2 italic flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Attempted on {new Date(data.result.attemptDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    {/* Candidate Info Card */}
                    <div className="hidden lg:flex items-center gap-4 bg-white p-3 pr-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner">
                            {data.result.studentId?.image ? (
                                <Image src={data.result.studentId.image} alt="Candidate" fill className="object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Candidate</p>
                            <p className="text-base font-black text-slate-900 leading-none">{data.result.studentId?.name || "Student"}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl shadow-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Rank</p>
                                <p className="text-3xl font-black">#{data.result.rank || "--"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<Target className="w-5 h-5 text-indigo-500" />} 
                    label="Score Analysis" 
                    value={`${data.result.score}`} 
                    subValue={`out of ${data.result.totalMarks}`}
                    color="bg-indigo-50"
                />
                <StatCard 
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} 
                    label="Accuracy Rate" 
                    value={`${Math.round(data.result.analysis?.accuracy || 0)}%`} 
                    subValue="Based on attempts"
                    color="bg-emerald-50"
                />
                <StatCard 
                    icon={<Timer className="w-5 h-5 text-amber-500" />} 
                    label="Total Time" 
                    value={`${Math.floor(data.result.analysis?.timeTaken / 60)}m ${data.result.analysis?.timeTaken % 60}s`} 
                    subValue="Avg: 45s / Question"
                    color="bg-amber-50"
                />
                <StatCard 
                    icon={<Zap className="w-5 h-5 text-rose-500" />} 
                    label="Percentile" 
                    value={`${data.result.percentile}%`} 
                    subValue="Better than others"
                    color="bg-rose-50"
                />
            </div>

            {/* Question Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-primary" />
                                Responses Distribution
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <BreakedownRow label="Correct Answers" count={data.result.analysis?.correctAnswers} color="bg-emerald-500" />
                            <BreakedownRow label="Incorrect Answers" count={data.result.analysis?.incorrectAnswers} color="bg-rose-500" />
                            <BreakedownRow label="Unattempted" count={data.result.analysis?.unattemptedQuestions} color="bg-slate-200" />
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500" 
                                    style={{ width: `${(data.result.analysis?.correctAnswers / data.result.totalQuestions) * 100}%` }} 
                                />
                                <div 
                                    className="h-full bg-rose-500" 
                                    style={{ width: `${(data.result.analysis?.incorrectAnswers / data.result.totalQuestions) * 100}%` }} 
                                />
                                <div 
                                    className="h-full bg-slate-200" 
                                    style={{ width: `${(data.result.analysis?.unattemptedQuestions / data.result.totalQuestions) * 100}%` }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                         <BarChart3 className="w-10 h-10 text-indigo-300 mb-2" />
                         <h3 className="text-xl font-black">Want to Improve?</h3>
                         <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                            Review each incorrect answer to understand the concepts you missed. Our detailed explanations help you master the topic.
                         </p>
                         <Button className="w-full h-14 rounded-2xl bg-white text-indigo-600 font-black hover:bg-indigo-50">
                            Re-learn Concepts
                         </Button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <BookOpen className="w-7 h-7 text-primary" />
                            Question Wise Analysis
                        </h3>

                        <div className="space-y-6">
                            {data?.answers?.map((ans: any, i: number) => {
                                const q = ans.questionId;
                                const isCorrect = ans.evaluation?.isCorrect;
                                const marks = ans.evaluation?.marksAwarded;

                                return (
                                    <div key={i} className={`p-8 rounded-[2rem] border-2 space-y-6 ${isCorrect ? "border-emerald-50 bg-emerald-50/20" : "border-rose-50 bg-rose-50/20"}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                                    {i + 1}
                                                </div>
                                                <Badge className={`${isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"} border-none font-black text-[10px] uppercase px-3`}>
                                                    {isCorrect ? "Correct" : "Incorrect"}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${marks > 0 ? "text-emerald-600" : "text-rose-600"}`}>{marks > 0 ? `+${marks}` : marks} Marks</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-700 leading-relaxed text-lg prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(q?.content?.en || "") }} />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                            <div className={`p-4 rounded-xl border-2 ${isCorrect ? "border-emerald-200 bg-white" : "border-rose-200 bg-white"}`}>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Response</p>
                                                <span className="font-bold text-slate-800">
                                                    {q.type === "NUMERIC" ? ans.numericAnswer : (ans.selectedOptionIds?.[0] ? "Selected an option" : "N/A")}
                                                </span>
                                            </div>
                                            <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct Answer</p>
                                                <span className="font-bold text-indigo-600">
                                                    {q.type === "NUMERIC" ? q.numericAnswer : "Refer to Solution"}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {q.explanation?.en && (
                                            <div className="bg-white/80 p-6 rounded-2xl border border-slate-50 italic text-sm text-slate-600">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 not-italic">Scholar Explanation</p>
                                                {q.explanation.en}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subValue, color }: any) {
    return (
        <div className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 ${color}`}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">{subValue}</p>
            </div>
        </div>
    );
}

function BreakedownRow({ label, count, color }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm font-bold text-slate-600">{label}</span>
            </div>
            <span className="text-lg font-black text-slate-900">{count}</span>
        </div>
    );
}
