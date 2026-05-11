"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { completeLesson } from "@/app/actions/enrollment";
import { getCourseDetails, getLesson } from "@/app/actions/courses";
import VideoPlayer from "@/components/student/VideoPlayer";
import {
    CheckCircle2, ChevronLeft, ChevronRight, FileText,
    Download, Trophy, ArrowRight, Loader2, BookOpen, Brain, Globe, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    type: "VIDEO" | "PDF" | "QUIZ" | "YOUTUBE_LIVE" | "YOUTUBE_RECORDED";
    contentUrl?: string;
    duration?: number;
    order: number;
    attachments?: { title: string; url: string; size?: string }[];
    videoId?: string;
    isLive?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    status?: "upcoming" | "live" | "completed";
    quizId?: string;
}

export default function LessonPage({
    params,
}: {
    params: Promise<{ courseId: string; lessonId: string }>;
}) {
    const router = useRouter();
    const [courseId, setCourseId] = useState("");
    const [lessonId, setLessonId] = useState("");

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [certificateId, setCertificateId] = useState<string | null>(null);

    // Resolve async params
    useEffect(() => {
        params.then(({ courseId: cid, lessonId: lid }) => {
            setCourseId(cid);
            setLessonId(lid);
        });
    }, [params]);

    // Load lesson + course data whenever ids change
    useEffect(() => {
        if (!courseId || !lessonId) return;
        setLoading(true);

        Promise.all([
            getLesson(lessonId),
            getCourseDetails(courseId),
        ]).then(([lessonRes, courseRes]) => {
            if (lessonRes.success && lessonRes.lesson) {
                setLesson(lessonRes.lesson as Lesson);
            }
            if (courseRes.success) {
                setAllLessons((courseRes.lessons as Lesson[]) ?? []);
                const done = courseRes.completedLessonIds ?? [];
                setCompletedIds(done);
                setIsCompleted(done.includes(lessonId));
                setProgress(courseRes.enrollment?.progress ?? 0);
            }
            setLoading(false);
        });
    }, [courseId, lessonId]);

    // Current index, prev, next
    const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    const isLastLesson = !nextLesson;

    const handleComplete = useCallback(async () => {
        if (isCompleted || completing) return;
        setCompleting(true);
        try {
            const res = await completeLesson(courseId, lessonId);
            if (res.success) {
                setIsCompleted(true);
                setCompletedIds((prev) => [...prev, lessonId]);
                setProgress(res.progress ?? 0);
                // Force server layout to re-render → sidebar picks up new completedLessons
                router.refresh();
                if (res.courseComplete) {
                    setCertificateId(res.certificateId ?? null);
                    toast.success("🎉 Course complete! Certificate issued!");
                    setShowCelebration(true);
                } else {
                    toast.success("Lesson marked as complete! ✅");
                }
            } else {
                toast.error(res.error || "Failed to mark complete");
            }
        } finally {
            setCompleting(false);
        }
    }, [courseId, lessonId, isCompleted, completing, isLastLesson, router]);

    const goToLesson = (lesson: Lesson) => {
        router.push(`/student/courses/${courseId}/lessons/${lesson._id}`);
    };

    const goNext = () => {
        if (nextLesson) goToLesson(nextLesson);
    };

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-medium">Loading lesson...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
                <BookOpen className="w-14 h-14 text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Lesson not found</h2>
                <Link href={`/student/courses/${courseId}`}>
                    <Button variant="outline" className="mt-6 rounded-xl">Back to Course</Button>
                </Link>
            </div>
        );
    }

    // ── Course Complete Celebration ──────────────────────────
    if (showCelebration) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-10 animate-in zoom-in-95 duration-500">
                <div className="relative w-28 h-28 mb-8">
                    <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-40" />
                    <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-200">
                        <Trophy className="w-14 h-14 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-3">🎉 Course Complete!</h1>
                <p className="text-slate-500 text-lg max-w-md leading-relaxed mb-4">
                    Congratulations! You&apos;ve completed all lessons. Your certificate has been issued and is ready to download.
                </p>
                {certificateId && (
                    <div className="mb-8 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Certificate successfully issued!
                    </div>
                )}
                <div className="flex gap-4 flex-wrap justify-center">
                    <Link href="/student/certificates">
                        <Button size="lg" className="h-14 px-8 rounded-2xl font-bold gap-2 shadow-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                            <Trophy className="w-5 h-5" /> View My Certificate
                        </Button>
                    </Link>
                    <Link href="/student/courses">
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl font-bold gap-2 border-2">
                            <BookOpen className="w-5 h-5" /> My Courses
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }


    // ── Lesson View ──────────────────────────────────────────
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-400">

            {/* Breadcrumb nav */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Link href="/student/courses" className="hover:text-primary transition-colors">My Courses</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/student/courses/${courseId}`} className="hover:text-primary transition-colors">Course</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-600 truncate max-w-[160px]">{lesson.title}</span>
            </div>

            {/* Step progress strip */}
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Lesson {currentIndex + 1} of {allLessons.length}
                    </span>
                    {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary">{progress}% complete</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Video / PDF / Quiz Content ── */}
            <div className="w-full">
                {lesson.type === "VIDEO" && (
                    <VideoPlayer
                        title={lesson.title}
                        url={lesson.contentUrl ?? ""}
                        type="VIDEO"
                        onComplete={handleComplete}
                    />
                )}
                {(lesson.type === "YOUTUBE_LIVE" || lesson.type === "YOUTUBE_RECORDED") && lesson.videoId && (
                    <div className="w-full aspect-video bg-black rounded-[1.75rem] overflow-hidden relative shadow-lg">
                        {lesson.type === "YOUTUBE_LIVE" && lesson.status === "upcoming" ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-8 text-center text-white">
                                <Globe className="w-16 h-16 text-red-500 mb-4 animate-pulse opacity-80" />
                                <h3 className="text-3xl font-black mb-2 tracking-tight">Live Stream Starting Soon</h3>
                                <p className="text-slate-400 max-w-md mb-8">
                                    This live session will begin shortly. Please wait until the instructor goes live, or check the scheduled time below.
                                </p>
                                <div className="bg-slate-800/80 px-8 py-5 rounded-2xl flex flex-col gap-1 items-center border border-slate-700 shadow-xl">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Scheduled for</span>
                                    <span className="text-xl font-black text-rose-400">
                                        {lesson.scheduledDate ? new Date(lesson.scheduledDate).toLocaleDateString() : ""} at {lesson.scheduledTime}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                src={`https://www.youtube.com/embed/${lesson.videoId}?autoplay=0`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                            ></iframe>
                        )}
                        {lesson.status === "live" && (
                            <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow-xl">
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                LIVE NOW
                            </div>
                        )}
                        {lesson.type === "YOUTUBE_RECORDED" && (
                            <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-sm border border-blue-400/30 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-xl">
                                RECORDED LECTURE
                            </div>
                        )}
                    </div>
                )}
                {lesson.type === "PDF" && (
                    <div className="w-full aspect-video bg-slate-50 rounded-[1.75rem] border border-slate-200 flex flex-col items-center justify-center gap-5 p-10">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-black text-slate-900 text-xl">{lesson.title}</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-sm">
                                This lesson contains a PDF document. Open it in a new tab to read.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="rounded-2xl font-bold gap-2 h-12 px-8"
                            onClick={() => window.open(lesson.contentUrl, "_blank")}
                        >
                            <FileText className="w-4 h-4" /> Open PDF Document
                        </Button>
                    </div>
                )}
                {lesson.type === "QUIZ" && (
                    <div className="w-full aspect-video bg-indigo-50 rounded-[1.75rem] border border-indigo-100 flex flex-col items-center justify-center gap-5 p-10">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-black text-slate-900 text-xl">{lesson.title}</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-sm">
                                Take this quiz to test your understanding of the material.
                            </p>
                        </div>
                        {lesson.quizId ? (
                            <Link href={`/student/quizzes/${lesson.quizId}?courseId=${courseId}`}>
                                <Button size="lg" className="rounded-2xl font-bold gap-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700">
                                    <Brain className="w-4 h-4" /> Start Quiz
                                </Button>
                            </Link>
                        ) : (
                            <p className="text-rose-500 text-xs font-black uppercase">No quiz attached to this lesson yet.</p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Lesson Info ── */}
            <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">{lesson.title}</h1>
                {lesson.description && (
                    <p className="text-slate-500 leading-relaxed text-base">{lesson.description}</p>
                )}
            </div>

            {/* ── Mark Complete + Navigation ── */}
            <div className="bg-white border border-slate-100 rounded-[1.75rem] p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Complete button */}
                    <Button
                        onClick={handleComplete}
                        disabled={isCompleted || completing}
                        size="lg"
                        className={cn(
                            "h-13 px-8 rounded-2xl font-bold gap-2 shadow-lg transition-all",
                            isCompleted
                                ? "bg-emerald-500 hover:bg-emerald-500 cursor-default shadow-emerald-200"
                                : "shadow-primary/20 hover:scale-[1.02] active:scale-95"
                        )}
                    >
                        {completing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Marking complete...</>
                        ) : isCompleted ? (
                            <><CheckCircle2 className="w-4 h-4" /> Lesson Completed!</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> Mark as Complete</>
                        )}
                    </Button>

                    {/* Prev / Next */}
                    <div className="flex items-center gap-3">
                        {prevLesson && (
                            <Button
                                variant="outline"
                                onClick={() => goToLesson(prevLesson)}
                                className="h-11 rounded-xl font-bold border-2 gap-2 hover:bg-slate-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                        )}
                        {nextLesson && (
                            <Button
                                onClick={() => {
                                    if (!isCompleted) {
                                        toast("Tip: Mark this lesson complete before moving on!", {
                                            action: { label: "Continue anyway", onClick: goNext },
                                        });
                                    } else {
                                        goNext();
                                    }
                                }}
                                className="h-11 rounded-xl font-bold gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                Next Lesson <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                        {isLastLesson && isCompleted && (
                            <Button
                                onClick={() => setShowCelebration(true)}
                                className="h-11 rounded-xl font-bold gap-2 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200"
                            >
                                <Trophy className="w-4 h-4" /> Finish Course
                            </Button>
                        )}
                    </div>
                </div>

                {/* What's next hint */}
                {!isCompleted && (
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                        Complete this lesson to unlock the next one and update your progress.
                    </p>
                )}
                {isCompleted && nextLesson && (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5" />
                        Up next: <span className="text-slate-700">{nextLesson.title}</span>
                    </p>
                )}
            </div>

            {/* ── Attachments ── */}
            {lesson.attachments && lesson.attachments.length > 0 && (
                <div className="bg-slate-50 rounded-[1.75rem] p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-primary" />
                        Lesson Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lesson.attachments.map((att, i) => (
                            <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm group hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-700 group-hover:text-primary transition-colors">{att.title}</p>
                                        {att.size && <p className="text-xs text-slate-400">{att.size}</p>}
                                    </div>
                                </div>
                                <Download className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
