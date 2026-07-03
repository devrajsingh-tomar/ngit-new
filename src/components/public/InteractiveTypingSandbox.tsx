"use client";

import React, { useState, useEffect, useRef } from "react";
import { Keyboard, RefreshCw, Play, Flame, Target, Timer, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractiveTypingSandbox() {
    const targetPassage = "Success in typing exams is not just about speed, it is a game of muscle memory, consistency, and maintaining a calm composure. Focus on accuracy first, and speed will follow naturally.";
    
    const [typedText, setTypedText] = useState("");
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Hindi">("English");

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    // Reset Sandbox
    const handleReset = () => {
        setTypedText("");
        setIsStarted(false);
        setIsFinished(false);
        setTimeElapsed(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Start Timer
    const startTimer = () => {
        setIsStarted(true);
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                setTimeElapsed((prev) => prev + 1);
            }, 1000);
        }
    };

    // Handle Input Changes
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (isFinished) return;

        if (!isStarted && val.length > 0) {
            startTimer();
        }

        // Limit typed length to target passage length
        if (val.length <= targetPassage.length) {
            setTypedText(val);
        }

        // Check if finished
        if (val.length === targetPassage.length) {
            setIsFinished(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    // Clear interval on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Calculate metrics
    const totalChars = typedText.length;
    let correctChars = 0;
    for (let i = 0; i < totalChars; i++) {
        if (typedText[i] === targetPassage[i]) {
            correctChars++;
        }
    }
    const errors = totalChars - correctChars;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    const netWpm = timeElapsed > 0 ? Math.max(0, Math.round(((correctChars / 5) / timeElapsed) * 60)) : 0;

    // Render characters with color highlighting
    const renderPassageChars = () => {
        return targetPassage.split("").map((char, index) => {
            let className = "text-slate-400"; // default untyped
            if (index < typedText.length) {
                className = typedText[index] === char 
                    ? "text-emerald-500 bg-emerald-500/10 font-bold" 
                    : "text-rose-500 bg-rose-500/10 font-bold underline";
            } else if (index === typedText.length && isStarted && !isFinished) {
                className = "text-primary border-l-2 border-primary animate-pulse font-bold bg-primary/10";
            }
            return (
                <span key={index} className={`${className} transition-colors duration-150 font-mono text-[15px] sm:text-[17px] leading-relaxed`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <section id="typing-exam" className="py-24 bg-slate-950 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/95 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
                        <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                        National Typing Assessment Standard
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 italic">Typing Engine</span>
                    </h2>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
                        Practice with government-standard formats, select multiple layouts, and assess your performance instantly with scientific diagnostics.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                    {/* Left Column: Info & Specs */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                Prepare for <span className="text-primary">Government Certifications</span>
                            </h3>
                            <p className="text-slate-400 font-medium leading-relaxed text-sm">
                                NGIT is the leading portal for mock typing tests adhering strictly to national guidelines. Gain a competitive edge with live error reporting and real examination simulations.
                            </p>
                        </div>

                        {/* Language Selector Preview */}
                        <div className="space-y-4">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Supported Standards</span>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setSelectedLanguage("English")}
                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-start ${selectedLanguage === "English" ? "border-primary bg-primary/5 text-white" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"}`}
                                >
                                    <span className="text-lg font-black">English</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Standard QWERTY Layout</span>
                                </button>
                                <button 
                                    onClick={() => setSelectedLanguage("Hindi")}
                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-start ${selectedLanguage === "Hindi" ? "border-primary bg-primary/5 text-white" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"}`}
                                >
                                    <span className="text-lg font-black">Hindi</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Mangal Inscript Layout</span>
                                </button>
                            </div>
                        </div>

                        {/* Exam Badges */}
                        <div className="space-y-4">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Official Exam Modules</span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="font-bold text-slate-300">SSC CHSL/CGL</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="font-bold text-slate-300">UPSSSC Junior Assistant</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="font-bold text-slate-300">Railway NTPC</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="font-bold text-slate-300">State Police Exams</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Sandbox Widget */}
                    <div className="lg:col-span-7">
                        <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex flex-col h-full justify-between shadow-2xl relative overflow-hidden">
                            {/* Dashboard HUD */}
                            <div className="grid grid-cols-3 gap-4 pb-6 border-b border-white/5 mb-6 text-center">
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                                        <Timer className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Time</span>
                                    </div>
                                    <span className="text-xl font-bold font-mono text-white">{timeElapsed}s</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                                        <Flame className="w-4 h-4 text-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Net WPM</span>
                                    </div>
                                    <span className="text-xl font-bold font-mono text-emerald-400">{netWpm}</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                                        <Target className="w-4 h-4 text-sky-400" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Accuracy</span>
                                    </div>
                                    <span className={`text-xl font-bold font-mono ${accuracy >= 95 ? "text-emerald-400" : accuracy >= 85 ? "text-amber-400" : "text-rose-400"}`}>{accuracy}%</span>
                                </div>
                            </div>

                            {/* Live Text Viewer */}
                            <div className="bg-slate-950 border border-white/10 rounded-2xl p-5 mb-6 min-h-[120px] select-none text-left relative">
                                <div className="absolute top-2 right-2 text-[8px] uppercase tracking-widest text-slate-600 font-black">Reference Passage</div>
                                <div className="pt-2">{renderPassageChars()}</div>
                            </div>

                            {/* Typing input */}
                            <div className="relative mb-6">
                                <textarea
                                    ref={inputRef}
                                    value={typedText}
                                    onChange={handleInputChange}
                                    placeholder="Click here and start typing to launch the engine..."
                                    className="w-full bg-slate-950/80 border-2 border-white/10 focus:border-primary rounded-2xl p-4 min-h-[100px] text-white text-sm font-medium outline-none resize-none transition-all placeholder:text-slate-600 focus:ring-4 focus:ring-primary/5"
                                    disabled={isFinished}
                                />
                                {isFinished && (
                                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2 border border-white/10">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                        <span className="text-sm font-bold text-white">Assessment Completed!</span>
                                    </div>
                                )}
                            </div>

                            {/* Control Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button 
                                    onClick={handleReset} 
                                    variant="outline"
                                    className="h-14 px-6 rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all w-full sm:w-auto font-black uppercase text-xs tracking-widest flex items-center gap-2 justify-center"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reset Test
                                </Button>
                                <Link href="/typing" className="w-full sm:flex-1">
                                    <Button className="h-14 rounded-xl bg-white text-slate-900 font-black hover:bg-slate-100 transition-all w-full text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-white/5">
                                        <Keyboard className="w-4 h-4" />
                                        Launch Full Examination Suite
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
