import React from "react";
import Image from "next/image";
import Link from "next/link";
import { constructMetadata, getBreadcrumbSchema, getOrganizationSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookPreviewModal from "@/components/public/BookPreviewModal";
import {
  O_LEVEL_BOOKS,
  O_LEVEL_FAQS,
  O_LEVEL_PRICING,
  O_LEVEL_WHATSAPP_CONFIG,
  buildWhatsAppUrl,
  GENERAL_O_LEVEL_ENQUIRY_MESSAGE,
} from "@/lib/o-level-books-data";
import {
  BookOpen,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Phone,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  FileText,
  Clock,
  Tag,
  UserCheck,
  Percent,
} from "lucide-react";

// WhatsApp Brand SVG Icon for consistent high-quality display
function WhatsAppIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45h.007c5.584 0 10.122-4.516 10.126-10.064.002-2.687-1.042-5.212-2.94-7.114C16.65 1.524 14.128.482 11.44.482c-5.588 0-10.13 4.516-10.134 10.065-.001 2.01.523 3.976 1.52 5.71l-1.011 3.69 3.824-.993zm11.366-5.873c-.3-.15-1.77-.875-2.043-.974-.275-.098-.475-.148-.675.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-1.041-.519-1.714-.947-2.393-2.117-.174-.3-.174-.557-.026-.708.134-.135.3-.349.45-.524.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.675-1.624-.925-2.224-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.224 5.11 4.525.714.31 1.272.495 1.706.634.717.228 1.368.196 1.884.119.575-.085 1.77-.724 2.02-1.375.25-.65.25-1.209.175-1.325-.075-.115-.275-.189-.575-.339z" />
    </svg>
  );
}

// ─── PHASE 6: SEO METADATA ───────────────────────────────────────────────────
export const metadata = constructMetadata({
  title: "Best O Level Books in Prayagraj | NGIT NIELIT Books",
  description:
    "Explore NGIT O Level books in Prayagraj for NIELIT M1-R5.1, M2-R5.1, M3-R5.1 and M4-R5.1 at special offer price of ₹299 per book or ₹999 for complete 4-book combo.",
  path: "/nielit-o-level-books-prayagraj",
  ogImage: "/images/books/nielit-o-level-infinity-series-banner.png",
});

export default function NielitOLevelBooksPrayagrajPage() {
  const generalWhatsAppUrl = buildWhatsAppUrl(GENERAL_O_LEVEL_ENQUIRY_MESSAGE);

  // ─── STRUCTURED DATA SCHEMAS ───────────────────────────────────────────────
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "NIELIT O Level Books Prayagraj", url: "/nielit-o-level-books-prayagraj" },
  ]);

  const organizationSchema = getOrganizationSchema();

  const productSchemas = O_LEVEL_BOOKS.map((book) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `NIELIT O Level ${book.moduleCode} Book: ${book.fullTitle}`,
    description: book.description,
    image: `https://ngitedu.com${book.coverImage}`,
    sku: `NGIT-${book.moduleCode}`,
    mpn: `NGIT-OLEVEL-${book.moduleCode}`,
    brand: {
      "@type": "Brand",
      name: "NGIT",
    },
    offers: {
      "@type": "Offer",
      url: `https://ngitedu.com/nielit-o-level-books-prayagraj#${book.id}`,
      priceCurrency: "INR",
      price: book.discountedPrice.toString(),
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "EducationalOrganization",
        name: "National Genius Institute of Technology",
      },
      description: `Discounted Offer Price ₹${book.discountedPrice} (Printed MRP ₹${book.mrp}). Contact NGIT Prayagraj on WhatsApp to order.`,
    },
  }));

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={[breadcrumbSchema, organizationSchema, ...productSchemas]} />

      {/* ─── PHASE 3: HERO SECTION (FULL-WIDTH TOP BANNER & HERO DESK) ── */}
      <section className="container mx-auto px-4 lg:px-10 mb-16 space-y-8">
        {/* 1. TOP FULL-WIDTH PANORAMIC SHOWCASE BANNER */}
        <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-indigo-500/30 shadow-2xl bg-slate-950 group">
          <Image
            src="/images/books/nielit-o-level-infinity-series-banner.png"
            alt="NGIT NIELIT O Level Books Series in Prayagraj - M1, M2, M3, M4 Practice Books by Javed Sir"
            width={1086}
            height={362}
            priority
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          />
          {/* Subtle bottom info bar */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-6 py-3.5 border-t border-indigo-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-amber-300 uppercase tracking-wider">
                NGIT Infinity Book Series • O Level All 4 Modules (M1, M2, M3 & M4)
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-semibold text-emerald-400">
                Special Offer: ₹299 / Book • All 4 Combo @ ₹999/-
              </span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:inline text-slate-300 font-medium">
                Academic Direction: Javed Sir (Director, NGIT)
              </span>
              <span className="hidden lg:inline text-slate-600">•</span>
              <a
                href={`tel:${O_LEVEL_WHATSAPP_CONFIG.phoneNumber}`}
                className="hidden lg:flex items-center gap-1.5 text-white font-bold hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 88403 41525
              </a>
            </div>
          </div>
        </div>

        {/* 2. HERO CONTENT & QUICK-ORDER CARD */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-14 overflow-hidden shadow-2xl border border-indigo-900/40">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Headings, Text & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-black text-xs uppercase tracking-widest shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>PRAYAGRAJ (ALLAHABAD) • NIELIT O LEVEL BOOKS</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-wider">
                  <Percent className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>SPECIAL OFFER: ₹299 / BOOK • COMBO ₹999</span>
                </div>
              </div>

              {/* Primary H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Best NIELIT O Level Books in Prayagraj – NGIT
              </h1>

              {/* Supporting Text */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                Prepare for the NIELIT O Level examination with NGIT&apos;s module-wise books and learning resources for
                IT Tools and Network Basics (M1-R5.1), Web Designing and Publishing (M2-R5.1), Python Programming (M3-R5.1), and Internet of Things (M4-R5.1).
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Authored under the academic guidance of Director Javed Sir. Now available at an exclusive student discounted price of <strong className="text-emerald-400 font-black">₹299 per book</strong> (Printed MRP up to ₹490), or get the <strong className="text-amber-300 font-black">complete 4-book combo for just ₹999</strong> (Save ₹681 / 40% OFF).
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="bg-slate-900/80 text-emerald-300 border-emerald-500/30 py-1 px-3 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Latest R5.1 Revision
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-indigo-300 border-indigo-500/30 py-1 px-3 text-xs">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Bilingual (Hindi + English)
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-amber-300 border-amber-500/30 py-1 px-3 text-xs">
                  <Tag className="w-3.5 h-3.5 mr-1 text-amber-400" /> ₹299 Each / ₹999 Combo Pack
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 text-blue-300 border-blue-500/30 py-1 px-3 text-xs">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-400" /> Center Pickup & Home Delivery
                </Badge>
              </div>

              {/* Hero Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 items-center">
                <a href="#books">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-13 px-8 text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-600/30 gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <BookOpen className="w-5 h-5" /> Explore Books (₹299)
                  </Button>
                </a>

                <a
                  href={generalWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button
                    size="lg"
                    className="bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black h-13 px-8 text-sm sm:text-base rounded-2xl shadow-lg shadow-[#25D366]/25 gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <WhatsAppIcon className="w-5 h-5 fill-current" /> Order on WhatsApp (₹999 Combo)
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Column: Instant Student Order & Pricing Desk */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-slate-900/80 border border-indigo-500/30 p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      OFFICIAL NGIT STUDENT DESK
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">Prayagraj</span>
                </div>

                {/* Offer Price Highlight Box */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Single Module Book</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-emerald-400">₹299/-</span>
                        <span className="text-xs text-slate-400 line-through">MRP up to ₹490</span>
                      </div>
                    </div>
                    <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      Save up to ₹191
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-indigo-900/60 to-slate-900 border-2 border-amber-400/40 relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                        BEST VALUE
                      </span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">Complete 4-Book Combo</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-amber-300">₹999/-</span>
                      <span className="text-sm text-slate-400 line-through font-semibold">MRP ₹1,680</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Save ₹681 (40% OFF) • All 4 Modules Included
                    </p>
                  </div>
                </div>

                {/* Quick Delivery / Pickup Info */}
                <div className="space-y-2 pt-1 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Center Pickup:</strong> Sainik Market, Sanjay Dryers Chauraha, Rasulabad, Prayagraj</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Home Delivery:</strong> Postal / Courier Dispatch across India</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Academic Support:</strong> Direct Doubt Guidance by Director Javed Sir</span>
                  </div>
                </div>

                {/* Direct Action Buttons in Card */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href={generalWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      size="lg"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black h-12 rounded-xl shadow-lg gap-2 text-xs uppercase tracking-wider transition-all duration-300 hover:scale-102"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-current" /> Order 4-Book Combo (₹999)
                    </Button>
                  </a>

                  <a
                    href={`tel:${O_LEVEL_WHATSAPP_CONFIG.phoneNumber}`}
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold h-12 rounded-xl gap-2 text-xs"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" /> Call {O_LEVEL_WHATSAPP_CONFIG.displayNumber}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST & HIGHLIGHTS BAR ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl border-slate-200 bg-white shadow-xs text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 font-black">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">4 Modules</p>
            <p className="text-xs text-slate-500 font-semibold">M1-R5.1, M2, M3, M4</p>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white shadow-xs text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-black">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700">₹299 Only</p>
            <p className="text-xs text-slate-500 font-semibold">Per Book Offer Price</p>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white shadow-xs text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">₹999 Combo</p>
            <p className="text-xs text-slate-500 font-semibold">Save ₹681 on 4 Books</p>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200 bg-white shadow-xs text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 font-black">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">Prayagraj</p>
            <p className="text-xs text-slate-500 font-semibold">Center Pickup & Courier</p>
          </Card>
        </div>
      </section>

      {/* ─── PHASE 4: DISPLAY ALL FOUR BOOKS ───────────────────────────────── */}
      <section id="books" className="container mx-auto px-4 lg:px-10 mb-20 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full text-indigo-700 bg-indigo-50 border-indigo-200 font-black text-xs uppercase tracking-widest">
            NIELIT O LEVEL THEORY & PRACTICE MODULES
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Explore All 4 NIELIT O Level Books
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Authentic module books published by NGIT Institute under the guidance of Javed Sir.
            Each book is now available at a discounted offer price of <strong className="text-emerald-700 font-black">₹299</strong> (or all 4 for <strong className="text-indigo-700 font-black">₹999</strong>).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {O_LEVEL_BOOKS.map((book) => {
            const whatsAppUrl = buildWhatsAppUrl(book.enquiryMessage);
            const savings = book.mrp - book.discountedPrice;

            return (
              <Card
                key={book.id}
                id={book.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Top Header Row with Module Code, Language & Price Badge */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xs">
                        {book.moduleCode}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {book.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 line-through">
                        MRP ₹{book.mrp}
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        <Tag className="w-3.5 h-3.5 text-emerald-700" /> Offer: ₹{book.discountedPrice}/-
                      </span>
                    </div>
                  </div>

                  {/* Book Card Layout: Thumbnail + Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start mb-6">
                    {/* Thumbnail: Authentic Front Cover with interactive preview modal */}
                    <div className="sm:col-span-5 flex flex-col items-center">
                      <div className="relative w-44 sm:w-full aspect-[492/646] max-w-[210px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 group-hover:scale-102 transition-transform duration-300">
                        <Image
                          src={book.coverImage}
                          alt={`NGIT NIELIT O Level ${book.moduleCode} ${book.fullTitle} book cover`}
                          width={492}
                          height={646}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Interactive Full Jacket Preview Modal Trigger */}
                      <BookPreviewModal book={book} />
                    </div>

                    {/* Book Information */}
                    <div className="sm:col-span-7 space-y-3">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                        {book.fullTitle}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Director: {book.author}</span>
                      </div>

                      <p className="text-xs font-medium text-slate-500 leading-normal">
                        {book.tagline}
                      </p>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {book.description}
                      </p>

                      {/* Natural SEO Phrases Tags */}
                      <div className="pt-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                          Target Curriculum Topics:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {book.seoKeywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Topics List */}
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                    <p className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> Syllabus Coverage Highlights:
                    </p>
                    <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 font-medium">
                      {book.keyTopics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Row: Price, Availability & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Special Offer Price:</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                          ₹{book.discountedPrice}
                        </span>
                        <span className="text-sm font-semibold text-slate-500 line-through">
                          MRP ₹{book.mrp}
                        </span>
                        <span className="text-[11px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                          Save ₹{savings}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-medium text-[11px] block">Availability:</span>
                      <span className="font-bold text-emerald-800 text-xs flex items-center gap-1 justify-end">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock • Immediate Dispatch
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black h-12 rounded-xl shadow-md gap-2 text-xs uppercase tracking-wider transition-all duration-300 hover:scale-102 active:scale-98"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-current" /> Order on WhatsApp (₹299)
                      </Button>
                    </a>

                    <Link href={book.courseLink} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 hover:bg-slate-100 text-slate-800 font-bold h-12 rounded-xl gap-2 text-xs uppercase tracking-wider"
                      >
                        View Course Details <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ─── ALL-IN-ONE 4-BOOK COMBO CARD ─────────────────────────────────── */}
        <div className="mt-12 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-indigo-800/50">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-3 py-1">
                  MEGA COMBO OFFER • 40% OFF
                </Badge>
                <Badge variant="outline" className="text-emerald-300 border-emerald-400/40 text-xs font-bold py-1 px-3">
                  SAVE ₹681 INSTANTLY
                </Badge>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Order All 4 Books Combo (M1, M2, M3 & M4)
              </h3>

              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-300">
                  ₹{O_LEVEL_PRICING.comboPrice}/-
                </span>
                <span className="text-lg text-slate-400 line-through font-semibold">
                  Total MRP ₹{O_LEVEL_PRICING.totalMrp}/-
                </span>
                <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-lg">
                  You Save ₹{O_LEVEL_PRICING.savings} ({O_LEVEL_PRICING.discountPercent})
                </span>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Save time and streamline your preparation with the complete 4-book study kit by Javed Sir.
                Includes all module theory, practical exercises, and previous exam question analysis in a single bundle for only ₹999.
              </p>
              <p className="text-xs text-slate-400">
                Direct institute pickup available at Sainik Market, Sanjay Dryers Chauraha, Rasulabad, Prayagraj. Home courier delivery available across India.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black h-13 rounded-2xl shadow-lg gap-2 text-sm uppercase tracking-wider transition-all duration-300 hover:scale-102"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" /> Order 4-Book Combo (₹999)
                </Button>
              </a>

              <a
                href={`tel:${O_LEVEL_WHATSAPP_CONFIG.phoneNumber}`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white font-bold h-13 rounded-2xl gap-2 text-sm"
                >
                  <Phone className="w-4 h-4 text-emerald-400" /> Call {O_LEVEL_WHATSAPP_CONFIG.displayNumber}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHASE 7: CONTENT SECTIONS ─────────────────────────────────────── */}

      {/* Section 1: Why Explore NGIT O Level Books? */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Why Explore NGIT O Level Books?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Effective NIELIT preparation requires clear, structured explanations and focused practice material at student-friendly prices.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Module-Wise Study Resources</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Each book focuses exclusively on its designated syllabus scope (M1, M2, M3, or M4), allowing students
                to target their preparation according to exam paper schedules without clutter or confusing digressions.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Syllabus-Oriented Preparation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Content is aligned with the latest NIELIT R5.1 curriculum structure, covering official module units,
                key definitions, syntax breakdowns, and revision summaries for practical and theory examinations.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Bilingual Hindi + English Medium</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Concepts, technical terms, and problem statements are explained using accessible bilingual formatting,
                ensuring Hindi-medium and English-medium students in Prayagraj can master complex IT and programming topics.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Direct Academic Guidance by Javed Sir</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Students have access to expert coaching tips, online video explanations, and computer lab practical support
                at NGIT Institute Prayagraj.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 2: How to Choose an O Level Practice Book */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How to Choose an O Level Practice Book
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Important factors to review before purchasing study material for the NIELIT O Level certification:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Verify Syllabus Alignment (R5.1 Edition)</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-0.5">
                  Ensure the book aligns with the current NIELIT R5.1 curriculum. Older editions based on R4 or early R5
                  may have outdated frameworks or missing topics (such as Python in M3 or IoT architectures in M4).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Check Clarity of Explanations & Language</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-0.5">
                  Look for books that present explanations in accessible language. A bilingual presentation (Hindi +
                  English) is particularly helpful when translating programming logic or network protocol concepts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Practical Exercises & Code Snippets</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-0.5">
                  NIELIT examinations place strong emphasis on practical problem solving. Make sure the book contains
                  runnable Python snippets, HTML/CSS structure examples, and real-world IoT sensor diagrams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Affordable Student Pricing & Direct Support</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-0.5">
                  Check value for money. NGIT offers books directly to students at a discounted price of ₹299 per book
                  (or ₹999 for all 4 books combo) with direct WhatsApp guidance from the faculty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Overview Table of NIELIT O Level Modules */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              NIELIT O Level Examination & Price Matrix (R5.1)
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Standard module breakdown and discounted student pricing for NIELIT O Level candidates:
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Module Code</th>
                  <th className="py-3.5 px-4">Module Name</th>
                  <th className="py-3.5 px-4">Printed MRP</th>
                  <th className="py-3.5 px-4 text-emerald-800">Offer Price</th>
                  <th className="py-3.5 px-4 text-emerald-800">You Save</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Exam Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-black text-indigo-700">M1-R5.1</td>
                  <td className="py-3 px-4 font-semibold">Information Technology Tools and Network Basics</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹380</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹299</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹81 (21% OFF)</td>
                  <td className="py-3 px-4">Hindi + English</td>
                  <td className="py-3 px-4">Online CBT + Lab Practical</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-black text-indigo-700">M2-R5.1</td>
                  <td className="py-3 px-4 font-semibold">Web Designing and Publishing</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹430</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹299</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹131 (30% OFF)</td>
                  <td className="py-3 px-4">Hindi + English</td>
                  <td className="py-3 px-4">Online CBT + Lab Practical</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-black text-indigo-700">M3-R5.1</td>
                  <td className="py-3 px-4 font-semibold">Programming and Problem Solving through Python</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹490</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹299</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹191 (39% OFF)</td>
                  <td className="py-3 px-4">Hindi + English</td>
                  <td className="py-3 px-4">Online CBT + Lab Practical</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-black text-indigo-700">M4-R5.1</td>
                  <td className="py-3 px-4 font-semibold">Internet of Things and Its Applications</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹380</td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹299</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹81 (21% OFF)</td>
                  <td className="py-3 px-4">Hindi + English</td>
                  <td className="py-3 px-4">Online CBT + Lab Practical</td>
                </tr>
                <tr className="bg-amber-50/70 font-bold border-t-2 border-amber-200">
                  <td className="py-3.5 px-4 font-black text-amber-900">ALL 4 COMBO</td>
                  <td className="py-3.5 px-4 font-black text-amber-950">Complete 4-Book Set (M1 + M2 + M3 + M4)</td>
                  <td className="py-3.5 px-4 text-slate-500 line-through">₹1,680</td>
                  <td className="py-3.5 px-4 font-black text-amber-900 text-base">₹999</td>
                  <td className="py-3.5 px-4 font-black text-emerald-800">₹681 (40% OFF)</td>
                  <td className="py-3.5 px-4">Hindi + English</td>
                  <td className="py-3.5 px-4">Complete Set</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4: Frequently Asked Questions */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Common queries regarding NIELIT O Level books, modules, and offer pricing in Prayagraj:
            </p>
          </div>

          <div className="space-y-4">
            {O_LEVEL_FAQS.map((faq, index) => (
              <Card
                key={index}
                className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7 font-normal">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PHASE 7: FINAL CTA SECTION ────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-10">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-center text-white space-y-6 shadow-2xl relative overflow-hidden border border-indigo-900/50">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-400/30 font-black text-xs uppercase tracking-widest px-4 py-1">
              NGIT PRAYAGRAJ ACADEMIC RESOURCES
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Order Your NIELIT O Level Books Today
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Get authentic books for M1, M2, M3, and M4 at the special student offer price of <strong className="text-emerald-400 font-bold">₹299 each</strong>, or save big with the complete 4-book combo at <strong className="text-amber-300 font-bold">₹999</strong> (Save ₹681).
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <a href="#books">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-13 px-8 text-sm sm:text-base rounded-2xl shadow-lg gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-5 h-5" /> View Books (₹299)
                </Button>
              </a>

              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black h-13 px-8 text-sm sm:text-base rounded-2xl shadow-lg gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" /> Order on WhatsApp (₹999 Combo)
                </Button>
              </a>
            </div>

            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" /> Sainik Market, Sanjay Dryers Chauraha, Rasulabad, Prayagraj, UP 211004
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" /> +91 88403 41525 / +91 80049 58441
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" /> Mon - Sat: 9:00 AM - 7:00 PM
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
