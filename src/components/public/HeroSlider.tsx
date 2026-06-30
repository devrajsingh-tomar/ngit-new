"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileDown, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Slide {
    _id: string;
    title: string;
    subtitle: string;
    description: string;
    imageUrl?: string;
    bgColor: string;
    cta1Text: string;
    cta1Link: string;
    cta2Text: string;
    cta2Link: string;
    isActive: boolean;
    order: number;
}

export default function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        fetch("/api/hero-slides")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setSlides(data);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isAutoPlaying || slides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="relative w-full h-[85vh] md:h-[90vh] bg-gradient-to-br from-primary via-primary to-emerald-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
        );
    }

    // Empty state — no slides configured yet
    if (slides.length === 0) {
        return (
            <div className="relative w-full h-[85vh] md:h-[90vh] bg-gradient-to-br from-primary via-primary to-emerald-950 flex items-center justify-center">
                <div className="text-center text-white/60 px-4">
                    <p className="text-2xl font-bold mb-2">Hero Banner</p>
                    <p className="text-sm opacity-70">No slides configured yet. Add slides from the Admin Panel → Website CMS → Homepage Builder.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[85vh] lg:h-[90vh] min-h-[400px] overflow-hidden bg-slate-950">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide._id}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000",
                        index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    {/* Background */}
                    {slide.imageUrl ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform [transition-duration:10000ms] ease-linear"
                            style={{ 
                                backgroundImage: `url(${slide.imageUrl})`,
                                transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
                        </div>
                    ) : (
                        <div className={cn("absolute inset-0 bg-gradient-to-br", slide.bgColor || "from-primary via-primary to-emerald-950")}>
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative h-full flex items-center">
                        <div className="container-custom">
                            <div className="max-w-4xl animate-slide-up">
                                {slide.subtitle && (
                                    <p className="text-accent font-bold text-base md:text-lg uppercase tracking-widest mb-6 inline-block px-4 py-2 bg-accent/10 rounded-lg backdrop-blur-sm">
                                        {slide.subtitle}
                                    </p>
                                )}
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                                    {slide.title}
                                </h1>
                                {slide.description && (
                                    <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl leading-relaxed font-medium">
                                        {slide.description}
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {slide.cta1Text && slide.cta1Link && (
                                        <Link href={slide.cta1Link}>
                                            <Button className="bg-gradient-to-r from-accent via-accent-dark to-orange-600 hover:from-orange-600 hover:via-accent-dark hover:to-accent text-white font-bold text-lg px-10 py-7 shadow-2xl hover:shadow-accent/50 transition-all duration-300 w-full sm:w-auto">
                                                <FileDown className="w-6 h-6 mr-3" />
                                                {slide.cta1Text}
                                            </Button>
                                        </Link>
                                    )}
                                    {slide.cta2Text && slide.cta2Link && (
                                        <Link href={slide.cta2Link}>
                                            <Button variant="outline" className="w-full sm:w-auto bg-white/15 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold text-lg px-10 py-7 transition-all duration-300">
                                                <Calendar className="w-6 h-6 mr-3" />
                                                {slide.cta2Text}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all group"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all group"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </>
            )}

            {/* Slide Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "transition-all duration-300",
                                index === currentSlide
                                    ? "w-12 h-2 bg-accent rounded-full"
                                    : "w-2 h-2 bg-white/50 hover:bg-white/75 rounded-full"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
