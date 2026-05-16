"use client";

import {
    X,
    Maximize2,
    FileText,
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
    const [fullScreen, setFullScreen] = useState(false);

    // Use Google Docs Viewer for high compatibility and to bypass local security blocks
    const getEmbedUrl = (rawUrl: string) => {
        if (!rawUrl) return "";
        
        let finalUrl = rawUrl;
        
        // Handle Google Drive: Use its own preview mode if it's a drive link
        if (rawUrl.includes("drive.google.com")) {
            const idMatch = rawUrl.match(/\/file\/d\/([^/?]+)/) || rawUrl.match(/[?&]id=([^&]+)/);
            if (idMatch && idMatch[1]) {
                return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
            }
        }

        // For local files or other links, use Google Docs Viewer as a proxy
        if (rawUrl.startsWith("/")) {
            if (typeof window !== "undefined") {
                finalUrl = window.location.origin + rawUrl;
            }
        }

        return `https://docs.google.com/viewer?url=${encodeURIComponent(finalUrl)}&embedded=true`;
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = "auto"; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const embedUrl = getEmbedUrl(url);

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 select-none no-print"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            {/* Viewer Container */}
            <div className={cn(
                "relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 transition-all duration-500",
                fullScreen ? "w-full h-full" : "w-full max-w-6xl h-[90vh]"
            )}>
                {/* Header */}
                <header className="h-20 bg-slate-50 border-b flex items-center justify-between px-8 shrink-0 relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 leading-tight line-clamp-1">{title}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Academic Portal</p>
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
                    <iframe
                        src={embedUrl}
                        className="w-full h-full border-none relative z-10"
                        title={title}
                        allowFullScreen
                    />

                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.06] rotate-[-30deg] z-20">
                        <p className="text-7xl md:text-9xl font-black text-slate-900 select-none uppercase text-center leading-tight">
                            NGIT PROPERTY<br/>DO NOT COPY
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Encrypted Stream</span>
                    </div>
                </main>

                {/* Footer */}
                <footer className="h-12 bg-white border-t px-8 flex items-center justify-center shrink-0 relative z-20">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Protected by NGIT Security • Unauthorized Capture Prohibited
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
