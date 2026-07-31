"use client";

import { Megaphone, ChevronRight, Sparkles, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
    id: string | number;
    text: string;
    link?: string;
    createdAt?: string;
}

export default function NotificationScroller({ notifications = [] }: { notifications: Notification[] }) {
    if (!notifications || notifications.length === 0) return null;

    // Double/triple list to ensure the marquee loop is seamless
    const listToRender = notifications.length >= 4 
        ? [...notifications, ...notifications] 
        : [...notifications, ...notifications, ...notifications, ...notifications];

    return (
        <section className="bg-slate-50 py-12 border-y border-slate-100 overflow-hidden">
            <div className="container px-6 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Latest Announcements</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Real-time Institute Updates</p>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Live Feed</span>
                    </div>
                </div>

                {/* Horizontal Scrollable Container */}
                <div className="relative overflow-hidden w-full">
                    <div className="animate-marquee hover:[animation-play-state:paused] flex gap-6 pb-6">
                        {listToRender.map((item, index) => (
                            <div 
                                key={`${item.id}-${index}`}
                                className="flex-shrink-0 w-[300px] md:w-[380px]"
                            >
                                <div className="h-full bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group/card relative overflow-hidden">
                                    {/* Glass flare */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                    
                                    <div className="flex flex-col h-full space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/card:text-primary transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Update
                                                </span>
                                            </div>
                                            {(index % notifications.length) === 0 && (
                                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                                    <Sparkles className="w-2.5 h-2.5" /> NEW
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-normal break-words line-clamp-3 flex-1">
                                            {item.text}
                                        </p>

                                        {item.link ? (
                                            <Link
                                                href={item.link}
                                                className="group/btn inline-flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-widest hover:text-primary-dark transition-colors pt-2"
                                            >
                                                View Details
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                                                    <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="h-[21px]" /> /* spacer */
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 35s linear infinite;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}
