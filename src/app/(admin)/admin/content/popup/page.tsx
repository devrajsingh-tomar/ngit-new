"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
    ChevronLeft, Megaphone, Save, Globe, Loader2, Play, 
    X, Library, Settings2, Link as LinkIcon, CheckCircle2, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MediaLibraryModal } from "@/components/admin/cms/MediaLibraryModal";
import { ImageUpload } from "@/components/ui/image-upload";
import { getCMSContent, updateCMSContent } from "@/services/CMSService";

interface PopupData {
    isActive: boolean;
    title: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    showOncePerSession: boolean;
}

const defaultPopupData: PopupData = {
    isActive: false,
    title: "Subscribe to YouTube Channel!",
    description: "हमारे YouTube Channel पर बहुत सारे Shorthand Batches बिल्कुल FREE में उपलब्ध हैं। अभी Subscribe करें और अपनी तैयारी को बेहतर बनाएं!",
    imageUrl: "",
    buttonText: "Channel Subscribe करें",
    buttonLink: "https://youtube.com",
    showOncePerSession: true
};

export default function AdminPopupPage() {
    const [form, setForm] = useState<PopupData>(defaultPopupData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Fetch existing settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getCMSContent("HOMEPAGE_POPUP");
                if (data) {
                    setForm({
                        isActive: typeof data.isActive === "boolean" ? data.isActive : false,
                        title: data.title || "",
                        description: data.description || "",
                        imageUrl: data.imageUrl || "",
                        buttonText: data.buttonText || "",
                        buttonLink: data.buttonLink || "",
                        showOncePerSession: typeof data.showOncePerSession === "boolean" ? data.showOncePerSession : true
                    });
                }
            } catch (err) {
                toast.error("Failed to load popup configurations");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Save modifications
    const handleSave = () => {
        if (!form.title.trim()) {
            toast.error("Popup title is required");
            return;
        }
        if (!form.buttonText.trim()) {
            toast.error("Action button text is required");
            return;
        }
        if (!form.buttonLink.trim()) {
            toast.error("Action redirect URL is required");
            return;
        }

        setSaving(true);
        startTransition(async () => {
            try {
                const res = await updateCMSContent("HOMEPAGE_POPUP", form);
                if (res.success) {
                    toast.success("Popup settings published successfully!");
                } else {
                    toast.error(res.error || "Failed to update popup content");
                }
            } catch {
                toast.error("Server synchronization error");
            } finally {
                setSaving(false);
            }
        });
    };

    const isYoutubeLink = form.buttonLink.toLowerCase().includes("youtube.com") || form.buttonLink.toLowerCase().includes("youtu.be");

    return (
        <div className="flex flex-col h-full bg-[#f5f7fb]">
            {/* Header Banner */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/admin/content" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-base font-black text-slate-900">Homepage Alert Popup</h1>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                            Manage global modal overlays and call-to-actions
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/" target="_blank" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all">
                        <Globe className="w-3.5 h-3.5" /> Preview Website
                    </Link>
                </div>
            </div>

            {/* Form Editor Body */}
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching parameters...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Editor Controls */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Visual Editor Form */}
                            <div className="bg-white border rounded-[2rem] p-8 shadow-sm space-y-6">
                                <h2 className="text-base font-black text-slate-900 border-b pb-4 border-slate-100 flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-violet-600" /> Popup Form Content
                                </h2>

                                {/* Title Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Popup Heading/Title</label>
                                    <input
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Subscribe to YouTube Channel!"
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 font-semibold"
                                    />
                                </div>

                                {/* Description Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Popup Message/Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Enter the body message of your alert popup..."
                                        rows={4}
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 font-medium resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Image uploads */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Popup Icon / Badge Image</label>
                                    <div className="space-y-3">
                                        <ImageUpload 
                                            value={form.imageUrl}
                                            onChange={(url) => setForm({ ...form, imageUrl: url })}
                                            label="Upload Image Icon"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                value={form.imageUrl}
                                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                                placeholder="Or paste external logo image URL here..."
                                                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 font-medium"
                                            />
                                            <button 
                                                onClick={() => setIsMediaModalOpen(true)}
                                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                <Library className="w-3.5 h-3.5" /> Library
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">CTA Button Label</label>
                                        <input
                                            value={form.buttonText}
                                            onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                                            placeholder="e.g. Subscribe Now"
                                            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">CTA Redirect URL/Link</label>
                                        <input
                                            value={form.buttonLink}
                                            onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                                            placeholder="e.g. https://youtube.com/channel/..."
                                            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar controls */}
                        <div className="space-y-6">
                            {/* Publish configurations */}
                            <div className="bg-white border rounded-[2rem] p-6 shadow-sm space-y-6">
                                <h3 className="text-sm font-black text-slate-900 border-b pb-4 border-slate-100 flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-violet-600 animate-bounce" /> Deployment Settings
                                </h3>

                                {/* Global visibility toggle */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                    <div>
                                        <p className="text-xs font-black text-slate-700 uppercase">Show popup</p>
                                        <p className="text-[9px] text-slate-400 font-semibold">Live website status</p>
                                    </div>
                                    <button
                                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            form.isActive ? "bg-violet-600" : "bg-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                            form.isActive ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>

                                {/* Frequency settings */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                    <div>
                                        <p className="text-xs font-black text-slate-700 uppercase">Once Per Session</p>
                                        <p className="text-[9px] text-slate-400 font-semibold">Avoid disrupting users</p>
                                    </div>
                                    <button
                                        onClick={() => setForm({ ...form, showOncePerSession: !form.showOncePerSession })}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            form.showOncePerSession ? "bg-violet-600" : "bg-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                            form.showOncePerSession ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-violet-100 disabled:opacity-60 transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Configurations
                                </button>
                            </div>

                            {/* Live Layout Preview (Mockup card) */}
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-2 right-2 text-[7px] uppercase tracking-widest text-slate-500 font-black">Live Preview Mockup</div>
                                
                                <div className="bg-white text-slate-900 rounded-3xl p-5 relative mt-4 shadow-xl border text-center">
                                    {/* Close mock */}
                                    <div className="absolute top-3 right-3 text-slate-300"><X className="w-3.5 h-3.5" /></div>

                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3">
                                        {form.imageUrl ? (
                                            <img src={form.imageUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                                        ) : (
                                            <Play className="w-5 h-5 fill-red-500 text-red-500" />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-xs font-black text-slate-900 leading-tight mb-1 truncate">{form.title || "Heading..."}</h4>
                                    
                                    {/* Description */}
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-3 mb-4">{form.description || "Body text..."}</p>

                                    {/* Button */}
                                    <button className={cn(
                                        "w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-white shadow-md",
                                        isYoutubeLink ? "bg-red-600 shadow-red-200" : "bg-slate-950 shadow-slate-200"
                                    )}>
                                        {isYoutubeLink && <Play className="w-3 h-3 fill-white" />}
                                        {form.buttonText || "Button"}
                                    </button>

                                    {/* Dismiss */}
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-3">Maybe Later</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Media library */}
            <MediaLibraryModal 
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={(url) => {
                    setForm({ ...form, imageUrl: url });
                    setIsMediaModalOpen(false);
                    toast.success("Asset linked from media library");
                }}
            />
        </div>
    );
}
