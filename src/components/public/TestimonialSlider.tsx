import { Quote } from "lucide-react";
import Image from "next/image";

export default function TestimonialSlider({ data, blocks }: { data: any, blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="container mx-auto px-4 lg:px-10 py-16">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-slate-900 mb-6">{data?.section_name || "Success Stories & Testimonials"}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blocks.map((block: any, idx: number) => {
                    const extra = typeof block.extra_data === 'string' ? JSON.parse(block.extra_data || "{}") : (block.extra_data || {});
                    return (
                        <div key={idx} className={`p-8 rounded-[2rem] shadow-xl text-center relative hover:-translate-y-2 transition-transform duration-300 ${extra.color || "bg-white border border-slate-100"}`}>
                            <Quote className="w-10 h-10 text-slate-200 absolute top-6 left-6 -z-10" />
                            {block.image ? (
                                <div className="mx-auto relative w-24 h-24 rounded-full mb-6 overflow-hidden shadow-sm border-4 border-slate-50">
                                    <Image src={block.image} alt={block.title} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full mb-6 flex items-center justify-center font-black text-2xl text-slate-400">
                                    {block.title?.[0]}
                                </div>
                            )}
                            
                            <p className="text-slate-600 mb-6 font-medium leading-relaxed italic">
                                "{block.description}"
                            </p>

                            <h4 className="text-xl font-bold text-slate-900">{block.title || "Student Name"}</h4>
                            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mt-1">
                                {block.subtitle || "Achievement"}
                            </p>
                            {extra.course && (
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold mt-3 inline-block">
                                    Course: {extra.course}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
