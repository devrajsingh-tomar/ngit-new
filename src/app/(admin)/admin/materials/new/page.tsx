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
        course: "General",
        type: "PDF",
        url: "",
        size: "Unknown"
    });
    const [uploading, setUploading] = useState(false);
    const [courses, setCourses] = useState<{ _id: string, title: string }[]>([]);
    const [uploadMode, setUploadMode] = useState<"upload" | "link">("link");

    useEffect(() => {
        const loadCourses = async () => {
            const res = await getAllCourses();
            if (res.success && res.courses) setCourses(res.courses);
        };
        loadCourses();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        setUploading(true);
        const toastId = toast.loading("Uploading PDF...");

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);

            const res = await fetch("/api/upload/material", {
                method: "POST",
                body: uploadFormData,
            });

            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    url: data.url,
                    size: data.size || prev.size,
                    type: "PDF"
                }));
                toast.success("PDF uploaded successfully", { id: toastId });
            } else {
                toast.error(data.error || "Upload failed", { id: toastId });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred during upload", { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url) {
            toast.error("Please upload a file or provide a link");
            return;
        }
        setLoading(true);

        try {
            const res = await createMaterial(formData);
            if (res.success) {
                toast.success("Study material added successfully!");
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
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Add Study Material</h1>
                    <p className="text-slate-500 font-medium">Upload PDFs or share external resources with students.</p>
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
                                <option value="General">General / All Students</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c.title}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Type</label>
                            <select
                                className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white focus:border-primary outline-none text-sm font-medium"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="VIDEO">Video Link</option>
                                <option value="LINK">External Resource</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                            <button
                                type="button"
                                onClick={() => setUploadMode("upload")}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${uploadMode === "upload" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Upload PDF
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMode("link")}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${uploadMode === "link" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                External Link
                            </button>
                        </div>

                        {uploadMode === "upload" ? (
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <Upload className="w-3 h-3" /> Select PDF File
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-primary/50 transition-colors bg-slate-50/50">
                                    <div className="space-y-1 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-slate-300" />
                                        <div className="flex text-sm text-slate-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-bold text-primary hover:text-primary/80 focus-within:outline-none">
                                                <span>{formData.url ? "Change PDF" : "Upload a file"}</span>
                                                <input 
                                                    type="file" 
                                                    className="sr-only" 
                                                    accept=".pdf" 
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-slate-400">PDF up to 50MB</p>
                                        {formData.url && (
                                            <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">File Ready: {formData.size}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> File URL / Drive Link <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required={uploadMode === "link"}
                                    value={formData.url}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        let newType = formData.type;
                                        if (val.includes("drive.google.com") && formData.type !== "PDF") {
                                            newType = "PDF";
                                            toast.info("Google Drive link detected. Automatically set to PDF mode.");
                                        }
                                        setFormData({ ...formData, url: val, type: newType as any });
                                    }}
                                    placeholder="https://drive.google.com/..."
                                    className="h-11 border-slate-200 focus:border-primary font-mono text-xs"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Paste a publicly accessible link (Google Drive, Dropbox, or direct file link).</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Size Info (Auto-filled on upload)</label>
                        <Input
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            placeholder="e.g. 2.5 MB"
                            className="h-11 border-slate-200 focus:border-primary w-1/3"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={loading || uploading} 
                        size="lg" 
                        className="rounded-xl shadow-lg shadow-primary/20 gap-2 font-bold px-8"
                    >
                        {loading ? "Processing..." : "Add Material"}
                        <Save className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
