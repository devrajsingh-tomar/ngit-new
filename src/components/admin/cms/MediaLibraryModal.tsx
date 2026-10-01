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
        const res = await getGalleryImages();
        if (res.success) {
            setImages(res.images);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) loadImages();
    }, [isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
        const files = (e instanceof Array) ? e : Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(10);
        
        let successCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", file.name.split('.')[0]);
            formData.append("category", selectedCategory !== "All" ? selectedCategory : "Others");

            const res = await uploadImageAction(formData);
            if (res.success) {
                successCount++;
                setUploadProgress(10 + ((i + 1) / files.length) * 90);
            }
        }

        if (successCount > 0) {
            toast.success(`${successCount} asset(s) successfully integrated`);
            loadImages();
            setShowUploadZone(false);
        } else {
            toast.error("Asset ingestion failed");
        }
        setUploading(false);
        setUploadProgress(0);
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!confirm("Permanently delete this asset from core?")) return;
        
        const res = await deleteImageAction(id);
        if (res.success) {
            setImages(prev => prev.filter(img => img._id !== id));
            if (selectedAsset?._id === id) setSelectedAsset(null);
            setSelection(prev => prev.filter(sid => sid !== id));
            toast.success("Asset purged");
        } else {
            toast.error("Purge failed");
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
        const matchesSearch = img.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             img.filename?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryCounts = images.reduce((acc: any, img: any) => {
        acc[img.category] = (acc[img.category] || 0) + 1;
        return acc;
    }, {});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-6 lg:p-10">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-none md:rounded-[2rem] shadow-2xl w-full max-w-[1400px] h-full md:h-[85vh] overflow-hidden flex flex-col relative"
            >
                {/* --- COMPACT STICKY HEADER --- */}
                <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none">Institutional Media Core</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Unified Digital Assets Manager</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowUploadZone(!showUploadZone)}
                            className="items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 hidden sm:flex"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {showUploadZone ? "Cancel" : "Upload Asset"}
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-all hidden sm:block">
                            <FolderPlus className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block" />
                        <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* --- SEARCH & FILTER BAR --- */}
                <div className="px-6 py-4 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center gap-4 bg-slate-50/30">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search assets by keyword, filename, or metadata..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden lg:block" />
                        {categories.map(cat => {
                            const count = cat.name === "All" ? images.length : (categoryCounts[cat.name] || 0);
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                                        selectedCategory === cat.name 
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-100" 
                                            : "bg-white border border-slate-100 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    {cat.name}
                                    {count > 0 && (
                                        <span className={cn(
                                            "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md text-[8px] font-bold",
                                            selectedCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* --- MAIN GRID --- */}
                    <div className={cn(
                        "flex-1 overflow-y-auto p-6 transition-all duration-300",
                        selectedAsset ? "md:mr-[350px] lg:mr-[400px]" : ""
                    )}>
                        {showUploadZone && (
                            <UploadArea onUpload={handleFileUpload} isUploading={uploading} progress={uploadProgress} onClose={() => setShowUploadZone(false)} />
                        )}

                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <RefreshCcw className="w-8 h-8 text-slate-900 animate-spin mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Neural Archive...</p>
                            </div>
                        ) : filteredImages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-slate-200" />
                                </div>
                                <p className="text-lg font-black text-slate-900 tracking-tight">No matching assets identified</p>
                                <p className="text-xs text-slate-400 mt-2 font-medium max-w-[240px] mx-auto">Try refining your search query or adjusting active category filters.</p>
                                <Button onClick={() => setShowUploadZone(true)} variant="outline" className="mt-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200">
                                    Upload First Asset
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
                                {filteredImages.map((img) => (
                                    <AssetCard 
                                        key={img._id} 
                                        img={img} 
                                        isSelected={selectedAsset?._id === img._id}
                                        isMultiSelected={selection.includes(img._id)}
                                        onSelect={() => setSelectedAsset(img)}
                                        onSelectDirect={(url: string) => onSelect(url)}
                                        onToggleSelect={(e: React.MouseEvent) => toggleSelection(img._id, e)}
                                        onDelete={(e: React.MouseEvent) => handleDelete(img._id, e)}
                                        onCopy={(e: React.MouseEvent) => handleCopyUrl(img.url, e)}
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
                                className="absolute right-0 top-0 bottom-0 w-full md:w-[350px] lg:w-[400px] bg-white border-l border-slate-100 shadow-2xl z-30 flex flex-col"
                            >
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-slate-900" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Asset Intelligence</span>
                                    </div>
                                    <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    {/* Large Preview */}
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                        <img src={selectedAsset.url} alt={selectedAsset.title} className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => window.open(selectedAsset.url, '_blank')}
                                                className="p-3 bg-white rounded-xl text-slate-900 hover:scale-110 transition-all shadow-xl"
                                            >
                                                <Maximize2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Metadata List */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Identification</label>
                                            <h3 className="text-sm font-black text-slate-900 break-words leading-tight">{selectedAsset.title || selectedAsset.filename}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <MetaItem icon={Calendar} label="Registered" value={new Date(selectedAsset.createdAt).toLocaleDateString()} />
                                            <MetaItem icon={HardDrive} label="Capacity" value={formatFileSize(selectedAsset.size)} />
                                            <MetaItem icon={FileText} label="Format" value={selectedAsset.mimeType.split('/')[1]?.toUpperCase()} />
                                            <MetaItem icon={Filter} label="Category" value={selectedAsset.category} />
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Active Deployment</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                This asset is currently indexed for use across the institute's digital infrastructure.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                                    <button 
                                        type="button"
                                        onClick={() => onSelect(selectedAsset.url)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Quick Select This Poster
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleCopyUrl(selectedAsset.url)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> Copy Resource URL
                                    </button>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- BOTTOM ACTION BAR --- */}
                <footer className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white sticky bottom-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                selection.length > 0 ? "bg-indigo-500 animate-pulse" : "bg-slate-300"
                            )} />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {selection.length > 0 ? `${selection.length} Assets Selected` : `Neural Archive: ${images.length} Assets Total`}
                            </p>
                        </div>
                        {selection.length > 0 && (
                            <button 
                                onClick={() => setSelection([])}
                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400">
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            onClick={() => selectedAsset ? onSelect(selectedAsset.url) : (selection.length > 0 && onSelect(images.find(i => i._id === selection[0])?.url))}
                            disabled={!selectedAsset && selection.length === 0}
                            className="rounded-xl px-8 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Quick Select Poster
                        </Button>
                    </div>
                </footer>

                {/* Mobile Floating Action Button */}
                <button 
                    onClick={() => setShowUploadZone(true)}
                    className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 animate-in zoom-in-50 duration-300"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </motion.div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function AssetCard({ img, isSelected, isMultiSelected, onSelect, onSelectDirect, onToggleSelect, onDelete, onCopy }: any) {
    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className={cn(
                "group relative bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl",
                isSelected ? "border-emerald-600 ring-4 ring-emerald-600/10 shadow-2xl" : "border-slate-100",
                isMultiSelected ? "bg-slate-50" : ""
            )}
            onClick={onSelect}
            onDoubleClick={() => onSelectDirect && onSelectDirect(img.url)}
        >
            {/* Multi-select checkmark */}
            <button 
                onClick={onToggleSelect}
                className={cn(
                    "absolute top-3 left-3 w-6 h-6 rounded-lg border-2 z-10 transition-all flex items-center justify-center",
                    isMultiSelected 
                        ? "bg-slate-900 border-slate-900 text-white scale-110 shadow-lg" 
                        : "bg-white/40 backdrop-blur-md border-white/60 opacity-0 group-hover:opacity-100 hover:border-white hover:bg-white"
                )}
            >
                {isMultiSelected && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Thumbnail */}
            <div className="aspect-square relative overflow-hidden bg-slate-50">
                <img 
                    src={img.url} 
                    alt={img.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    loading="lazy"
                />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {onSelectDirect && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectDirect(img.url);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xl flex items-center gap-1.5 cursor-pointer transform hover:scale-105 transition-all"
                            title="Quick Select"
                        >
                            <Check className="w-3.5 h-3.5" /> Quick Select
                        </button>
                    )}
                    <div className="flex items-center gap-1.5">
                        <button onClick={onCopy} className="p-2 bg-white rounded-lg text-slate-900 hover:scale-110 transition-all shadow-lg" title="Copy URL">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => window.open(img.url, '_blank')} className="p-2 bg-white rounded-lg text-slate-900 hover:scale-110 transition-all shadow-lg" title="Preview">
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={onDelete} className="p-2 bg-white rounded-lg text-red-500 hover:scale-110 transition-all shadow-lg" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metadata Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex flex-col justify-between gap-1.5">
                <p className="text-[10px] font-black text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                    {img.title || img.filename}
                </p>
                <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{img.category}</span>
                    {onSelectDirect && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectDirect(img.url);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-all"
                        >
                            <Check className="w-3 h-3" /> Quick Select
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center shadow-lg border border-white/20">
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative w-full h-48 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center group cursor-pointer",
                    isDragOver ? "border-slate-900 bg-slate-50 scale-[1.01]" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => onUpload(e)} />
                
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-900" />
                </div>
                
                <div className="text-center">
                    <p className="text-sm font-black text-slate-900 tracking-tight">Drop institutional assets here</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-upload support enabled • Max 5MB/file</p>
                </div>

                {isUploading && (
                    <div className="absolute inset-x-8 bottom-8">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-slate-900" 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">Integrating Assets... {Math.round(progress)}%</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MetaItem({ icon: Icon, label, value }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-slate-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xs font-black text-slate-900">{value}</p>
        </div>
    );
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
