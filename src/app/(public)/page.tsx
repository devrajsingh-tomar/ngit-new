export const dynamic = "force-dynamic";

import HeroSlider from "@/components/home/HeroSlider";
import QuickActionsGrid from "@/components/public/QuickActionsGrid";
import TypingInformationSection from "@/components/public/TypingInformationSection";
import AppDownloadSection from "@/components/public/AppDownloadSection";
import NotificationScroller from "@/components/public/NotificationScroller";
import BlogSection from "@/components/public/BlogSection";

import { getHeroSlides, getDynamicPageData } from "@/app/actions/cms";
import { getNotices } from "@/app/actions/notice";
import { listBlogPosts } from "@/app/actions/blog";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "NGIT | Computer Courses, Typing & Government Exam Preparation in Prayagraj",
  description: "Join NGIT Prayagraj for online Hindi & English typing tests, Steno shorthand dictations, UPSSSC & SSC exam preparation, CCC, O Level & IT computer courses.",
  path: "/",
});

export default async function PublicHomePage() {
    const [slidesRes, dynamicRes, noticesRes, blogRes] = await Promise.all([
        getHeroSlides(),
        getDynamicPageData("home"),
        getNotices(false),
        listBlogPosts({ status: "PUBLISHED", limit: 3, page: 1 }),
    ]);

    const heroSlides = slidesRes.success ? slidesRes.slides : [];
    const rawNotices = noticesRes.success ? noticesRes.notices : [];
    const blogs = blogRes.success && blogRes.data ? (blogRes.data.posts || []) : [];
    
    const notifications = rawNotices.map((n: any) => ({
        id: n._id?.toString() || n._id,
        text: `${n.title} - ${n.description}`,
        link: n.link || undefined,
    }));
    
    // Find dynamic Quick Navigation blocks configured by the admin
    const pageSections = dynamicRes.success && dynamicRes.sections ? dynamicRes.sections : [];
    const quickActionsSection = pageSections.find((s: any) => s.section_type === "QuickActionsGrid");
    const navigationBlocks = quickActionsSection ? quickActionsSection.blocks : [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Hero Slider */}
            <HeroSlider blocks={heroSlides} />

            {/* 2. Notifications Scroller */}
            <NotificationScroller notifications={notifications} />

            {/* 3. Quick Navigation Workspace */}
            <QuickActionsGrid blocks={navigationBlocks} />

            {/* 4. Typing Software Module Information Section */}
            <TypingInformationSection />

            {/* 5. Mobile App Download Section */}
            <AppDownloadSection />

            {/* 6. Blog Grid Section */}
            <BlogSection blogs={blogs} />
        </div>
    );
}
