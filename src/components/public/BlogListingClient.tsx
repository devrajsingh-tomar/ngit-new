"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  BookOpen, 
  Filter, 
  X, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  author?: {
    name?: string;
  };
  publishedAt?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface BlogListingClientProps {
  initialPosts: BlogPostItem[];
}

export default function BlogListingClient({ initialPosts }: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 9;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return ["ALL", ...Array.from(set)];
  }, [initialPosts]);

  // Strip HTML from excerpt
  const getCleanExcerpt = (post: BlogPostItem) => {
    if (post.excerpt && post.excerpt.trim()) {
      return post.excerpt.replace(/<[^>]*>?/gm, "").trim();
    }
    if (post.content) {
      const clean = post.content.replace(/<[^>]*>?/gm, "").trim();
      return clean.slice(0, 150) + (clean.length > 150 ? "..." : "");
    }
    return "Read this in-depth guide and educational insights from the faculty and IT trainers at NGIT Prayagraj.";
  };

  // Filter posts based on search query & category
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        (post.category && post.category.trim().toLowerCase() === selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        (post.category && post.category.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-12">
      {/* Search & Category Filter Toolbar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search articles by topic, keyword, or exam..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result Count Indicator */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider self-start md:self-auto flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>
              Showing {filteredPosts.length} of {initialPosts.length} published articles
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-102"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {cat === "ALL" ? "All Articles" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Blog Cards Grid */}
      {paginatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedPosts.map((post) => {
            const dateStr = post.publishedAt || post.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            const thumbnailSrc =
              post.thumbnail && post.thumbnail.trim()
                ? post.thumbnail
                : "/images/books/nielit-o-level-infinity-series-banner.png";

            return (
              <article
                key={post._id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300/60 transition-all duration-300 flex flex-col group"
              >
                {/* Thumbnail Container */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="block aspect-[16/10] relative overflow-hidden bg-slate-900 cursor-pointer"
                >
                  <img
                    src={thumbnailSrc}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-sm">
                      {post.category || "Education"}
                    </span>
                  </div>
                </Link>

                {/* Article Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Meta Row: Date & Author */}
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{formattedDate}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="line-clamp-1">{post.author?.name || "NGIT Faculty"}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-3">
                      {getCleanExcerpt(post)}
                    </p>
                  </div>

                  {/* Footer Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-all group-hover:translate-x-1"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      Free Guide
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-black">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No Articles Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo; in category &ldquo;
            {selectedCategory}&rdquo;. Try another keyword or clear the filter.
          </p>
          <Button
            onClick={resetFilters}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 h-11 text-xs uppercase tracking-wider"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border-slate-200 gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                  currentPage === pageNum
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border-slate-200 gap-1 text-xs font-bold"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
