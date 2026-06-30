import { getDynamicPageData } from "@/app/actions/cms";
import DynamicRenderer from "@/components/public/DynamicRenderer";
import { notFound } from "next/navigation";

export default async function DynamicCMSPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch data for this specific slug
    const dynamicData = await getDynamicPageData(slug);

    if (!dynamicData.success || !dynamicData.page) {
        return notFound();
    }

    const cmsSections = dynamicData.sections || [];

    return (
        <div className="min-h-screen">
            {/* Header / Banner for Dynamic Pages */}
            <section className="bg-slate-900 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                <div className="container relative z-10 px-4 mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white capitalize">
                        {dynamicData.page.title || slug}
                    </h1>
                </div>
            </section>

            <DynamicRenderer 
                sections={cmsSections} 
                staticFallback={
                    <div className="py-20 text-center text-slate-500">
                        <p>This page has no sections yet. Add sections in the Admin Panel.</p>
                    </div>
                } 
            />
        </div>
    );
}
