"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    X, Upload, Search, Image as ImageIcon, 
    Copy, Trash2, Check, Loader2, RefreshCcw,
    FolderPlus, MoreVertical, Eye, Download,
    ExternalLink, Maximize2, FileText, Calendar,
    HardDrive, CheckCircle2, ChevronRight, Filter,
    Plus, Grid, List as ListIcon, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getGalleryImages, uploadImageAction, deleteImageAction } from "@/app/actions/upload";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [selection, setSelection] = useState<string[]>([]);
    const [showUploadZone, setShowUploadZone] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const categories = [
        { name: "All", count: 0 },
        { name: "Campus", count: 0 },
        { name: "Events", count: 0 },
        { name: "Students", count: 0 },
        { name: "Faculty", count: 0 },
        { name: "Banners", count: 0 },
        { name: "Gallery", count: 0 },
        { name: "Others", count: 0 }
    ];

    const loadImages = async () => {
        setLoading(true);
        try {
            const res = await getGalleryImages();
            if (res && res.success && Array.isArray(res.images)) {
                setImages(res.images);
            }
        } catch (err) {
            console.error("Failed to load gallery images:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadImages();
            setSelectedAsset(null);
            setSelection([]);
            setShowUploadZone(false);
        }
    }, [isOpen]);

    const getAssetUrl = (item: any): string => {
        if (!item) return "";
        if (typeof item === "string") return item.trim();
        return (item.url || item.path || item.secure_url || "").trim();
    };

    const handleChooseAsset = (item: any) => {
        const finalUrl = getAssetUrl(item);
        if (!finalUrl) {
            toast.error("Invalid image asset URL");
            return;
        }
        onSelect(finalUrl);
        onClose();
        toast.success("Poster image selected successfully!");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
        const files = (e instanceof Array) ? e : Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(10);
        
        let successCount = 0;
        let lastUploadedUrl = "";
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", file.name.split('.')[0]);
            formData.append("category", selectedCategory !== "All" ? selectedCategory : "Others");

            const res = await uploadImageAction(formData);
            if (res.success && res.url) {
                successCount++;
                lastUploadedUrl = res.url;
                setUploadProgress(10 + ((i + 1) / files.length) * 90);
            }
        }

        if (successCount > 0) {
            toast.success(`${successCount} asset(s) uploaded successfully`);
            await loadImages();
            setShowUploadZone(false);
            if (lastUploadedUrl) {
                handleChooseAsset(lastUploadedUrl);
            }
        } else {
            toast.error("Asset upload failed");
        }
        setUploading(false);
        setUploadProgress(0);
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!confirm("Permanently delete this asset?")) return;
        
        const res = await deleteImageAction(id);
        if (res.success) {
            setImages(prev => prev.filter(img => img._id !== id));
            if (selectedAsset?._id === id) setSelectedAsset(null);
            setSelection(prev => prev.filter(sid => sid !== id));
            toast.success("Asset deleted");
        } else {
            toast.error("Failed to delete asset");
        }
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelection(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleCopyUrl = (url: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Resource URL copied to clipboard");
    };

    const filteredImages = images.filter(img => {
        const matchesSearch = (img.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (img.filename || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryCounts = images.reduce((acc: any, img: any) => {
        acc[img.category] = (acc[img.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogPrimitive.Portal>
                {/* Backdrop Overlay */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                
                {/* Modal Container */}
                <DialogPrimitive.Content 
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[96vw] max-w-[1400px] h-[92vh] max-h-[92vh] bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col focus:outline-none border border-slate-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    aria-describedby={undefined}
                >
                    <DialogPrimitive.Title className="sr-only">Institutional Media Core & Poster Selector</DialogPrimitive.Title>

                    {/* --- COMPACT STICKY HEADER --- */}
                    <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                                <ImageIcon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                                    Institutional Media Core
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                        Click Any Image to Select as Poster
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                    Select or upload official posters, thumbnails, and graphic assets
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button"
                                onClick={() => setShowUploadZone(!showUploadZone)}
                                className="items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-md flex cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {showUploadZone ? "Close Upload" : "Upload New Poster"}
                            </button>
                            <button 
                                type="button"
                                onClick={loadImages}
                                title="Refresh Archive"
                                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                            >
                                <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin text-indigo-600")} />
                            </button>
                            <div className="w-px h-6 bg-slate-200 mx-1" />
                            <button 
                                type="button"
                                onClick={onClose} 
                                title="Close Modal"
                                className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    {/* --- SEARCH & FILTER BAR --- */}
                    <div className="px-6 py-3.5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-3 bg-slate-50/50 shrink-0">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search assets by keyword, filename, or title..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                            />
                            {searchQuery && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden lg:block shrink-0" />
                            {categories.map(cat => {
                                const count = cat.name === "All" ? images.length : (categoryCounts[cat.name] || 0);
                                return (
                                    <button
                                        type="button"
                                        key={cat.name}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                                            selectedCategory === cat.name 
                                                ? "bg-slate-900 text-white shadow-md" 
                                                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        {cat.name}
                                        {count > 0 && (
                                            <span className={cn(
                                                "inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-md text-[8px] font-black",
                                                selectedCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="flex-1 flex overflow-hidden relative">
                        {/* --- MAIN GRID --- */}
                        <div className={cn(
                            "flex-1 overflow-y-auto p-6 transition-all duration-300",
                            selectedAsset ? "md:mr-[350px] lg:mr-[400px]" : ""
                        )}>
                            {showUploadZone && (
                                <UploadArea 
                                    onUpload={handleFileUpload} 
                                    isUploading={uploading} 
                                    progress={uploadProgress} 
                                    onClose={() => setShowUploadZone(false)} 
                                />
                            )}

                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center py-24">
                                    <RefreshCcw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Gallery Images...</p>
                                </div>
                            ) : filteredImages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5 text-slate-300">
                                        <Search className="w-10 h-10" />
                                    </div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">No matching images found</p>
                                    <p className="text-xs text-slate-400 mt-1.5 font-medium max-w-[280px] mx-auto">
                                        Try adjusting your search query, or upload a new image directly.
                                    </p>
                                    <Button 
                                        type="button"
                                        onClick={() => setShowUploadZone(true)} 
                                        variant="outline" 
                                        className="mt-6 rounded-xl font-black text-xs uppercase tracking-wider border-slate-200 gap-2"
                                    >
                                        <Upload className="w-4 h-4" /> Upload New Poster
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                                    {filteredImages.map((img) => (
                                        <AssetCard 
                                            key={img._id} 
                                            img={img} 
                                            url={getAssetUrl(img)}
                                            isSelected={selectedAsset?._id === img._id}
                                            isMultiSelected={selection.includes(img._id)}
                                            onChoose={() => handleChooseAsset(img)}
                                            onOpenInfo={() => setSelectedAsset(img)}
                                            onToggleSelect={(e: React.MouseEvent) => toggleSelection(img._id, e)}
                                            onDelete={(e: React.MouseEvent) => handleDelete(img._id, e)}
                                            onCopy={(e: React.MouseEvent) => handleCopyUrl(getAssetUrl(img), e)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- PREVIEW DRAWER --- */}
                        <AnimatePresence>
                            {selectedAsset && (
                                <motion.aside 
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="absolute right-0 top-0 bottom-0 w-full md:w-[350px] lg:w-[400px] bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col"
                                >
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                                        <div className="flex items-center gap-2">
                                            <Info className="w-4 h-4 text-indigo-600" />
                                            <span className="text-xs font-black uppercase tracking-wider text-slate-900">Asset Intelligence</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedAsset(null)} 
                                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                        {/* Large Preview */}
                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                                            <img 
                                                src={getAssetUrl(selectedAsset)} 
                                                alt={selectedAsset.title || "Poster"} 
                                                className="w-full h-full object-contain" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => window.open(getAssetUrl(selectedAsset), '_blank')}
                                                    className="p-2.5 bg-white rounded-xl text-slate-900 hover:scale-110 transition-all shadow-xl cursor-pointer"
                                                    title="View Full Size"
                                                >
                                                    <Maximize2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Metadata List */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Title / Name</label>
                                                <h3 className="text-sm font-extrabold text-slate-900 break-words leading-snug">
                                                    {selectedAsset.title || selectedAsset.filename || "Untitled Poster"}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <MetaItem icon={Calendar} label="Date" value={new Date(selectedAsset.createdAt || Date.now()).toLocaleDateString()} />
                                                <MetaItem icon={HardDrive} label="Size" value={formatFileSize(selectedAsset.size || 0)} />
                                                <MetaItem icon={FileText} label="Format" value={(selectedAsset.mimeType || "image/jpeg").split('/')[1]?.toUpperCase()} />
                                                <MetaItem icon={Filter} label="Category" value={selectedAsset.category || "General"} />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Direct Image Path</label>
                                                <div className="flex items-center gap-1.5">
                                                    <input 
                                                        readOnly 
                                                        value={getAssetUrl(selectedAsset)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 font-mono"
                                                    />
                                                    <Button 
                                                        type="button"
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleCopyUrl(getAssetUrl(selectedAsset))}
                                                        className="shrink-0 h-8 rounded-xl px-2.5 text-xs"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons in Drawer */}
                                    <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2 shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => handleChooseAsset(selectedAsset)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-200 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Quick Select This Poster
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleCopyUrl(getAssetUrl(selectedAsset))}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy Image URL
                                        </button>
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* --- BOTTOM ACTION BAR --- */}
                    <footer className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2.5 h-2.5 rounded-full",
                                    selectedAsset || selection.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                )} />
                                <p className="text-xs text-slate-600 font-bold">
                                    {selectedAsset 
                                        ? `Selected: ${selectedAsset.title || selectedAsset.filename}`
                                        : `${images.length} images available in gallery archive`}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                type="button"
                                variant="ghost" 
                                onClick={onClose} 
                                className="rounded-xl font-extrabold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button"
                                onClick={() => {
                                    const targetItem = selectedAsset || (selection.length > 0 && images.find(i => i._id === selection[0])) || images[0];
                                    if (targetItem) {
                                        handleChooseAsset(targetItem);
                                    } else {
                                        toast.error("Please click on an image first");
                                    }
                                }}
                                disabled={images.length === 0}
                                className="rounded-xl px-7 h-10 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Quick Select Poster
                            </Button>
                        </div>
                    </footer>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

// --- SUB-COMPONENTS ---

function AssetCard({ 
    img, 
    url,
    isSelected, 
    isMultiSelected, 
    onChoose, 
    onOpenInfo,
    onToggleSelect, 
    onDelete, 
    onCopy 
}: any) {
    return (
        <motion.div 
            whileHover={{ y: -3 }}
            className={cn(
                "group relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg flex flex-col",
                isSelected ? "border-emerald-600 ring-4 ring-emerald-500/20 shadow-md" : "border-slate-200 hover:border-emerald-500"
            )}
            onClick={onChoose}
        >
            {/* Multi-select checkmark */}
            <button 
                type="button"
                onClick={onToggleSelect}
                className={cn(
                    "absolute top-2.5 left-2.5 w-6 h-6 rounded-lg border-2 z-10 transition-all flex items-center justify-center cursor-pointer",
                    isMultiSelected 
                        ? "bg-slate-900 border-slate-900 text-white scale-105 shadow-md" 
                        : "bg-white/70 backdrop-blur-md border-white/80 opacity-0 group-hover:opacity-100 hover:bg-white text-slate-700"
                )}
                title="Select"
            >
                {isMultiSelected && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Thumbnail Box */}
            <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center">
                <img 
                    src={url} 
                    alt={img.title || "Poster Thumbnail"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                />
                
                {/* Actions Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChoose();
                        }}
                        className="w-full max-w-[130px] py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xl flex items-center justify-center gap-1.5 cursor-pointer transform hover:scale-105 transition-all uppercase tracking-wide"
                        title="Select this image as poster"
                    >
                        <Check className="w-4 h-4" /> Select Poster
                    </button>
                    <div className="flex items-center gap-1.5">
                        <button 
                            type="button"
                            onClick={onCopy} 
                            className="p-2 bg-white/90 hover:bg-white rounded-lg text-slate-800 hover:scale-110 transition-all shadow-md cursor-pointer" 
                            title="Copy URL"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(url, '_blank');
                            }} 
                            className="p-2 bg-white/90 hover:bg-white rounded-lg text-slate-800 hover:scale-110 transition-all shadow-md cursor-pointer" 
                            title="Preview Full Size"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenInfo();
                            }} 
                            className="p-2 bg-white/90 hover:bg-white rounded-lg text-indigo-700 hover:scale-110 transition-all shadow-md cursor-pointer" 
                            title="View Info"
                        >
                            <Info className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            type="button"
                            onClick={onDelete} 
                            className="p-2 bg-white/90 hover:bg-white rounded-lg text-rose-600 hover:scale-110 transition-all shadow-md cursor-pointer" 
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metadata & Quick Select Footer (Always Visible) */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex flex-col justify-between gap-1.5">
                <p className="text-[11px] font-black text-slate-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">
                    {img.title || img.filename || "Untitled"}
                </p>
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[65px]">
                        {img.category || "General"}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChoose();
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-all"
                    >
                        <Check className="w-3 h-3" /> Quick Select
                    </button>
                </div>
            </div>

            {/* Selected Indicator Badge */}
            {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Check className="w-3.5 h-3.5 text-white" />
                </div>
            )}
        </motion.div>
    );
}

function UploadArea({ onUpload, isUploading, progress, onClose }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) onUpload(files);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative w-full h-44 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center group cursor-pointer",
                    isDragOver ? "border-indigo-600 bg-indigo-50/50 scale-[1.01]" : "border-slate-300 bg-slate-50/70 hover:bg-slate-50 hover:border-indigo-400"
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => onUpload(e)} 
                />
                
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform text-indigo-600">
                    <Upload className="w-6 h-6" />
                </div>
                
                <div className="text-center px-4">
                    <p className="text-sm font-extrabold text-slate-900 tracking-tight">Drop poster images here, or browse files</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        JPG, PNG, WEBP, GIF, SVG up to 10MB • Auto-selects upon upload
                    </p>
                </div>

                {isUploading && (
                    <div className="absolute inset-x-8 bottom-6">
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-indigo-600" 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest text-center mt-2">
                            Uploading and registering asset... {Math.round(progress)}%
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MetaItem({ icon: Icon, label, value }: any) {
    return (
        <div className="space-y-0.5">
            <div className="flex items-center gap-1">
                <Icon className="w-3 h-3 text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">{value}</p>
        </div>
    );
}

function formatFileSize(bytes: number) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
