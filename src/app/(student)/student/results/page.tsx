"use client";

import { useEffect, useState } from "react";
import { getStudentResults } from "@/app/actions/mockTestResults";
import { Clock, Trophy, Target, TrendingUp, Calendar, ChevronRight, CheckCircle2, XCircle, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function StudentResultsPage() {
    const [results, setResults] = useState<any[]>([]);
    const [typingResults, setTypingResults] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"mock" | "typing">("mock");

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            // Load Mock Test Results
            const res = await getStudentResults();
            if (res.success) {
                setResults(res.results);
                setAttempts(res.attempts || []);
            } else {
                toast.error(res.error || "Failed to load mock results");
            }

            // Load Typing Results
            const typingRes = await fetch("/api/typing/results");
            const typingData = await typingRes.json();
            if (typingRes.ok) {
                setTypingResults(typingData);
            }
        } catch (error) {
            console.error("Failed to load results", error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Results</h1>
                    <p className="text-slate-500 mt-1 font-medium">Track your performance across mock tests</p>
                </div>
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <Trophy className="w-16 h-16 text-slate-200 mb-4" />
                    <h2 className="text-xl font-black text-slate-900">No Results Found</h2>
                    <p className="text-slate-500 max-w-sm mt-2 font-medium text-sm">
                        You haven't received any results yet. Complete mock tests to see your scoring and rankings here.
                    </p>
                    <Link href="/student/quizzes" className="mt-8">
                        <Button className="rounded-xl font-bold gap-2">
                            Take a Test <ChevronRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Performance</h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Detailed breakdown of your mock test attempts and rankings.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("mock")}
                        className={`rounded-xl px-6 font-bold ${activeTab === "mock" ? "bg-white shadow-sm" : "text-slate-400"}`}
                    >
                        Mock Tests
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => {
                            setActiveTab("typing");
                            loadResults();
                        }}
                        className={`rounded-xl px-6 font-bold ${activeTab === "typing" ? "bg-white shadow-sm" : "text-slate-400"}`}
                    >
                        Typing Tests
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {activeTab === "mock" ? (
                    results.map((res) => {
                        const isPass = res.score >= (res.totalMarks * 0.4); 
                        const timeTakenMinutes = Math.floor((res.analysis?.timeTaken || 0) / 60);
                        const timeTakenSeconds = (res.analysis?.timeTaken || 0) % 60;
                        
                        return (
                            <div key={res._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col lg:flex-row gap-10 items-center">
                                {/* Left: Status & Main Title */}
                                <div className="flex-1 w-full lg:w-auto">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className={`${isPass ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"} border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                                            {isPass ? "Passed" : "Under Target"}
                                        </Badge>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" /> {new Date(res.attemptDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                        {res.mockTestId?.title || "Mock Assessment"}
                                    </h3>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{res.course || "IIT-JEE Foundation"}</p>
                                </div>

                                {/* Middle: Key Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto shrink-0">
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Target className="w-3 h-3" /> Raw Score
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-slate-900">{res.score}</span>
                                            <span className="text-xs font-bold text-slate-400">/{res.totalMarks}</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 min-w-[140px]">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Trophy className="w-3 h-3" /> All India Rank
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-blue-600">#{res.rank || "-"}</span>
                                            <span className="text-[10px] font-black text-blue-400 bg-blue-100 px-1.5 rounded-md self-center">{res.percentile}%ile</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Time Used
                                        </p>
                                        <div className="flex items-baseline">
                                            <span className="text-2xl font-black text-slate-900">{timeTakenMinutes}m</span>
                                            <span className="text-2xl font-black text-slate-900 ml-1">{timeTakenSeconds}s</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <TrendingUp className="w-3 h-3" /> Accuracy
                                        </p>
                                        <div className="flex items-baseline text-slate-900">
                                            <span className="text-2xl font-black">{Math.round(res.analysis?.accuracy || 0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Action */}
                                <div className="w-full lg:w-auto">
                                    <Link href={`/student/results/${res._id}`}>
                                        <Button className="w-full lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-slate-900 hover:bg-primary text-white p-0 group-hover:scale-110 transition-all flex items-center justify-center font-bold">
                                            <span className="lg:hidden mr-2">View Analysis</span>
                                            <ChevronRight className="w-6 h-6" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    typingResults.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            <Keyboard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">No Typing Records</h3>
                            <p className="text-slate-500 text-sm">Start your first typing exam to see results here.</p>
                        </div>
                    ) : (
                        typingResults.map((res) => {
                            const lang = res.examId?.language?.toLowerCase() || "";
                            const isHindi = lang.includes("hindi") || lang.includes("mangal") || lang.includes("kruti");
                            const passingWpm = isHindi ? 25 : 30;
                            const isQualified = (res.wpm || 0) >= passingWpm;
                            return (
                                <div key={res._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col lg:flex-row gap-10 items-center">
                                    <div className="flex-1 w-full lg:w-auto">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Badge className={`${isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"} border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                                                {isQualified ? "Qualified" : "Not Qualified"}
                                            </Badge>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(res.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                            {res.examId?.title || "Typing Exam"}
                                        </h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            {res.examId?.language || "English"} • {res.examId?.passageId?.title || "Standard Passage"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto shrink-0">
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Net Speed</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-slate-900">{res.wpm}</span>
                                                <span className="text-xs font-bold text-slate-400">WPM</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Accuracy</p>
                                            <div className="flex items-baseline text-slate-900">
                                                <span className="text-2xl font-black">{Math.round(res.accuracy || 0)}%</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Errors</p>
                                            <div className="flex items-baseline text-slate-900">
                                                <span className="text-2xl font-black">{res.errorCount || 0}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[140px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Backspaces</p>
                                            <div className="flex items-baseline text-slate-900">
                                                <span className="text-2xl font-black">{res.backspaces || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-auto">
                                        <Link href={`/typing/results/${res._id}`}>
                                            <Button className="w-full lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-slate-900 hover:bg-primary text-white p-0 group-hover:scale-110 transition-all flex items-center justify-center font-bold">
                                                <span className="lg:hidden mr-2">View Report</span>
                                                <ChevronRight className="w-6 h-6" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>

        </div>
    );
}
