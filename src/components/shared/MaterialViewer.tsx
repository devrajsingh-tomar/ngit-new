"use client";

import {
    X,
    FileText,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MaterialViewerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
}

export default function MaterialViewer({ isOpen, onClose, title, url }: MaterialViewerProps) {
    const [loading, setLoading] = useState(true);
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !url) return;

        setLoading(true);
        
        // Handle Google Drive: Always use the direct preview link
        if (url.includes("drive.google.com")) {
            const idMatch = url.match(/\/file\/d\/([^/?]+)/) || url.match(/[?&]id=([^&]+)/);
            if (idMatch && idMatch[1]) {
                setDisplayUrl(`https://drive.google.com/file/d/${idMatch[1]}/preview`);
            } else {
                setDisplayUrl(url);
            }
            setLoading(false);
            return;
        }

        // For local files, use our new Proxy API to bypass Nginx X-Frame-Options
        if (url.startsWith("/uploads/")) {
            setDisplayUrl(`/api/view-pdf?url=${encodeURIComponent(url)}`);
            setLoading(false);
            return;
        }

        // Fallback for other external links
        setDisplayUrl(url);
        setLoading(false);

    }, [isOpen, url]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = "auto"; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 select-none no-print"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            {/* Viewer Container */}
            <div className={cn(
                "relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 transition-all duration-500 w-full max-w-6xl h-[90vh]"
            )}>
                {/* Header */}
                <header className="h-20 bg-slate-50 border-b flex items-center justify-between px-8 shrink-0 relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 leading-tight line-clamp-1">{title}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Study Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-11 w-11 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            onClick={onClose}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
                        </div>
                    ) : displayUrl ? (
                        <iframe
                            src={displayUrl}
                            className="w-full h-full border-none relative z-10"
                            title={title}
                            allowFullScreen
                        />
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-slate-500 font-bold">PDF viewer could not be initialized.</p>
                        </div>
                    )}

                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-30deg] z-20">
                        <p className="text-7xl md:text-9xl font-black text-slate-900 select-none uppercase text-center leading-tight">
                            NGIT PROPERTY<br/>CONFIDENTIAL
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="h-10 bg-white border-t px-8 flex items-center justify-center shrink-0 relative z-20">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Protected Content • Unauthorized Capture Prohibited
                    </p>
                </footer>
            </div>

            <style jsx global>{`
                @media print {
                    body { display: none !important; }
                    .no-print { display: none !important; }
                }
                .select-none {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
            `}</style>
        </div>
    );
}
