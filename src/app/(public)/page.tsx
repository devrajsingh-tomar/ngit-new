export const dynamic = "force-dynamic";

import HeroSection from "@/components/public/HeroSection";
import QuickActionsGrid from "@/components/public/QuickActionsGrid";
import InteractiveTypingSandbox from "@/components/public/InteractiveTypingSandbox";
import RedesignedCertification from "@/components/public/RedesignedCertification";
import BlogSection from "@/components/public/BlogSection";

import { getHeroSlides } from "@/app/actions/cms";
import { listBlogPosts } from "@/app/actions/blog";

export default async function PublicHomePage() {
    const [slidesRes, blogRes] = await Promise.all([
        getHeroSlides(),
        listBlogPosts({ status: "PUBLISHED", limit: 3, page: 1 }),
    ]);

    const heroSlides = slidesRes.success ? slidesRes.slides : [];
    const publicBlogs = blogRes.success ? blogRes.data.posts : [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Hero Slider */}
            <HeroSection blocks={heroSlides} />

            {/* 2. Quick Navigation */}
            <QuickActionsGrid />

            {/* 3. Typing Exam Section */}
            <InteractiveTypingSandbox />

            {/* 4. Certification Section */}
            <RedesignedCertification />

            {/* 5. Blog Section */}
            <BlogSection blogs={publicBlogs} />
        </div>
    );
}

