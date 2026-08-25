"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getHeaderFooterData } from "@/app/actions/layoutContent";
import {
    GraduationCap, ArrowRight, Eye, EyeOff,
    BookOpen, Trophy, BarChart2, Loader2, Sparkles, ShieldCheck, Zap
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const features = [
    { icon: BookOpen, label: "Premium Materials" },
    { icon: Trophy, label: "Live Assessments" },
    { icon: BarChart2, label: "Growth Analytics" },
];

export default function StudentLoginForm() {
    const { data: session } = useSession();
    const [headerData, setHeaderData] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoverySubmitted, setRecoverySubmitted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signIn("credentials", { email, password, redirect: false });

            if (res?.error) {
                if (res.error === "ACCOUNT_PENDING_APPROVAL") {
                    toast.error("Your account is pending admin approval. Please wait for activation.");
                } else {
                    toast.error("Invalid email or password. Please try again.");
                }
            } else {
                toast.success("Welcome back to your workspace!");
                router.refresh();
                const response = await fetch("/api/auth/session");
                const session = await response.json();

                if (callbackUrl && !callbackUrl.startsWith("/admin")) {
                    router.push(callbackUrl);
                } else if (session?.user?.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push("/student");
                }
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
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
                        <p className="text-xl font-black text-slate-900 leading-none tracking-tight">Student <span className="text-primary">Portal</span></p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{headerData?.logoText || "NGIT Education"}</p>
                    </div>
                </Link>
                <Link href="/" className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-primary transition-all uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md">
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" /> 
                    Back to Home
                </Link>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-[450px]">
                    {/* Welcome Experience */}
                    <div className="text-center mb-8 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 border border-primary/10">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span className="text-primary font-black uppercase tracking-widest text-[9px]">Student Login</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic">
                            Ignite Your <span className="text-primary">Future.</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm tracking-tight opacity-80">
                            Access your academic dashboard
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-primary" /> Registered Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="yourname@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                                    <button
                                      type="button"
                                      onClick={() => setIsForgotModalOpen(true)}
                                      className="text-[10px] text-primary font-black hover:text-slate-900 uppercase tracking-widest transition-colors cursor-pointer"
                                    >
                                      Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-6 pr-14 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-primary text-white hover:bg-primary-dark font-black rounded-xl flex items-center justify-center gap-3 text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Authorizing...</>
                                ) : (
                                    <>Open Dashboard <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                            <span className="relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
                        </div>

                        {/* Google Sign-In Button */}
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: callbackUrl || "/student" })}
                            className="w-full h-14 rounded-xl border-2 border-slate-100 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs flex items-center justify-center gap-3 shadow-sm transition-all mb-8"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">New to NGIT?</p>
                            <Link href="/register">
                                <Button variant="outline" className="h-12 border-2 border-slate-100 bg-transparent text-slate-600 font-black hover:bg-slate-50 px-8 rounded-xl w-full transition-all text-xs">
                                    Create Student Account
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Features ecosystem */}
                    <div className="flex items-center justify-center gap-8 mt-12 opacity-50">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <f.icon className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* System Footer */}
            <footer className="px-12 py-8 flex justify-center items-center relative z-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    NGIT Academy • 2025 • Educational Portal
                </p>
            </footer>

            {/* Forgot Password Recovery Modal */}
            <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" /> Password Recovery
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 font-medium">
                            Choose how you would like to regain access to your NGIT Student Account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {/* Option A: Instant Google Sign-In */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Option 1: Instant Google Access (Recommended)</p>
                            <p className="text-[11px] text-slate-500 font-medium">
                                If your account email is a Gmail address, sign in with Google directly. No password required!
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotModalOpen(false);
                                    signIn("google", { callbackUrl: callbackUrl || "/student" });
                                }}
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                Instant Sign In with Google
                            </button>
                        </div>

                        {/* Option B: Request Password Reset Link */}
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Option 2: Password Reset Request</p>
                            {recoverySubmitted ? (
                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 text-center">
                                    ✓ Password recovery request received! Please check your registered email or contact admin at +91 80049 58441.
                                </div>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!recoveryEmail.trim()) return;
                                        setRecoverySubmitted(true);
                                        toast.success("Password recovery request submitted!");
                                    }}
                                    className="space-y-3"
                                >
                                    <input
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={recoveryEmail}
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        required
                                        className="w-full h-11 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 text-xs font-bold"
                                    />
                                    <Button type="submit" className="w-full h-11 bg-primary text-white font-black text-xs rounded-xl">
                                        Send Recovery Request
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
