"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2, AlertCircle, AlertTriangle, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getSeoMetaDataAction, updateSeoMetaDataAction } from "@/app/actions/seo";

const pages = [
  { slug: "/", title: "Home Page", defaultTitle: "NGIT | Computer Courses, Typing & Government Exam Preparation in Prayagraj", defaultDesc: "Join NGIT Prayagraj for online Hindi & English typing tests, Steno shorthand dictations, UPSSSC & SSC exam preparation, CCC, O Level & IT computer courses." },
  { slug: "/about", title: "About Us", defaultTitle: "About NGIT | Computer Training & Skill Institute in Prayagraj", defaultDesc: "Learn about NGIT (National Genius Institute of Technology) in Prayagraj. Discover our mission, faculty, computer courses, typing software, and government exam coaching." },
  { slug: "/contact", title: "Contact Us", defaultTitle: "Contact NGIT | Computer Training Institute in Prayagraj", defaultDesc: "Contact NGIT (National Genius Institute of Technology) in Prayagraj. Reach out for course inquiries, typing & steno admissions, or call +91 80049 58441." },
  { slug: "/typing", title: "Typing Tests", defaultTitle: "Hindi & English Typing Test Online | Mangal & Krutidev Practice", defaultDesc: "Practice Hindi and English typing online with NGIT's exam-oriented typing software. Supports Mangal Unicode, Krutidev, speed tracking, backspace control, and government exam practice." },
  { slug: "/steno", title: "Steno Shorthand", defaultTitle: "Steno Shorthand Practice & Dictation Tests Online | UPSSSC & SSC Steno", defaultDesc: "Practice Stenography shorthand online with audio/video dictations, speed fluctuation, automatic transcription evaluation, and UPSSSC/SSC Steno exam prep at NGIT." },
  { slug: "/university-courses", title: "University Courses", defaultTitle: "University Degree & Computer Diploma Courses | PGDCA, DCA, BCA | NGIT Prayagraj", defaultDesc: "Explore university degree and diploma courses at NGIT Prayagraj: PGDCA, DCA, BCA, CCC, O Level, and professional IT certification programs." },
  { slug: "/blog", title: "Blog Hub", defaultTitle: "Latest IT, Typing & Government Exam Blogs | NGIT Prayagraj", defaultDesc: "Read expert articles on Hindi & English typing speed improvement, Steno dictation tips, UPSSSC/SSC exam preparation, and computer courses from NGIT Prayagraj." },
];

export default function SEOSettingsPage() {
  const [selected, setSelected] = useState(pages[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    metaTitle: selected.defaultTitle,
    metaDescription: selected.defaultDesc,
    focusKeyword: "",
    canonicalUrl: `https://ngitedu.com${selected.slug}`,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadSeo() {
      setLoading(true);
      try {
        const res = await getSeoMetaDataAction({ routeSlug: selected.slug });
        if (isMounted) {
          if (res?.success && res?.data) {
            setForm({
              metaTitle: res.data.metaTitle || selected.defaultTitle,
              metaDescription: res.data.metaDescription || selected.defaultDesc,
              focusKeyword: res.data.focusKeyword || "",
              canonicalUrl: res.data.canonicalUrl || `https://ngitedu.com${selected.slug}`,
            });
          } else {
            setForm({
              metaTitle: selected.defaultTitle,
              metaDescription: selected.defaultDesc,
              focusKeyword: "",
              canonicalUrl: `https://ngitedu.com${selected.slug}`,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSeo();
    return () => { isMounted = false; };
  }, [selected]);

  const handleSelect = (page: typeof pages[0]) => {
    setSelected(page);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSeoMetaDataAction({
        routeSlug: selected.slug,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        focusKeyword: form.focusKeyword,
        canonicalUrl: form.canonicalUrl,
      });

      if (res?.success) {
        toast.success(`SEO Settings saved for ${selected.title}!`);
      } else {
        toast.error(res?.error || "Failed to save SEO settings.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fb]">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 shrink-0">
        <Link href="/admin/content" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base font-black text-slate-900">SEO Settings & Metadata Engine</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Configure live Meta Titles, Meta Descriptions, and Canonical URLs across public routes
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Page List */}
        <div className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Public Indexable Pages</p>
          <div className="space-y-1.5">
            {pages.map((page) => (
              <button
                key={page.slug}
                onClick={() => handleSelect(page)}
                className={cn(
                  "w-full text-left px-3.5 py-3 rounded-xl transition-all border",
                  selected.slug === page.slug
                    ? "bg-indigo-50/80 border-indigo-200 shadow-xs"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                )}
              >
                <p className="text-xs font-bold text-slate-900">{page.title}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{page.slug}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              )}

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Editing Metadata: {selected.title}</h2>
                  <p className="text-xs font-mono text-indigo-600 font-bold mt-0.5">https://ngitedu.com{selected.slug}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Meta Title
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{form.metaTitle.length}/60 chars</span>
                  </div>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    placeholder="Meta title for search engines"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-900"
                  />
                  {form.metaTitle.length > 60 && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Recommended under 60 characters
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Meta Description
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{form.metaDescription.length}/160 chars</span>
                  </div>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    placeholder="Meta description for search engine snippets"
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900 resize-none"
                  />
                  {form.metaDescription.length > 160 && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Recommended under 160 characters
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                      Focus Keyword
                    </label>
                    <input
                      value={form.focusKeyword}
                      onChange={(e) => setForm((f) => ({ ...f, focusKeyword: e.target.value }))}
                      placeholder="e.g. Hindi Typing Test Prayagraj"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                      Canonical URL
                    </label>
                    <input
                      value={form.canonicalUrl}
                      onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
                      placeholder="https://ngitedu.com/..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Google Search Result Live Snippet Preview */}
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Google SERP Snippet Preview</p>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-700 font-mono font-bold">
                    {form.canonicalUrl || `https://ngitedu.com${selected.slug}`}
                  </p>
                  <p className="text-sm font-semibold text-indigo-700 hover:underline cursor-pointer">
                    {form.metaTitle || selected.defaultTitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {form.metaDescription || selected.defaultDesc}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving Changes..." : "Save SEO Metadata"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
