"use client";

import React, { useState, useEffect } from "react";
import { X, Trophy, ArrowRight, BellRing, Sparkles, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getRecentTypingExams } from "@/app/actions/public-exams";

interface ExamItem {
    _id: string;
    title: string;
    category: string;
    language: string;
    duration: number;
    examMode: string;
    govExamId?: {
        title: string;
    };
    isFree?: boolean;
    isAccessible?: boolean;
}

export default function TypingNotificationPopup() {
    const [showToast, setShowToast] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [exams, setExams] = useState<ExamItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Cookie helper for once per session
    const getCookie = (name: string): string | null => {
        if (typeof window === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const setSessionCookie = (name: string, value: string) => {
        if (typeof window === "undefined") return;
        document.cookie = `${name}=${value}; path=/`;
    };

    useEffect(() => {
        const checkAndSetPopup = async () => {
            try {
                setLoading(true);
                const res = await getRecentTypingExams();
                if (res.success && res.exams && res.exams.length > 0) {
                    setExams(res.exams);
                    
                    const hasBeenShown = sessionStorage.getItem("ngit_exams_toast_shown") || getCookie("ngit_exams_toast_shown");
                    if (hasBeenShown !== "true") {
                        const timer = setTimeout(() => {
                            setShowToast(true);
                            sessionStorage.setItem("ngit_exams_toast_shown", "true");
                            setSessionCookie("ngit_exams_toast_shown", "true");
                        }, 2500);

                        return () => clearTimeout(timer);
                    }
                }
            } catch (err) {
                console.error("Failed to load toast exams", err);
            } finally {
                setLoading(false);
            }
        };

        checkAndSetPopup();
    }, []);

    const handleViewClick = () => {
        setShowToast(false);
        setShowModal(true);
    };

    const handleCloseToast = () => {
        setShowToast(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <>
            {/* 1. BOTTOM RIGHT CORNER TOAST */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-72 right-6 z-[90] max-w-sm w-full bg-white/95 border border-slate-100 rounded-[2rem] shadow-2xl p-6 backdrop-blur-md flex flex-col gap-4 text-slate-800"
                    >
                        <button
                            onClick={handleCloseToast}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Dismiss Toast"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-50 text-red-500 border border-red-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm animate-bounce mt-1">
                                <BellRing className="w-6 h-6 fill-current" />
                            </div>
                            <div className="space-y-1 pr-6">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-black text-slate-900 leading-none">New Tests Added!</h4>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                </div>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                                    New government mock typing tests have been uploaded. Check details and start practicing now!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t pt-3 border-slate-100">
                            <button
                                onClick={handleCloseToast}
                                className="px-4 py-2 text-[10px] font-black tracking-wider uppercase text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={handleViewClick}
                                className="px-4 py-2.5 bg-primary text-white text-[10px] font-black tracking-wider uppercase rounded-xl shadow-lg hover:bg-primary/95 transition-all flex items-center gap-1"
                            >
                                View Here / यहाँ देखें <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. OVERLAY MODAL LISTING TOP 5 TESTS */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-[#f8fafc] rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-950 tracking-tight leading-none">NEWLY UPLOADED TESTS</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Practice official government templates</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Close Modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body / Exam Items */}
                            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading latest tests...</p>
                                    </div>
                                ) : exams.length === 0 ? (
                                    <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl p-6 italic text-slate-400">
                                        No new tests found in the database.
                                    </div>
                                ) : (
                                    exams.map((exam) => {
                                        // Specific target badge (e.g. UPSSSC, UP Police, AHC, etc.)
                                        const modeBadge = exam.govExamId?.title || exam.examMode || "General";
                                        
                                        return (
                                            <div
                                                key={exam._id}
                                                className="bg-white hover:shadow-md border border-slate-100 hover:border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 group"
                                            >
                                                <div className="space-y-1.5 min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 uppercase tracking-wide">
                                                            {modeBadge}
                                                        </span>
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                                                            {exam.language}
                                                        </span>
                                                        {exam.isFree ? (
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                                                                Free
                                                            </span>
                                                        ) : exam.isAccessible ? (
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                                                                Unlocked
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
                                                                Premium
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug truncate group-hover:text-primary transition-colors">
                                                        {exam.title}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                        Duration: {exam.duration} Min
                                                    </p>
                                                </div>

                                                <Link href={`/typing/exam/${exam._id}`}>
                                                    <button
                                                        onClick={handleCloseModal}
                                                        className={cn(
                                                            "px-4 py-2 text-white text-xs font-black rounded-xl transition-all shadow active:scale-95 flex items-center gap-1.5 whitespace-nowrap",
                                                            exam.isAccessible || exam.isFree 
                                                                ? "bg-slate-900 hover:bg-primary" 
                                                                : "bg-amber-600 hover:bg-amber-750"
                                                        )}
                                                    >
                                                        {exam.isAccessible || exam.isFree ? (
                                                            <>
                                                                <Play className="w-3 h-3 fill-white" /> Practice
                                                            </>
                                                        ) : (
                                                            <>
                                                                Unlock
                                                            </>
                                                        )}
                                                    </button>
                                                </Link>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-white px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    onClick={handleCloseModal}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                                >
                                    Close
                                </button>
                                <Link href="/typing">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-5 py-3 bg-slate-950 text-white text-xs font-black tracking-widest uppercase rounded-2xl shadow-lg hover:bg-primary transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        Explore More / अधिक देखें <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
