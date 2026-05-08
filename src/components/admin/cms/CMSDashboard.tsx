"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Menu,
  Star,
  Bell,
  Search as SearchIcon,
  Settings,
  ChevronRight,
  Plus,
  Globe,
  Eye,
  UploadCloud,
  PenLine,
  Layers,
  AlignLeft,
  Navigation,
  Footprints,
  Megaphone,
  MonitorPlay,
  BarChart2,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Hash,
  Sliders,
  Send,
  MessageSquare,
  X
} from "lucide-react";

// ─── CMS Sidebar Nav ────────────────────────────────────────────────────────

const cmsNav = [
  { label: "Website Overview", href: "/admin/content", icon: LayoutDashboard },
  { label: "Homepage Builder", href: "/admin/content/home-builder", icon: Layers },
  { label: "Pages", href: "/admin/content/pages", icon: FileText },
  { label: "Blogs & Articles", href: "/admin/blogs", icon: BookOpen },
  { label: "Media Library", href: "/admin/gallery", icon: ImageIcon },
  { label: "Announcements", href: "/admin/notices", icon: Bell },
  { label: "Testimonials", href: "/admin/feedback", icon: Star },
  { label: "Navigation Builder", href: "/admin/layout", icon: Navigation },
  { label: "Footer Manager", href: "/admin/content/footer", icon: Footprints },
  { label: "SEO Settings", href: "/admin/content/seo", icon: SearchIcon },
  { label: "Website Settings", href: "/admin/settings", icon: Settings },
  { label: "Forms & Leads", href: "/admin/content/forms", icon: MessageSquare },
];

export function CMSSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-white border-r border-slate-100 h-full flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Website CMS</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Content Manager</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {cmsNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-violet-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          Preview Website
        </Link>
      </div>
    </aside>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, trend }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-none mt-1">{value}</p>
        {trend && <p className="text-[10px] font-semibold text-emerald-600 mt-1">{trend}</p>}
      </div>
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────────────────────────

function QuickAction({ label, icon: Icon, href, color }: {
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all group cursor-pointer",
        "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
      )}
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-110", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs font-bold text-slate-600 group-hover:text-violet-700 text-center leading-tight">{label}</span>
    </Link>
  );
}

// ─── Section Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "published" | "draft" | "review" | "scheduled" }) {
  const map = {
    published: "bg-emerald-50 text-emerald-700",
    draft: "bg-slate-100 text-slate-500",
    review: "bg-amber-50 text-amber-700",
    scheduled: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide", map[status])}>
      {status}
    </span>
  );
}

// ─── CMS Dashboard Home ───────────────────────────────────────────────────────

export default function CMSDashboard() {
  const [globalSearch, setGlobalSearch] = useState("");

  const recentPages = [
    { title: "Home Page", slug: "/", status: "published" as const, updated: "2 hrs ago" },
    { title: "About Us", slug: "/about", status: "published" as const, updated: "1 day ago" },
    { title: "Contact Us", slug: "/contact", status: "draft" as const, updated: "3 days ago" },
    { title: "Privacy Policy", slug: "/privacy", status: "review" as const, updated: "5 days ago" },
    { title: "Courses Page", slug: "/courses", status: "published" as const, updated: "1 week ago" },
  ];

  const recentBlogs = [
    { title: "How to Crack SSC CGL 2025", category: "Exam Tips", status: "published" as const, updated: "1 hr ago" },
    { title: "Top 10 Typing Speed Tricks", category: "Typing", status: "draft" as const, updated: "4 hrs ago" },
    { title: "CPCT Exam Pattern Explained", category: "CPCT", status: "scheduled" as const, updated: "Yesterday" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f5f7fb]">
      {/* ── Top Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Website CMS</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your public website — pages, blogs, media, and more.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search pages, blogs..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            />
          </div>
          <Link href="/admin/content/pages/new" className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" /> New Page
          </Link>
          <Link href="/admin/blogs/new" className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm">
            <PenLine className="w-3.5 h-3.5" /> New Blog
          </Link>
          <Link href="/" target="_blank" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-lg transition-all">
            <Eye className="w-3.5 h-3.5" /> Preview Site
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total Pages" value="12" icon={FileText} color="bg-violet-50 text-violet-600" />
          <StatCard label="Published Blogs" value="47" icon={BookOpen} color="bg-emerald-50 text-emerald-600" trend="↑ 3 this week" />
          <StatCard label="Pending Drafts" value="5" icon={AlignLeft} color="bg-amber-50 text-amber-600" />
          <StatCard label="Media Files" value="218" icon={ImageIcon} color="bg-blue-50 text-blue-600" />
          <StatCard label="Active Notices" value="3" icon={Bell} color="bg-rose-50 text-rose-600" />
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            <QuickAction label="Edit Homepage" href="/admin/content/home-builder" icon={Layers} color="bg-violet-100 text-violet-600" />
            <QuickAction label="New Blog Post" href="/admin/blogs/new" icon={PenLine} color="bg-emerald-100 text-emerald-600" />
            <QuickAction label="Upload Media" href="/admin/gallery" icon={UploadCloud} color="bg-blue-100 text-blue-600" />
            <QuickAction label="Post Notice" href="/admin/notices" icon={Megaphone} color="bg-amber-100 text-amber-600" />
            <QuickAction label="Edit Navigation" href="/admin/layout" icon={Navigation} color="bg-rose-100 text-rose-600" />
            <QuickAction label="SEO Settings" href="/admin/content/seo" icon={SearchIcon} color="bg-teal-100 text-teal-600" />
            <QuickAction label="Site Settings" href="/admin/settings" icon={Settings} color="bg-slate-100 text-slate-600" />
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pages Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Pages</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">All website pages and their status</p>
              </div>
              <Link href="/admin/content/pages" className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentPages.map((page) => (
                <div key={page.slug} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{page.title}</p>
                    <p className="text-[10px] font-mono text-slate-400">{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <StatusBadge status={page.status} />
                    <span className="text-[10px] text-slate-400 hidden sm:block">{page.updated}</span>
                    <Link href={`/admin/content/pages`} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-violet-50 text-violet-600 transition-all">
                      <PenLine className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blog Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Recent Blogs</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Latest posts and their status</p>
              </div>
              <Link href="/admin/blogs" className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentBlogs.map((blog) => (
                <div key={blog.title} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{blog.title}</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{blog.category}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <StatusBadge status={blog.status} />
                    <Link href="/admin/blogs" className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-violet-50 text-violet-600 transition-all">
                      <PenLine className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
              <div className="px-5 py-3">
                <Link href="/admin/blogs/new" className="flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Write a new blog post
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── CMS Module Grid ── */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">All Website Sections</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {[
              { label: "Homepage Builder", desc: "Hero, banners, sections", href: "/admin/content/home-builder", icon: Layers, color: "text-violet-600 bg-violet-50" },
              { label: "All Pages", desc: "Create & manage pages", href: "/admin/content/pages", icon: FileText, color: "text-blue-600 bg-blue-50" },
              { label: "Blogs", desc: "Articles & posts", href: "/admin/blogs", icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
              { label: "Media Library", desc: "Images, videos, docs", href: "/admin/gallery", icon: ImageIcon, color: "text-cyan-600 bg-cyan-50" },
              { label: "Notices", desc: "Banners & alerts", href: "/admin/notices", icon: Bell, color: "text-amber-600 bg-amber-50" },
              { label: "Testimonials", desc: "Reviews & feedback", href: "/admin/feedback", icon: Star, color: "text-yellow-600 bg-yellow-50" },
              { label: "Navigation", desc: "Header & menus", href: "/admin/layout", icon: Menu, color: "text-rose-600 bg-rose-50" },
              { label: "SEO", desc: "Meta tags & ranking", href: "/admin/content/seo", icon: SearchIcon, color: "text-teal-600 bg-teal-50" },
              { label: "Forms & Leads", desc: "Enquiries & contacts", href: "/admin/content/forms", icon: MessageSquare, color: "text-indigo-600 bg-indigo-50" },
              { label: "Events", desc: "Calendar & schedule", href: "/admin/events", icon: Clock, color: "text-orange-600 bg-orange-50" },
              { label: "About Us", desc: "Mission, vision, team", href: "/admin/content/about", icon: AlignLeft, color: "text-purple-600 bg-purple-50" },
              { label: "Site Settings", desc: "Logo, colors, info", href: "/admin/settings", icon: Settings, color: "text-slate-600 bg-slate-100" },
            ].map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group flex flex-col"
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110", mod.color)}>
                  <mod.icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{mod.label}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">{mod.desc}</p>
                <div className="mt-3 flex items-center text-[10px] font-black text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wide gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Publishing Status Summary ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-black text-slate-900 mb-4">Publishing Health</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-800">47 Published</p>
                <p className="text-[10px] text-emerald-600">Live on website</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              <AlignLeft className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-800">5 Drafts</p>
                <p className="text-[10px] text-amber-600">Awaiting review</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-blue-800">2 Scheduled</p>
                <p className="text-[10px] text-blue-600">Will publish soon</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-rose-800">3 SEO Issues</p>
                <p className="text-[10px] text-rose-600">Need attention</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
