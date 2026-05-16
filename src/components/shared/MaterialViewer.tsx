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

    const embedUrl = getEmbedUrl(url);

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 select-none"
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
                <header className="h-20 bg-slate-50 border-b flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 leading-tight line-clamp-1">{title}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure PDF Document</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500"><ZoomOut className="w-4 h-4" /></Button>
                        <div className="px-3 text-xs font-bold text-slate-600">100%</div>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500"><ZoomIn className="w-4 h-4" /></Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 text-slate-400 hover:text-primary"><Share2 className="w-5 h-5" /></Button>
                            {/* Download button removed as per security request */}
                        </div>
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
                <main className="flex-1 bg-slate-100 flex items-center justify-center overflow-auto relative">
                    <iframe
                        src={`${embedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-none"
                        title={title}
                        allowFullScreen
                        onLoad={(e) => {
                            // Basic attempts to obscure iframe content from standard print/save
                        }}
                    />

                    {/* Fallback for blocked content */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-2">
                         <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black text-primary border border-primary/20 shadow-lg hover:bg-primary hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                            <ExternalLink className="w-3 h-3" /> 
                            Open in New Tab
                         </a>
                         <p className="text-[8px] font-bold text-slate-400 bg-white/50 backdrop-blur px-2 py-1 rounded-md uppercase tracking-tighter">If content is blocked above</p>
                    </div>

                    {/* Watermark Overlay to discourage screenshots */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-30deg]">
                        <p className="text-9xl font-black text-slate-900 select-none uppercase">Confidential • NGIT</p>
                    </div>

                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/10 opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
                        <span className="text-white text-sm font-bold px-4 border-l border-r border-white/10 uppercase tracking-widest">Protected View</span>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
                    </div>
                </main>

                {/* Footer / Meta */}
                <footer className="h-10 bg-white border-t px-8 flex items-center justify-center shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protected Content • Download and Screenshot prohibited</p>
                </footer>
            </div>
        </div>
    );
}
