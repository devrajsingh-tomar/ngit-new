"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, FileText, ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createMaterial } from "@/app/actions/materials";
import { getAllCourses } from "@/app/actions/courses";

export default function CreateMaterialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        course: "",
        type: "PDF",
        url: "",
        size: "Unknown"
    });
    const [courses, setCourses] = useState<{ _id: string, title: string }[]>([]);

    useEffect(() => {
        const loadCourses = async () => {
            const res = await getAllCourses();
            if (res.success && res.courses) setCourses(res.courses);
        };
        loadCourses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await createMaterial(formData);
            if (res.success) {
                toast.success("Study material uploaded (linked) successfully!");
                router.push("/admin/materials");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to add material");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/materials">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Upload Material</h1>
                    <p className="text-slate-500 font-medium">Share study notes, PDFs, or lecture links.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Material Title <span className="text-red-500">*</span></label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Thermodynamics Formula Sheet"
                            className="font-bold text-lg h-12 border-slate-200 focus:border-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Course / Subject <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white focus:border-primary outline-none text-sm font-medium"
                            >
                                <option value="" disabled>Select a mapped course...</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c.title}>{c.title}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">Material maps strictly to the course title here.</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Type</label>
                            <select
                                className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white focus:border-primary outline-none text-sm font-medium"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="VIDEO">Video Link</option>
                                <option value="LINK">External Resource</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <LinkIcon className="w-3 h-3" /> File URL / Drive Link <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={formData.url}
                            onChange={(e) => {
                                const val = e.target.value;
                                let newType = formData.type;
                                if (val.includes("drive.google.com") && formData.type !== "PDF") {
                                    newType = "PDF";
                                    toast.info("Google Drive link detected. Automatically set to PDF mode.");
                                }
                                setFormData({ ...formData, url: val, type: newType });
                            }}
                            placeholder="https://drive.google.com/..."
                            className="h-11 border-slate-200 focus:border-primary font-mono text-xs"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Paste a publicly accessible link (Google Drive, Dropbox, or direct file link).</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Size (Optional)</label>
                        <Input
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            placeholder="e.g. 2.5 MB"
                            className="h-11 border-slate-200 focus:border-primary w-1/3"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button type="submit" disabled={loading} size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2 font-bold px-8">
                        {loading ? "Adding..." : "Add Material"}
                        <Upload className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
