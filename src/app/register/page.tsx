"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { registerUser } from "@/app/actions/registration";
import { GraduationCap, ArrowRight, Eye, EyeOff, Loader2, User, Mail, Lock, Phone, Sparkles, ShieldCheck, Zap, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getHeaderFooterData } from "@/app/actions/layoutContent";

function RegisterForm() {
    const [headerData, setHeaderData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Referral code state
    const urlRef = searchParams.get("ref") || searchParams.get("code") || "";
    const urlSource = searchParams.get("source") === "qr" ? "QR_CODE" : "URL_LINK";

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        referralCode: urlRef.toUpperCase(),
    });

    const [validatingCode, setValidatingCode] = useState(false);
    const [verifiedInstitute, setVerifiedInstitute] = useState<{
        valid: boolean;
        instituteName?: string;
        instituteCode?: string;
        discountPercent?: number;
        discountAmount?: number;
        error?: string;
    } | null>(null);

    useEffect(() => {
        getHeaderFooterData().then(res => {
            if (res.success) setHeaderData(res.header);
        });
    }, []);

    // Validate referral code when URL param exists or when student types code
    const validateCode = async (codeToTest: string) => {
        const clean = codeToTest.trim().toUpperCase();
        if (!clean) {
            setVerifiedInstitute(null);
            return;
        }

        setValidatingCode(true);
        try {
            const res = await fetch(`/api/referrals/validate?code=${encodeURIComponent(clean)}`);
            const data = await res.json();
            if (data.valid) {
                setVerifiedInstitute({
                    valid: true,
                    instituteName: data.instituteName,
                    instituteCode: data.instituteCode,
                    discountPercent: data.discountPercent,
                    discountAmount: data.discountAmount,
                });
            } else {
                setVerifiedInstitute({
                    valid: false,
                    error: data.error || "Invalid referral code",
                });
            }
        } catch {
            setVerifiedInstitute({ valid: false, error: "Could not verify referral code" });
        } finally {
            setValidatingCode(false);
        }
    };

    // Auto-validate on mount if ?ref= is present
    useEffect(() => {
        if (urlRef) {
            validateCode(urlRef);
        }
    }, [urlRef]);

    const set = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleCodeChange = (val: string) => {
        const uppercase = val.toUpperCase().trim();
        set("referralCode", uppercase);
        if (uppercase.length >= 3) {
            validateCode(uppercase);
        } else {
            setVerifiedInstitute(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (form.password.length < 8) {
            toast.error("Security policy: Password must be at least 8 characters");
            return;
        }

        if (form.mobile.length < 10) {
            toast.error("Invalid mobile number (minimum 10 digits required)");
            return;
        }

        setLoading(true);
        try {
            const result = await registerUser({
                name: form.name,
                email: form.email,
                password: form.password,
                mobile: form.mobile,
                referralCode: form.referralCode || undefined,
                attributionSource: form.referralCode ? (urlRef ? urlSource : "MANUAL_ENTRY") : undefined,
            });
            if (result.success) {
                toast.success("Identity Created. Welcome to the ecosystem.");
                router.push("/student/login");
            } else {
                toast.error(result.error || "Registration sequence failed.");
            }
        } catch {
            toast.error("System synchronization error. Please retry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
            {/* Soft background accents */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full -mr-96 -mt-96 blur-[200px] opacity-50" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/5 rounded-full -ml-96 -mb-96 blur-[150px] opacity-30" />
            
            {/* Navigation / Header */}
            <header className="flex items-center justify-between px-8 py-6 md:px-12 relative z-50">
                <Link href="/" className="flex items-center gap-4 group">
                    {headerData?.logoImage ? (
                        <img src={headerData.logoImage} alt="Logo" className="h-16 w-auto object-contain" />
                    ) : (
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-300">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <div>
                        <p className="text-xl font-black text-slate-900 leading-none tracking-tight">NGIT <span className="text-primary">Academy</span></p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{headerData?.logoText || "Create Identity"}</p>
                    </div>
                </Link>
                <Link href="/student/login" className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-primary transition-all uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md">
                    Access Portal
                    <ArrowRight className="w-3.5 h-3.5" /> 
                </Link>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 relative z-10">
                <div className="w-full max-w-[520px]">
                    {/* Welcome Experience */}
                    <div className="text-center mb-6 space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 border border-primary/10">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span className="text-primary font-black uppercase tracking-widest text-[9px]">New Student Account</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">
                            Create Your <span className="text-primary">Identity.</span>
                        </h1>
                        <div className="pt-2">
                            <Link href="/enroll">
                                <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-all group">
                                    <div className="text-left pl-2">
                                        <p className="text-xs font-black uppercase tracking-wider">Online Course Admission & Enrollment</p>
                                        <p className="text-[10px] text-slate-200 font-medium">Register, select degree/diploma & pay online</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Verified Institute Referral Banner */}
                    {verifiedInstitute?.valid && (
                        <div className="mb-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Partner Referral Applied</span>
                                    {verifiedInstitute.discountPercent && (
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                                            {verifiedInstitute.discountPercent}% Off Available
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-black text-emerald-950 truncate mt-0.5">
                                    {verifiedInstitute.instituteName}
                                </p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        </div>
                    )}

                    {/* Registration Card */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter legal name"
                                    value={form.name}
                                    onChange={(e) => set("name", e.target.value)}
                                    required
                                    className="w-full h-12 bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-primary" /> Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={(e) => set("email", e.target.value)}
                                    required
                                    className="w-full h-12 bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-primary" /> Mobile
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+91 ••••• •••••"
                                    value={form.mobile}
                                    onChange={(e) => set("mobile", e.target.value)}
                                    required
                                    className="w-full h-12 bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-primary" /> Security Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => set("password", e.target.value)}
                                        required
                                        className="w-full h-12 bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 pr-10 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center justify-between ml-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3 text-indigo-600" /> Institute Referral Code (Optional)
                                    </label>
                                    {validatingCode && (
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="e.g. APEX2026 or NGIT-STENO"
                                        value={form.referralCode}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        className={`w-full h-12 bg-slate-50 border text-slate-900 placeholder:text-slate-400 rounded-xl px-4 text-xs font-bold uppercase focus:outline-none focus:ring-4 transition-all ${
                                            verifiedInstitute?.valid
                                                ? "border-emerald-500 bg-emerald-50/20 focus:ring-emerald-500/10 focus:border-emerald-600"
                                                : verifiedInstitute && !verifiedInstitute.valid
                                                ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500/10 focus:border-rose-500"
                                                : "border-slate-100 focus:ring-primary/5 focus:border-primary/20"
                                        }`}
                                    />
                                    {verifiedInstitute?.valid && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                    )}
                                    {verifiedInstitute && !verifiedInstitute.valid && (
                                        <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                                {verifiedInstitute && !verifiedInstitute.valid && (
                                    <p className="text-[10px] font-bold text-rose-600 ml-2 mt-1">
                                        {verifiedInstitute.error}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-primary text-white hover:bg-primary-dark font-black rounded-xl flex items-center justify-center gap-3 text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Creating Profile...</>
                                    ) : (
                                        <>Complete Registration <Zap className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="flex items-center gap-4 my-6 opacity-20">
                            <div className="flex-1 h-px bg-slate-900" />
                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest">or</span>
                            <div className="flex-1 h-px bg-slate-900" />
                        </div>

                        <div className="text-center">
                            <Link href="/student/login">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-primary transition-colors">
                                    Already have an account? <span className="text-primary underline underline-offset-4 ml-1">Login here</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-6 flex justify-center items-center relative z-50">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    NGIT Academy • Enrollment Portal • 2026
                </p>
            </footer>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
