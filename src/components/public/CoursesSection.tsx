"use client";

import { BookOpen, Users, ArrowRight, Zap, Target, Globe, PlayCircle } from "lucide-react";
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
    duration?: string;
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
                            <div className="h-full bg-white border-8 border-slate-50 rounded-[3rem] p-8 shadow-2xl hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] hover:border-slate-100 transition-all duration-500 flex flex-col relative overflow-hidden">
                                
                                {/* Thumbnail Image with Video Play Overlay */}
                                <div className="aspect-video rounded-3xl bg-slate-900 flex items-center justify-center overflow-hidden relative mb-6 border border-slate-100">
                                    {course.thumbnail ? (
                                        <img 
                                            src={course.thumbnail} 
                                            alt={course.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                            <BookOpen className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}
                                    <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-md" />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                    <p className="absolute bottom-4 left-0 right-0 text-center text-white font-black text-[9px] tracking-[0.2em] uppercase z-10 drop-shadow-md">Watch Course Preview</p>
                                    
                                    {/* Category Badge overlay on image */}
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm z-10">
                                        {course.category}
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div className="flex-1 space-y-4 mb-6">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-3">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Pricing Section */}
                                <div className="flex items-baseline gap-2 mb-6">
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{course.price.toLocaleString()}</p>
                                    {course.price > 0 && (
                                        <>
                                            <p className="text-slate-400 line-through font-bold text-sm">₹{Math.round(course.price * 1.25).toLocaleString()}</p>
                                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-100">20% OFF</span>
                                        </>
                                    )}
                                </div>

                                {/* Enroll Button */}
                                <Link href={`/courses/${course.slug}`} className="w-full mb-6">
                                    <Button className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition-all hover:scale-105 group/btn">
                                        Enroll in Program
                                        <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </Link>

                                {/* Footer details grid layout */}
                                <div className="grid grid-cols-3 gap-2 text-center pt-6 border-t border-slate-100">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Duration</p>
                                        <p className="text-[11px] font-black text-slate-700 mt-0.5 truncate">{course.duration || "Self-paced"}</p>
                                    </div>
                                    <div className="border-x border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Access</p>
                                        <p className="text-[11px] font-black text-slate-700 mt-0.5">Lifetime</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Certificate</p>
                                        <p className="text-[11px] font-black text-slate-700 mt-0.5">Included</p>
                                    </div>
                                </div>
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
