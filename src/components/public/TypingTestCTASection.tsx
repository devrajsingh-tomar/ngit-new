import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Keyboard, ArrowRight, Zap, Trophy, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function TypingTestCTASection({ data }: { data?: any }) {
    return (
        <div className="container mx-auto px-4 lg:px-10 py-16">
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-2xl border border-slate-800">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] -ml-48 -mb-48" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            Official Typing Module
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 italic">Typing Speed</span>
                        </h2>
                        
                        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
                            Practice with government-standard passages, track your WPM and accuracy, and prepare for official typing examinations in both English and Hindi.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                            <Link href="/typing">
                                <Button className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-white/10 gap-3 w-full sm:w-auto">
                                    <Keyboard className="w-6 h-6" />
                                    Start Practice Now
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" className="h-16 px-8 rounded-2xl border-2 border-white/20 bg-transparent text-white font-black text-lg hover:bg-white/10 transition-colors w-full sm:w-auto">
                                    Login to Dashboard
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual Element */}
                    <div className="flex-1 w-full max-w-lg relative perspective-1000">
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                        <Timer className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Time Remaining</div>
                                        <div className="text-xl font-bold text-white font-mono">08:45</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Net Speed</div>
                                        <div className="text-xl font-bold text-emerald-400 font-mono">45 WPM</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="h-4 bg-white/5 rounded-full w-full" />
                                <div className="h-4 bg-white/5 rounded-full w-[90%]" />
                                <div className="h-4 bg-white/5 rounded-full w-[95%]" />
                                <div className="h-4 bg-white/5 rounded-full w-[80%]" />
                                <div className="flex gap-2 pt-2">
                                    <div className="h-4 bg-emerald-500/50 rounded-full w-[40%]" />
                                    <div className="h-4 bg-transparent border border-emerald-500/30 rounded-full w-[2px] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
