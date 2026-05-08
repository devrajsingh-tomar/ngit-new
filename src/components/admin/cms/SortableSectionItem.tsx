"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
    GripVertical, Eye, EyeOff, Copy, Trash2, 
    ArrowUpDown, Settings2, Edit3 
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SortableSectionItemProps {
    section: any;
    isSelected: boolean;
    onSelect: () => void;
    onToggleVisibility: (e: React.MouseEvent) => void;
    onDuplicate: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export function SortableSectionItem({ 
    section, 
    isSelected, 
    onSelect, 
    onToggleVisibility, 
    onDuplicate, 
    onDelete 
}: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
            className={cn(
                "bg-white border rounded-2xl p-4 cursor-pointer transition-all group relative",
                isSelected 
                    ? "border-violet-400 shadow-xl shadow-violet-100 ring-2 ring-violet-500/5 rotate-1" 
                    : "border-slate-200 hover:border-slate-300 shadow-sm",
                !section.is_active && "opacity-50 grayscale-[0.5]"
            )}
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className="text-slate-300 hover:text-slate-500 transition-colors cursor-grab active:cursor-grabbing p-1"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Content Icon */}
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    isSelected ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-400"
                )}>
                    <Settings2 className="w-6 h-6" />
                </div>

                {/* Section Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                        {section.section_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {section.section_type}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                            {section.is_active ? "LIVE ON SITE" : "HIDDEN"}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 ml-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onToggleVisibility}
                        className={cn(
                            "p-2 rounded-xl transition-all",
                            section.is_active ? "text-violet-600 hover:bg-violet-50" : "text-slate-400 hover:bg-slate-100"
                        )}
                        title={section.is_active ? "Hide Section" : "Show Section"}
                    >
                        {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    
                    <Link 
                        href={section.section_type === "HeroSection" ? "/admin/content/home-builder/slider" : `/admin/content/pages`}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit Content"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                        onClick={onDelete}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Section"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-300">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
            )}
        </div>
    );
}
