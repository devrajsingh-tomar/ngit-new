"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SecondarySlideItem {
  _id: string;
  title?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
}

interface SecondaryBannerSliderProps {
  slides?: SecondarySlideItem[];
}

export default function SecondaryBannerSlider({ slides = [] }: SecondaryBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter only active slides
  const activeSlides = slides.filter((s) => s.isActive);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 bg-slate-950 group aspect-[16/6] min-h-[220px] max-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide._id || currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Ambient Background Blur */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 pointer-events-none scale-110"
              style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
            />

            {/* Slide Link / Main Image */}
            {currentSlide.link ? (
              <Link href={currentSlide.link} className="relative z-10 w-full h-full block">
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title || "Banner Slide"}
                  className="w-full h-full object-cover rounded-[2.5rem]"
                />
              </Link>
            ) : (
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title || "Banner Slide"}
                className="relative z-10 w-full h-full object-cover rounded-[2.5rem]"
              />
            )}

            {/* Slide Title Overlay (if provided) */}
            {currentSlide.title && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 z-20 pointer-events-none rounded-b-[2.5rem]">
                <h3 className="text-white font-black text-lg sm:text-2xl drop-shadow-md">
                  {currentSlide.title}
                </h3>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls (Only if multiple slides exist) */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              title="Previous Banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              title="Next Banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-white shadow-sm"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
