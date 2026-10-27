"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ExternalLink, MapPin, CheckCircle2 } from "lucide-react";
import { OLevelBook, buildWhatsAppUrl } from "@/lib/o-level-books-data";

export default function BookPreviewModal({ book }: { book: OLevelBook }) {
  const [isOpen, setIsOpen] = useState(false);
  const whatsAppUrl = buildWhatsAppUrl(book.enquiryMessage);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-2 cursor-pointer bg-indigo-50/70 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg border border-indigo-200/60"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview Full Cover (Front & Back)</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-950 text-white border-slate-800 rounded-3xl">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-600 text-white font-black text-xs px-2.5 py-0.5">
              {book.moduleCode}
            </Badge>
            <Badge className="bg-emerald-400 text-slate-950 font-black text-xs px-2.5 py-0.5">
              Special Offer: ₹{book.discountedPrice}/-
            </Badge>
            <Badge variant="outline" className="text-slate-400 border-slate-700 line-through text-xs">
              MRP: ₹{book.mrp}/-
            </Badge>
            <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
              NGIT Infinity Series
            </Badge>
          </div>
          <DialogTitle className="text-lg sm:text-2xl font-black text-white tracking-tight pt-1">
            {book.fullTitle}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Guide: {book.author} • Published by NGIT Institute Prayagraj
          </p>
        </DialogHeader>

        {/* Full Jacket Cover Spread Display */}
        <div className="space-y-4 my-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <Image
              src={book.fullSpreadImage}
              alt={`Full jacket cover spread of ${book.fullTitle} (${book.moduleCode})`}
              width={1000}
              height={648}
              className="w-full h-auto object-contain rounded-xl"
              priority
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Book Highlights:
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Comprehensive Hindi + English bilingual notes, theory MCQs, practice question sets, and practical exercises.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" /> Center Pickup & Shipping:
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Sainik Market, Sanjay Dryers Chauraha, Rasulabad, Prayagraj, UP 211004. Postal delivery available across India.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black h-11 px-6 rounded-xl text-xs uppercase tracking-wider gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45h.007c5.584 0 10.122-4.516 10.126-10.064.002-2.687-1.042-5.212-2.94-7.114C16.65 1.524 14.128.482 11.44.482c-5.588 0-10.13 4.516-10.134 10.065-.001 2.01.523 3.976 1.52 5.71l-1.011 3.69 3.824-.993zm11.366-5.873c-.3-.15-1.77-.875-2.043-.974-.275-.098-.475-.148-.675.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-1.041-.519-1.714-.947-2.393-2.117-.174-.3-.174-.557-.026-.708.134-.135.3-.349.45-.524.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.675-1.624-.925-2.224-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.224 5.11 4.525.714.31 1.272.495 1.706.634.717.228 1.368.196 1.884.119.575-.085 1.77-.724 2.02-1.375.25-.65.25-1.209.175-1.325-.075-.115-.275-.189-.575-.339z" />
              </svg>
              Enquire on WhatsApp
            </Button>
          </a>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto text-slate-400 hover:text-white text-xs"
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
