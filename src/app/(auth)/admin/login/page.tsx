import LoginForm from "@/components/auth/LoginForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden font-sans">
            {/* Soft background accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full -mr-96 -mt-96 blur-[150px] opacity-50" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full -ml-32 -mb-32 blur-[120px] opacity-40" />
            
            {/* Top Bar Navigation */}
            <div className="absolute top-8 left-8 md:left-12 z-50">
                <Link href="/" className="flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-100">
                    <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Back to Site</span>
                </Link>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                        <span className="text-primary font-black uppercase tracking-widest text-[10px]">Admin Access</span>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        Command <span className="text-primary">Center</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        NGIT Administrative Gateway
                    </p>
                </div>

                <div className="relative">
                    <LoginForm
                        title="Sign In"
                        description="Access the administrative dashboard"
                        role="ADMIN"
                    />
                </div>
                
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    © 2025 NGIT • Secure Infrastructure
                </p>
            </div>
        </div>
    );
}

