export const dynamic = "force-dynamic";
import { ReactNode } from "react";

import PublicNavbar from "@/components/public/PublicNavbar";
import Footer from "@/components/public/Footer";
import HomepagePopup from "@/components/public/HomepagePopup";
import { getCMSContent } from "@/services/CMSService";

export default async function PublicLayout({ children }: { children: ReactNode }) {
    const popupSettings = await getCMSContent("HOMEPAGE_POPUP");

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <HomepagePopup settings={popupSettings} />
        </div>
    );
}

