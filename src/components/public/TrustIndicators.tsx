"use client";

import { Trophy, Users, TrendingUp, Target, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

const defaultStats = [
    {
        icon: Trophy,
        value: "15+",
        label: "Years of Mastery",
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
    {
        icon: Users,
        value: "5000+",
        label: "Students Architected",
        color: "text-teal-600",
        bg: "bg-teal-100",
    },
    {
        icon: TrendingUp,
        value: "98%",
        label: "Success Deployment",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
    },
    {
        icon: Target,
        value: "45+",
        label: "Elite Milestones",
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
];

interface TrustIndicatorsProps {
    stats?: any[];
}

const iconMap: Record<string, any> = { Trophy, Users, TrendingUp, Target, ShieldCheck, Zap };

export default function TrustIndicators({ stats }: TrustIndicatorsProps) {
    const displayStats = stats && stats.length > 0 ? stats.map((s, i) => {
        const base = defaultStats[i % defaultStats.length] || defaultStats[0];
        const CustomIcon = s.icon_name ? iconMap[s.icon_name] : null;
        
        return {
            ...base,
            icon: CustomIcon || base.icon,
            value: s.subtitle || s.value || "0",
            label: s.title || s.label || "Stat"
        };
    }) : defaultStats;

    return (
        <section className="bg-white border-y border-slate-100 py-24 relative overflow-hidden">
            {/* Artistic Subtlety */}
            <div className="absolute inset-0 bg-slate-50/50 -z-10" />
            
            <div className="container px-6 mx-auto relative z-10">
                <div className="text-center mb-16 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-black uppercase tracking-[0.3em] text-[9px]">
                        <Zap className="w-3 h-3 text-primary" />
                        Mission Critical Metrics
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 lg:gap-24">
                    {displayStats.map((stat, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group text-center"
                        >
                            <div className="relative inline-block mb-10">
                                {/* Soft Shadow Layer */}
                                <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 bg-slate-400`} />
                                
                                <div className={`w-24 h-24 rounded-3xl ${stat.bg} ${stat.color} flex items-center justify-center border-4 border-white shadow-xl group-hover:-translate-y-2 transition-transform duration-500 relative`}>
                                    <stat.icon className="w-12 h-12" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic leading-none">
                                    {stat.value}
                                </h3>
                                <div className="h-1 w-12 bg-slate-200 mx-auto rounded-full group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] pt-4">
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
