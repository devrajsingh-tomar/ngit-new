"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    FileText,
    Download,
    Search,
    Filter,
    BookOpen,
    Clock,
    CheckCircle2,
    Eye,
    Loader2
} from "lucide-react";
import MaterialViewer from "@/components/shared/MaterialViewer";
import { getStudentMaterials } from "@/app/actions/materials";

export default function StudentMaterialsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<{ title: string, url: string } | null>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await getStudentMaterials();
            if (res.success) {
                setMaterials(res.materials || []);
            } else {
                toast.error("Failed to fetch study materials");
            }
            setLoading(false);
        };
        load();
    }, []);

    const filteredMaterials = materials.filter(m =>
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.course?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openViewer = (material: any) => {
        setSelectedMaterial({ title: material.title, url: material.url });
        setViewerOpen(true);
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Study Library</h1>
                    <p className="text-slate-500 font-medium mt-1">Access all your course handouts, notes and PDF resources.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find resources..."
                            className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 h-12 text-sm focus:border-primary outline-none min-w-[300px] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 rounded-2xl border-2 border-slate-100 font-bold gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Loading your library...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredMaterials.map((m) => (
                        <div key={m._id} className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all group">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-md">
                                                {m.course}
                                            </span>
                                            {m.type !== "PDF" && (
                                                <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{m.type}</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{m.title}</h3>
                                    </div>

                                    <div className="flex items-center gap-6 text-slate-400 text-xs font-bold">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 opacity-50" /> {new Date(m.createdAt).toLocaleDateString()}
                                        </div>
                                        {m.size && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 opacity-50" /> {m.size}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex flex-col xl:flex-row gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => m.type === "PDF" ? openViewer(m) : window.open(m.url, "_blank")}
                                            className="h-12 flex-1 rounded-xl px-4 border-2 border-slate-50 hover:bg-white hover:border-primary hover:text-primary transition-colors flex gap-2 font-bold"
                                        >
                                            <Eye className="w-4 h-4" /> {m.type === "PDF" ? "View Online" : "Open Link"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MaterialViewer
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                title={selectedMaterial?.title || ""}
                url={selectedMaterial?.url || ""}
            />

            {/* Empty State Mock */}
            {searchQuery && filteredMaterials.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Search className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-medium">No resources match your search "{searchQuery}".</p>
                </div>
            )}
            {!loading && !searchQuery && materials.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-medium">No study materials have been uploaded to the library yet.</p>
                </div>
            )}
        </div>
    );
}
