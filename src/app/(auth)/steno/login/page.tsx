import LoginForm from "@/components/auth/LoginForm";
import { ArrowLeft, Mic, Sparkles } from "lucide-react";
import Link from "next/link";

export default function StenoInstituteLoginPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden font-sans">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full -mr-96 -mt-96 blur-[150px] opacity-70 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full -ml-32 -mb-32 blur-[120px] opacity-50 pointer-events-none" />
            
            {/* Top Bar Navigation */}
            <div className="absolute top-8 left-8 md:left-12 z-50">
                <Link href="/" className="flex items-center gap-3 group px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all shadow-sm border border-slate-700/50">
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">Back to Site</span>
                </Link>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20">
                        <Mic className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-300 font-black uppercase tracking-widest text-[10px]">Steno Institute Portal</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                        NGIT <span className="text-indigo-400">Steno Portal</span>
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        Institute & Shorthand Module Management
                    </p>
                </div>

                <div className="relative bg-white text-slate-900 rounded-3xl p-1 shadow-2xl">
                    <LoginForm
                        title="Institute Sign In"
                        description="Access Steno dictations, student analytics & series"
                        role="ADMIN"
                    />
                </div>
                
                <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    © 2026 NGIT • Dedicated Steno Management
                </p>
            </div>
        </div>
    );
}
