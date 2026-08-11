"use client";

import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShorthandComingSoonPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden py-24 flex items-center justify-center">
            {/* Glowing background decorations */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

            <div className="max-w-4xl w-full mx-auto px-6 relative z-10 text-center space-y-12">
                {/* Header Badge & Title */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-black uppercase tracking-[0.2em]">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Launching Soon
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none">
                        Shorthand <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Software Portal</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        We are building India's most advanced Stenography & Shorthand speed-building application. Government-grade dictations, real-time error mapping, and keyboard shortcuts are coming right here.
                    </p>
                </div>

                {/* Features Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 text-left backdrop-blur-md">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-lg text-white">Smart Dictation</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                            Audio speed controllers with standard shorthand scripts and custom outlines.
                        </p>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 text-left backdrop-blur-md">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-lg text-white">Govt Test Formats</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                            Simulate SSC, High Court, and UPSSSC stenography pattern exams.
                        </p>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/40 rounded-3xl p-6 text-left backdrop-blur-md">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-lg text-white">Performance Log</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                            Detailed transcripts analysis highlighting substitutions, omissions, and spelling errors.
                        </p>
                    </div>
                </div>

                {/* Contact and Admission Support Info Card */}
                <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 max-w-2xl mx-auto shadow-2xl backdrop-blur-xl space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-black text-white">Admission & Support Open!</h2>
                        <p className="text-slate-400 text-sm font-semibold">
                            Get in touch directly with our counselors to join offline/online batches today.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                        {/* Call Card */}
                        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Call Support</span>
                                <a href="tel:+918840341525" className="text-sm font-extrabold hover:text-emerald-400 transition-colors block text-white">+91 88403 41525</a>
                                <a href="tel:+918004958441" className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors block">+91 80049 58441</a>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Email Address</span>
                                <a href="mailto:contact@ngit.org.in" className="text-sm font-extrabold hover:text-indigo-400 transition-colors block text-white">contact@ngit.org.in</a>
                            </div>
                        </div>
                    </div>

                    {/* Address block */}
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-start gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 border border-rose-500/20">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Academy Campus</span>
                            <a 
                                href="https://www.google.com/maps/place/National+Genius+Institute+Of+Technology/@25.4967301,81.853729,17z" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-slate-300 hover:text-rose-400 transition-colors leading-relaxed block"
                            >
                                First Floor, Sainik Market, Rasulabad Ghat Road, near Mahila Polytechnic, Rasulabad, Teliarganj, Prayagraj, Uttar Pradesh 211004
                            </a>
                        </div>
                    </div>
                </div>

                {/* Back to Home CTA */}
                <div className="pt-6">
                    <Link href="/">
                        <Button className="h-12 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black shadow-lg flex items-center justify-center gap-2 border-none transition-all duration-300">
                            <ArrowLeft className="w-4 h-4" /> Return to Homepage
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
