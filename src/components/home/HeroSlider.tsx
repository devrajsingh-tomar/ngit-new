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
        <section className="w-full select-none bg-white overflow-hidden">
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={1}
                loop={activeSlides.length > 1}
                speed={700}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                pagination={{
                    clickable: true,
                    bulletClass: "swiper-pagination-bullet bg-slate-900 opacity-30 transition-all duration-300",
                    bulletActiveClass: "swiper-pagination-bullet-active bg-emerald-500 opacity-100 w-6 rounded-full"
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
                        <div className="relative w-full h-[280px] sm:h-[400px] md:h-[520px] overflow-hidden">
                            <Image
                                src={imageUrl}
                                alt={slide.title || "Promotional Banner"}
                                fill
                                sizes="100vw"
                                priority={idx === 0}
                                className="object-cover transition-transform duration-700"
                                loading={idx === 0 ? "eager" : "lazy"}
                            />
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

            {/* Custom Arrow Styles & Hover Micro-Animations */}
            <style jsx global>{`
                .swiper-button-next,
                .swiper-button-prev {
                    color: #fff !important;
                    background: rgba(0, 0, 0, 0.4);
                    width: 44px !important;
                    height: 44px !important;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    opacity: 0;
                }
                .swiper-button-next::after,
                .swiper-button-prev::after {
                    font-size: 18px !important;
                    font-weight: bold;
                }
                .swiper:hover .swiper-button-next,
                .swiper:hover .swiper-button-prev {
                    opacity: 1;
                }
                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: rgba(16, 185, 129, 0.9) !important; /* brand primary color hover */
                    transform: scale(1.1);
                }
                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    margin: 0 4px !important;
                }
                .swiper-pagination-bullet-active {
                    width: 24px !important;
                }
                .swiper-pagination {
                    bottom: 20px !important;
                }
            `}</style>
        </section>
    );
}
