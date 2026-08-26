"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadImageAction, getGalleryImages, deleteImageAction } from "@/app/actions/upload";
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Upload,
    RefreshCcw,
    X,
    Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminGalleryPage() {
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Others");
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        getGalleryImages().then(res => {
            if (res.success && res.images) {
                setImages(res.images.map((img: any) => ({
                    id: img._id,
                    title: img.title || "Untitled",
                    category: img.category || "Others",
                    url: img.url
                })));
            }
        });
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this image?")) return;
        const res = await deleteImageAction(id);
        if (res.success) {
            setImages(images.filter(img => img.id !== id));
            toast.success("Image removed from gallery");
        } else {
            toast.error("Failed to delete image.");
        }
    };

    const handleCopyUrl = (url: string) => {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Image URL copied to clipboard");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
    const [externalUrl, setExternalUrl] = useState("");

    const handleUpload = async () => {
        if (uploadMode === "url") {
            if (!externalUrl || !externalUrl.startsWith("http")) return toast.error("Enter a valid image URL");
            
            const uploadTitle = title || "Untitled";
            
            setLoading(true);
            const res = await (await import("@/app/actions/upload")).saveExternalImageUrlAction({
                url: externalUrl,
                title: uploadTitle,
                category
            });

            if (res.success) {
                setImages([{
                    id: res.media._id,
                    title: uploadTitle,
                    category,
                    url: externalUrl
                }, ...images]);
                toast.success("External memory saved!");
                resetUpload();
            } else {
                toast.error(res.error);
            }
        } else {
            if (!selectedFile) return toast.error("Select an image first");
            
            const uploadTitle = title || "Untitled";

            setLoading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", uploadTitle);
            formData.append("category", category);

            const res = await uploadImageAction(formData);

            if (res.success && res.url) {
                setImages([{
                    id: res.media._id,
                    title: uploadTitle,
                    category,
                    url: res.url
                }, ...images]);
                toast.success("Photo uploaded!");
                resetUpload();
            } else {
                toast.error(res.error || "Upload failed");
            }
        }
        setLoading(false);
    };

    const resetUpload = () => {
        setShowUpload(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setExternalUrl("");
        setTitle("");
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gallery Management</h1>
                    <p className="text-muted-foreground mt-1">Manage the institute's visual identity and memory gallery.</p>
                </div>
                <Button onClick={() => setShowUpload(!showUpload)} className="gap-2 h-12 rounded-xl px-6">
                    <Upload className="w-5 h-5" />
                    {showUpload ? "Cancel Upload" : "Upload New Photo"}
                </Button>
            </div>

            {showUpload && (
                <div className="bg-white border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-xl animate-in slide-in-from-top duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <h2 className="text-xl font-black flex items-center gap-2">
                             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Plus className="w-5 h-5" />
                             </div>
                             Add New Memory
                        </h2>
                        
                        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                             <button
                                onClick={() => setUploadMode("file")}
                                className={cn("px-5 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all", uploadMode === "file" ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                             >Direct Upload</button>
                             <button
                                onClick={() => setUploadMode("url")}
                                className={cn("px-5 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all", uploadMode === "url" ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                             >External Link</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Photo Title</label>
                                <Input
                                    placeholder="e.g. Science Lab 2025"
                                    className="h-14 rounded-2xl border-2 focus:border-primary/50 text-base font-bold shadow-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category Group</label>
                                <select
                                    className="flex h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 font-black text-sm uppercase tracking-widest focus:border-primary/50 outline-none transition-all"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="Others">Private / Others</option>
                                    <option>Campus</option>
                                    <option>Events</option>
                                    <option>Students</option>
                                    <option>Faculty</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Photo Source</label>
                            {uploadMode === "url" ? (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="https://images.unsplash.com/photo-..."
                                        className="h-14 rounded-2xl border-2 border-indigo-100 bg-indigo-50/20 text-sm font-mono"
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                    />
                                    {externalUrl && externalUrl.startsWith("http") && (
                                        <div className="w-full aspect-video rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
                                            <img src={externalUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    {previewUrl ? (
                                        <div className="w-full aspect-video rounded-3xl border-4 border-white shadow-2xl relative overflow-hidden group">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                className="absolute top-4 right-4 bg-red-600 text-white p-2.5 rounded-2xl hover:scale-110 transition-all shadow-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-56 rounded-3xl border-4 border-dashed border-slate-100 hover:border-primary/20 flex flex-col items-center justify-center text-slate-300 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer group"
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                                                <ImageIcon className="w-8 h-8 opacity-30" />
                                            </div>
                                            <p className="font-black text-[10px] uppercase tracking-[0.2em]">Select or drop source file</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 border-t pt-8">
                        <Button
                            onClick={handleUpload}
                            disabled={loading || (uploadMode === "file" ? !selectedFile : !externalUrl)}
                            className="flex-1 h-16 rounded-[1.5rem] font-black text-base shadow-2xl shadow-primary/30"
                        >
                            {loading ? <RefreshCcw className="w-5 h-5 animate-spin mr-3" /> : <Upload className="w-5 h-5 mr-3" />}
                            {uploadMode === "file" ? "Upload Photo" : "Add External Link"}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowUpload(false)} className="h-16 px-8 rounded-[1.5rem] font-black text-slate-400 uppercase tracking-widest text-xs">
                             Discard Changes
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.map((img) => (
                    <div key={img.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="aspect-square relative overflow-hidden bg-slate-100">
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/95 backdrop-blur-sm text-[10px] font-black px-3 py-1 rounded-full uppercase text-slate-900 border border-slate-200 shadow-xs">
                                    {img.category}
                                </span>
                            </div>

                            <div className="absolute top-3 right-3">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-full h-8 w-8 shadow-md"
                                    onClick={() => handleDelete(img.id)}
                                    title="Delete Image"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <h3 className="font-black text-sm text-slate-900 truncate" title={img.title}>{img.title}</h3>
                            
                            {/* Prominent Copy Image URL Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleCopyUrl(img.url)}
                                className="w-full h-9 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border-indigo-200 transition-all gap-1.5 shadow-2xs"
                            >
                                <Copy className="w-3.5 h-3.5" /> Copy Image URL
                            </Button>
                        </div>
                    </div>
                ))}


                {images.length === 0 && !showUpload && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[2rem] text-slate-400 font-medium">
                        Your gallery is empty. Let's add some memories!
                    </div>
                )}
            </div>
        </div>
    );
}
