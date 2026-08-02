"use client";

import React, { useState } from "react";
import { Link as LinkIcon, X, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SocialItem {
    platform: string;
    url: string;
    isActive?: boolean;
}

export default function FloatingSocials({ socials = [] }: { socials: SocialItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const activeSocials = socials.filter(s => s.isActive !== false);

    if (activeSocials.length === 0) return null;

    const getPlatformStyles = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes("whatsapp")) {
            return {
                bg: "bg-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.5)]",
                svg: (
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45h.007c5.584 0 10.122-4.516 10.126-10.064.002-2.687-1.042-5.212-2.94-7.114C16.65 1.524 14.128.482 11.44.482c-5.588 0-10.13 4.516-10.134 10.065-.001 2.01.523 3.976 1.52 5.71l-1.011 3.69 3.824-.993zm11.366-5.873c-.3-.15-1.77-.875-2.043-.974-.275-.098-.475-.148-.675.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-1.041-.519-1.714-.947-2.393-2.117-.174-.3-.174-.557-.026-.708.134-.135.3-.349.45-.524.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.675-1.624-.925-2.224-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.224 5.11 4.525.714.31 1.272.495 1.706.634.717.228 1.368.196 1.884.119.575-.085 1.77-.724 2.02-1.375.25-.65.25-1.209.175-1.325-.075-.115-.275-.189-.575-.339z" />
                    </svg>
                )
            };
        }
        if (p.includes("telegram")) {
            return {
                bg: "bg-[#0088cc] hover:shadow-[0_0_20px_rgba(0,136,204,0.5)]",
                svg: (
                    <svg className="w-5 h-5 fill-current mr-[1px] mt-[1px]" viewBox="0 0 24 24">
                        <path d="M11.944 0C5.347 0 0 5.347 0 11.944 0 18.54 5.348 23.89 11.944 23.89c6.596 0 11.944-5.348 11.944-11.944C23.888 5.347 18.54 0 11.944 0zm5.823 8.358l-1.97 9.278c-.147.662-.54 8.2-.54.82L12.38 16.22l-2.07 1.99c-.208.208-.383.383-.783.383l.307-4.36 7.947-7.18c.346-.307-.075-.478-.537-.17L7.333 13.06l-4.225-1.32c-.92-.288-.936-.92.193-1.362L19.82 3.97c.763-.28 1.428.176 1.134 1.39l-3.187 2.998z" />
                    </svg>
                )
            };
        }
        if (p.includes("instagram")) {
            return {
                bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:shadow-[0_0_20px_rgba(238,42,123,0.5)]",
                svg: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                )
            };
        }
        if (p.includes("facebook") || p.includes("fb")) {
            return {
                bg: "bg-[#1877F2] hover:shadow-[0_0_20px_rgba(24,119,242,0.5)]",
                svg: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                )
            };
        }
        return {
            bg: "bg-slate-800 hover:shadow-[0_0_20px_rgba(51,65,85,0.5)]",
            svg: <LinkIcon className="w-5 h-5 text-white" />
        };
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
            {/* 1. COLLAPSIBLE SOCIAL MEDIA STACK */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-3 items-center mb-1 pr-1.5"
                    >
                        {activeSocials.map((social, index) => {
                            const styles = getPlatformStyles(social.platform);
                            return (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={social.platform}
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
                                        styles.bg
                                    )}
                                >
                                    {styles.svg}
                                </a>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. TOGGLE / TRIGGER BUTTON ("Click Here") */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 px-6 rounded-full bg-slate-950 text-white hover:bg-slate-900 shadow-2xl border border-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
            >
                {isOpen ? (
                    <>
                        <X className="w-4 h-4 text-rose-500 animate-spin" />
                        <span>Close / बंद करें</span>
                    </>
                ) : (
                    <>
                        <Share2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Click Here / सोशल मीडिया</span>
                    </>
                )}
            </button>
        </div>
    );
}
