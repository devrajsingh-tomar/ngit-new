"use client";

import { useState } from "react";
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
    TrendingUp,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StudentQRModal from "@/components/student/StudentQRModal";

interface StudentDashboardClientProps {
    data: any;
}

export default function StudentDashboardClient({ data }: StudentDashboardClientProps) {
    const [qrOpen, setQrOpen] = useState(false);

    const {
        stats,
        enrollments,
        userName,
        userImage,
        userId,
        progressTrend,
        typingResults,
        typingExams
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

    // Calculate typing statistics
    const totalTypingTests = typingResults?.length || 0;
    const avgTypingSpeed = totalTypingTests > 0 
        ? Math.round(typingResults.reduce((sum: number, r: any) => sum + (r.wpm || 0), 0) / totalTypingTests)
        : 0;
    const avgTypingAccuracy = totalTypingTests > 0
        ? Math.round(typingResults.reduce((sum: number, r: any) => sum + (r.accuracy || 0), 0) / totalTypingTests)
        : 0;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-7xl mx-auto pb-20">
            {/* Warning Banner for Incomplete Profile */}
            {data.isProfileComplete === false && (
                <div className="bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-rose-950 uppercase tracking-wide">Profile Details Incomplete / प्रोफ़ाइल विवरण अधूरा है</h3>
                            <p className="text-xs text-rose-700 font-bold mt-1 max-w-2xl leading-relaxed">
                                Your student registration file is missing critical details (Father's Name, Mother's Name, DOB, Address, Aadhar Card, etc.). Please complete your profile to prevent account limitations.
                                <br />
                                आपके छात्र पंजीकरण फ़ाइल में महत्वपूर्ण जानकारी (पिता/माता का नाम, जन्मतिथि, पता, आधार कार्ड आदि) अधूरी है। कृपया इसे पूरा करें।
                            </p>
                        </div>
                    </div>
                    <Link href="/student/settings" className="shrink-0">
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest px-6 py-4 h-12 rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all">
                            Complete Profile / प्रोफ़ाइल पूरी करें
                        </Button>
                    </Link>
                </div>
            )}

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
                            Welcome back, <span className="text-gradient inline-block">{(userName || 'Student').split(' ')[0]}!</span> <span className="inline-block">👋</span>
                        </h1>
                        <p className="text-slate-500 mt-6 font-bold flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            All systems operational. Start your typing practice today!
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6 bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50">
                    <Link href="/student/typing">
                        <Button className="btn-primary h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-primary/20">
                            Start Typing Test <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {[
                    { label: "Typing Exams Taken", val: totalTypingTests.toString(), icon: Keyboard, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100/50" },
                    { label: "Attendance", val: `${stats.attendancePercentage || 0}%`, icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100/50" },
                    { label: "Avg Typing Speed", val: `${avgTypingSpeed} WPM`, icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50/50", border: "border-indigo-100/50" },
                    { label: "Avg Accuracy", val: `${avgTypingAccuracy}%`, icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100/50" },
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
                            {typingExams?.length > 0 ? typingExams.map((exam: any) => (
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
                            <Link href="/student/typing">
                                <Button variant="ghost" className="text-primary font-black gap-2 uppercase text-[10px] tracking-widest">Full History <ChevronRight className="w-4 h-4" /></Button>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {typingResults?.length > 0 ? typingResults.map((result: any) => (
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
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Learning Hub</h3>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Personalized Insights</p>
                        </div>
                        <div className="space-y-6">
                            {[
                                { t: "Keep your wrists elevated and look straight at the screen while typing.", icon: CheckCircle2, iconColor: "text-emerald-500", bg: "bg-emerald-50" },
                                { t: "Practice 15 minutes of touch typing daily to build muscle memory.", icon: Clock, iconColor: "text-blue-500", bg: "bg-blue-50" }
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
