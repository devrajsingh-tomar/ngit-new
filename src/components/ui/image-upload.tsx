"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    label?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    label = "Upload Image",
    className
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                onChange(data.url);
                toast.success("Image uploaded successfully");
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className={className}>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
            />

            {value ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                    <Image
                        src={value}
                        alt="Uploaded logo"
                        fill
                        className="object-contain p-4 bg-slate-50"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 rounded-lg font-bold"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg"
                            onClick={() => {
                                onChange("");
                                if (onRemove) onRemove();
                            }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                            </div>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
