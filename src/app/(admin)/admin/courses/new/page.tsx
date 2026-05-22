"use client";
import React, { useState } from "react";
import { createCourse } from "@/services/CourseService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { uploadImageAction } from "@/app/actions/upload";

export default function NewCoursePage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        category: "Academic",
        type: "ONLINE" as "ONLINE" | "OFFLINE",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80",
    });
    const [categories, setCategories] = useState(["Academic", "Competitive Exams", "Skill Development", "Management"]);
    const [newCategory, setNewCategory] = useState("");
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Uploading course thumbnail...");
        
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("title", `Course Thumbnail - ${formData.title || "New Course"}`);
            formDataUpload.append("category", "Courses");

            const res = await uploadImageAction(formDataUpload);
            if (res.success && res.url) {
                setFormData(prev => ({ ...prev, thumbnail: res.url }));
                toast.success("Thumbnail uploaded successfully!", { id: toastId });
            } else {
                toast.error(res.error || "Failed to upload image", { id: toastId });
            }
        } catch (err) {
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createCourse(formData);

        if (res.success) {
            toast.success("Course created! Now add some lessons.");
            // Go straight to content manager to start adding lessons
            router.push(`/admin/courses/${res.data._id}`);
        } else {
            toast.error(res.error || "Failed to create course");
            setLoading(false);
        }
    };


    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section center aligned on desktop */}
            <div className="flex items-center gap-6 mb-4">
                <Link href="/admin/courses">
                    <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 border-2 border-slate-100 hover:bg-white hover:border-primary/20 shadow-sm transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Create New Course</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Academic Program Setup — V1.2</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-50 rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-slate-200/50 space-y-12 relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    {/* Basic Info */}
                    <div className="space-y-8 md:col-span-2 border-b-2 border-dashed border-slate-100 pb-12">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
                            <div className="w-2.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                            Core Curriculm Details
                        </h2>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Official Course Title</label>
                                <Input
                                    placeholder="e.g. Advanced Diploma in Professional Computing"
                                    className="h-16 rounded-2xl px-8 bg-slate-50 border-none font-black text-slate-900 text-lg hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Academic Summary / Narrative</label>
                                <Textarea
                                    placeholder="Briefly explain the course objectives, target audience, and expected outcomes..."
                                    className="min-h-[160px] rounded-[2rem] px-8 py-6 bg-slate-50 border-none font-bold text-slate-700 text-base hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Category */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
                            <div className="w-2.5 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" />
                            Investment & Placement
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Base Tuition (₹)</label>
                                    <Input
                                        type="number"
                                        placeholder="0 for Open Enrollment"
                                        className="h-14 rounded-2xl px-6 bg-slate-50 border-2 border-transparent font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Delivery Model</label>
                                    <select
                                        className="flex h-14 w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 font-black text-xs uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "ONLINE" | "OFFLINE" })}
                                    >
                                        <option value="ONLINE">Digital Cloud Access</option>
                                        <option value="OFFLINE">Physical Campus Training</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Academic Category</label>
                                <div className="flex flex-col gap-4">
                                    <select
                                        className="flex h-14 flex-1 rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 font-black text-xs uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Tag New Category..."
                                            className="h-14 flex-1 rounded-2xl px-6 bg-white border-2 border-slate-100 font-bold"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            className="h-14 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest bg-slate-900 hover:bg-black shadow-lg"
                                            onClick={() => {
                                                if (newCategory && !categories.includes(newCategory)) {
                                                    setCategories([...categories, newCategory]);
                                                    setFormData({ ...formData, category: newCategory });
                                                    setNewCategory("");
                                                }
                                            }}
                                        >
                                            Append
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
                            <div className="w-2.5 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
                            Program Visuals
                        </h2>
                        <div className="space-y-6">
                            <input 
                                type="file" 
                                id="course-thumbnail-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                            />
                            <div 
                                onClick={() => document.getElementById("course-thumbnail-upload")?.click()}
                                className="w-full aspect-video rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 group hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer overflow-hidden shadow-inner relative"
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-xs font-bold text-slate-400">Uploading image...</p>
                                    </div>
                                ) : formData.thumbnail ? (
                                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 mb-2 opacity-30 group-hover:scale-110 group-hover:text-primary transition-all" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Identity Visual</p>
                                    </>
                                )}
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Asset URL / Secure Source</label>
                                <Input
                                    placeholder="Enter secure image URL..."
                                    className="h-14 rounded-2xl px-6 bg-slate-50 border-none font-bold text-slate-500 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 flex flex-col md:flex-row gap-6 border-t-2 border-slate-50">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-20 flex-1 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 gap-4 group"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Processing Admission Portal...
                            </>
                        ) : (
                            <>
                                Initialize Academic Program
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
                                   <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            </>
                        )}
                    </Button>
                    <Link href="/admin/courses" className="flex md:hidden">
                        <Button variant="ghost" className="h-16 w-full rounded-[2rem] font-bold text-slate-400">Cancel Setup</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
