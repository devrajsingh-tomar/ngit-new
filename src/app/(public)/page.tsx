export const dynamic = "force-dynamic";

import HeroSlider from "@/components/home/HeroSlider";
import QuickActionsGrid from "@/components/public/QuickActionsGrid";
import TypingInformationSection from "@/components/public/TypingInformationSection";
import NotificationScroller from "@/components/public/NotificationScroller";

import { getHeroSlides, getDynamicPageData } from "@/app/actions/cms";
import { getNotices } from "@/app/actions/notice";

export default async function PublicHomePage() {
    const [slidesRes, dynamicRes, noticesRes] = await Promise.all([
        getHeroSlides(),
        getDynamicPageData("home"),
        getNotices(false),
    ]);

    const heroSlides = slidesRes.success ? slidesRes.slides : [];
    const rawNotices = noticesRes.success ? noticesRes.notices : [];
    
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
        </div>
    );
}

