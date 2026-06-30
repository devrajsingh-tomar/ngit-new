"use client";

import { useEffect, useState, use } from "react";
import { verifyCertificate } from "@/app/actions/certificate";
import { 
    CheckCircle2, 
    XCircle, 
    Award, 
    BookOpen, 
    Calendar,
    Trophy,
    ShieldCheck,
    Loader2,
    Printer,
    Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerificationPage({ params }: { params: Promise<{ certNumber: string | string[] }> }) {
    const { certNumber: certNumberParam } = use(params);
    let certNumber = Array.isArray(certNumberParam) ? certNumberParam.join('/') : certNumberParam;
    
    // We should also ensure any URL-encoded parts (like %2F) are decoded just in case
    certNumber = decodeURIComponent(certNumber);

    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function check() {
            setLoading(true);
            const res = await verifyCertificate({ certId: certNumber });
            if (res.success) {
                setCert(res.data);
            } else {
                setError(res.error || "Certificate could not be verified.");
            }
            setLoading(false);
        }
        check();
    }, [certNumber]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="font-bold text-slate-500">Connecting to secure credential registry...</p>
            </div>
        );
    }

    if (error || !cert) {
        return (
            <div className="max-w-xl mx-auto py-20 px-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-sm">
                    <XCircle className="w-10 h-10 text-rose-500 shadow-sm" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Verification Unsuccessful</h1>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    The provided certificate identifier <span className="font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded">{certNumber}</span> does not match our official records or has been revoked. 
                    Please ensure the ID or QR code is correct.
                </p>
                <Link href="/">
                    <Button className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-rose-100 bg-slate-900 text-white border-none">Back to Portal</Button>
                </Link>
            </div>
        );
    }

    const isIssued = cert.status === "ISSUED";

    return (
        <div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Verification Header */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100 mb-6 group transition-all shadow-sm">
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Securely Verified Credential
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                    Digital Certificate Registry
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                    Authenticating achievements and validating academic excellence within our global ecosystem.
                </p>
            </div>

            {/* Main Credential Card */}
            <div className="relative group">
                {/* Decorative background blur */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60" />
                
                <div className="relative bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="h-4 bg-gradient-to-r from-primary via-indigo-500 to-cyan-500" />
                    
                    <div className="p-8 md:p-16">
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
                            {/* Left: Certificate Graphic */}
                            <div className="w-full md:w-1/3 shrink-0">
                                <div className="aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl flex items-center justify-center p-6 text-center border-4 border-slate-800">
                                    <Award className="w-16 h-16 text-amber-400 opacity-40 absolute" />
                                    <div className="relative z-10">
                                        <div className="text-amber-400 font-black text-2xl mb-1 italic">NGIT</div>
                                        <div className="text-white/40 font-bold text-[8px] uppercase tracking-[0.3em]">OFFICIAL CREDENTIAL</div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 text-[9px] font-mono text-white/20 break-all">{cert.certificateNumber}</div>
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="flex-1 space-y-10 text-center md:text-left">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Issued To</p>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-none mb-3">{cert.studentId?.name}</h2>
                                    <p className="text-slate-500 font-medium italic">Credential Holder since {new Date(cert.createdAt).getFullYear()}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                            <BookOpen className="w-3.5 h-3.5" /> Certification Course
                                        </p>
                                        <p className="font-bold text-slate-900 text-lg leading-snug">{cert.courseId?.title || cert.customCourseName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                            <Calendar className="w-3.5 h-3.5" /> Conferral Date
                                        </p>
                                        <p className="font-bold text-slate-900 text-lg">{new Date(cert.issuedDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                            <Trophy className="w-3.5 h-3.5" /> Achievement Score
                                        </p>
                                        <div className="flex items-center gap-4 justify-center md:justify-start">
                                            <span className="font-black text-slate-900 text-3xl">{cert.grade}</span>
                                            <div className="text-left">
                                                <div className="text-[9px] font-black text-slate-400 uppercase">Percentile</div>
                                                <div className="text-xs font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{cert.percentage}% Score</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Registry Status
                                        </p>
                                        <Badge className={`bg-emerald-500 text-white border-none px-4 py-1 font-black text-[11px] tracking-widest uppercase rounded-full shadow-lg shadow-emerald-100`}>
                                            {cert.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Meta / Technical details */}
                        <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Digital Signature Reference / Registry ID</p>
                                <p className="font-mono text-[10px] text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 group-hover:text-primary transition-colors select-all cursor-copy">{cert._id}</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button variant="outline" onClick={() => window.print()} className="flex-1 md:flex-none rounded-2xl font-bold h-12 border-2 gap-2 shadow-sm">
                                    <Printer className="w-4 h-4" /> Print Record
                                </Button>
                                <Link href="/contact" className="flex-1 md:flex-none">
                                    <Button className="w-full rounded-2xl font-bold h-12 bg-slate-900 hover:bg-black text-white px-8 shadow-xl shadow-slate-200">Verify Issuer</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Institutional Detail */}
            <div className="mt-20 text-center space-y-4">
                <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-indigo-500 mx-auto rounded-full mb-8" />
                <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-xs">NGIT Institute Credentialing Administration</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-2xl mx-auto">
                    ISO 9001:2015 Certified Organization • Registered Under Chowdhry Law Chambers • Authorized Academic Certification Provider • Digital Compliance Standard 4.1
                </p>
                <div className="pt-6">
                     <p className="text-[9px] text-slate-300 font-medium">© {new Date().getFullYear()} NGIT Institute. All achievements securely archived.</p>
                </div>
            </div>
        </div>
    );
}
