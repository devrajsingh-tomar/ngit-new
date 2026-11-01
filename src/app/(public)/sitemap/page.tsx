import React from "react";
import Link from "next/link";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { listBlogPosts } from "@/app/actions/blog";
import { 
  Compass, 
  BookOpen, 
  Keyboard, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = constructMetadata({
  title: "Website Sitemap | Navigation Directory | NGIT Prayagraj",
  description:
    "Explore the complete website structure of National Genius Institute of Technology (NGIT) Prayagraj, including courses, typing tests, steno software, O Level books, and published educational blogs.",
  path: "/sitemap",
});

export const revalidate = 60; // 60 seconds revalidation

export default async function HtmlSitemapPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Sitemap", url: "/sitemap" },
  ]);

  // Fetch all published blogs dynamically
  const blogRes = await listBlogPosts({ status: "PUBLISHED", limit: 200, page: 1 });
  const publishedBlogs =
    blogRes.success && blogRes.data && Array.isArray(blogRes.data.posts) ? blogRes.data.posts : [];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={breadcrumbSchema} />

      {/* Header Banner */}
      <section className="container mx-auto px-4 lg:px-10 mb-12">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-14 overflow-hidden shadow-2xl border border-indigo-900/40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-black text-xs uppercase tracking-widest shadow-sm">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>PUBLIC DIRECTORY & ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              Website Sitemap & Directory
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Quickly navigate through all public portals, examination software, NIELIT study resources,
              admission forms, and published educational blogs of NGIT Prayagraj.
            </p>
            <div className="pt-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
              >
                <span>View Search Engine XML Sitemap (sitemap.xml)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sitemap Sections Grid */}
      <main className="container mx-auto px-4 lg:px-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Core Pages & Admissions */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Core Portals</h2>
                <p className="text-[11px] text-slate-500 font-medium">Main Academy Pages</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Home Page</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>About Us & Faculty Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/enroll" className="text-emerald-700 font-black hover:text-emerald-800 transition-colors flex items-center justify-between">
                  <span>Online Admission & Enrollment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Student Certificate Verification</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Contact Information & Location</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/student/login" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Student Portal Login</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Courses & NIELIT Books */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Courses & Books</h2>
                <p className="text-[11px] text-slate-500 font-medium">Curriculum & Textbooks</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700">
              <li>
                <Link href="/courses" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>All Computer Courses</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/university-courses" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>University Degree Programs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link
                  href="/nielit-o-level-books-prayagraj"
                  className="text-indigo-700 font-black hover:text-indigo-900 transition-colors flex items-center justify-between"
                >
                  <span>NIELIT O Level Books (M1, M2, M3, M4)</span>
                  <Badge className="bg-amber-400 text-slate-950 text-[10px] py-0 px-2">₹299 Offer</Badge>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-indigo-700 font-black hover:text-indigo-900 transition-colors flex items-center justify-between">
                  <span>Public Blog & Educational Articles</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Typing & Steno Learning Software */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Exam Software</h2>
                <p className="text-[11px] text-slate-500 font-medium">Typing & Steno Engines</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700">
              <li>
                <Link href="/typing" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Online Typing Tests</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/typing-software" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Typing Software Download</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/typing-software-prayagraj" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Typing Software in Prayagraj</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/steno" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Online Steno Practice Engine</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/steno-software" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Steno Software Download</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/steno-software-prayagraj" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Steno Software in Prayagraj</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/shorthand" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Shorthand Audio Dictations</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Student Resources & Legal */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Student Resources</h2>
                <p className="text-[11px] text-slate-500 font-medium">Tools & Legal Policies</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700">
              <li>
                <Link href="/tools" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Practical Student Tools</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Exam Schedules</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Events & Seminars</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Institute Photo Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/notices" className="hover:text-indigo-600 transition-colors flex items-center justify-between">
                  <span>Official Notices</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex gap-2">
                <Link href="/terms-and-conditions" className="hover:text-indigo-600 transition-colors">Terms</Link>
                <span>•</span>
                <Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                <span>•</span>
                <Link href="/refund-policy" className="hover:text-indigo-600 transition-colors">Refund</Link>
              </li>
            </ul>
          </div>

          {/* 5. Published Educational Blogs (Dynamically Populated) */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Published Blog Articles</h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    All {publishedBlogs.length} Active Educational Articles
                  </p>
                </div>
              </div>
              <Link href="/blog" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                View Blog Portal →
              </Link>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              {publishedBlogs.map((blog: any) => {
                const date = blog.publishedAt || blog.createdAt;
                return (
                  <li key={blog._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                    <Link href={`/blog/${blog.slug}`} className="hover:text-indigo-600 transition-colors block space-y-1">
                      <span className="font-bold text-slate-900 line-clamp-2 leading-snug">
                        {blog.title}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="font-semibold text-indigo-600">{blog.category || "General"}</span>
                        <span>{date ? new Date(date).toLocaleDateString() : ""}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
