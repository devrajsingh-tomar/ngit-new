"use client";

import { ChevronLeft, ChevronRight, GraduationCap, ShieldCheck, Zap, ArrowRight, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Faculty {
    id: number | string;
    name: string;
    subject: string;
    qualification: string;
    experience: string;
    specialization: string;
    image?: string;
}

const defaultFaculty: Faculty[] = [
    {
        id: 1,
        name: "Javed Akhtar",
        subject: "Managing Director",
        qualification: "MCA, PGDCA",
        experience: "15+ Years",
        specialization: "Software Development & IT Strategy",
    },
    {
        id: 2,
        name: "Mohd. Anas",
        subject: "Senior Faculty",
        qualification: "MCA",
        experience: "8 Years",
        specialization: "Advanced Programming & Data Science",
    },
    {
        id: 3,
        name: "Saurabh Mishra",
        subject: "Lab Instructor",
        qualification: "B.Tech",
        experience: "6 Years",
        specialization: "Hardware & Networking Expert",
    },
    {
        id: 4,
        name: "Arifa Khatoon",
        subject: "Typing Expert",
        qualification: "MA, ADCA",
        experience: "10 Years",
        specialization: "Expert Bilingual Typing Specialist",
    },
];

export default function FacultySection({ members, data }: { members?: any[], data?: any }) {
    const [page, setPage] = useState(0);
    const itemsPerPage = 4;

    const title = data?.section_name || "Learn from the Industry Masters";
    const subtitle = data?.subtitle || "Elite Faculty";
    
    const displayFaculty = (members && members.length > 0) ? members.map((m, i) => ({
        id: m._id || i,
        name: m.name,
        subject: m.position,
        qualification: m.qualification || "Expert",
        experience: m.experience || "N/A",
        bio: m.bio || "Dedicated professional committed to educational excellence.",
        specialization: m.specialization || "Expert",
        shortBio: m.bio ? (m.bio.length > 100 ? m.bio.substring(0, 100) + "..." : m.bio) : (m.position + " at NGIT Academy."),
        image: m.image
    })) : (members?.length === 0 ? [] : defaultFaculty.map(f => ({
        ...f,
        id: f.id.toString(),
        bio: f.specialization,
        shortBio: f.specialization
    })));

    if (displayFaculty.length === 0) return null;

    const totalPages = Math.ceil(displayFaculty.length / itemsPerPage);
    const visibleFaculty = displayFaculty.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    return (
        <section id="faculty" className="py-24 bg-white relative overflow-hidden">
            {/* Architectural Accent */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-slate-50 -z-10" />
            
            <div className="container px-6 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                            <Zap className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                                {subtitle}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-none">
                            {title}
                        </h2>
                    </div>

                    {/* Elite Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm hover:shadow-xl transition-all disabled:opacity-20 group"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm hover:shadow-xl transition-all disabled:opacity-20 group"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
                    <AnimatePresence mode="wait">
                        {visibleFaculty.map((faculty, idx) => (
                            <motion.div
                                key={faculty.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group h-full"
                            >
                                <div className="h-full flex flex-col p-8 bg-white border border-slate-100 rounded-[3rem] hover:border-primary/20 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden">
                                    {/* Prestige Indicator */}
                                    <div className="absolute top-8 right-8 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-slate-100 group-hover:border-primary">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>

                                    {/* Visual Identity */}
                                    <div className="relative w-full aspect-square mb-10 rounded-[2.5rem] overflow-hidden bg-slate-50 border-8 border-slate-50 group-hover:border-white transition-all duration-700 shadow-inner">
                                        {faculty.image ? (
                                            <img 
                                                src={faculty.image} 
                                                alt={faculty.name} 
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <User className="w-20 h-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>

                                    {/* Narrative Info */}
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors duration-500">
                                            {faculty.name}
                                        </h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {faculty.subject}
                                        </p>
                                        
                                        <div className="pt-6 mt-6 border-t border-slate-50">
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-3">
                                                "{faculty.shortBio}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Structural Call-to-Action */}
                                    <div className="mt-8">
                                        <Link href={`/faculty/${faculty.id}`}>
                                            <button className="w-full h-14 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/10">
                                                See More <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* View All Sequence */}
            <div className="mt-20 text-center">
                <Link href="/faculty" className="inline-flex items-center gap-3 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-[11px] transition-colors group">
                    Meet All Industry masters & Faculty
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
}
