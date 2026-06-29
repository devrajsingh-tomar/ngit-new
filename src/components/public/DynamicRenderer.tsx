import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import WhyChooseSection from "./WhyChooseSection";
import InfrastructureSection from "./InfrastructureSection";
import FacultySection from "./FacultySection";
import AchievementsSection from "./AchievementsSection";
import CoursesSection from "./CoursesSection";
import GallerySection from "./GallerySection";
import EventsSection from "./EventsSection";
import RegistrationCTA from "./RegistrationCTA";
import CTASection from "./CTASection";
import ContactSection from "./ContactSection";
import TrustIndicators from "./TrustIndicators";
import NotificationScroller from "./NotificationScroller";
import DirectorMessageSection from "./DirectorMessageSection";
import BlogSection from "./BlogSection";
import VideoFeedbackSection from "./VideoFeedbackSection";
import NoticeSliderSection from "./NoticeSliderSection";

import CourseGrid from "./CourseGrid";
import FacultyGrid from "./FacultyGrid";
import GalleryGrid from "./GalleryGrid";
import TestimonialSlider from "./TestimonialSlider";
import PublicResultsGrid from "./PublicResultsGrid";
import PublicExamsGrid from "./PublicExamsGrid";
import TypingTestCTASection from "./TypingTestCTASection";

// Add some placeholder or custom mapping
export default function DynamicRenderer({ sections, staticFallback, extraData, session }: { sections: any[], staticFallback?: React.ReactNode, extraData?: any, session?: any }) {
    if (!sections || sections.length === 0) {
        return <>{staticFallback}</>;
    }

    return (
        <>
            {sections.filter((s: any) => s.is_active && s.section_type !== "CoursesSection" && s.section_type !== "CourseGrid").map((section: any, index: number) => {
                const sectionKey = section._id || index;

                switch (section.section_type) {
                    case "HeroSection":
                        return <HeroSection key={sectionKey} blocks={extraData?.heroSlides || section.blocks} />;
                    case "AboutSection":
                        return <AboutSection key={sectionKey} data={section} blocks={section.blocks} />;
                    case "WhyChooseSection":
                        return <WhyChooseSection key={sectionKey} data={section} blocks={section.blocks} />;
                    case "CourseGrid":
                        return <CourseGrid key={sectionKey} data={section} blocks={section.blocks} />;
                    case "CoursesSection":
                        return <CoursesSection key={sectionKey} data={section} courses={extraData?.courses || []} hideExplorer={extraData?.hideExplorer} />;
                    case "FacultyGrid":
                        return <FacultyGrid key={sectionKey} data={section} blocks={section.blocks} members={extraData?.faculty || []} />;
                    case "FacultySection":
                        return <FacultySection key={sectionKey} data={section} members={extraData?.faculty || []} />;
                    case "DirectorMessageSection": {
                        const director = extraData?.director || (extraData?.faculty?.find((f: any) => 
                            f.position?.toLowerCase().includes("director") || 
                            f.position?.toLowerCase().includes("md") ||
                            f.name?.toLowerCase().includes("javed")
                        ) || extraData?.faculty?.[0]);
                        return <DirectorMessageSection key={sectionKey} data={section} director={director} />;
                    }
                    case "GalleryGrid":
                        return <GalleryGrid key={sectionKey} data={section} blocks={section.blocks} />;
                    case "GallerySection":
                        return <GallerySection key={sectionKey} data={section} images={extraData?.gallery || []} />;
                    case "TestimonialSlider":
                        return <TestimonialSlider key={sectionKey} data={section} blocks={section.blocks} />;
                    case "AchievementsSection":
                        return <AchievementsSection key={sectionKey} data={section} blocks={section.blocks} />;
                    case "CTASection":
                        return <CTASection key={sectionKey} data={section} blocks={section.blocks} />;
                    case "TypingTestCTASection":
                        return <TypingTestCTASection key={sectionKey} data={section} />;
                    case "RegistrationCTA":
                        return <RegistrationCTA key={sectionKey} data={section} blocks={section.blocks} />;
                    case "ContactSection":
                        return <ContactSection key={sectionKey} data={section} blocks={section.blocks} />;
                    case "EventsSection":
                        return <EventsSection key={sectionKey} events={extraData?.events || []} />;
                    case "BlogSection":
                        return <BlogSection key={sectionKey} data={section} blogs={extraData?.blogs || []} />;
                    case "VideoFeedbackSection":
                        return <VideoFeedbackSection key={sectionKey} data={section} feedbacks={extraData?.feedback || []} />;
                    case "NoticeSliderSection":
                        return <NoticeSliderSection key={sectionKey} notices={extraData?.notices || []} />;
                    case "InfrastructureSection":
                        return <InfrastructureSection key={sectionKey} data={section} blocks={section.blocks} />;
                    case "PublicResultsGrid":
                        return <PublicResultsGrid key={sectionKey} data={section} results={extraData?.publicResults || []} />;
                    case "PublicExamsGrid":
                        return <PublicExamsGrid key={sectionKey} data={section} exams={extraData?.publicExams || []} session={session} />;
                    case "NotificationScroller": {
                        let notifications = [];
                        if (extraData?.notices && extraData.notices.length > 0) {
                            notifications = extraData.notices
                                .filter((n: any) => n.showInScroller)
                                .map((n: any) => ({
                                    id: n._id,
                                    text: n.title + (n.description ? ` - ${n.description.substring(0, 100)}...` : ''),
                                    link: n.link || `/notices`
                                }));
                        } else {
                            notifications = section.blocks?.map((b: any) => ({
                                id: b._id || b.id,
                                text: b.title || b.description || "Notification",
                                link: b.button_link || b.image || ""
                            })) || [];
                        }
                        if (notifications.length === 0) return null;
                        return <NotificationScroller key={sectionKey} notifications={notifications} />;
                    }
                    case "TrustIndicators": {
                        const stats = section.blocks?.map((b: any) => ({
                            label: b.title || "Stat",
                            value: b.subtitle || "0"
                        })) || [];
                        return <TrustIndicators key={sectionKey} stats={stats} />;
                    }
                    default:
                        // Fallback component
                        return (
                            <section key={sectionKey} className="py-20 bg-slate-50 text-center">
                                <h2 className="text-2xl font-bold mb-4">{section.section_name}</h2>
                                <p className="text-slate-500">Component type '{section.section_type}' is currently not mapped.</p>
                            </section>
                        );
                }
            })}
        </>
    );
}
