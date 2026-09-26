"use client";

import { FileText, Clock, Target, ArrowRight, Zap, ChevronRight, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSafeSession } from "@/lib/useSafeSession";

interface PublicExamsGridProps {
    exams: any[];
    data?: any;
    session?: any;
}

export default function PublicExamsGrid({ exams, data, session: propSession }: PublicExamsGridProps) {
    const { data: clientSession } = useSafeSession();
    const session = propSession || clientSession;
    const title = data?.section_name || "Mock Test Performance Hub";
    const subtitle = data?.subtitle || "Assessment Engine";
    const description = data?.description || "Challenge your intellect with our curated practice modules designed to simulate high-stakes professional environments.";
    
    if (!exams || exams.length === 0) {
        return (
            <section id="exams" className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container px-6 mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-4">
                            <BrainCircuit className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                {subtitle}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">{title}</h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">{description}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="exams" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-1/2 -mt-1/2" />
            
            <div className="container px-6 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-600 font-black uppercase tracking-[0.2em] text-[10px] border border-slate-300">
                        {subtitle}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        {title}
                    </h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exams.slice(0, 6).map((exam, idx) => {
                        const startUrl = session?.user?.role === "STUDENT" 
                            ? `/student/quizzes/${exam._id}` 
                            : `/student/login?callbackUrl=${encodeURIComponent(`/student/quizzes/${exam._id}`)}`;

                        return (
                            <motion.div
                                key={exam._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group h-full"
                            >
                                <div className="h-full flex flex-col p-8 bg-white border border-slate-100 rounded-[3rem] hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="space-y-3 flex-1">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                                                {exam.courseId?.title || "General Proficiency"}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight leading-tight">
                                                {exam.title}
                                            </h3>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shrink-0">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                    </div>

                                    {/* Parameters Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-10 pt-8 border-t border-slate-50">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">Timeline</span>
                                            </div>
                                            <p className="text-xl font-black text-slate-900 italic tracking-tight">{exam.settings?.timeLimit || 0} <span className="text-xs font-medium not-italic text-slate-400 uppercase tracking-widest">MINS</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <Target className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">Capacity</span>
                                            </div>
                                            <p className="text-xl font-black text-slate-900 italic tracking-tight">{exam.settings?.totalMarks || 0} <span className="text-xs font-medium not-italic text-slate-400 uppercase tracking-widest">PTS</span></p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <Link href={startUrl} className="flex-1 mr-4">
                                            <Button className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-slate-950 text-white hover:bg-slate-800 shadow-xl transition-all group-hover:scale-105 active:scale-95">
                                                {session?.user ? "Engage Now" : "Authenticate to Start"}
                                            </Button>
                                        </Link>
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                            <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="mt-20 text-center">
                    <Link href="/exams" className="inline-flex items-center gap-3 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-[11px] transition-colors group">
                        Browse All Available Exams & Practice Sets
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
