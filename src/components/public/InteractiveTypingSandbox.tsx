"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    Keyboard, 
    RefreshCw, 
    Flame, 
    Target, 
    Timer, 
    CheckCircle2, 
    ShieldCheck, 
    Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    const netWpm = timeElapsed > 0 ? Math.max(0, Math.round(((correctChars / 5) / timeElapsed) * 60)) : 0;

    // Render characters with color highlighting
    const renderPassageChars = () => {
        return targetPassage.split("").map((char, index) => {
            let className = "text-slate-600"; // default untyped (subtle in dark terminal)
            if (index < typedText.length) {
                className = typedText[index] === char 
                    ? "text-emerald-400 bg-emerald-950/40 rounded-sm px-[1px] font-semibold" 
                    : "text-rose-400 bg-rose-950/40 rounded-sm px-[1px] font-semibold underline decoration-rose-500 decoration-2";
            } else if (index === typedText.length && isStarted && !isFinished) {
                className = "text-white bg-primary/30 border-b-2 border-primary animate-pulse font-semibold";
            }
            return (
                <span key={index} className={`${className} transition-colors duration-150 font-mono text-[15px] sm:text-[18px] leading-relaxed`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <section id="typing-exam" className="py-24 bg-slate-950 text-white relative overflow-hidden">
            {/* High-tech radial background glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[650px] h-[650px] bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-black uppercase tracking-[0.25em] backdrop-blur-md">
                        <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
                        National Assessment Standards
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
                        Master Your <span className="text-gradient italic">Typing Engine</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
                        Assess shorthand speed, error mapping, and key accuracy using our government-standard test simulation tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Details & Layout Selector */}
                    <div className="lg:col-span-5 flex flex-col justify-center space-y-8 h-full">
                        <div className="space-y-4">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                                Live Diagnostics & <span className="text-primary">Exam Simulations</span>
                            </h3>
                            <p className="text-slate-400 font-medium leading-relaxed text-sm">
                                Track accuracy calculations, net words per minute (WPM), and key omissions in real-time. Practice for official typing formats with custom Inscript and QWERTY templates.
                            </p>
                        </div>

                        {/* Language & Layout Selector */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                Select Layout Mode
                            </span>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setSelectedLanguage("English")}
                                    className={`flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-start text-left ${selectedLanguage === "English" ? "border-primary bg-primary/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                                >
                                    <span className="text-base font-black">English</span>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1">QWERTY Layout</span>
                                </button>
                                <button 
                                    onClick={() => setSelectedLanguage("Hindi")}
                                    className={`flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-start text-left ${selectedLanguage === "Hindi" ? "border-primary bg-primary/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                                >
                                    <span className="text-base font-black">Hindi</span>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1">Inscript Layout</span>
                                </button>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Syllabi Modules</span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2.5 hover:bg-white/[0.08] transition-colors">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="font-bold text-slate-300">SSC CHSL / CGL</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2.5 hover:bg-white/[0.08] transition-colors">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="font-bold text-slate-300">UPSSSC Junior Asst</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2.5 hover:bg-white/[0.08] transition-colors">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="font-bold text-slate-300">Railway NTPC</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2.5 hover:bg-white/[0.08] transition-colors">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="font-bold text-slate-300">High Court Exams</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Premium Dark Dashboard Widget */}
                    <div className="lg:col-span-7 h-full flex flex-col justify-center">
                        <div className="bg-slate-900/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden">
                            {/* HUD Stats Dashboard */}
                            <div className="grid grid-cols-3 gap-4 pb-6 border-b border-white/5 mb-6 text-center">
                                <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center transition-all hover:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                        <Timer className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Time</span>
                                    </div>
                                    <span className="text-2xl font-bold font-mono text-white">{timeElapsed}s</span>
                                </div>
                                
                                <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center transition-all hover:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Net WPM</span>
                                    </div>
                                    <span className="text-2xl font-bold font-mono text-emerald-400">{netWpm}</span>
                                </div>

                                <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center transition-all hover:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                        <Target className="w-3.5 h-3.5 text-sky-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Accuracy</span>
                                    </div>
                                    <span className={`text-2xl font-bold font-mono ${accuracy >= 95 ? "text-emerald-400" : accuracy >= 85 ? "text-amber-400" : "text-rose-400"}`}>
                                        {accuracy}%
                                    </span>
                                </div>
                            </div>

                            {/* Reference Text (Terminal Frame) */}
                            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 mb-6 min-h-[140px] select-none text-left relative overflow-hidden">
                                <div className="absolute top-2 right-3 text-[8px] uppercase tracking-widest text-slate-700 font-black">
                                    Assess Box View
                                </div>
                                <div className="pt-2">{renderPassageChars()}</div>
                            </div>

                            {/* Typing input */}
                            <div className="relative mb-6">
                                <textarea
                                    ref={inputRef}
                                    value={typedText}
                                    onChange={handleInputChange}
                                    placeholder="Focus inside and begin typing to start key assess engine..."
                                    className="w-full bg-slate-950/80 border-2 border-white/5 focus:border-primary rounded-2xl p-4 min-h-[120px] text-white text-sm font-medium outline-none resize-none transition-all placeholder:text-slate-700 focus:ring-4 focus:ring-primary/5 leading-relaxed"
                                    disabled={isFinished}
                                />
                                {isFinished && (
                                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-3 border border-white/10 animate-fade-in">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                        <div className="text-center">
                                            <p className="text-base font-extrabold text-white">Assessment Completed!</p>
                                            <p className="text-xs text-slate-400 mt-1">Accuracy: {accuracy}% | Speed: {netWpm} WPM</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Control Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button 
                                    onClick={handleReset} 
                                    variant="outline"
                                    className="h-14 px-6 rounded-2xl border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all w-full sm:w-auto font-black uppercase text-xs tracking-widest flex items-center gap-2 justify-center"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reset Test
                                </Button>
                                <Link href="/typing" className="w-full sm:flex-1">
                                    <Button className="h-14 rounded-2xl bg-white text-slate-950 font-black hover:bg-slate-100 transition-all w-full text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-white/5 border-none">
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
