"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Zap, Maximize2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface GalleryImage {
    _id: string;
    title: string;
    category: string;
    url: string;
}

export default function GallerySection({ images = [], data }: { images?: GalleryImage[], data?: any }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const title = data?.section_name || "Capture the Moments";
    const subtitle = data?.subtitle || "Campus Gallery";
    const description = data?.description || "A visual journey through our state-of-the-art infrastructure, collaborative learning spaces, and vibrant campus culture.";

    const openLightbox = (id: string) => setSelectedImage(id);
    const closeLightbox = () => setSelectedImage(null);

    const goToNext = () => {
        if (selectedImage !== null) {
            const currentIndex = images.findIndex(img => img._id === selectedImage);
            const nextIndex = (currentIndex + 1) % images.length;
            setSelectedImage(images[nextIndex]._id);
        }
    };

    const goToPrev = () => {
        if (selectedImage !== null) {
            const currentIndex = images.findIndex(img => img._id === selectedImage);
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            setSelectedImage(images[prevIndex]._id);
        }
    };

    const selectedImg = images.find(img => img._id === selectedImage);

    return (
        <section id="gallery" className="py-24 bg-white relative overflow-hidden">
            <div className="container px-6 mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-4">
                        < Zap className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            {subtitle}
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        {title}
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Gallery Grid - Responsive Masonry-like Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {images.slice(0, 6).map((image, idx) => (
                        <motion.div
                            key={image._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => openLightbox(image._id)}
                            className={cn(
                                "relative overflow-hidden cursor-pointer group rounded-[2rem] bg-slate-100",
                                idx % 3 === 0 ? "aspect-[4/5] md:col-span-1" : "aspect-square",
                                idx % 4 === 0 ? "md:col-span-2 md:aspect-video" : ""
                            )}
                        >
                            {image.url ? (
                                <img 
                                    src={image.url} 
                                    alt={image.title} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                                    <Camera className="w-12 h-12" />
                                </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="text-center p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30 text-white">
                                        <Maximize2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-white font-black tracking-tight mb-1">{image.title}</p>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{image.category}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All */}
                <div className="mt-16 text-center">
                    <Link href="/gallery" className="inline-flex items-center gap-3 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-[11px] transition-colors group">
                        Explore Full Campus Gallery
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Lightbox Experience */}
            <AnimatePresence>
                {selectedImage !== null && selectedImg && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        {/* Controls */}
                        <div className="absolute top-10 left-10 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">
                            {images.findIndex(img => img._id === selectedImage) + 1} / {images.length}
                        </div>

                        <button
                            onClick={closeLightbox}
                            className="absolute top-8 right-8 w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 group"
                        >
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>

                        <div className="flex items-center gap-8 w-full max-w-7xl">
                            <button
                                onClick={goToPrev}
                                className="hidden md:flex w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 items-center justify-center text-white transition-all"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <div className="flex-1 relative aspect-video rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/10">
                                {selectedImg.url ? (
                                    <img 
                                        src={selectedImg.url} 
                                        alt={selectedImg.title} 
                                        className="w-full h-full object-contain" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        <Camera className="w-24 h-24" />
                                    </div>
                                )}
                                
                                {/* Info Strip */}
                                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-950 text-white text-center">
                                    <h3 className="text-3xl font-black tracking-tighter mb-2">{selectedImg.title}</h3>
                                    <p className="text-white/60 font-black uppercase tracking-widest text-xs">{selectedImg.category}</p>
                                </div>
                            </div>

                            <button
                                onClick={goToNext}
                                className="hidden md:flex w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 items-center justify-center text-white transition-all"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
