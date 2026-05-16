"use client";

import {
    X,
    Maximize2,
    Download,
    Share2,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    ExternalLink
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

    // Sanitize URL for Google Drive and other providers
    const getEmbedUrl = (rawUrl: string) => {
        if (!rawUrl) return "";
        
        try {
            // Handle Google Drive
            if (rawUrl.includes("drive.google.com")) {
                let fileId = "";
                
                // Format: /file/d/ID/view
                const idMatch = rawUrl.match(/\/file\/d\/([^/?]+)/);
                if (idMatch && idMatch[1]) {
                    fileId = idMatch[1];
                } else {
                    // Format: ?id=ID
                    const urlObj = new URL(rawUrl);
                    fileId = urlObj.searchParams.get("id") || "";
                }

                if (fileId) {
                    return `https://drive.google.com/file/d/${fileId}/preview`;
                }
            }

            // Handle Dropbox
            if (rawUrl.includes("dropbox.com")) {
                return rawUrl.replace("?dl=0", "?dl=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
            }

        } catch (e) {
            console.error("URL parsing error:", e);
        }
        
        return rawUrl;
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            // Prevent right-click on the entire document when viewer is open
            const preventDefault = (e: MouseEvent) => e.preventDefault();
            document.addEventListener("contextmenu", preventDefault);
            return () => {
                document.body.style.overflow = "auto";
                document.removeEventListener("contextmenu", preventDefault);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isLocal = url.startsWith("/uploads/");
    const embedUrl = getEmbedUrl(url);
    const finalUrl = isLocal ? `${embedUrl}#toolbar=0&navpanes=0&scrollbar=0` : embedUrl;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 select-none no-print"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Viewer Container */}
            <div className={cn(
                "relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 transition-all duration-500",
                fullScreen ? "w-full h-full" : "w-full max-w-6xl h-[90vh]"
            )}>
                {/* Header */}
                <header className="h-20 bg-slate-50 border-b flex items-center justify-between px-8 shrink-0 relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 leading-tight line-clamp-1">{title}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Encrypted Viewer</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500"><ZoomOut className="w-4 h-4" /></Button>
                        <div className="px-3 text-xs font-bold text-slate-600">100%</div>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500"><ZoomIn className="w-4 h-4" /></Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-px h-8 bg-slate-200 mx-2" />
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
                    {/* Security Shield Overlay - blocks right-click and interaction with top toolbar area */}
                    <div 
                        className="absolute inset-0 z-10" 
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {/* Top bar shield to hide/block built-in PDF toolbar */}
                        <div className="absolute top-0 left-0 right-0 h-14 bg-transparent cursor-not-allowed" />
                        {/* Right side shield to block scrollbar/download buttons */}
                        <div className="absolute top-0 right-0 bottom-0 w-16 bg-transparent cursor-not-allowed" />
                    </div>

                    <iframe
                        src={finalUrl}
                        className="w-full h-full border-none pointer-events-auto"
                        title={title}
                        allowFullScreen
                        onLoad={(e) => {
                            // Loaded
                        }}
                    />

                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] rotate-[-30deg] z-[5]">
                        <p className="text-9xl font-black text-slate-900 select-none uppercase text-center leading-tight">
                            NGIT PROPERTY<br/>CONFIDENTIAL
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure View Active</span>
                    </div>
                </main>

                {/* Footer / Meta */}
                <footer className="h-12 bg-white border-t px-8 flex items-center justify-center shrink-0 relative z-20">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        Protected by NGIT Security • Unauthorized Capture Prohibited
                    </p>
                </footer>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { display: none !important; }
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
