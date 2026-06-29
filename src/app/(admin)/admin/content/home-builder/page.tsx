"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Plus, ChevronLeft, Layers, Image as ImageIcon,
    Type, Users, Star, MessageSquare, BookOpen,
    Phone, HelpCircle, Award, Megaphone, Save,
    CheckCircle2, Settings2, Loader2, LayoutTemplate,
    Search, X, ExternalLink, Keyboard
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { 
    getDynamicPageData, updateCmsSection, 
    deleteCmsSection, createCmsSection 
} from "@/app/actions/cms";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSectionItem } from "@/components/admin/cms/SortableSectionItem";

const SECTION_TYPES = [
  { type: "HeroSection", label: "Hero Slider", icon: ImageIcon, desc: "Dynamic background slides" },
  { type: "AboutSection", label: "About Section", icon: Type, desc: "Institute intro text" },
  { type: "DirectorMessageSection", label: "Director Message", icon: Users, desc: "Official institution vision" },
  { type: "TypingTestCTASection", label: "Typing Test Section", icon: Keyboard, desc: "Official typing module prompt" },
  { type: "AchievementsSection", label: "Achievements", icon: Award, desc: "Stats & milestones" },
  { type: "TestimonialSlider", label: "Testimonials", icon: Star, desc: "Student reviews" },
  { type: "FacultySection", label: "Faculty Team", icon: Users, desc: "Meet the team" },
  { type: "GalleryGrid", label: "Gallery", icon: ImageIcon, desc: "Photo grid" },
  { type: "CTASection", label: "CTA Banner", icon: Megaphone, desc: "Call to action strip" },
  { type: "BlogSection", label: "Blog Preview", icon: BookOpen, desc: "Latest articles" },
  { type: "ContactSection", label: "Contact Section", icon: Phone, desc: "Form & map" },
  { type: "NotificationScroller", label: "Announcement Bar", icon: MessageSquare, desc: "Top banner notice" },
];

export default function HomepageBuilderPage() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageId, setPageId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getDynamicPageData("home");
            if (res.success) {
                setSections(res.sections);
                setPageId(res.page._id);
            } else {
                toast.error("Home page not found in CMS");
            }
        } catch (error) {
            toast.error("Failed to sync with matrix");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s._id === active.id);
            const newIndex = sections.findIndex((s) => s._id === over.id);
            const newArray = arrayMove(sections, oldIndex, newIndex);
            
            // Optimistic update
            setSections(newArray);
            setSaving(true);

            try {
                // Persist new order to DB
                for (let i = 0; i < newArray.length; i++) {
                    await updateCmsSection(newArray[i]._id, { sort_order: i });
                }
                toast.success("Homepage sequence updated");
            } catch (error) {
                toast.error("Failed to preserve order");
                loadData(); // Revert
            } finally {
                setSaving(false);
            }
        }
    };

    const toggleVisibility = async (id: string) => {
        const section = sections.find(s => s._id === id);
        if (!section) return;

        const originalState = section.is_active;
        // Optimistic
        setSections(prev => prev.map(s => s._id === id ? { ...s, is_active: !originalState } : s));

        const res = await updateCmsSection(id, { is_active: !originalState });
        if (!res.success) {
            toast.error("Visibility sync failed");
            setSections(prev => prev.map(s => s._id === id ? { ...s, is_active: originalState } : s));
        }
    };

    const deleteSection = async (id: string) => {
        if (!confirm("Are you sure you want to discard this section? All its internal blocks will be lost.")) return;
        
        const res = await deleteCmsSection(id);
        if (res.success) {
            toast.success("Section purged from architecture");
            setSections(prev => prev.filter(s => s._id !== id));
            if (selectedId === id) setSelectedId(null);
        } else {
            toast.error("Purge failed");
        }
    };

    const addSection = async (type: string) => {
        if (!pageId) return;
        const template = SECTION_TYPES.find(s => s.type === type);
        if (!template) return;

        setLoading(true);
        const res = await createCmsSection({
            page_id: pageId,
            section_name: template.label,
            section_type: type,
            sort_order: sections.length,
            is_active: true
        });

        if (res.success) {
            toast.success(`${template.label} injected into layout`);
            setSections([...sections, res.section]);
            setShowAddPanel(false);
        } else {
            toast.error("Injection failed");
        }
        setLoading(false);
    };

    const selectedSection = sections.find(s => s._id === selectedId);

    return (
        <div className="flex flex-col h-full bg-[#f5f7fb]">
            {/* Dynamic Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/content" className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-500 transition-all border border-transparent hover:border-slate-200">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Homepage Visual Manager</h1>
                            {saving && <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...
                            </div>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">
                            Live Infrastructure Management / Node: Home
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddPanel(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-200"
                    >
                        <Plus className="w-4 h-4" /> Inject Module
                    </button>

                    <Link href="/" target="_blank" className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                        <ExternalLink className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Section Architecture List */}
                <div className="w-full max-w-xl p-8 overflow-y-auto space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                Component Stack ({sections.length})
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-6" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Visual Architecture...</p>
                        </div>
                    ) : sections.length === 0 ? (
                        <div className="py-24 text-center bg-white border-4 border-dashed border-slate-100 rounded-[3rem]">
                            <LayoutTemplate className="w-20 h-20 text-slate-100 mx-auto mb-8" />
                            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest mb-4">Architecture Void</h3>
                            <button onClick={() => setShowAddPanel(true)} className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                Inject First Module
                            </button>
                        </div>
                    ) : (
                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={sections.map(s => s._id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4 pb-20">
                                    {sections.map((section) => (
                                        <SortableSectionItem 
                                            key={section._id}
                                            section={section}
                                            isSelected={selectedId === section._id}
                                            onSelect={() => setSelectedId(selectedId === section._id ? null : section._id)}
                                            onToggleVisibility={(e) => { e.stopPropagation(); toggleVisibility(section._id); }}
                                            onDuplicate={(e) => { e.stopPropagation(); toast.info("Duplicate incoming..."); }}
                                            onDelete={(e) => { e.stopPropagation(); deleteSection(section._id); }}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Intelligent Inspector Panel */}
                <div className="flex-1 border-l border-slate-200 bg-white p-10 overflow-y-auto hidden lg:block">
                    {selectedSection ? (
                        <div className="max-w-md animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-5 mb-10 pb-8 border-b border-slate-100">
                                <div className="w-16 h-16 rounded-[2rem] bg-violet-600 text-white flex items-center justify-center shadow-2xl shadow-violet-200 rotate-3">
                                    <Settings2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSection.section_name}</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Module Inspector</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Rename Module</label>
                                    <input
                                        defaultValue={selectedSection.section_name}
                                        onBlur={(e) => updateCmsSection(selectedSection._id, { section_name: e.target.value })}
                                        className="w-full px-5 py-4 text-sm font-black bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/5 transition-all"
                                    />
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase">Live Activation</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Toggle visibility on production</p>
                                        </div>
                                        <button
                                            onClick={() => toggleVisibility(selectedSection._id)}
                                            className={cn(
                                                "relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner",
                                                selectedSection.is_active ? "bg-emerald-500" : "bg-slate-300"
                                            )}
                                        >
                                            <span className={cn(
                                                "inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-transform",
                                                selectedSection.is_active ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 bg-violet-600 rounded-[2.5rem] text-white shadow-2xl shadow-violet-200 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            {selectedSection.section_type === "HeroSection" ? (
                                                <ImageIcon className="w-5 h-5 text-violet-200" />
                                            ) : (
                                                <BookOpen className="w-5 h-5 text-violet-200" />
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                                {selectedSection.section_type === "HeroSection" ? "Media Pipeline" : "Content Pipeline"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black mb-2">
                                            {selectedSection.section_type === "HeroSection" ? "Slider Controls" : "Editor Access"}
                                        </h3>
                                        <p className="text-xs text-violet-100 font-medium leading-relaxed opacity-90 mb-6">
                                            {selectedSection.section_type === "HeroSection" 
                                                ? "This module is driven by the global hero slider. To manage background images, headlines, and buttons for these slides, open the slider manager."
                                                : "To edit the internal blocks, images, and headlines of this module, launch the Matrix Editor."}
                                        </p>
                                        <Link href={selectedSection.section_type === "HeroSection" ? "/admin/content/home-builder/slider" : "/admin/content/pages"}>
                                            <button className="w-full py-4 bg-white text-violet-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-violet-50 transition-all shadow-xl active:scale-95">
                                                {selectedSection.section_type === "HeroSection" ? "Manage Hero Slides" : "Open Matrix Editor"}
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-300">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100">
                                <Search className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest">Inspector Inactive</p>
                            <p className="text-xs text-slate-400 font-medium mt-2 max-w-[200px]">Select a component module from the stack to adjust its configuration.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Injection Matrix (Add Section Modal) */}
            {showAddPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Module Injection Hub</h2>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Select a component to instantiate</p>
                            </div>
                            <button onClick={() => setShowAddPanel(false)} className="p-4 rounded-full hover:bg-white text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-10 overflow-y-auto">
                            {SECTION_TYPES.map((st) => {
                                const Icon = st.icon;
                                return (
                                    <button
                                        key={st.type}
                                        onClick={() => addSection(st.type)}
                                        className="flex flex-col items-start p-6 border-2 border-slate-50 rounded-[2rem] hover:border-violet-200 hover:bg-violet-50/30 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{st.label}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{st.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
