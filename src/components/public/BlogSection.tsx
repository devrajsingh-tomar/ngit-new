"use client";

import { ArrowRight, Calendar, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    category?: string;
    author?: { name: string };
    createdAt: string;
}

export default function BlogSection({ blogs = [], data }: { blogs?: BlogPost[], data?: any }) {
    const title = data?.section_name || "Latest Insights & Knowledge";
    const subtitle = data?.subtitle || "Storytelling & SEO Ecosystem";
    const description = data?.description || "Expert perspectives on education, technology, and success strategies from our experienced faculty and industry leaders.";

    const fallbackBlogs: BlogPost[] = [
        {
            _id: "demo-1",
            title: "Top Computer Courses for Career Advancement in 2026",
            slug: "top-computer-courses-2026",
            excerpt: "Discover the most in-demand technical certifications and skills that top employers look for in modern job candidates.",
            thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000",
            category: "Career & Guidance",
            author: { name: "NGIT Editorial" },
            createdAt: new Date().toISOString()
        },
        {
            _id: "demo-2",
            title: "Mastering Speed & Accuracy for Government Typing Exams",
            slug: "mastering-typing-speed-exams",
            excerpt: "Essential tips, daily drills, and posture advice to clear high-stakes government typing tests effortlessly.",
            thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000",
            category: "Exam Prep",
            author: { name: "NGIT Faculty" },
            createdAt: new Date().toISOString()
        },
        {
            _id: "demo-3",
            title: "How Practical IT Training Transforms Technical Skill Sets",
            slug: "practical-it-training-benefits",
            excerpt: "Hands-on projects and laboratory experience are crucial for bridging the gap between theory and industry needs.",
            thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000",
            category: "Technology",
            author: { name: "Admin" },
            createdAt: new Date().toISOString()
        }
    ];

    const displayBlogs = blogs && blogs.length > 0 ? blogs : fallbackBlogs;

    const getExcerpt = (post: BlogPost) => {
        if (post.excerpt && post.excerpt.trim()) return post.excerpt;
        if (post.content) {
            const cleanText = post.content.replace(/<[^>]*>?/gm, "").trim();
            if (cleanText) return cleanText.slice(0, 140) + "...";
        }
        return "Dive deep into our latest article exploring the intersections of academic excellence and modern skill development...";
    };

    return (
        <section id="blog" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="container px-6 mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-4">
                        <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            {subtitle}
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        {title}
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Blogs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayBlogs.slice(0, 3).map((post, idx) => (
                        <motion.div
                            key={post._id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group"
                        >
                            <div className="h-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col">
                                {/* Image Container */}
                                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                                    <img 
                                        src={post.thumbnail && post.thumbnail.trim() ? post.thumbnail : "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070"} 
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-xl">
                                        {post.category && post.category.trim() ? post.category : "Education"}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <User className="w-3.5 h-3.5 text-primary" />
                                            By {post.author?.name || "NGIT Team"}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors mb-4 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-3 flex-1">
                                        {getExcerpt(post)}
                                    </p>

                                    <Link href={`/blog/${post.slug}`} className="mt-8 block">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest group/link">
                                            Read Full Article
                                            <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover/link:translate-x-1" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 pt-12 border-t border-slate-200/60 text-center">
                    <Link href="/blog">
                        <Button className="h-16 px-12 rounded-[2rem] text-sm font-black uppercase tracking-widest bg-slate-950 text-white hover:bg-primary shadow-2xl transition-all hover:-translate-y-1 group">
                            Explore Entire Content Hub
                            <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <p className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Updated thrice weekly with expert insights</p>
                </div>
            </div>

            {/* Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        </section>
    );
}
