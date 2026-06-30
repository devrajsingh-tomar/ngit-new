"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Bell, 
    ArrowRight, 
    Calendar, 
    ArrowLeft, 
    ChevronRight,
    Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notice {
    _id: string;
    title: string;
    description: string;
    date: string;
    link?: string;
    showInScroller?: boolean;
}

export default function NoticeSliderSection({ notices = [] }: { notices?: Notice[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    // Filter to only active/relevant notices if needed, or use all
    const activeNotices = notices.length > 0 ? notices : [];

    useEffect(() => {
        if (activeNotices.length <= 1 || paused) return;

        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % activeNotices.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(timer);
    }, [activeNotices.length, paused]);

    if (activeNotices.length === 0) return null;

    const currentNotice = activeNotices[index];
    const dateObj = new Date(currentNotice.date);
    const formattedDate = dateObj.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container px-6 mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/50">
                            <Megaphone className="w-4 h-4 text-emerald-600 animate-bounce" />
                            <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">
                                Real-time Institute Updates
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Latest Announcements
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
                    </div>
                </div>

                {/* Slider Container */}
                <div 
                    className="relative max-w-5xl mx-auto"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div className="relative h-[400px] md:h-[320px] overflow-hidden rounded-[3rem]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentNotice._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                className="absolute inset-0 bg-slate-50 border-2 border-slate-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10"
                            >
                                {/* Date Badge */}
                                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center p-4">
                                    <Calendar className="w-6 h-6 text-emerald-500 mb-2 opacity-20" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{dateObj.getDate()}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">{dateObj.getFullYear()}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-6 text-center md:text-left">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight line-clamp-2">
                                            {currentNotice.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 text-sm md:text-base">
                                            {currentNotice.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        {currentNotice.link && (
                                            <Link href={currentNotice.link} target={currentNotice.link.startsWith('http') ? '_blank' : '_self'}>
                                                <Button className="h-12 rounded-xl px-8 font-bold gap-2 shadow-lg shadow-primary/20">
                                                    View Details
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Priority Update
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {activeNotices.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    index === i ? "w-8 bg-emerald-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                                )}
                            />
                        ))}
                    </div>

                    {/* Left/Right Buttons (Desktop only visible on hover) */}
                    <button 
                        onClick={() => setIndex((prev) => (prev - 1 + activeNotices.length) % activeNotices.length)}
                        className="absolute top-1/2 -left-4 md:-left-16 -translate-y-1/2 w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:scale-110"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setIndex((prev) => (prev + 1) % activeNotices.length)}
                        className="absolute top-1/2 -right-4 md:-right-16 -translate-y-1/2 w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* All Notices Button (Bottom) */}
                <div className="mt-20 text-center">
                    <Link href="/notices">
                        <Button variant="outline" className="h-16 px-12 rounded-[2rem] border-2 border-slate-900 text-slate-900 font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl hover:-translate-y-1">
                            Browse All Notices
                            <ArrowRight className="w-5 h-5 ml-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] -z-10" />
        </section>
    );
}
