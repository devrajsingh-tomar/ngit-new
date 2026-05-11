"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    CheckCircle2,
    XCircle,
    PlayCircle,
    BarChart3,
    ArrowLeft
} from "lucide-react";
import { getQuizAnalysis } from "@/app/actions/student/quizzes";
import Link from "next/link";
import { toast } from "sonner";

export default function QuizAnalysisPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attemptId");
    const courseId = searchParams.get("courseId");

    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            const res = await getQuizAnalysis({ 
                attemptId: attemptId || undefined, 
                quizId: !attemptId ? quizId : undefined 
            });
            if (res.success) {
                setAnalysis(res.data);
            } else {
                toast.error(res.error || "Failed to load analysis");
            }
            setLoading(false);
        };
        fetchAnalysis();
    }, [attemptId, quizId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900">Analysis Not Found</h2>
                <Link href="/student/quizzes">
                    <Button className="mt-4">Back to Quizzes</Button>
                </Link>
            </div>
        );
    }

    const { quizId: quiz, totalScore: score, totalMarks, answers, isPassed } = analysis;
    const accuracy = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const timeTaken = analysis.endTime ? (new Date(analysis.endTime).getTime() - new Date(analysis.startTime).getTime()) / 1000 : 0;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                <Link href="/student/quizzes" className="inline-flex items-center text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Mock Tests
                </Link>

                {/* Score Card */}
                <div className="bg-white rounded-[4rem] border-8 border-slate-50 shadow-2xl p-12 text-center relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${isPassed ? 'bg-emerald-50' : 'bg-red-50'}`} />

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 ${isPassed ? 'bg-emerald-100 text-emerald-600 border-emerald-50' : 'bg-red-100 text-red-600 border-red-50'}`}>
                        {isPassed ? <ShieldCheck className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>

                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{isPassed ? "Excellent Job!" : "Keep Practicing!"}</h1>
                        <p className="text-slate-500 mt-2 font-medium">{quiz.title}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 py-8 mt-8 border-t border-slate-100">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Score</p>
                            <p className="text-4xl font-black text-slate-900">{score}/{totalMarks}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                            <p className={`text-4xl font-black ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>{accuracy}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Time</p>
                            <p className="text-4xl font-black text-slate-900">{Math.round(timeTaken / 60)}m</p>
                        </div>
                    </div>
                </div>

                {/* Question Analysis */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-primary" /> Detailed Analysis
                    </h2>

                    {quiz.questions.map((question: any, idx: number) => {
                        const userAnswer = (answers as any[]).find((a: any) => a.questionId === question._id);
                        const isCorrect = userAnswer?.evaluation?.isCorrect;

                        return (
                            <div key={question._id} className={`bg-white rounded-[2rem] p-8 border-2 ${isCorrect ? 'border-emerald-100' : 'border-red-100'} shadow-sm`}>
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-lg font-bold text-slate-900">{question.content?.en}</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {question.options.map((option: any, optIdx: number) => {
                                                const isSelected = userAnswer?.selectedOptionIds?.includes(option._id);
                                                const isAnswer = option.isCorrect;

                                                let style = "bg-slate-50 border-slate-100 text-slate-500";
                                                if (isAnswer) style = "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold";
                                                else if (isSelected && !isCorrect) style = "bg-red-50 border-red-200 text-red-700 font-bold";

                                                return (
                                                    <div key={optIdx} className={`p-4 rounded-xl border flex items-center justify-between ${style}`}>
                                                        <span>{option.text?.en}</span>
                                                        {isAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {question.explanation?.en && (
                                            <div className="mt-4 bg-primary/5 p-4 rounded-xl text-sm text-slate-600">
                                                <span className="font-bold text-primary block mb-1">Explanation:</span>
                                                {question.explanation.en}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                    {courseId ? (
                        <Link href={`/student/courses/${courseId}`}>
                            <Button size="lg" className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2">
                                <ArrowLeft className="w-5 h-5" /> Back to Course
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/student/quizzes">
                            <Button size="lg" className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20">
                                Take Another Test
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
