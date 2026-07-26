export const dynamic = "force-dynamic";
import { ReactNode } from "react";

import PublicNavbar from "@/components/public/PublicNavbar";
import Footer from "@/components/public/Footer";
import HomepagePopup from "@/components/public/HomepagePopup";
import FloatingSocials from "@/components/public/FloatingSocials";
import { getCMSContent } from "@/services/CMSService";
import { getFloatingSocialsData } from "@/app/actions/layoutContent";

export default async function PublicLayout({ children }: { children: ReactNode }) {
    const [popupSettings, socialsRes] = await Promise.all([
        getCMSContent("HOMEPAGE_POPUP"),
        getFloatingSocialsData(),
    ]);

    const socials = socialsRes.success ? socialsRes.data : [];

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <HomepagePopup settings={popupSettings} />
            <FloatingSocials socials={socials} />
        </div>
    );
}

