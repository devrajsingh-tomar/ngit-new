"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { uploadImageAction } from "@/app/actions/upload";
import { 
    Trash2, Save, Image as ImageIcon,
    Upload, Clock, Move, ChevronDown, ChevronUp,
    Library
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MediaLibraryModal } from "./cms/MediaLibraryModal";
import { RichTextEditor } from "./cms/RichTextEditor";

export function SortableBlockItem({ block, index, onUpdate, onSave, onDelete, sectionType }: any) {
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.6 : 1,
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", `Slider Image: ${block.title || "Untitled"}`);

        const res = await uploadImageAction(formData);
        if (res.success) {
            onUpdate(block._id, "image", res.url);
            toast.success("Image uploaded!");
        } else {
            toast.error(res.error || "Upload failed");
        }
        setUploading(false);
    };

    const needsMedia = ["HeroSection", "TestimonialSlider", "InfrastructureSection", "GalleryGrid", "AboutSection", "AchievementsSection", "VideoFeedbackSection", "CourseGrid", "FacultyGrid", "QuickActionsGrid"].includes(sectionType);
    const needsCTA = ["HeroSection", "CTASection", "AboutSection", "QuickActionsGrid"].includes(sectionType);
    const needsStructure = ["HeroSection"].includes(sectionType);
    const isHero = sectionType === "HeroSection";

    return (
        <div ref={setNodeRef} style={style} className={cn(
            "bg-white border text-sm border-slate-200 rounded-[2rem] relative group mb-8 shadow-sm hover:shadow-lg transition-all",
            !block.is_active && "bg-slate-50/80 border-dashed"
        )}>
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div 
                        {...attributes} {...listeners}
                        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors"
                    >
                        <Move className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-lg text-slate-800 tracking-tight">
                            {isHero ? `Slide Module ${index + 1}` : `Block Data ${index + 1}`}
                        </h4>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5 max-w-[200px] truncate">{block.title || "Untitled Block"}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                        <Switch 
                            checked={block.is_active !== false} 
                            onCheckedChange={(val) => onUpdate(block._id, "is_active", val)} 
                        />
                    </div>
                    <Button variant="outline" className="h-10 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold text-xs border-slate-200" onClick={() => onSave(block._id, block)}>
                        <Save className="w-4 h-4 mr-2" /> Sync
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 border-slate-200" onClick={() => onDelete(block._id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="p-6 sm:p-8 pt-6 space-y-8">
                {/* Upper Grid: Media & Text */}
                <div className={cn("grid gap-8", needsMedia ? "md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "grid-cols-1")}>
                    
                    {/* Media Column */}
                    {needsMedia && (
                        <div className="space-y-6">
                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-50 shadow-inner group/img">
                                {block.image ? (
                                    <Image src={block.image} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">No Media Source</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer">
                                    <div className="flex gap-2">
                                        <label className="cursor-pointer">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                            <div className="bg-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 shadow-xl hover:scale-105 transition-transform">
                                                {uploading ? <Clock className="w-4 h-4 animate-spin text-blue-500" /> : <Upload className="w-4 h-4 text-blue-500" />}
                                                {uploading ? "Ingesting..." : "Upload"}
                                            </div>
                                        </label>
                                        <button 
                                            onClick={() => setIsMediaModalOpen(true)}
                                            className="bg-violet-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white shadow-xl hover:scale-105 transition-transform"
                                        >
                                            <Library className="w-4 h-4" />
                                            Library
                                        </button>
                                    </div>
                                    <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Replace Block Media</span>
                                </div>
                            </div>

                            <MediaLibraryModal 
                                isOpen={isMediaModalOpen}
                                onClose={() => setIsMediaModalOpen(false)}
                                onSelect={(url) => {
                                    onUpdate(block._id, "image", url);
                                    setIsMediaModalOpen(false);
                                    toast.success("Asset linked from library");
                                }}
                            />
                            
                            {isHero && (
                                <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50 rounded-[2rem]">
                                    <div className="space-y-2 col-span-2 sm:col-span-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Animation Type</label>
                                        <Select value={block.animation || "slide"} onValueChange={(val) => onUpdate(block._id, "animation", val)}>
                                            <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl border-none shadow-2xl">
                                                <SelectItem value="slide">Slide In</SelectItem>
                                                <SelectItem value="fade">Dissolve</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2 sm:col-span-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Timer (ms)</label>
                                        <Input 
                                            type="number" 
                                            value={block.duration || 5000} 
                                            className="h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"
                                            onChange={(e) => onUpdate(block._id, "duration", parseInt(e.target.value))} 
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Image Focus Position</label>
                                        <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl">
                                            {(['top', 'center', 'bottom'] as const).map(pos => (
                                                <button 
                                                    key={pos}
                                                    onClick={() => onUpdate(block._id, "image_position", pos)}
                                                    className={cn(
                                                        "py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap overflow-hidden text-ellipsis",
                                                        (block.image_position || 'center') === pos ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                                    )}
                                                >
                                                    {pos}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text Column */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {sectionType === "TrustIndicators" ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Metrics Counter / Value</label>
                                        <Input 
                                            placeholder="e.g. 5000+ or 98%"
                                            className="h-16 rounded-xl bg-slate-900 border-none font-black text-white text-3xl focus-visible:ring-1 focus-visible:ring-blue-500 tracking-tight" 
                                            value={block.subtitle || ""} 
                                            onChange={(e) => onUpdate(block._id, "subtitle", e.target.value)} 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Metric Label / Recognition</label>
                                        <Input 
                                            placeholder="e.g. Students Trained"
                                            className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm text-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500" 
                                            value={block.title || ""} 
                                            onChange={(e) => onUpdate(block._id, "title", e.target.value)} 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Associated Icon Class</label>
                                        <Select value={block.icon_name || "Trophy"} onValueChange={(val) => onUpdate(block._id, "icon_name", val)}>
                                            <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-2xl border-none">
                                                <SelectItem value="Trophy">Trophy (Years of Mastery)</SelectItem>
                                                <SelectItem value="Users">Users (Students Trained)</SelectItem>
                                                <SelectItem value="TrendingUp">Trending Up (Success Rate)</SelectItem>
                                                <SelectItem value="Target">Target (High Ranks/Milestones)</SelectItem>
                                                <SelectItem value="ShieldCheck">Shield (Trusted Certification)</SelectItem>
                                                <SelectItem value="Zap">Zap (Instant Processing)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            {sectionType === "WhyChooseSection" ? "Reason Title" : "Primary Headline"}
                                        </label>
                                        <Input 
                                            placeholder="E.g., Welcome to NGIT"
                                            className="h-12 rounded-xl bg-slate-50 border-none font-extrabold text-slate-900 text-base focus-visible:ring-1 focus-visible:ring-blue-500" 
                                            value={block.title || ""} 
                                            onChange={(e) => onUpdate(block._id, "title", e.target.value)} 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Overline Badge / Subtitle</label>
                                        <Input 
                                            placeholder="E.g., Excellence in Education"
                                            className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm text-blue-600 focus-visible:ring-1 focus-visible:ring-blue-500" 
                                            value={block.subtitle || ""} 
                                            onChange={(e) => onUpdate(block._id, "subtitle", e.target.value)} 
                                        />
                                    </div>
                                </>
                            )}
                            {sectionType !== "TrustIndicators" && !["CourseGrid", "FacultyGrid"].includes(sectionType) && (
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                        {sectionType === "WhyChooseSection" ? "Reason Description" : "Narrative / Description"}
                                    </label>
                                    <RichTextEditor 
                                        content={block.description || ""} 
                                        onChange={(html) => onUpdate(block._id, "description", html)} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Call To Actions Grid */}
                {needsCTA && (
                    <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 mt-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Action Route</span>
                            </div>
                            <div className="space-y-3">
                                <Input 
                                    placeholder="Button Label (e.g., Get Started)" 
                                    className="h-11 rounded-xl bg-white border-slate-200 text-sm font-bold shadow-sm" 
                                    value={block.button_text || ""} 
                                    onChange={(e) => onUpdate(block._id, "button_text", e.target.value)} 
                                />
                                <Input 
                                    placeholder="Target URL Path" 
                                    className="h-11 rounded-xl bg-white/60 border-slate-200 text-xs font-mono" 
                                    value={block.button_link || ""} 
                                    onChange={(e) => onUpdate(block._id, "button_link", e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Action Route</span>
                            </div>
                            <div className="space-y-3">
                                <Input 
                                    placeholder="Button Label (e.g., Learn More)" 
                                    className="h-11 rounded-xl bg-white border-slate-200 text-sm font-bold shadow-sm" 
                                    value={block.secondary_button_text || ""} 
                                    onChange={(e) => onUpdate(block._id, "secondary_button_text", e.target.value)} 
                                />
                                <Input 
                                    placeholder="Target URL Path" 
                                    className="h-11 rounded-xl bg-white/60 border-slate-200 text-xs font-mono" 
                                    value={block.secondary_button_link || ""} 
                                    onChange={(e) => onUpdate(block._id, "secondary_button_link", e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Display Control Footer */}
                <div className="rounded-[2rem] bg-slate-900 text-white p-6 sm:p-8 space-y-8 relative overflow-hidden mt-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    
                    {needsStructure && (
                        <div className="relative">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Structure & Display Settings
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Height Scale</label>
                                    <Select value={block.image_size || "full"} onValueChange={(val) => onUpdate(block._id, "image_size", val)}>
                                        <SelectTrigger className="h-10 rounded-xl bg-slate-800/80 border-slate-700 text-xs font-bold shadow-none"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-2xl">
                                            <SelectItem value="small">Small (400px)</SelectItem>
                                            <SelectItem value="medium">Medium (600px)</SelectItem>
                                            <SelectItem value="large">Large (800px)</SelectItem>
                                            <SelectItem value="full">Ultra (Hero)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Object Fitting</label>
                                    <Select value={block.object_fit || "cover"} onValueChange={(val) => onUpdate(block._id, "object_fit", val)}>
                                        <SelectTrigger className="h-10 rounded-xl bg-slate-800/80 border-slate-700 text-xs font-bold shadow-none"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-2xl">
                                            <SelectItem value="cover">Cover Bounds</SelectItem>
                                            <SelectItem value="contain">Contain Full</SelectItem>
                                            <SelectItem value="fill">Fill (Distort)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Aspect Ratio</label>
                                    <Select value={block.aspect_ratio || "none"} onValueChange={(val) => onUpdate(block._id, "aspect_ratio", val)}>
                                        <SelectTrigger className="h-10 rounded-xl bg-slate-800/80 border-slate-700 text-xs font-bold shadow-none"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-2xl">
                                            <SelectItem value="none">Original Auto</SelectItem>
                                            <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                                            <SelectItem value="4:3">Standard (4:3)</SelectItem>
                                            <SelectItem value="1:1">Square Grid (1:1)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Layout Grid</label>
                                    <Select value={block.layout || "full-background"} onValueChange={(val) => onUpdate(block._id, "layout", val)}>
                                        <SelectTrigger className="h-10 rounded-xl bg-slate-800/80 border-slate-700 text-xs font-bold shadow-none"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-2xl">
                                            <SelectItem value="full-background">Immersive Overlay</SelectItem>
                                            <SelectItem value="centered">Centered Focus</SelectItem>
                                            <SelectItem value="left-content">Split Layout (Left)</SelectItem>
                                            <SelectItem value="right-content">Split Layout (Right)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={cn("relative pt-6 border-slate-800", needsStructure ? "border-t" : "")}>
                        <div className="grid md:grid-cols-2 gap-4 items-center">
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time-based Scheduling</h5>
                                <p className="text-xs text-slate-500 font-medium">Auto-publish or retire content on specific dates.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-4 h-10">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-3">From</span>
                                    <Input 
                                        type="date" 
                                        className="bg-transparent border-none text-[10px] font-black text-white focus-visible:ring-0 p-0" 
                                        value={block.start_date ? new Date(block.start_date).toISOString().split('T')[0] : ""}
                                        onChange={(e) => onUpdate(block._id, "start_date", e.target.value)}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="flex-1 flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-4 h-10">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-3">Until</span>
                                    <Input 
                                        type="date" 
                                        className="bg-transparent border-none text-[10px] font-black text-white focus-visible:ring-0 p-0" 
                                        value={block.end_date ? new Date(block.end_date).toISOString().split('T')[0] : ""}
                                        onChange={(e) => onUpdate(block._id, "end_date", e.target.value)}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
