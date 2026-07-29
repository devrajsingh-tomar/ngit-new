"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Users, Clock, FileText, Globe, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TypingExamListing() {
  const [exams, setExams] = useState<any[]>([]);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lang")) setSelectedLanguage(params.get("lang") || "English");
  }, []);

  useEffect(() => {
    fetch("/api/typing/categories")
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetchExams(selectedCategory, selectedLanguage);
  }, [selectedCategory, selectedLanguage]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredExams(
      exams.filter(e =>
        !q || e.title?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, exams]);

  const fetchExams = (category: string, lang: string) => {
    setLoading(true);
    let url = `/api/typing/exams?lang=${encodeURIComponent(lang)}`;
    if (category !== "All") url += `&category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setExams(arr);
        setFilteredExams(arr);
        setLoading(false);
      })
      .catch(() => { setExams([]); setFilteredExams([]); setLoading(false); });
  };

  return (
    <div className="min-h-screen bg-[#f5f4ef]">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                Official Examination Portal
              </span>
              <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tight">
                Typing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Exams</span>
              </h1>
              <p className="text-slate-400 font-medium mt-4 text-sm max-w-lg">
                Government-standard typing tests for SSC, Railway, State Police and more.
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex gap-2">
              {["English", "Hindi"].map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-black text-sm transition-all",
                    selectedLanguage === lang
                      ? "bg-white text-slate-900"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  )}
                >
                  {lang === "English" ? "🇬🇧 English" : "🇮🇳 Hindi"}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: "Active Exams", value: exams.length },
              { label: "Categories", value: categories.length + 1 },
              { label: "Languages", value: 2 },
            ].map(stat => (
              <div key={stat.label} className="border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 max-w-full scrollbar-none">
            {["All", ...categories.map(c => {
              const parent = categories.find(p => p._id === c.parentCategoryId?._id || p._id === c.parentCategoryId);
              return {
                value: c.name,
                label: parent ? `${parent.name} ➔ ${c.name}` : c.name
              };
            })].map(cat => {
              const val = typeof cat === "string" ? cat : cat.value;
              const lbl = typeof cat === "string" ? cat : cat.label;
              return (
                <button
                  key={val}
                  onClick={() => setSelectedCategory(val)}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-black transition-all border",
                    selectedCategory === val
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  )}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exam Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-32 text-center">
            <FileText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Exams Found</h3>
            <p className="text-slate-500 font-medium">
              {searchQuery ? `No results for "${searchQuery}"` : "No exams available in this category."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Showing {filteredExams.length} exam{filteredExams.length !== 1 ? "s" : ""} · {selectedLanguage}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredExams.map((exam, i) => (
                <Link href={`/typing/exam/${exam._id}`} key={exam._id} className="group">
                  <div className={cn(
                    "relative bg-white rounded-3xl p-6 h-full flex flex-col border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  )}>
                    {/* Accent top bar */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1 rounded-t-3xl",
                      exam.language === "Hindi" ? "bg-gradient-to-r from-orange-400 to-rose-500" : "bg-gradient-to-r from-indigo-400 to-cyan-500"
                    )} />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 mt-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg",
                        exam.language === "Hindi" ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"
                      )}>
                        {exam.language}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">
                        #{String(i + 1).padStart(3, "0")}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-black text-slate-900 leading-snug mb-6 line-clamp-3 group-hover:text-indigo-700 transition-colors flex-1">
                      {exam.title}
                    </h2>

                    {/* Meta */}
                    <div className="space-y-3 mt-auto">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                            <Clock className="w-3 h-3" /> Duration
                          </div>
                          <span className="text-sm font-black text-slate-900">{exam.duration} min</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                            <FileText className="w-3 h-3" /> Words
                          </div>
                          <span className="text-sm font-black text-slate-900">{exam.passageId?.wordCount || "—"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <Users className="w-3 h-3" />
                          <span>{exam.participantCount || 0} appeared</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 group-hover:gap-2 transition-all">
                          Start <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
