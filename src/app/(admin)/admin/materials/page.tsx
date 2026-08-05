"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Upload,
    Search,
    Download,
    Trash2,
    CheckCircle2,
    BookOpen,
    Loader2,
    ExternalLink,
    Edit2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getMaterials, deleteMaterial } from "@/app/actions/materials";

export default function AdminMaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            const res = await getMaterials();
            if (res.success) {
                setMaterials(res.materials);
            } else {
                toast.error("Failed to load materials");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this material?")) return;
        try {
            await deleteMaterial(id);
            toast.success("Material deleted");
            loadMaterials();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.course?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
    const paginatedMaterials = filteredMaterials.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Study Materials</h1>
                    <p className="text-slate-500 font-medium mt-1">Upload and manage PDFs, notes, and resources for your students.</p>
                </div>
                <Link href="/admin/materials/new">
                    <Button className="gap-2 h-12 rounded-xl px-6 shadow-lg shadow-primary/20 font-bold">
                        <Upload className="w-5 h-5" />
                        Upload New Material
                    </Button>
                </Link>
            </div>

            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search by title or course..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-sm focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="border-b bg-slate-50/30">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Material Info</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course Assignment</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Type</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 italic flex justify-center gap-2 items-center">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Loading library...
                                    </td>
                                </tr>
                            ) : paginatedMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <BookOpen className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No materials found</h3>
                                        <p className="text-slate-400 text-sm mt-1">Start by uploading your first study resource.</p>
                                    </td>
                                </tr>
                            ) : paginatedMaterials.map((m) => (
                                <tr key={m._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 line-clamp-1">{m.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{m.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                            <span className="text-xs font-bold text-slate-600 line-clamp-1">{m.course}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            {new Date(m.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={m.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all"
                                                title="Open Resource"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Link href={`/admin/materials/${m._id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl hover:bg-primary/10 text-slate-300 hover:text-primary"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(m._id)}
                                                className="rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-8 border-t flex items-center justify-between bg-slate-50/30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="rounded-xl font-bold"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="rounded-xl font-bold"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
