import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CourseGrid({ data, blocks }: { data: any, blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="container mx-auto px-4 lg:px-10 py-20">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{data?.section_name || "Our Courses"}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blocks.map((block: any, idx: number) => {
                    const extra = typeof block.extra_data === 'string' ? JSON.parse(block.extra_data || "{}") : (block.extra_data || {});
                    return (
                        <div key={block._id || idx} className={`p-8 rounded-[2rem] bg-white border ${extra.borderColor || "border-emerald-100"} shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
                            {block.image && (
                                <div className="mb-6 rounded-2xl overflow-hidden aspect-video relative">
                                    <Image src={block.image} alt={block.title} fill className="object-cover" />
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{block.title}</h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{block.subtitle || "Course"}</span>
                                {extra.fees && <span className="text-xl font-black text-slate-900">₹{extra.fees}</span>}
                            </div>
                            <p className="text-slate-600 mb-6 font-medium">{block.description}</p>
                            
                            {extra.duration && (
                                <p className="text-sm text-slate-500 mb-6 font-bold uppercase tracking-wider">⏱ Duration: {extra.duration}</p>
                            )}
                            
                            {(block.button_text || block.button_link) && (
                                <Link href={block.button_link || "#"}>
                                    <Button className="w-full font-bold h-12 rounded-xl bg-slate-900 hover:bg-primary text-white transition-colors">
                                        {block.button_text || "Learn More"} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
