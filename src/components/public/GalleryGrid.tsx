import { ImageIcon } from "lucide-react";
import Image from "next/image";

export default function GalleryGrid({ data, blocks }: { data: any, blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;


    // Using regular un-hooked layout for simplicity, or we use hooks:
    // But this is a component that might be rendered server-side or client-side.
    // If we use useState, it must have 'use client'.
    // See how it's done...
    return (
        <div className="container mx-auto px-4 lg:px-10 py-16">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-slate-900 mb-6">{data?.section_name || "Our Gallery"}</h2>
            </div>
            {/* Minimal static view without tabs, or we can use standard grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {blocks.map((item: any, idx: number) => (
                    <div
                        key={idx}
                        className="group relative aspect-square rounded-[2rem] overflow-hidden bg-slate-200 cursor-pointer shadow-md hover:shadow-xl"
                    >
                        {item.image ? (
                            <Image
                                src={item.image}
                                alt={item.title || "Gallery Image"}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-slate-100">
                                <ImageIcon className="w-12 h-12 text-slate-300" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <span className="text-emerald-300 font-bold uppercase tracking-wider text-xs mb-1">
                                {item.subtitle || "Category"}
                            </span>
                            <h4 className="text-white text-lg font-bold">
                                {item.title || item.description || "Image"}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
