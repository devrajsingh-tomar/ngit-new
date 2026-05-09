"use client";

import { motion } from "framer-motion";
import { Quote, Sparkles, Target, Zap } from "lucide-react";
import Image from "next/image";

export default function DirectorMessageSection({ data, director }: { data?: any, director?: any }) {
    if (!director) return null;

    const title = data?.title || "Visionary Leadership";
    const bg_color = data?.bg_color || "bg-slate-950";

    return (
        <section className={`py-24 ${bg_color} relative overflow-hidden px-4`}>
            {/* Architectural Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px] -z-0 opacity-40 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10 max-w-7xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 md:p-20 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Visual Identity Column */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto group">
                            {/* Dynamic Frame */}
                            <div className="absolute inset-x-0 bottom-0 top-12 bg-primary/20 rounded-[3.5rem] rotate-3 scale-105 blur-2xl group-hover:rotate-6 group-hover:scale-110 transition-transform duration-1000" />
                            
                            <div className="relative w-full h-full overflow-hidden rounded-[3.5rem] border-8 border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] z-10">
                                {director.image ? (
                                    <Image
                                        src={director.image} 
                                        alt={director.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform [transition-duration:2000ms]"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white/10 text-6xl font-black italic">
                                        NGIT
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            
                            {/* Decorative Badge */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center text-slate-950 z-20 shadow-2xl border-4 border-slate-950/10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Sparkles className="w-8 h-8 text-primary mb-1 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">Established<br/>{director.establishedYear || "2009"}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Intellectual Narrative Column */}
                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em]">
                            <Zap className="w-3.5 h-3.5 text-secondary animate-pulse" />
                            {title}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
                                {director.name}
                            </h2>
                            <div className="h-2 w-32 bg-gradient-to-r from-primary to-transparent rounded-full" />
                            <h3 className="text-xl md:text-2xl text-primary font-black uppercase font-serif tracking-widest leading-none">
                                {director.position || "Head of Institution"}
                            </h3>
                            {director.qualification && (
                                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{director.qualification}</p>
                            )}
                        </div>

                        <div className="relative group max-w-xl">
                            <Quote className="w-32 h-32 text-primary opacity-5 absolute -top-16 -left-12 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="relative pt-6">
                                <p className="text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed italic relative z-10 tracking-tight">
                                    "{director.message || director.bio || "In an era of rapid digital evolution, we don't just teach technology; we architect the next generation of industrial leaders with a paradigm of excellence."}"
                                </p>
                                
                                <div className="mt-12 flex items-center gap-6">
                                    <div className="w-12 h-1 bg-slate-800 rounded-full" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600">Chairman's Commitment</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
