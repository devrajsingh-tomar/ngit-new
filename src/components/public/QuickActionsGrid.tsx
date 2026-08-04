import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface QuickActionItem {
    title: string;
    image: string;
    href: string;
}

export default function QuickActionsGrid({ blocks }: { blocks?: any[] }) {
    // Default fallback actions using images matching the screenshot!
    const defaultActions: QuickActionItem[] = [
        {
            title: "Hindi Steno Software (Login/Register)",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600", // Elegant abstract red/gold themed banner
            href: "student.ngitedu.com"
        },
        {
            title: "My Web App",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600", // Blue themed web login dashboard
            href: "/student/login"
        },
        {
            title: "Typing Software",
            image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600", // Neon backlit keyboard image
            href: "/typing"
        },
        {
            title: "English Steno Software (Login/Register)",
            image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=600", // Writing pad/pen banner
            href: "https://svshorthandsoftware.blogspot.com"
        },
        {
            title: "University Courses (Admission Open)",
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600", // University theme graduation caps
            href: "/university-courses"
        }
    ];

    // Map database blocks to our rendering structure if they exist
    const actionsToRender = (blocks && blocks.length > 0)
        ? blocks.map(b => ({
            title: b.title || "",
            image: b.image && (b.image.startsWith("http") || b.image.startsWith("/"))
                ? b.image
                : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
            href: b.button_link || "#"
          }))
        : defaultActions;

    return (
        <section className="py-16 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-10 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.2em]">
                        Student Workspace
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none italic">
                        Quick <span className="text-gradient">Navigation Hub</span>
                    </h2>
                    <p className="text-slate-500 font-bold text-lg leading-relaxed">
                        Access our core assessment engines, study materials, and certification tools directly from the links below.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {actionsToRender.map((item, index) => {
                        const finalHref = item.href.startsWith("http") || item.href.startsWith("/") ? item.href : `https://${item.href}`;
                        const isExternal = finalHref.startsWith("http");
                        return (
                            <Link 
                                key={index} 
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="w-full">
                                    {/* Card Image Header */}
                                    <div className="w-full aspect-[2.4/1] relative overflow-hidden bg-slate-900 flex items-center justify-center">
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                    {/* Card Label Bottom */}
                                    <div className="p-5 text-center bg-slate-50/50 min-h-[80px] flex items-center justify-center border-t border-slate-100">
                                        <span className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
