"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
    getCmsPages, createCmsPage, deleteCmsPage, getCmsSections, 
    createCmsSection, updateCmsSection, deleteCmsSection, 
    getCmsContentBlocks
} from "@/app/actions/cms";
import { 
    ArrowUp, ArrowDown, ExternalLink, Plus, Trash2, Menu, 
    ChevronRight, LayoutTemplate, List, ArrowRight, Settings2, Sparkles,
    Maximize, Minimize
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeroBlockEditor } from "@/components/admin/HeroBlockEditor";

export default function AdvancedCmsPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const sectionTypes = ["HeroSection", "CourseGrid", "FacultyGrid", "GalleryGrid", "TestimonialSlider", "CTASection", "TypingTestCTASection", "AboutSection", "WhyChooseSection", "ContactSection", "AchievementsSection", "CoursesSection", "FacultySection", "EventsSection", "InfrastructureSection", "PublicResultsGrid", "PublicExamsGrid", "NotificationScroller", "TrustIndicators", "VideoFeedbackSection", "BlogSection"];

    const DATA_DRIVEN_SECTIONS: Record<string, { label: string, link: string }> = {
        "CoursesSection": { label: "Courses", link: "/admin/courses" },
        "CourseGrid": { label: "Courses", link: "/admin/courses" },
        "FacultySection": { label: "Faculty", link: "/admin/faculty" },
        "FacultyGrid": { label: "Faculty", link: "/admin/faculty" },
        "EventsSection": { label: "Events", link: "/admin/events" },
        "PublicResultsGrid": { label: "Exam Results", link: "/admin/results" },
        "PublicExamsGrid": { label: "Available Exams", link: "/admin/mock-tests/list" },
        "GallerySection": { label: "Gallery", link: "/admin/gallery" },
        "GalleryGrid": { label: "Gallery", link: "/admin/gallery" },
        "VideoFeedbackSection": { label: "Video Testimonials", link: "/admin/feedback" },
        "BlogSection": { label: "Blog Posts", link: "/admin/blogs" },
        "NotificationScroller": { label: "Latest Updates/Notices", link: "/admin/notices" },
        "HeroSection": { label: "Hero Slider", link: "/admin/content/home-builder/slider" }
    };

    const HIDDEN_PAGES = ["courses", "faculty"];
    const visiblePages = pages.filter(p => !HIDDEN_PAGES.includes(p.page_name));

    const activeSection = useMemo(() => sections.find(s => s._id === activeSectionId), [sections, activeSectionId]);

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        setLoading(true);
        const res = await getCmsPages();
        if (res.success && res.pages.length > 0) {
            setPages(res.pages);
            const initialVisible = res.pages.filter((p: any) => !HIDDEN_PAGES.includes(p.page_name));
            if (initialVisible.length > 0) {
                setActivePageId(initialVisible[0]._id);
                loadSections(initialVisible[0]._id);
            }
        }
        setLoading(false);
    };

    const loadSections = async (pageId: string) => {
        setLoading(true);
        const res = await getCmsSections(pageId);
        if (res.success) {
            setSections(res.sections);
            if (res.sections.length > 0) {
                setActiveSectionId(res.sections[0]._id);
                loadBlocks(res.sections[0]._id);
            } else {
                setBlocks([]);
                setActiveSectionId(null);
            }
        }
        setLoading(false);
    };

    const loadBlocks = async (sectionId: string) => {
        setLoading(true);
        try {
            const res = await getCmsContentBlocks(sectionId);
            if (res.success) {
                setBlocks(res.blocks);
            } else {
                setBlocks([]);
            }
        } catch (error) {
            console.error("Block sync error:", error);
            setBlocks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSection = async () => {
        if (!activePageId) return toast.error("Select a page first");
        const name = prompt("Enter section name:");
        if (!name) return;
        const type = prompt(`Enter section type (${sectionTypes.join(", ")}):`, "HeroSection");
        if (!type || !sectionTypes.includes(type)) return toast.error("Invalid type");

        const res = await createCmsSection({
            page_id: activePageId,
            section_name: name,
            section_type: type,
            sort_order: sections.length,
            is_active: true
        });

        if (res.success) {
            toast.success("Section created");
            loadSections(activePageId);
        }
    };

    const handleUpdateSection = async (id: string, updates: any) => {
        const res = await updateCmsSection(id, updates);
        if (res.success) {
            toast.success("Section updated");
            setSections(sections.map(s => s._id === id ? res.section : s));
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await deleteCmsSection(id);
        if (res.success) {
            toast.success("Section removed");
            loadSections(activePageId!);
        }
    };

    const handleCreatePage = async () => {
        const name = prompt("Enter page name:");
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        const title = prompt("Enter title:", name);
        if (!title) return;

        const res = await createCmsPage({ page_name: slug, title });
        if (res.success) {
            toast.success("Page created");
            loadPages();
        }
    };

    const handleDeletePage = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await deleteCmsPage(id);
        if (res.success) {
            toast.success("Page deleted");
            loadPages();
        }
    };

    const handleMoveSection = async (id: string, direction: "up" | "down") => {
        const index = sections.findIndex(s => s._id === id);
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === sections.length - 1) return;
        const newIndex = direction === "up" ? index - 1 : index + 1;
        const current = sections[index];
        const swap = sections[newIndex];
        await updateCmsSection(current._id, { sort_order: swap.sort_order });
        await updateCmsSection(swap._id, { sort_order: current.sort_order });
        loadSections(activePageId!);
    };

    return (
        <div className="space-y-8 max-w-full px-6 mx-auto pb-20 animate-in fade-in duration-1000">
            <div className="flex justify-between items-center px-4">
                 <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Enterprise Content Matrix</h1>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Production-Grade CMS Architecture / NGIT V.4</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setSidebarVisible(!sidebarVisible)}
                        className="font-black text-[10px] uppercase tracking-widest gap-2 bg-white rounded-xl px-4 h-10 border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        {sidebarVisible ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                        <span className="hidden sm:inline">{sidebarVisible ? "Zen Mode" : "Show Hierarchy"}</span>
                    </Button>
                    <Link href="/admin/content" className="hidden md:block">
                        <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest gap-2 bg-slate-50 rounded-xl px-6 h-10">
                            Dashboard <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className={cn("grid gap-8 items-start", sidebarVisible ? "xl:grid-cols-12" : "grid-cols-1")}>
                
                {/* Navigation Ecosystem */}
                {sidebarVisible && (
                    <div className="xl:col-span-3 space-y-6 animate-in slide-in-from-left-4 duration-500 fade-in">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Pages</h3>
                            <Button size="icon" variant="ghost" onClick={handleCreatePage} className="h-9 w-9 hover:bg-blue-50 rounded-xl"><Plus className="w-5 h-5 text-blue-600" /></Button>
                        </div>
                        <div className="space-y-2">
                            {visiblePages.map(page => (
                                <button 
                                    key={page._id}
                                    onClick={() => { setActivePageId(page._id); loadSections(page._id); }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black transition-all",
                                        activePageId === page._id
                                            ? "bg-slate-900 text-white shadow-2xl scale-[1.02] translate-x-1"
                                            : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <span className="uppercase tracking-widest">{page.page_name}</span>
                                    {activePageId === page._id && <ChevronRight className="w-4 h-4 text-blue-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Component Modules</h3>
                            <Button size="icon" variant="ghost" onClick={handleCreateSection} className="h-9 w-9 hover:bg-blue-50 rounded-xl"><Plus className="w-5 h-5 text-blue-600" /></Button>
                        </div>
                        <div className="space-y-3">
                            {sections.map((section, idx) => (
                                <div key={section._id} className="group/item relative">
                                    <button 
                                        onClick={() => { setActiveSectionId(section._id); loadBlocks(section._id); }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all",
                                            activeSectionId === section._id 
                                                ? "border-blue-500 bg-blue-50/50 shadow-inner ring-4 ring-blue-500/5 rotate-1" 
                                                : "border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">{section.section_name}</span>
                                            <span className="text-[8px] uppercase font-bold text-blue-400 tracking-tighter mt-0.5">{section.section_type}</span>
                                        </div>
                                    </button>
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col opacity-0 group-hover/item:opacity-100 transition-all z-20">
                                        <button onClick={() => handleMoveSection(section._id, "up")} className="p-1.5 bg-white border rounded-full mb-1 hover:text-blue-600 shadow-sm"><ArrowUp className="w-3 h-3" /></button>
                                        <button onClick={() => handleMoveSection(section._id, "down")} className="p-1.5 bg-white border rounded-full hover:text-blue-600 shadow-sm"><ArrowDown className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Intelligent Workspace */}
                <div className={cn(
                    "bg-slate-50/40 rounded-[3.5rem] border border-slate-200 shadow-inner overflow-hidden min-h-[800px] flex flex-col transition-all duration-500",
                    sidebarVisible ? "xl:col-span-9" : "col-span-full"
                )}>
                    {activeSectionId && activeSection ? (
                        <>
                            <div className="bg-white p-10 border-b border-slate-100 flex flex-wrap items-center justify-between gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-primary/10 text-primary font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full">Active Environment</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{activeSection.section_name}</h2>
                                    <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" /> {activeSection.section_type}</span>
                                        <span className="flex items-center gap-1.5"><List className="w-3.5 h-3.5" /> Synchronized Module</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        onClick={() => handleUpdateSection(activeSectionId, { is_active: !activeSection.is_active })}
                                        className={cn(
                                            "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl",
                                            activeSection.is_active ? "bg-slate-900 text-white" : "bg-emerald-500 text-white"
                                        )}
                                    >
                                        {activeSection.is_active ? "Offline Mode" : "Activate Module"}
                                    </Button>
                                    <Button variant="outline" className="h-14 w-14 rounded-2xl hover:bg-red-50 hover:text-red-500 border-slate-200" onClick={() => handleDeleteSection(activeSectionId)}>
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-10 flex-1">
                                {DATA_DRIVEN_SECTIONS[activeSection.section_type] ? (
                                    <div className="max-w-2xl mx-auto py-32 text-center space-y-10">
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-white">
                                                <ExternalLink className="w-12 h-12" />
                                            </div>
                                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-50">
                                                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Database-Coupled Module</h3>
                                            <p className="text-lg text-slate-500 font-medium leading-relaxed italic">
                                                This component is directly synchronized with your institutional records. Structural changes must be made via the dedicated {DATA_DRIVEN_SECTIONS[activeSection.section_type].label} Control Center.
                                            </p>
                                        </div>
                                        <Link href={DATA_DRIVEN_SECTIONS[activeSection.section_type].link}>
                                            <Button className="h-20 px-12 rounded-[2rem] bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                                                Launch {DATA_DRIVEN_SECTIONS[activeSection.section_type].label} HUB
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in zoom-in-95 duration-500">
                                        <HeroBlockEditor 
                                            key={activeSectionId} 
                                            sectionId={activeSectionId} 
                                            sectionType={activeSection.section_type} 
                                            initialBlocks={blocks} 
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-20 text-center animate-in zoom-in-95 duration-1000">
                            <div className="max-w-sm space-y-8">
                                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto border border-slate-50 relative">
                                    <LayoutTemplate className="w-10 h-10 text-slate-200" />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full blur-xl opacity-20" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.05em]">Module Selection Required</h3>
                                    <p className="text-slate-400 font-bold leading-relaxed text-sm">Please identify a page and component module from the architecture tree to begin configuration.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
