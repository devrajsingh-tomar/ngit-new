"use client";

import React, { useState, useEffect } from "react";
import { X, Play, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PopupSettings {
    isActive: boolean;
    title: string;
    description: string;
    imageUrl?: string;
    buttonText: string;
    buttonLink: string;
    showOncePerSession: boolean;
}

export default function HomepagePopup({ settings }: { settings: PopupSettings | null }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!settings || !settings.isActive) return;

        // Check if shown in current session
        if (settings.showOncePerSession) {
            const hasBeenShown = sessionStorage.getItem("ngit_popup_shown");
            if (hasBeenShown === "true") {
                return; // already shown
            }
        }

        // Delay popup showing slightly for better UX
        const timer = setTimeout(() => {
            setIsOpen(true);
            if (settings.showOncePerSession) {
                sessionStorage.setItem("ngit_popup_shown", "true");
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [settings]);

    if (!settings || !settings.isActive) return null;

    const handleClose = () => {
        setIsOpen(false);
    };

    const isYoutubeLink = settings.buttonLink.toLowerCase().includes("youtube.com") || settings.buttonLink.toLowerCase().includes("youtu.be");

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 sm:p-10 w-full max-w-md relative z-10 overflow-hidden text-center"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Close Popup"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Top Image / YouTube play button */}
                        <div className="mt-4 mb-6 flex justify-center">
                            {settings.imageUrl ? (
                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 bg-slate-50 shadow-sm">
                                    <img src={settings.imageUrl} alt="Icon" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border",
                                    isYoutubeLink ? "bg-red-50 text-red-500 border-red-100" : "bg-primary/5 text-primary border-primary/10"
                                )}>
                                    {isYoutubeLink ? (
                                        <Play className="w-8 h-8 fill-current" />
                                    ) : (
                                        <ExternalLink className="w-7 h-7" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-3">
                            {settings.title || "Announcements & Updates"}
                        </h3>

                        {/* Description */}
                        {settings.description && (
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 max-w-xs mx-auto whitespace-pre-line">
                                {settings.description}
                            </p>
                        )}

                        {/* CTA button */}
                        <div className="space-y-4">
                            <a
                                href={settings.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <button
                                    className={cn(
                                        "w-full h-14 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                                        isYoutubeLink
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                                            : "bg-slate-950 hover:bg-slate-900 text-white shadow-slate-200"
                                    )}
                                >
                                    {isYoutubeLink && <Play className="w-4 h-4 fill-white" />}
                                    {settings.buttonText || "Learn More"}
                                    <span className="text-xs">→</span>
                                </button>
                            </a>

                            {/* Dismiss button */}
                            <button
                                onClick={handleClose}
                                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest pt-2"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
