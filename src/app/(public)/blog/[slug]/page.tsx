import { getBlogPost } from "@/app/actions/blog";
import { notFound } from "next/navigation";
import { Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { constructMetadata, getArticleSchema, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const res = await getBlogPost({ slug });
    if (!res.success) return constructMetadata({ title: "Post Not Found", description: "The requested blog post was not found on NGIT.", path: `/blog/${slug}`, noindex: true });
    const post = res.data;
    
    return constructMetadata({
        title: post.metaTitle || `${post.title} | NGIT Official Blog`,
        description: post.metaDescription || post.excerpt || `Read ${post.title} on NGIT Official Blog`,
        path: `/blog/${post.slug}`,
        ogType: "article",
        ogImage: post.thumbnail || "/logo.png",
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || "NGIT Team"],
        tags: post.tags || [],
    });
}

export default async function PublicBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const res = await getBlogPost({ slug });
    
    if (!res.success) {
        notFound();
    }

    const post = res.data;

    const articleSchema = getArticleSchema({
      title: post.title,
      description: post.excerpt || post.metaDescription || post.title,
      url: `/blog/${post.slug}`,
      image: post.thumbnail,
      publishedAt: post.publishedAt || post.createdAt,
      updatedAt: post.updatedAt,
      authorName: post.author?.name || "NGIT Team",
    });

    const breadcrumbSchema = getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ]);

    return (
        <article className="min-h-screen bg-white">
            <JsonLd data={[articleSchema, breadcrumbSchema]} />

            {/* Header Content Section */}
            <header className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
                <div className="container px-6 mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors mb-8 group">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Insight Hub
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-6 mb-8">
                            <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                {post.category || "Education"}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock className="w-4 h-4" />
                                6 min read
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic mb-10">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 py-8 border-t border-slate-200">
                            <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center text-white text-xl font-black italic">
                                {post.author?.name?.charAt(0) || "A"}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Architected By</p>
                                <p className="text-xl font-black text-slate-900 italic">{post.author?.name || "Admin Expert"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-[400px] h-full bg-slate-100 -z-10 rounded-bl-[10rem]" />
            </header>

            {/* Featured Image */}
            <div className="container px-6 mx-auto -mt-10 mb-20 relative z-20">
                <div className="max-w-5xl mx-auto">
                    <div className="aspect-[21/9] relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white shadow-black/10">
                        <img 
                            src={post.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070"} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="container px-6 mx-auto pb-24">
                <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-16 relative">
                    
                    {/* Share Sidebar */}
                    <aside className="lg:w-20 shrink-0 lg:sticky lg:top-32 h-fit space-y-8 flex lg:flex-col items-center justify-center lg:justify-start">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all cursor-pointer">
                            <Facebook className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-blue-400 hover:text-white transition-all cursor-pointer">
                            <Twitter className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-blue-700 hover:text-white transition-all cursor-pointer">
                            <Linkedin className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-slate-950 hover:text-white transition-all cursor-pointer">
                            <Bookmark className="w-5 h-5" />
                        </div>
                    </aside>

                    {/* Rich Text Body */}
                    <div className="flex-1">
                        <div 
                            className="prose prose-slate prose-xl max-w-none 
                                prose-headings:font-black prose-headings:tracking-tighter prose-headings:italic prose-headings:text-slate-900 
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                                prose-strong:text-slate-900 prose-strong:font-black
                                prose-blockquote:border-l-primary prose-blockquote:bg-slate-50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:italic prose-blockquote:font-black prose-blockquote:text-slate-900 
                                prose-img:rounded-3xl prose-img:shadow-xl
                                prose-a:text-primary prose-a:font-black prose-a:no-underline hover:prose-a:underline
                                prose-li:text-slate-600 prose-li:font-medium
                                selection:bg-primary/20"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap gap-3">
                                {post.tags.map((tag: string, idx: number) => (
                                    <span key={idx} className="px-5 py-2 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 cursor-pointer transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* CTA Overlay Section */}
            <section className="py-24 bg-slate-950 mx-4 lg:mx-10 rounded-[4rem] mb-20 relative overflow-hidden">
                <div className="container px-6 mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none mb-10">
                        Ready to begin your <br className="hidden md:block"/> <span className="text-primary">Intellectual Journey?</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/exams">
                            <button className="h-16 px-12 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Explore Mock Tests
                            </button>
                        </Link>
                        <Link href="/contact">
                            <button className="h-16 px-12 rounded-2xl bg-white text-slate-950 text-sm font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
                                Connect Expert
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
            </section>
        </article>
    );
}
