"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BookOpen, Globe, MonitorPlay, CheckCircle, GraduationCap, Zap } from "lucide-react";

const staticReasons = [
    { sincerity: true, icon: <ShieldCheck className="w-8 h-8" />, title: "Trusted IT Institute", desc: "Recognized training center with a 15-year legacy of excellence.", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <BookOpen className="w-8 h-8" />, title: "Affordable Diplomas", desc: "Premium technical education at accessible fee structures.", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: <Globe className="w-8 h-8" />, title: "Bilingual Learning", desc: "Flexible course delivery in Hindi & English for better understanding.", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <MonitorPlay className="w-8 h-8" />, title: "Smart Hybrid Classes", desc: "State-of-the-art labs combined with flexible online support.", color: "text-orange-600", bg: "bg-orange-50" },
    { icon: <CheckCircle className="w-8 h-8" />, title: "50+ Courses", desc: "Comprehensive curriculum from basic IT to professional diplomas.", color: "text-pink-600", bg: "bg-pink-50" },
    { icon: <GraduationCap className="w-8 h-8" />, title: "Govt. Exam Prep", desc: "Dedicated coaching for competitive exams & job placements.", color: "text-teal-600", bg: "bg-teal-50" }
];

export default function WhyChooseSection({ data, blocks }: { data?: any, blocks?: any[] }) {
    const title = data?.section_name || "Excellence in Every Lesson";
    const subtitle = data?.subtitle || "Why NGIT?";
    
    const displayReasons = blocks && blocks.length > 0 ? blocks.map((b, i) => ({
        ...staticReasons[i % staticReasons.length],
        title: b.title,
        desc: b.description
    })) : staticReasons;

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-4">
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            {subtitle}
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        {title}
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        We don't just teach technology; we architect your career for the modern digital economy with precision and care.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayReasons.map((reason, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500"
                        >
                            <div className={`w-16 h-16 ${reason.bg} rounded-2xl flex items-center justify-center ${reason.color} mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-black/5`}>
                                {reason.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{reason.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                {reason.desc}
                            </p>
                            
                            <div className="mt-8 h-1 w-12 bg-slate-100 rounded-full group-hover:w-24 group-hover:bg-primary transition-all duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
            
            {/* Soft decorative elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -z-10" />
        </section>
    );
}
