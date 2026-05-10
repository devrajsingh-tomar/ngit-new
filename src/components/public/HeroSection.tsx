"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Sparkles, Download, ChevronLeft, ChevronRight, TrendingUp, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroSection({ blocks }: { blocks?: any[] }) {
    const defaultBlock = {
        title: "A Place to Learn and Grow Your Future",
        subtitle: "India's Premier IT & Academic Hub",
        description: "Empowering the next generation of tech leaders with cutting-edge vocational training, government exam prep, and specialized computer education.",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
        button_text: "New Admission",
        button_link: "/register",
        secondary_button_text: "Prospectus",
        secondary_button_link: "/prospectus",
        layout: "full-background",
        image_size: "full",
        animation: "slide",
        duration: 5000
    };

    const sliderBlocks = (blocks && blocks.length > 0) ? blocks : [defaultBlock];

    if (sliderBlocks.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden bg-slate-950">
            <Swiper
                modules={[Autoplay, Navigation, Pagination, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                loop={sliderBlocks.length > 1}
                effect={sliderBlocks.some(b => b.animation === 'fade') ? 'fade' : 'slide'}
                autoplay={{
                    delay: sliderBlocks[0]?.duration || 5000,
                    disableOnInteraction: false,
                }}
                navigation={{
                    nextEl: '.hero-next',
                    prevEl: '.hero-prev',
                }}
                pagination={{
                    clickable: true,
                    el: '.hero-pagination',
                    bulletClass: 'hero-bullet',
                    bulletActiveClass: 'hero-bullet-active'
                }}
                className="w-full"
            >
                {sliderBlocks.map((block, idx) => {
                    const primaryText = block.cta1Text || block.button_text;
                    const primaryLink = block.cta1Link || block.button_link;
                    const secondaryText = block.cta2Text || block.secondary_button_text;
                    const secondaryLink = block.cta2Link || block.secondary_button_link;
                    const image = block.imageUrl || block.image;
                    
                    const isTextEmpty = !block.title?.trim() && !block.subtitle?.trim() && !block.description?.trim() && !primaryText && !secondaryText;

                    return (
                        <SwiperSlide key={block._id || idx}>
                            <div className="relative w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[65vh] xl:min-h-[75vh] flex items-center overflow-hidden bg-slate-950">
                                {/* Background Image - Edge to Edge */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={image || defaultBlock.image}
                                        alt={block.title || "Hero Image"}
                                        className="w-full h-full object-cover md:object-fill lg:object-cover object-center transition-transform duration-700"
                                    />
                                    {/* Only show overlay if there is custom text to show */}
                                    {!isTextEmpty && (
                                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
                                    )}
                                </div>

                                {/* Content Overlay (Only if not empty) */}
                                {!isTextEmpty && (
                                    <div className="container relative z-10 px-6 mx-auto">
                                        <div className="max-w-4xl space-y-8 text-center lg:text-left">
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6 }}
                                                className="space-y-6"
                                            >
                                                {block.subtitle && (
                                                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                                        <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                                                            {block.subtitle}
                                                        </span>
                                                    </div>
                                                )}

                                                {block.title && (
                                                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight italic drop-shadow-2xl">
                                                        {block.title}
                                                    </h1>
                                                )}

                                                {block.description && (
                                                    <div 
                                                        className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl"
                                                        dangerouslySetInnerHTML={{ __html: block.description }}
                                                    />
                                                )}

                                                {(primaryText || secondaryText) && (
                                                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-4 justify-center lg:justify-start">
                                                        {primaryText && (
                                                            <Link href={primaryLink || "/register"} className="w-full sm:w-auto">
                                                                <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all hover:scale-105">
                                                                    <UserPlus className="w-6 h-6 mr-3" />
                                                                    {primaryText}
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {secondaryText && (
                                                            <Link href={secondaryLink || "/prospectus"} className="w-full sm:w-auto">
                                                                <Button variant="outline" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black text-white border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:scale-105">
                                                                    <Download className="w-6 h-6 mr-3" />
                                                                    {secondaryText}
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Custom Navigation */}
            {sliderBlocks.length > 1 && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-4 md:px-8">
                    <button className="hero-prev pointer-events-auto h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all group">
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button className="hero-next pointer-events-auto h-12 w-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all group">
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {/* Pagination */}
                    <div className="hero-pagination absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto" />
                </div>
            )}

            <style jsx global>{`
                .hero-bullet {
                    width: 8px;
                    height: 8px;
                    border-radius: 99px;
                    background: rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .hero-bullet-active {
                    width: 32px;
                    background: #fff;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </section>
    );
}
