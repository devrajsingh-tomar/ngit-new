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
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[80vh] lg:h-[85vh] min-h-[420px] overflow-hidden bg-slate-950">
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
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform [transition-duration:10000ms] ease-out"
                            style={{ 
                                backgroundImage: `url(${slide.imageUrl})`,
                                transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
                        </div>
                    ) : (
                        <div className={cn("absolute inset-0 bg-gradient-to-br", slide.bgColor || "from-primary via-primary to-emerald-950")}>
                            <div className="absolute inset-0 bg-black/30" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative h-full flex items-center">
                        <div className="container-custom">
                            <div className="max-w-4xl space-y-6 md:space-y-8">
                                {slide.subtitle && (
                                    <p className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-[0.2em] mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {slide.subtitle}
                                    </p>
                                )}
                                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                                    {slide.title}
                                </h1>
                                {slide.description && (
                                    <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed font-medium">
                                        {slide.description}
                                    </p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    {slide.cta1Text && slide.cta1Link && (
                                        <Link href={slide.cta1Link}>
                                            <Button className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-8 py-6 rounded-xl transition-all duration-300 w-full sm:w-auto shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                                                <FileDown className="w-5 h-5" />
                                                {slide.cta1Text}
                                            </Button>
                                        </Link>
                                    )}
                                    {slide.cta2Text && slide.cta2Link && (
                                        <Link href={slide.cta2Link}>
                                            <Button variant="outline" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-slate-900 font-bold text-sm px-8 py-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                                <Calendar className="w-5 h-5" />
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
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-primary hover:border-primary rounded-full flex items-center justify-center transition-all group shadow-md"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-primary hover:border-primary rounded-full flex items-center justify-center transition-all group shadow-md"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </>
            )}

            {/* Slide Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "h-2 transition-all duration-300 rounded-full",
                                index === currentSlide
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-white/40 hover:bg-white/60"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
