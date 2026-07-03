export const dynamic = "force-dynamic";

import HeroSlider from "@/components/home/HeroSlider";
import QuickActionsGrid from "@/components/public/QuickActionsGrid";
import InteractiveTypingSandbox from "@/components/public/InteractiveTypingSandbox";
import RedesignedCertification from "@/components/public/RedesignedCertification";
import BlogSection from "@/components/public/BlogSection";

import { getHeroSlides, getDynamicPageData } from "@/app/actions/cms";
import { listBlogPosts } from "@/app/actions/blog";

export default async function PublicHomePage() {
    const [slidesRes, blogRes, dynamicRes] = await Promise.all([
        getHeroSlides(),
        listBlogPosts({ status: "PUBLISHED", limit: 3, page: 1 }),
        getDynamicPageData("home"),
    ]);

    const heroSlides = slidesRes.success ? slidesRes.slides : [];
    const publicBlogs = blogRes.success ? blogRes.data.posts : [];
    
    // Find dynamic Quick Navigation blocks configured by the admin
    const pageSections = dynamicRes.success && dynamicRes.sections ? dynamicRes.sections : [];
    const quickActionsSection = pageSections.find((s: any) => s.section_type === "QuickActionsGrid");
    const navigationBlocks = quickActionsSection ? quickActionsSection.blocks : [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Hero Slider */}
            <HeroSlider blocks={heroSlides} />

            {/* 2. Quick Navigation */}
            <QuickActionsGrid blocks={navigationBlocks} />

            {/* 3. Typing Exam Section */}
            <InteractiveTypingSandbox />

            {/* 4. Certification Section */}
            <RedesignedCertification />

            {/* 5. Blog Section */}
            <BlogSection blogs={publicBlogs} />
        </div>
    );
}

