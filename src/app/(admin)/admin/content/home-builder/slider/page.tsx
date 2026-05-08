"use client";

import React, { useState, useEffect } from "react";
import { 
    Plus, Image as ImageIcon, Trash2, GripVertical, ExternalLink, 
    ChevronLeft, Edit3, Library, ArrowRight, Save, X, Sparkles, Loader2,
    Eye, EyeOff, Edit2, CheckCircle2, ArrowUp, ArrowDown, Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MediaLibraryModal } from "@/components/admin/cms/MediaLibraryModal";
import { ImageUpload } from "@/components/ui/image-upload";

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
  bgColor: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

const BG_PRESETS = [
  { label: "Primary Blue", value: "from-primary via-primary to-indigo-900" },
  { label: "Emerald Green", value: "from-emerald-700 via-emerald-800 to-teal-900" },
  { label: "Sunset Orange", value: "from-orange-600 via-rose-700 to-purple-900" },
  { label: "Royal Purple", value: "from-purple-700 via-indigo-800 to-slate-900" },
  { label: "Dark Slate", value: "from-slate-800 via-slate-900 to-black" },
  { label: "Sky Blue", value: "from-sky-600 via-blue-700 to-indigo-900" },
];

const emptySlide: Omit<Slide, "_id"> = {
  title: "",
  subtitle: "",
  description: "",
  cta1Text: "Learn More",
  cta1Link: "/",
  cta2Text: "Contact Us",
  cta2Link: "/contact",
  bgColor: "from-primary via-primary to-indigo-900",
  imageUrl: "",
  isActive: true,
  order: 0,
};

export default function HeroSliderAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Omit<Slide, "_id">>(emptySlide);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/admin/hero-slides");
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const openNew = () => {
    setForm({ ...emptySlide, order: slides.length });
    setEditingSlide(null);
    setIsNew(true);
    setShowForm(true);
  };

  const openEdit = (slide: Slide) => {
    setForm({ ...slide });
    setEditingSlide(slide);
    setIsNew(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSlide(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() && !form.imageUrl) { 
      toast.error("Please provide either a title or a background image"); 
      return; 
    }
    setSubmitting(true);
    try {
      if (isNew) {
        const res = await fetch("/api/admin/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Slide created!");
      } else if (editingSlide) {
        const res = await fetch(`/api/admin/hero-slides/${editingSlide._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Slide updated!");
      }
      closeForm();
      fetchSlides();
    } catch {
      toast.error("Failed to save slide");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
    toast.success("Slide deleted");
    fetchSlides();
  };

  const toggleActive = async (slide: Slide) => {
    await fetch(`/api/admin/hero-slides/${slide._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !slide.isActive }),
    });
    fetchSlides();
  };

  const moveSlide = async (index: number, dir: "up" | "down") => {
    const updated = [...slides];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    // Persist new order
    await Promise.all(
      updated.map((s, i) =>
        fetch(`/api/admin/hero-slides/${s._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i }),
        })
      )
    );
    fetchSlides();
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fb]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin/content/home-builder" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900">Hero Slider Management</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              {slides.length} slide{slides.length !== 1 ? "s" : ""} — changes go live instantly
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all">
            <Eye className="w-3.5 h-3.5" /> Preview Site
          </Link>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slide
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">No slides yet</h2>
            <p className="text-sm text-slate-400 font-medium mb-6 max-w-sm">
              The hero slider on your homepage is empty. Add your first slide to bring it to life.
            </p>
            <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all">
              <Plus className="w-4 h-4" /> Create First Slide
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {slides.map((slide, idx) => (
              <div
                key={slide._id}
                className={cn(
                  "bg-white border rounded-xl shadow-sm overflow-hidden transition-all",
                  !slide.isActive && "opacity-60",
                  slide.isActive ? "border-slate-200" : "border-dashed border-slate-300"
                )}
              >
                {/* Slide preview banner */}
                <div className={cn("h-2 w-full bg-gradient-to-r", slide.bgColor)} />

                <div className="p-4 flex items-center gap-4">
                  {/* Order controls */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveSlide(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-black text-slate-400 text-center">{idx + 1}</span>
                    <button
                      onClick={() => moveSlide(idx, "down")}
                      disabled={idx === slides.length - 1}
                      className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preview thumbnail */}
                  <div className={cn(
                    "w-16 h-12 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br text-white text-[8px] font-black text-center overflow-hidden",
                    slide.bgColor
                  )}>
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="px-1 leading-tight opacity-80">SLIDE {idx + 1}</span>
                    )}
                  </div>

                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900 truncate">{slide.title}</p>
                      {slide.isActive
                        ? <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md"><CheckCircle2 className="w-2.5 h-2.5"/>Live</span>
                        : <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Hidden</span>
                      }
                    </div>
                    {slide.subtitle && <p className="text-[11px] text-slate-500 truncate">{slide.subtitle}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      {slide.cta1Text && (
                        <span className="flex items-center gap-1 text-[10px] text-violet-600 font-semibold">
                          <LinkIcon className="w-2.5 h-2.5" />{slide.cta1Text} → {slide.cta1Link}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(slide)}
                      title={slide.isActive ? "Hide slide" : "Show slide"}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      {slide.isActive ? <Eye className="w-4 h-4 text-violet-500" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(slide)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide Editor Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {isNew ? "Add New Slide" : "Edit Slide"}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">All fields are live — changes publish immediately after saving.</p>
              </div>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Background Color Picker */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Background Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {BG_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setForm(f => ({ ...f, bgColor: preset.value }))}
                      className={cn(
                        "h-12 rounded-xl bg-gradient-to-r flex items-end p-2 transition-all border-2",
                        preset.value,
                        form.bgColor === preset.value ? "border-violet-500 scale-105 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                      )}
                    >
                      <span className="text-[9px] font-black text-white/80">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                  Background Image
                </label>
                <div className="space-y-3">
                  <ImageUpload 
                    value={form.imageUrl}
                    onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                    label="Upload Hero Slide Image"
                  />
                  <div className="flex gap-2">
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="Or paste external URL here..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 font-medium"
                    />
                    <button 
                      onClick={() => setIsMediaModalOpen(true)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Library className="w-3.5 h-3.5" /> Library
                    </button>
                  </div>
                </div>
              </div>



              <div className="grid grid-cols-2 gap-3">
                {/* Title */}
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    Main Heading <span className="text-slate-300 font-normal normal-case">(Optional if using full-banner image)</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Shape Your Future at NGIT"
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 font-medium"
                  />
                  <div className="mt-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-blue-700 font-black text-[11px] uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" /> Recommended Image Standards
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Perfect Resolution</p>
                        <p className="text-[11px] text-blue-800/70 font-medium leading-relaxed">
                          <b>1920 x 800 pixels</b> (Landscape). This size ensures your image covers the screen width while maintaining a professional height on all monitors.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Mobile Safe Zone</p>
                        <p className="text-[11px] text-blue-800/70 font-medium leading-relaxed">
                          Keep all text and faces in the <b>Center 1000px</b>. On mobile phones, the sides will be cropped to focus on the middle.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-blue-100 flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">Format: WebP / JPG</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">Size: Under 500KB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Tag Line / Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    placeholder="e.g. India's Premier Typing Institute"
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 font-medium"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short compelling sentence shown below the title..."
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 font-medium resize-none"
                  />
                </div>

                {/* CTA 1 */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Button 1 Text</label>
                  <input value={form.cta1Text} onChange={(e) => setForm(f => ({ ...f, cta1Text: e.target.value }))} placeholder="Download Prospectus" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Button 1 Link</label>
                  <input value={form.cta1Link} onChange={(e) => setForm(f => ({ ...f, cta1Link: e.target.value }))} placeholder="/prospectus.pdf" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 font-medium" />
                </div>

                {/* CTA 2 */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Button 2 Text</label>
                  <input value={form.cta2Text} onChange={(e) => setForm(f => ({ ...f, cta2Text: e.target.value }))} placeholder="Book Free Demo" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Button 2 Link</label>
                  <input value={form.cta2Link} onChange={(e) => setForm(f => ({ ...f, cta2Link: e.target.value }))} placeholder="/register" className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 font-medium" />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-700">Show on Website</p>
                  <p className="text-xs text-slate-400">Hidden slides won't appear in the public slider.</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    form.isActive ? "bg-violet-600" : "bg-slate-300"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    form.isActive ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button onClick={closeForm} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isNew ? "Publish Slide" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setForm(f => ({ ...f, imageUrl: url }));
          setIsMediaModalOpen(false);
          toast.success("Asset linked from library");
        }}
      />
    </div>
  );
}
