import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CourseGrid({ data, blocks }: { data: any, blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="container mx-auto px-4 lg:px-8 py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {data?.section_name || "Our Courses"}
                </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blocks.map((block: any, idx: number) => {
                    const extra = typeof block.extra_data === 'string' ? JSON.parse(block.extra_data || "{}") : (block.extra_data || {});
                    const price = Number(extra.fees) || 0;
                    return (
                        <div 
                            key={block._id || idx} 
                            className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                        >
                            <div className="space-y-4">
                                {block.image ? (
                                    <div className="mb-4 rounded-2xl overflow-hidden aspect-video relative border border-slate-100 shadow-sm group-hover:border-slate-200 transition-colors">
                                        <Image src={block.image} alt={block.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <PlayCircle className="w-14 h-14 text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4 rounded-2xl aspect-video bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <BookOpen className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-1">
                                        {block.title}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full">
                                            {block.subtitle || "Program"}
                                        </span>
                                        {price > 0 && (
                                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3">
                                        {block.description}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-5 space-y-4">
                                {price > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 line-through font-bold text-xs">₹{Math.round(price * 1.25).toLocaleString()}</span>
                                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            20% OFF
                                        </span>
                                    </div>
                                )}

                                {(block.button_text || block.button_link) && (
                                    <Link href={block.button_link || "#"}>
                                        <Button className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/10 transition-all group/btn">
                                            {block.button_text || "Enroll in Program"}
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </Link>
                                )}

                                <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 mt-2">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Duration</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">{extra.duration || "Self-paced"}</p>
                                    </div>
                                    <div className="border-x border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Access</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">Lifetime</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Certificate</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">Included</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
