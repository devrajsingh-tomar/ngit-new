import { Users } from "lucide-react";
import Image from "next/image";

export default function FacultyGrid({ data, blocks, members }: { data: any, blocks?: any[], members?: any[] }) {
    const displayItems = members && members.length > 0 
        ? members.map(m => ({
            _id: m._id,
            title: m.name,
            subtitle: m.position,
            description: m.bio || m.qualification,
            image: m.image,
            extra_data: JSON.stringify({
                designation: m.position,
                experience: m.experience || "Expert",
                qualification: m.qualification
            })
        }))
        : (blocks || []);

    if (displayItems.length === 0) return null;

    return (
        <div className="container mx-auto px-4 lg:px-10 py-20">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-6">{data?.section_name || "Our Exceptional Team"}</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayItems.map((block: any, idx: number) => {
                    const extra = typeof block.extra_data === 'string' ? JSON.parse(block.extra_data || "{}") : (block.extra_data || {});
                    return (
                        <div
                            key={block._id || idx}
                            className={`p-10 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-2 transition-transform duration-300 bg-white border border-slate-100 ${extra.color || ""}`}
                        >
                            {block.image ? (
                                <div className="relative w-32 h-32 rounded-full mb-6 overflow-hidden shadow-sm border-4 border-white">
                                    <Image src={block.image} alt={block.title} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className={`p-4 rounded-full shadow-sm mb-6 ${extra.iconColor || "bg-emerald-50 text-emerald-600"}`}>
                                    <Users className="w-10 h-10" />
                                </div>
                            )}

                            <h4 className="text-2xl font-extrabold text-slate-900 mb-2">{block.title || block.subtitle}</h4>
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs mb-4">
                                {extra.designation || block.subtitle}
                            </p>
                            
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {block.description}
                            </p>
                            {extra.experience && (
                                <p className="mt-4 text-[10px] bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest font-bold text-slate-600">
                                    {extra.experience} Years Exp.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
