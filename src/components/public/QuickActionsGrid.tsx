import Link from "next/link";
import { 
    BookOpen, 
    Book, 
    Mic, 
    Keyboard, 
    FileText, 
    Clock, 
    Share2, 
    HelpCircle, 
    Zap, 
    ArrowRight 
} from "lucide-react";

interface QuickActionItem {
    title: string;
    href: string;
}

export default function QuickActionsGrid({ blocks }: { blocks?: any[] }) {
    // Default fallback actions mapping to user website paths
    const defaultActions: QuickActionItem[] = [
        { title: "Paid Course", href: "/student/login" },
        { title: "Book Order", href: "/student/login" },
        { title: "Dictation Batch", href: "/student/login" },
        { title: "E-Book Pdf", href: "/student/login" },
        { title: "Software Batch Pdf", href: "/student/login" },
        { title: "Follow Us", href: "/student/login" },
        { title: "Doubt Solution", href: "/student/login" },
        { title: "Computer Course", href: "/student/login" },
        { title: "Timetable", href: "/student/login" },
        { title: "English Software Batches", href: "/student/login" },
        { title: "Hindi Software Batches", href: "/student/login" }
    ];

    const actionsToRender = (blocks && blocks.length > 0)
        ? blocks.map(b => ({
            title: b.title || "",
            href: b.button_link || "#"
          }))
        : defaultActions;

    // Helper to dynamically match titles to Lucide icons
    const getActionIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("paid") || t.includes("course") || t.includes("class")) {
            return <BookOpen className="w-6 h-6" />;
        }
        if (t.includes("book") && t.includes("order")) {
            return <Book className="w-6 h-6" />;
        }
        if (t.includes("dictation") || t.includes("steno") || t.includes("shorthand")) {
            return <Mic className="w-6 h-6" />;
        }
        if (t.includes("typing") || t.includes("keyboard")) {
            return <Keyboard className="w-6 h-6" />;
        }
        if (t.includes("pdf") || t.includes("ebook") || t.includes("download") || t.includes("software batch")) {
            return <FileText className="w-6 h-6" />;
        }
        if (t.includes("timetable") || t.includes("schedule") || t.includes("time")) {
            return <Clock className="w-6 h-6" />;
        }
        if (t.includes("follow") || t.includes("social") || t.includes("youtube") || t.includes("telegram")) {
            return <Share2 className="w-6 h-6" />;
        }
        if (t.includes("doubt") || t.includes("question") || t.includes("solution") || t.includes("help")) {
            return <HelpCircle className="w-6 h-6" />;
        }
        return <Zap className="w-6 h-6" />;
    };

    // Color theme list for unique card style branding
    const colorThemes = [
        { bg: "bg-indigo-50 text-indigo-600 border-indigo-100/50", hover: "group-hover:bg-indigo-600 group-hover:text-white" },
        { bg: "bg-emerald-50 text-emerald-600 border-emerald-100/50", hover: "group-hover:bg-emerald-600 group-hover:text-white" },
        { bg: "bg-rose-50 text-rose-600 border-rose-100/50", hover: "group-hover:bg-rose-600 group-hover:text-white" },
        { bg: "bg-amber-50 text-amber-600 border-amber-100/50", hover: "group-hover:bg-amber-600 group-hover:text-white" },
        { bg: "bg-violet-50 text-violet-600 border-violet-100/50", hover: "group-hover:bg-violet-600 group-hover:text-white" },
        { bg: "bg-sky-50 text-sky-600 border-sky-100/50", hover: "group-hover:bg-sky-600 group-hover:text-white" },
        { bg: "bg-teal-50 text-teal-600 border-teal-100/50", hover: "group-hover:bg-teal-600 group-hover:text-white" },
        { bg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100/50", hover: "group-hover:bg-fuchsia-600 group-hover:text-white" },
    ];

    return (
        <section className="py-20 bg-slate-50 relative overflow-hidden">
            {/* Background glowing decorations */}
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-sky-100/30 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.25em]">
                            Direct Access
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                            Quick <span className="text-gradient">Navigation Hub</span>
                        </h2>
                    </div>
                </div>

                {/* Desktop layout: Grid of clean modern card buttons */}
                <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {actionsToRender.map((item, index) => {
                        const finalHref = item.href.startsWith("http") || item.href.startsWith("/") ? item.href : `https://${item.href}`;
                        const isExternal = finalHref.startsWith("http");
                        const theme = colorThemes[index % colorThemes.length];

                        return (
                            <Link 
                                key={index} 
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-start h-[160px]"
                            >
                                <div className={`p-3 rounded-2xl aspect-square flex items-center justify-center border transition-colors duration-300 ${theme.bg} ${theme.hover}`}>
                                    {getActionIcon(item.title)}
                                </div>
                                <div className="flex items-center justify-between w-full mt-4">
                                    <h3 className="font-bold text-slate-800 text-[15px] group-hover:text-primary transition-colors pr-2 truncate">
                                        {item.title}
                                    </h3>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile layout: Grid layout matching mobile mock navigation */}
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                    {actionsToRender.map((item, index) => {
                        const finalHref = item.href.startsWith("http") || item.href.startsWith("/") ? item.href : `https://${item.href}`;
                        const isExternal = finalHref.startsWith("http");
                        const theme = colorThemes[index % colorThemes.length];

                        return (
                            <Link 
                                key={index} 
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group bg-white rounded-2xl p-3 border border-slate-100 flex items-center gap-3 active:scale-95 transition-all"
                            >
                                <div className={`p-2.5 rounded-xl aspect-square flex items-center justify-center shrink-0 ${theme.bg}`}>
                                    {getActionIcon(item.title)}
                                </div>
                                <span className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-primary transition-colors truncate">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
