"use client";

import { useEffect, useState } from "react";
import {
    PlayCircle,
    BookOpen,
    Trophy,
    Clock,
    ChevronRight,
    ArrowUpRight,
    CheckCircle2,
    QrCode,
    CalendarCheck,
    Keyboard,
    Sparkles,
    ArrowRight,
    Zap,
    FileText,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStudentDashboardData } from "@/app/actions/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StudentQRModal from "@/components/student/StudentQRModal";

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qrOpen, setQrOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetch = async () => {
            const res = await getStudentDashboardData();
            if (isMounted) {
                if (res.success) {
                    setData(res);
                }
                setLoading(false);
            }
        };
        fetch();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return <div className="p-8 animate-pulse text-slate-400 font-medium">Loading your genius portal...</div>;
    }

    const {
        stats,
        enrollments,
        userName,
        userImage,
        userId,
        progressTrend
    } = data || {
        stats: { avgProgress: 0, activeCourses: 0, attendancePercentage: 0, testsCompleted: 0, avgGrade: '-' },
        enrollments: [],
        typingResults: [],
        typingExams: [],
        userName: 'Student',
        userImage: null,
        userId: '',
        progressTrend: []
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* User Profile Image */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white border-4 border-white shadow-2xl shadow-primary/20 overflow-hidden relative shrink-0">
                        {userImage ? (
                            <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <span className="text-4xl font-black text-slate-300">{userName?.[0]}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <Sparkles className="w-3.5 h-3.5" /> Learning Workspace
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight italic">
                            Welcome back, <span className="text-gradient inline-block">{userName?.split(' ')[0]}!</span> <span className="inline-block">👋</span>
                        </h1>
                        <p className="text-slate-500 mt-6 font-bold flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            You have <span className="text-slate-900 font-black px-2 py-0.5 bg-slate-100 rounded-lg">{stats.activeCourses} active courses</span> in your learning path.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6 bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className="flex -space-x-4 overflow-hidden ml-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="inline-block h-12 w-12 rounded-2xl ring-4 ring-white bg-slate-100 border border-slate-200 shadow-sm" />
                        ))}
                    </div>
                    <div className="h-12 w-px bg-slate-100 mx-2" />
                    <Link href="/student/courses">
                        <Button className="btn-primary h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-primary/20">
                            Enter Classroom <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {[
                    { label: "Overall Progress", val: `${stats.avgProgress}%`, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100/50" },
                    { label: "Attendance", val: `${stats.attendancePercentage}%`, icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100/50" },
                    { label: "Active Courses", val: stats.activeCourses.toString(), icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50/50", border: "border-indigo-100/50" },
                    { label: "Tests Passed", val: stats.testsCompleted.toString(), icon: Trophy, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100/50" },
                ].map((stat, i) => (
                    <div key={i} className={cn("bg-white p-8 rounded-[2.8rem] border shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden", stat.border)}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                        <div className={cn("w-14 h-14 rounded-[1.2rem] flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 relative z-10", stat.bg, stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 relative z-10">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{stat.val}</p>
                    </div>
                ))}

                {/* Digital identity / Quick Action */}
                <div className="relative group cursor-pointer" onClick={() => setQrOpen(true)}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.8rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-slate-950 h-full rounded-[2.8rem] p-8 overflow-hidden flex flex-col justify-between shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/40 transition-colors" />
                        <div className="w-14 h-14 rounded-[1.2rem] bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-8 text-white group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Digital Identity</p>
                            <p className="text-2xl font-black text-white flex items-center gap-3 italic">
                                Student ID <Zap className="w-5 h-5 text-primary" />
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Active Courses */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Courses</h2>
                            <Link href="/student/courses">
                                <Button variant="ghost" className="text-primary font-black gap-2 uppercase text-[10px] tracking-widest">Go to Classroom <ChevronRight className="w-4 h-4" /></Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {enrollments.length > 0 ? enrollments.map((en: any) => (
                                <div key={en._id} className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
                                    <div className="flex flex-col md:flex-row gap-8 p-6">
                                        <div className="w-full md:w-56 aspect-video bg-slate-100 rounded-[1.5rem] overflow-hidden relative shadow-inner">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:opacity-0 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <PlayCircle className="w-12 h-12 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-black text-xl text-slate-900 tracking-tight">{en.courseId.title}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase tracking-wider">Premium Course</div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {en.courseId.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={`/student/courses/${en.courseId._id}`}>
                                                    <Button variant="outline" className="w-12 h-12 rounded-2xl p-0 hover:bg-primary hover:text-white transition-all">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                            
                                            <div className="space-y-3 pt-2">
                                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>Progression</span>
                                                    <span className="text-slate-900">{en.progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner flex">
                                                    <div
                                                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000 animate-shimmer"
                                                        style={{ width: `${en.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center space-y-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto border border-slate-100">
                                        <BookOpen className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Your bookshelf is empty</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 font-medium">Unlock premium learning tracks and start building your future today.</p>
                                    </div>
                                    <Link href="/courses">
                                        <Button className="btn-primary h-14 rounded-2xl px-10">Explore Catalog</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Typing Exams Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-3">
                                <Keyboard className="w-6 h-6 text-indigo-500" />
                                Available <span className="text-gradient">Typing Exams</span>
                            </h2>
                            <Link href="/student/typing">
                                <Button variant="ghost" className="text-primary font-black gap-2 uppercase text-[10px] tracking-widest">Practice More <ChevronRight className="w-4 h-4" /></Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data?.typingExams?.length > 0 ? data.typingExams.map((exam: any) => (
                                <div key={exam._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Keyboard className="w-6 h-6" />
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest">{exam.language || 'English'}</Badge>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-lg mb-2">{exam.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration}m</span>
                                        <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> {exam.wordLimit || 'Unlimited'} Words</span>
                                    </div>
                                    <Link href={`/typing/exam/${exam._id}`}>
                                        <Button className="w-full rounded-2xl font-black text-xs uppercase tracking-widest h-12 bg-slate-900 hover:bg-indigo-600 transition-colors">Start Exam</Button>
                                    </Link>
                                </div>
                            )) : (
                                <div className="md:col-span-2 py-10 bg-slate-50 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
                                    <Keyboard className="w-10 h-10 mb-4 opacity-20" />
                                    <p className="font-bold text-sm">No active typing exams available.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Typing Results Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-amber-500" />
                                Recent <span className="text-gradient">Typing Performance</span>
                            </h2>
                            <Link href="/student/results">
                                <Button variant="ghost" className="text-primary font-black gap-2 uppercase text-[10px] tracking-widest">Full History <ChevronRight className="w-4 h-4" /></Button>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {data?.typingResults?.length > 0 ? data.typingResults.map((result: any) => (
                                <div key={result._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black">
                                            {result.wpm}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-none">{result.examId?.title || "Typing Practice"}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                                {new Date(result.createdAt).toLocaleDateString()} · {result.accuracy}% Accuracy
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Speed</p>
                                            <p className="text-xl font-black text-slate-900">{result.wpm} WPM</p>
                                        </div>
                                        <Link href={`/typing/results/${result._id}`}>
                                            <Button variant="outline" className="w-12 h-12 rounded-2xl p-0 hover:bg-slate-900 hover:text-white transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 bg-slate-50 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
                                    <Trophy className="w-10 h-10 mb-4 opacity-20" />
                                    <p className="font-bold text-sm">No typing attempts recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-10">
                    <div className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl shadow-primary/10 group overflow-hidden">
                        <div className="bg-slate-800 h-full rounded-[2.3rem] p-8 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-[60px]" />
                            
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                                    <Trophy className="w-6 h-6 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight">Active Tasks</h3>
                            </div>

                            {data?.upcomingQuiz ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Next Assessment</p>
                                        <p className="font-black text-slate-100 text-lg leading-tight">{data.upcomingQuiz.title}</p>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {data.upcomingQuiz.settings?.timeLimit || 0}m</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span>Ranked Exam</span>
                                        </div>
                                    </div>
                                    <Link href="/student/quizzes">
                                        <Button className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black shadow-xl shadow-black/20">
                                            Launch Portal
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="py-10 text-center space-y-4 opacity-50">
                                    <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto" />
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No pending exams</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Learning Hub</h3>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Personalized Insights</p>
                        </div>
                        <div className="space-y-6">
                            {[
                                { t: "Revise your Physics notes before attempting tomorrow's session.", icon: CheckCircle2, iconColor: "text-emerald-500", bg: "bg-emerald-50" },
                                { t: "Complete the module 3 assignment to unlock certificate access.", icon: Clock, iconColor: "text-blue-500", bg: "bg-blue-50" }
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5", tip.bg)}>
                                        <tip.icon className={cn("w-5 h-5", tip.iconColor)} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed py-1">
                                        {tip.t}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <StudentQRModal
                isOpen={qrOpen}
                onClose={() => setQrOpen(false)}
                studentId={userId}
                studentName={userName}
            />
        </div>
    );
}
