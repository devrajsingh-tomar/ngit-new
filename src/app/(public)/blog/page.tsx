import { listBlogPosts } from "@/app/actions/blog";
import BlogSection from "@/components/public/BlogSection";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = constructMetadata({
  title: "Latest IT, Typing & Government Exam Blogs | NGIT Prayagraj",
  description: "Read expert articles on Hindi & English typing speed improvement, Steno dictation tips, UPSSSC/SSC exam preparation, and computer courses from NGIT Prayagraj.",
  path: "/blog",
});

export default async function PublicBlogListPage() {
    const res = await listBlogPosts({ status: "PUBLISHED", limit: 12, page: 1 });
    const posts = res.success && res.data ? (res.data.posts || []) : [];

    const breadcrumbSchema = getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
    ]);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <JsonLd data={breadcrumbSchema} />
            {/* Header Section */}
            <section className="relative overflow-hidden mb-16 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[3rem] mx-4 lg:mx-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070')] bg-cover opacity-10 mix-blend-overlay rounded-[3rem] mx-4 lg:mx-10" />
                
                <div className="relative z-10 container mx-auto px-4 py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-blue-200 font-black text-[10px] uppercase tracking-[0.3em] mb-8 backdrop-blur-xl border border-white/5">
                        The NGIT Archive
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none italic flex flex-wrap justify-center items-center gap-x-4">
                        <span className="inline-block">Knowledge</span>
                        <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 px-2 leading-none">Synthesis</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        Exploring the boundaries of technology, leadership, and industrial pedagogy through rigorous analysis and storytelling.
                    </p>
                </div>
            </section>

            {/* Articles List */}
            <BlogSection blogs={posts} />
        </div>
    );
}
