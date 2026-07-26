"use client";

import { BookOpen, ArrowRight, Zap, PlayCircle } from "lucide-react";
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
            {/* Background glows */}
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />

            <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">
                        <Zap className="w-3.5 h-3.5 animate-pulse" />
                        {subtitle}
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
                        {title}
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Courses Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course, idx) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08, duration: 0.4 }}
                            className="group flex"
                        >
                            <div className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden">
                                
                                <div className="space-y-4">
                                    {/* Thumbnail Image with Play overlay */}
                                    <div className="aspect-video rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden relative border border-slate-100 shadow-sm group-hover:border-slate-200 transition-colors">
                                        {course.thumbnail ? (
                                            <img 
                                                src={course.thumbnail} 
                                                alt={course.title}
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                                <BookOpen className="w-10 h-10 text-slate-300" />
                                            </div>
                                        )}
                                        {/* Play Hover Indicator */}
                                        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <PlayCircle className="w-14 h-14 text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300" />
                                        </div>
                                        
                                        {/* Category Badge */}
                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-100/50 text-[9px] font-black text-slate-800 uppercase tracking-widest shadow-sm z-10">
                                            {course.category}
                                        </div>
                                    </div>

                                    {/* Titles */}
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                                            {course.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {/* Pricing Section */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{course.price.toLocaleString()}</p>
                                        {course.price > 0 && (
                                            <>
                                                <p className="text-slate-400 line-through font-bold text-sm">₹{Math.round(course.price * 1.25).toLocaleString()}</p>
                                                <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                    20% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Enroll Button */}
                                    <Link href={`/courses/${course.slug}`} className="block w-full">
                                        <Button className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/10 transition-all group/btn">
                                            Enroll in Program
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </Link>

                                    {/* Structured specs footer */}
                                    <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 mt-2">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Duration</p>
                                            <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">{course.duration || "Self-paced"}</p>
                                        </div>
                                        <div className="border-x border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Access</p>
                                            <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">Lifetime</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Certificate</p>
                                            <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">Included</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 pt-12 border-t border-slate-100 text-center flex flex-col items-center gap-8">
                    {!hideExplorer && (
                        <Link href="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors group">
                            Explore Full Curriculum & Courses
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                    
                    <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Need expert guidance?</p>
                        <Link href="/contact">
                            <Button className="h-14 px-8 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white shadow-sm transition-all hover:-translate-y-0.5">
                                Talk to Career Counselor
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
