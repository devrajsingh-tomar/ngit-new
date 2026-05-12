"use client";

import { useEffect, useState } from "react";
import { 
    Plus, 
    Search, 
    FileText, 
    MoreVertical, 
    Trash2, 
    Clock, 
    Target,
    Layers,
    ChevronRight,
    ArrowUpRight,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { getPaperSets, deletePaperSet } from "@/app/actions/paperSets";

export default function PaperSetsPage() {
    const [paperSets, setPaperSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterExamCode, setFilterExamCode] = useState("ALL");

    useEffect(() => {
        loadPaperSets();
    }, []);

    const loadPaperSets = async () => {
        setLoading(true);
        const res = await getPaperSets();
        if (res.success) {
            setPaperSets(res.paperSets);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the paper set definition.")) return;
        const res = await deletePaperSet(id);
        if (res.success) {
            toast.success("Paper Set deleted");
            loadPaperSets();
        } else {
            toast.error(res.error);
        }
    };

    const filtered = paperSets.filter(ps => 
        (ps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterExamCode === "ALL" || ps.examCode === filterExamCode)
    );

    return (
        <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <Layers className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                        Paper Blueprints
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">Create and manage your blueprint collections.</p>
                </div>
                
                <Link href="/admin/mock-tests/papers/new">
                    <Button className="w-full sm:w-auto rounded-2xl h-12 md:h-14 font-black gap-2 px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                        <Plus className="w-5 h-5" />
                        New Blueprint
                    </Button>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search paper sets by name or subject..." 
                        className="pl-14 h-14 rounded-2xl border-none bg-slate-50 font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <select 
                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[160px]"
                        value={filterExamCode}
                        onChange={(e) => setFilterExamCode(e.target.value)}
                    >
                        <option value="ALL">All Exam Codes</option>
                        <option value="M1-R5">M1-R5</option>
                        <option value="M2-R5">M2-R5</option>
                        <option value="M3-R5">M3-R5</option>
                        <option value="M4-R5">M4-R5</option>
                    </select>
                </div>
            </div>

            {/* Grid for Paper Sets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-[2.5rem] bg-slate-100 animate-pulse" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-32 text-center text-slate-300">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="font-black uppercase tracking-widest text-xs">No paper sets created yet</p>
                    </div>
                ) : (
                    filtered.map((ps) => (
                        <div key={ps._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            
                            <div className="flex-1 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <Badge className="bg-slate-900 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                            {ps.subject}
                                        </Badge>
                                        {ps.examCode && (
                                            <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                                {ps.examCode}
                                            </Badge>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(ps._id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                        {ps.name}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mt-2">
                                        Courses: {ps.courseIds?.length > 0 ? ps.courseIds.map((c: any) => c.title).join(", ") : "Public"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Items</p>
                                        <p className="text-xl font-black text-slate-900">{ps.questions?.length}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Marks</p>
                                        <p className="text-xl font-black text-slate-900">{ps.totalMarks}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Mins</p>
                                        <p className="text-xl font-black text-slate-900">{ps.duration}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Ready</span>
                                </div>
                                <Button variant="ghost" className="rounded-xl h-10 gap-2 font-black text-xs" asChild>
                                    <Link href={`/admin/mock-tests/papers/preview/${ps._id}`}>
                                        Manage Questions <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
