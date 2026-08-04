export const dynamic = "force-dynamic";
import { ReactNode } from "react";

import PublicNavbar from "@/components/public/PublicNavbar";
import Footer from "@/components/public/Footer";
import HomepagePopup from "@/components/public/HomepagePopup";
import FloatingSocials from "@/components/public/FloatingSocials";
import TypingNotificationPopup from "@/components/public/TypingNotificationPopup";
import { getCMSContent } from "@/services/CMSService";
import { getFloatingSocialsData, getHeaderFooterData } from "@/app/actions/layoutContent";

export default async function PublicLayout({ children }: { children: ReactNode }) {
    const [popupSettings, socialsRes, layoutDataRes] = await Promise.all([
        getCMSContent("HOMEPAGE_POPUP"),
        getFloatingSocialsData(),
        getHeaderFooterData(),
    ]);

    const socials = socialsRes.success ? socialsRes.data : [];
    const headerData = layoutDataRes.success ? layoutDataRes.header : null;

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar initialData={headerData} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <HomepagePopup settings={popupSettings} />
            <FloatingSocials socials={socials} />
            <TypingNotificationPopup />
        </div>
    );
}

