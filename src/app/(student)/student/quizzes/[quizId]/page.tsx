"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { toast } from "sonner";
import { getQuiz, submitQuiz } from "@/app/actions/student/quizzes";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

import ExamLayout from "@/components/exams/engine/ExamLayout";
import QuestionRenderer from "@/components/exams/engine/QuestionRenderer";
import { ExamState } from "@/components/exams/engine/types";

export default function StudentQuizLivePage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const containerRef = useRef<HTMLDivElement>(null);

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [language, setLanguage] = useState<"en" | "hi">("en");

    // Unified State
    const [state, setState] = useState<ExamState>({
        currentQuestionIndex: 0,
        answers: {},
        visited: [],
        attempted: [],
        flagged: [],
        timer: 0,
    });

    const [warnings, setWarnings] = useState(0);
    const lastWarnedRef = useRef(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            const res = await getQuiz({ quizId });
            if (res.success) {
                setQuiz(res.data);
                setState(prev => ({
                    ...prev,
                    timer: (res.data.settings?.timeLimit || 30) * 60,
                    visited: [res.data.questions?.[0]?._id].filter(Boolean)
                }));
            } else {
                setError(res.error || "Failed to load quiz");
                toast.error(res.error || "Failed to load quiz");
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [quizId]);

    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;

        const confirmSubmit = window.confirm("Are you sure you want to submit the exam? You will not be able to change your answers after submission.");
        if (!confirmSubmit) return;

        setIsSubmitting(true);
        const timeLimitSecs = (quiz?.settings?.timeLimit || 30) * 60;
        const timeTaken = timeLimitSecs - state.timer;

        const formattedAnswers: Record<string, any> = {};
        Object.entries(state.answers).forEach(([qId, data]: [string, any]) => {
            formattedAnswers[qId] = data.value;
        });

        try {
            const res = await submitQuiz({ quizId, answers: formattedAnswers, timeTaken });
            if (res.success) {
                toast.success("Exam submitted successfully!");
                if (document.fullscreenElement) {
                    document.exitFullscreen?.().catch(() => { });
                }
                // Redirect to results analysis page
                const analysisUrl = `/student/quizzes/${quizId}/analysis?attemptId=${res.data.attemptId}${courseId ? `&courseId=${courseId}` : ""}`;
                router.push(analysisUrl);
            } else {
                toast.error(res.error || "Failed to submit test");
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error("Something went wrong during submission");
            setIsSubmitting(false);
        }
    }, [isSubmitting, quiz, state.timer, state.answers, quizId, router]);

    // Timer logic
    useEffect(() => {
        if (!quiz || state.timer <= 0 || isSubmitting) return;
        const timerId = setInterval(() => {
            setState(prev => ({ ...prev, timer: prev.timer - 1 }));
        }, 1000);
        return () => clearInterval(timerId);
    }, [state.timer, isSubmitting, quiz]);

    // Auto-submit on timeout
    useEffect(() => {
        if (state.timer === 0 && quiz && !isSubmitting) {
            handleSubmit();
        }
    }, [state.timer, quiz, isSubmitting, handleSubmit]);

    // Anti-Cheat
    useEffect(() => {
        if (!quiz) return;

        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting) {
                setWarnings(w => w + 1);
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [quiz, isSubmitting]);

    useEffect(() => {
        if (!quiz) return;
        
        const isEntryScreen = quiz.security?.requireFullscreen && !isFullscreen;
        if (!quiz.security?.preventTabSwitch || isSubmitting || isEntryScreen) return;

        if (warnings >= 3 && lastWarnedRef.current < 3) {
            lastWarnedRef.current = 3;
            toast.error("Max tab switches reached. Auto-submitting exam.");
            handleSubmit();
        } else if (warnings > 0 && warnings < 3 && lastWarnedRef.current !== warnings) {
            lastWarnedRef.current = warnings;
            toast.warning(`Warning ${warnings}/3: Do not switch tabs!`);
        }
    }, [warnings, quiz, isSubmitting, isFullscreen, handleSubmit]);

    const requestFullscreen = async () => {
        try {
            await containerRef.current?.requestFullscreen();
        } catch (err) {
            toast.error("Fullscreen not supported or blocked");
        }
    };

    const handleAnswerChange = (value: any) => {
        const question = quiz.questions[state.currentQuestionIndex];
        setState(prev => {
            const newAnswers = {
                ...prev.answers,
                [question._id]: {
                    type: question.type,
                    value
                }
            };
            
            const newAttempted = value !== undefined && value !== null && value !== "" 
                ? Array.from(new Set([...prev.attempted, question._id]))
                : prev.attempted.filter(id => id !== question._id);

            return {
                ...prev,
                answers: newAnswers,
                attempted: newAttempted
            };
        });
    };

    const navigateTo = (index: number) => {
        const question = quiz.questions[index];
        setState(prev => ({
            ...prev,
            currentQuestionIndex: index,
            visited: Array.from(new Set([...prev.visited, question._id]))
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Initializing Secure Engine...</p>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center animate-in fade-in duration-500">
                <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
                <h2 className="text-3xl font-black text-slate-900 mb-2">Access Issue</h2>
                <p className="max-w-md text-slate-500 font-medium mb-8">
                    {error || "We couldn't locate this specific mock test."}
                </p>
                <Button onClick={() => router.back()} variant="outline" className="h-12 px-8 rounded-xl font-bold">
                    Go Back
                </Button>
            </div>
        );
    }

    if (quiz.security?.requireFullscreen && !isFullscreen) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8 text-center" ref={containerRef}>
                <Maximize className="w-20 h-20 text-primary mb-6 animate-pulse" />
                <h2 className="text-3xl font-black mb-4">Fullscreen Required</h2>
                <p className="text-slate-400 max-w-lg mx-auto font-medium mb-8">
                    You must be in full-screen mode to take this exam.
                </p>
                <Button size="lg" className="h-14 px-10 text-lg font-black" onClick={requestFullscreen}>
                    Enter Fullscreen & Start Exam
                </Button>
            </div>
        );
    }

    const currentQuestion = quiz.questions[state.currentQuestionIndex];

    return (
        <div ref={containerRef} className="select-none h-full w-full fixed inset-0 overflow-hidden bg-white">
            <ExamLayout
                exam={quiz}
                user={{ 
                    name: session?.user?.name || "Student", 
                    loginId: session?.user?.id?.substring(0, 8).toUpperCase() || "A13DE8BF",
                    image: session?.user?.image
                }}
                currentQuestionIndex={state.currentQuestionIndex}
                totalQuestions={quiz.questions.length}
                timeLeft={state.timer}
                language={language}
                onLanguageChange={setLanguage}
                onQuestionSelect={navigateTo}
                onFinish={handleSubmit}
                answers={state.answers}
                flagged={state.flagged}
            >
                <QuestionRenderer
                    question={currentQuestion}
                    value={state.answers[currentQuestion._id]?.value}
                    onChange={handleAnswerChange}
                    language={language}
                    userName="Student"
                    isLastQuestion={state.currentQuestionIndex === quiz.questions.length - 1}
                    onSave={() => {
                        if (state.currentQuestionIndex < quiz.questions.length - 1) {
                            navigateTo(state.currentQuestionIndex + 1);
                        } else {
                            handleSubmit();
                        }
                    }}
                    onReset={() => {
                        setState(prev => {
                            const newAnswers = { ...prev.answers };
                            delete newAnswers[currentQuestion._id];
                            return {
                                ...prev,
                                answers: newAnswers,
                                attempted: prev.attempted.filter(id => id !== currentQuestion._id)
                            };
                        });
                    }}
                    onMark={() => {
                        setState(prev => {
                            const isCurrentlyFlagged = prev.flagged.includes(state.currentQuestionIndex);
                            const newFlagged = isCurrentlyFlagged
                                ? prev.flagged.filter(idx => idx !== state.currentQuestionIndex)
                                : [...prev.flagged, state.currentQuestionIndex];
                            
                            return {
                                ...prev,
                                flagged: newFlagged
                            };
                        });
                        
                        if (state.currentQuestionIndex < quiz.questions.length - 1) {
                            navigateTo(state.currentQuestionIndex + 1);
                        }
                    }}
                />
            </ExamLayout>

            {isSubmitting && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="font-black text-slate-900 uppercase tracking-widest">Submitting Your Response...</p>
                </div>
            )}
        </div>
    );
}
