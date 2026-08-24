"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck, User, Loader2, Zap, Fingerprint } from "lucide-react";
import { getDashboardRoute } from "@/lib/role-routing";

interface LoginFormProps {
    title: string;
    description: string;
    role?: "ADMIN" | "STUDENT";
}

export default function LoginForm({ title, description, role }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                if (res.error === "ACCOUNT_PENDING_APPROVAL") {
                    toast.error("Your account is pending admin approval.");
                } else {
                    toast.error("Access Denied: Invalid credentials.");
                }
            } else {
                toast.success("Identity Verified. Accessing system...");
                router.refresh();
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                const targetUrl = getDashboardRoute(session?.user?.role);

                window.location.href = targetUrl;
            }
        } catch (error) {
            toast.error("System connection failure. Please retry.");
        } finally {
            setLoading(false);
        }
    };

    const Icon = role === "ADMIN" ? ShieldCheck : (role === "STUDENT" ? User : GraduationCap);
    const accentColor = role === "ADMIN" ? "rose" : "primary";
    const iconStyles = role === "ADMIN" 
        ? "bg-rose-500 shadow-rose-500/40" 
        : "bg-primary shadow-primary/40";

    return (
        <div className="w-full bg-white rounded-[2.5rem] p-10 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
            {/* Decorative background element */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${accentColor === 'rose' ? 'rose' : 'primary'}-500/5 rounded-full -mr-16 -mt-16 blur-3xl`} />
            
            <div className="flex flex-col items-center mb-10 relative z-10">
                {role !== 'ADMIN' && (
                    <div className={`w-16 h-16 ${role === 'ADMIN' ? 'bg-rose-500' : 'bg-primary'} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-all duration-500`}>
                        <Icon className="w-8 h-8" />
                    </div>
                )}
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
                <p className="text-slate-500 mt-2 font-bold text-[10px] uppercase tracking-widest text-center">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <User className="w-3 h-3" /> System Identifier
                    </label>
                    <input
                        type="email"
                        placeholder="admin@ngit.edu"
                        className="w-full h-14 rounded-xl px-6 bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Fingerprint className="w-3 h-3" /> Access Token
                        </label>
                        <Link href="#" className={`text-[10px] text-primary font-black hover:text-slate-900 uppercase tracking-widest transition-colors`}>Forgot?</Link>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full h-14 rounded-xl px-6 bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-16 rounded-xl text-sm font-black flex items-center justify-center gap-4 shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 group/btn ${
                        role === 'ADMIN' 
                        ? 'bg-slate-900 hover:bg-black text-white shadow-slate-200' 
                        : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                    }`}
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...</>
                    ) : (
                        <>Authorize & Enter <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                    )}
                </button>
            </form>

            {role !== "ADMIN" && (
                <>
                    <div className="relative my-6 text-center z-10">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                        <span className="relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/student" })}
                        className="w-full h-14 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all relative z-10"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="mt-8 text-center relative z-10">
                        <div className="h-px bg-slate-100 w-full mb-6" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            New Member? <Link href="/register" className="text-primary font-black hover:text-slate-900 transition-colors ml-2">Create Account</Link>
                        </p>
                    </div>
                </>
            )}
        </div>
    );

}
