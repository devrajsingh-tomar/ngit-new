"use client";

import { BookOpen, Users, ArrowRight, Zap, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface Course {
    _id: string;
    title: string;
    description: string;
    slug: string;
    type: string;
    price: number;
    category: string;
    thumbnail?: string;
}

export default function CoursesSection({ courses = [], data, hideExplorer = false }: { courses?: Course[], data?: any, hideExplorer?: boolean }) {
    const title = data?.section_name || "Choose Your Path to Mastery";
    const subtitle = data?.subtitle || "Our Premium Programs";
    const description = data?.description || "Precisely architected curriculum designed to bridge the gap between academic learning and industry demands.";

    return (
        <section id="courses" className="py-24 bg-white relative overflow-hidden">
            <div className="container px-6 mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-4">
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            {subtitle}
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        {title}
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Courses Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course, idx) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group"
                        >
                            <div className="h-full bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col relative overflow-hidden">
                                {course.thumbnail ? (
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-slate-50 border border-slate-100 shadow-inner">
                                        <img 
                                            src={course.thumbnail} 
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Category Badge overlay on image */}
                                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                                            {course.category}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative flex items-center justify-between mb-8">
                                        <div className="p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-primary/10 transition-colors">
                                            <BookOpen className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        {/* Category Badge */}
                                        <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                                            {course.category}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-3">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Mode</p>
                                            <p className="text-[11px] font-black text-slate-900 uppercase italic">{course.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Success</p>
                                            <p className="text-[11px] font-black text-slate-900 uppercase italic">Assured</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/courses/${course.slug}`} className="mt-8">
                                    <Button className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-slate-950 text-white hover:bg-slate-800 shadow-xl transition-all hover:scale-105 group/btn">
                                        Explore Curriculum
                                        <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 pt-12 border-t border-slate-50 text-center flex flex-col items-center gap-8">
                    {!hideExplorer && (
                        <Link href="/courses" className="inline-flex items-center gap-3 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-[11px] transition-colors group">
                            Explore Full curriculum & Courses
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                    
                    <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Need expert guidance?</p>
                        <Link href="/contact">
                            <Button className="h-16 px-12 rounded-[2rem] text-sm font-black uppercase tracking-widest bg-white border-2 border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white shadow-2xl transition-all hover:-translate-y-1">
                                Talk to Career Counselor
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />
        </section>
    );
}
