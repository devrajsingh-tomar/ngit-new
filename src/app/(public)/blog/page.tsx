import React from "react";
import { listBlogPosts } from "@/app/actions/blog";
import BlogListingClient, { BlogPostItem } from "@/components/public/BlogListingClient";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { BookOpen, Sparkles, GraduationCap } from "lucide-react";

export const metadata = constructMetadata({
  title: "Latest Blogs & Educational Articles | NGIT Prayagraj",
  description:
    "Explore latest educational blogs, exam preparation strategies, Hindi & English typing test guides, Steno dictation tips, and computer training tutorials from NGIT Prayagraj.",
  path: "/blog",
});

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PublicBlogListPage() {
  // Fetch all published posts (ordered by createdAt: -1 from listBlogPosts)
  const res = await listBlogPosts({ status: "PUBLISHED", limit: 200, page: 1 });
  const posts: BlogPostItem[] =
    res.success && res.data && Array.isArray(res.data.posts) ? res.data.posts : [];

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Latest Blogs & Educational Articles – NGIT Prayagraj",
    description:
      "Explore comprehensive blogs on computer courses, government exam typing preparation, stenography tips, and technical training from National Genius Institute of Technology.",
    url: "https://ngitedu.com/blog",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://ngitedu.com/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={[breadcrumbSchema, blogListSchema]} />

      {/* Hero Header Section */}
      <section className="container mx-auto px-4 lg:px-10 mb-12">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-indigo-900/40 text-center">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-black text-xs uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>THE NGIT KNOWLEDGE ARCHIVE • PRAYAGRAJ</span>
            </div>

            {/* Required SEO H1 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Latest Blogs & Educational Articles
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              Expert insights, government exam preparation guides, Hindi and English typing drills,
              shorthand mastery tips, and technical education updates from the faculty of NGIT Institute Prayagraj.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {posts.length} Published Articles
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Verified Faculty Guides
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Interactive Blog Listing */}
      <main className="container mx-auto px-4 lg:px-10">
        <BlogListingClient initialPosts={posts} />
      </main>
    </div>
  );
}
