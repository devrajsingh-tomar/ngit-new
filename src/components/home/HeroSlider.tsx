"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface BannerBlock {
    _id?: string;
    imageUrl?: string;
    image?: string;
    cta1Link?: string;
    button_link?: string;
    openInNewTab?: boolean;
    isActive?: boolean;
    title?: string;
}

interface HeroSliderProps {
    blocks?: BannerBlock[];
}

export default function HeroSlider({ blocks = [] }: HeroSliderProps) {
    // Default fallback promotional posters if database is empty
    const defaultBanners: BannerBlock[] = [
        {
            _id: "default-1",
            imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1920",
            cta1Link: "/typing",
            openInNewTab: false
        }
    ];

    const activeSlides = (blocks && blocks.length > 0)
        ? blocks.filter(b => b.isActive !== false)
        : defaultBanners;

    if (activeSlides.length === 0) return null;

    return (
        <section className="w-full select-none bg-slate-50 py-4 overflow-hidden">
            <div className="w-full px-4 md:px-6">
                <div className="rounded-[2rem] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-100 bg-white">
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        slidesPerView={1}
                        loop={activeSlides.length > 1}
                        speed={800}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        pagination={{
                            clickable: true,
                            bulletClass: "swiper-pagination-bullet",
                            bulletActiveClass: "swiper-pagination-bullet-active"
                        }}
                        navigation={activeSlides.length > 1}
                        className="w-full group"
                    >
                        {activeSlides.map((slide, idx) => {
                            const imageUrl = slide.imageUrl || slide.image || defaultBanners[0].imageUrl || "";
                            const linkUrl = slide.cta1Link || slide.button_link;
                            const target = slide.openInNewTab ? "_blank" : undefined;
                            const rel = slide.openInNewTab ? "noopener noreferrer" : undefined;

                            const slideContent = (
                                <div className="relative w-full h-[280px] sm:h-[400px] md:h-[550px] lg:h-[600px] overflow-hidden group/slide">
                                    <Image
                                        src={imageUrl}
                                        alt={slide.title || "Promotional Banner"}
                                        fill
                                        sizes="100vw"
                                        priority={idx === 0}
                                        className="object-cover transition-transform duration-[8000ms] ease-out group-hover/slide:scale-105"
                                        loading={idx === 0 ? "eager" : "lazy"}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                                </div>
                            );

                            return (
                                <SwiperSlide key={slide._id || idx}>
                                    {linkUrl ? (
                                        <Link 
                                            href={linkUrl} 
                                            target={target} 
                                            rel={rel}
                                            className="block w-full cursor-pointer"
                                        >
                                            {slideContent}
                                        </Link>
                                    ) : (
                                        <div className="w-full">
                                            {slideContent}
                                        </div>
                                    )}
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>

            {/* Custom Arrow Styles & Hover Micro-Animations */}
            <style jsx global>{`
                .swiper-button-next,
                .swiper-button-prev {
                    color: #fff !important;
                    background: rgba(255, 255, 255, 0.15) !important;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    width: 48px !important;
                    height: 48px !important;
                    border-radius: 50%;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    opacity: 0;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                }
                .swiper-button-next::after,
                .swiper-button-prev::after {
                    font-size: 16px !important;
                    font-weight: 800;
                }
                .swiper:hover .swiper-button-next,
                .swiper:hover .swiper-button-prev {
                    opacity: 1;
                }
                .swiper-button-next {
                    right: 24px !important;
                    transform: translateX(10px) translateY(-50%) !important;
                }
                .swiper-button-prev {
                    left: 24px !important;
                    transform: translateX(-10px) translateY(-50%) !important;
                }
                .swiper:hover .swiper-button-next {
                    transform: translateX(0) translateY(-50%) !important;
                }
                .swiper:hover .swiper-button-prev {
                    transform: translateX(0) translateY(-50%) !important;
                }
                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: hsl(142, 76%, 36%) !important; /* brand primary color hover */
                    border-color: hsl(142, 76%, 36%) !important;
                    transform: scale(1.08) translateY(-50%) !important;
                }
                .swiper-pagination-bullet {
                    width: 8px !important;
                    height: 8px !important;
                    margin: 0 5px !important;
                    background: #fff !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                    border-radius: 50% !important;
                    opacity: 0.5 !important;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    display: inline-block !important;
                }
                .swiper-pagination-bullet-active {
                    width: 24px !important;
                    border-radius: 10px !important;
                    background: hsl(142, 76%, 36%) !important;
                    border-color: hsl(142, 76%, 36%) !important;
                    opacity: 1 !important;
                }
                .swiper-pagination {
                    bottom: 20px !important;
                }
            `}</style>
        </section>
    );
}
