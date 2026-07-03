"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, ArrowRight, BookOpen, GraduationCap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function RedesignedCertification() {
    const [certNumber, setCertNumber] = useState("");
    const router = useRouter();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (certNumber.trim()) {
            router.push(`/verify/${encodeURIComponent(certNumber.trim())}`);
        }
    };

    return (
        <section id="certification" className="py-24 bg-white relative overflow-hidden">
            {/* Background Details */}
            <div className="absolute inset-0 bg-slate-50/50 mix-blend-multiply pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm text-xs tracking-widest uppercase">
                        <ShieldCheck className="w-4.5 h-4.5" /> Secure Academic Registry
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                        Credentials & <span className="text-gradient italic">Certifications</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
                        Validate digital records instantly or log into the student portal to claim your official academic achievements.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-stretch">
                    {/* Card 1: Check/Verify Certificate */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-10 shadow-premium hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group">
                        <div className="space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                <Search className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">Verify Academic Certificate</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Authenticate issued certifications and validate academic transcripts by entering the unique registry identification code below.
                                </p>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <form onSubmit={handleVerify} className="mt-8 space-y-4">
                            <div className="relative w-full group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Search className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="e.g. NGIT/2026/001"
                                    value={certNumber}
                                    onChange={(e) => setCertNumber(e.target.value)}
                                    className="bg-slate-50/50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-12 pr-4 h-14 w-full placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                                    required
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={!certNumber.trim()}
                                className="h-14 w-full rounded-xl bg-slate-950 text-white font-black text-xs uppercase tracking-widest hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-md gap-2"
                            >
                                Verify Registry ID
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>

                    {/* Card 2: Get/Claim Certificate (Student Portal Login) */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-10 shadow-premium hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group">
                        <div className="space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">Claim Student Certificate</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Complete your online or offline training modules. Registered students can log in to view and download their verified digital diplomas instantly.
                                </p>
                            </div>
                        </div>

                        {/* Student Login Link */}
                        <div className="mt-8">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs">
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500">Requires student credential authentication</span>
                            </div>
                            <Button 
                                onClick={() => router.push(`/student/login?callbackUrl=${encodeURIComponent("/student/certificates")}`)}
                                className="h-14 w-full rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/95 hover:scale-[1.02] active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-primary/25 gap-2"
                            >
                                Login to Student Panel
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer labels */}
                <div className="mt-16 flex flex-wrap justify-center items-center gap-6 opacity-60 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Tamper Proof Blockchain Check
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" /> Approved Vocations
                    </div>
                </div>
            </div>
        </section>
    );
}
