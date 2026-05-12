"use client";

import { useEffect, useState } from "react";
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash2, 
    FileUp, 
    Download,
    HelpCircle,
    ChevronDown,
    BrainCircuit,
    Sparkles,
    CheckCircle2,
    XCircle,
    Copy,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { getQuestions, deleteQuestion, bulkDeleteQuestions } from "@/app/actions/questions";

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [filterDifficulty, setFilterDifficulty] = useState("ALL");
    const [filterExamCode, setFilterExamCode] = useState("ALL");

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setLoading(true);
        const res = await getQuestions();
        if (res.success) {
            setQuestions(res.questions);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        const res = await deleteQuestion(id);
        if (res.success) {
            toast.success("Question deleted successfully");
            setSelectedIds(prev => prev.filter(sid => sid !== id));
            loadQuestions();
        } else {
            toast.error(res.error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected questions?`)) return;
        
        setBulkLoading(true);
        const res = await bulkDeleteQuestions(selectedIds);
        if (res.success) {
            toast.success(`${selectedIds.length} questions deleted`);
            setSelectedIds([]);
            loadQuestions();
        } else {
            toast.error(res.error);
        }
        setBulkLoading(false);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allFilteredIds = filteredQuestions.map(q => q._id);
            setSelectedIds(allFilteredIds);
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.content?.en?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             q.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             q.topic?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || q.type === filterType;
        const matchesDifficulty = filterDifficulty === "ALL" || q.difficulty === filterDifficulty;
        const matchesExamCode = filterExamCode === "ALL" || q.examCode === filterExamCode;
        return matchesSearch && matchesType && matchesDifficulty && matchesExamCode;
    });

    return (
        <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                        Question Bank
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">Manage your institution's intellectual assets and test resources.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Link href="/admin/mock-tests/questions/import" className="flex-1">
                        <Button variant="outline" className="w-full rounded-2xl h-12 md:h-14 font-black gap-2 px-6 border-2 border-slate-100 bg-white hover:bg-slate-50">
                            <FileUp className="w-5 h-5 text-slate-400" />
                            Import
                        </Button>
                    </Link>
                    <Link href="/admin/mock-tests/questions/new" className="flex-1">
                        <Button className="w-full rounded-2xl h-12 md:h-14 font-black gap-2 px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                            <Plus className="w-5 h-5" />
                            Add New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                    { label: "Total Questions", value: questions.length, icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Mock Tests", value: [...new Set(questions.map(q => q.mockTestId))].filter(Boolean).length, icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Exam Codes", value: [...new Set(questions.map(q => q.examCode))].filter(Boolean).length, icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-slate-100 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-3 md:gap-5">
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col gap-4 md:gap-5">
                <div className="relative w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search questions..." 
                        className="pl-14 h-12 md:h-14 rounded-[1.25rem] md:rounded-2xl border-none bg-slate-50 font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select 
                        className="w-full h-12 md:h-14 rounded-[1.25rem] md:rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 outline-none"
                        value={filterExamCode}
                        onChange={(e) => setFilterExamCode(e.target.value)}
                    >
                        <option value="ALL">All Exam Codes</option>
                        <option value="M1-R5">M1-R5</option>
                        <option value="M2-R5">M2-R5</option>
                        <option value="M3-R5">M3-R5</option>
                        <option value="M4-R5">M4-R5</option>
                    </select>
                    <select 
                        className="w-full h-12 md:h-14 rounded-[1.25rem] md:rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 outline-none"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="MCQ_SINGLE">Single MCQ</option>
                        <option value="MCQ_MULTIPLE">Multiple MCQ</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="NUMERIC">Numeric</option>
                        <option value="ASSERTION_REASON">Assertion-Reason</option>
                        <option value="MATCH_THE_FOLLOWING">Match Matrix</option>
                    </select>
                    <select 
                        className="w-full h-12 md:h-14 rounded-[1.25rem] md:rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 outline-none"
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                    >
                        <option value="ALL">All Levels</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-slate-900 rounded-[2rem] p-4 pr-6 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 duration-300 ring-4 ring-primary/20 sticky top-4 z-50 mx-2">
                    <div className="flex items-center gap-6 ml-4">
                        <div className="flex -space-x-2">
                             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs ring-2 ring-slate-900">
                                 {selectedIds.length}
                             </div>
                        </div>
                        <p className="text-white font-black uppercase tracking-widest text-[10px] sm:text-xs">Questions Selected</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            className="text-white/60 hover:text-white font-black text-[10px] uppercase h-10"
                            onClick={() => setSelectedIds([])}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black gap-2 h-12 px-6 shadow-xl text-xs"
                            onClick={handleBulkDelete}
                            disabled={bulkLoading}
                        >
                            {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            <span className="hidden sm:inline">Delete Selected</span>
                            <span className="sm:hidden">Delete</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-14 py-8 pl-6 md:pl-10">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-primary rounded cursor-pointer" 
                                    checked={filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Topic & Content</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center hidden md:table-cell">Type & Difficulty</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Marks</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-right pr-6 md:pr-10">Control</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={6} className="h-24 bg-slate-50/20" />
                                </TableRow>
                            ))
                        ) : filteredQuestions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-32 text-center text-slate-400">
                                    <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-xs">No questions found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredQuestions.map((q) => (
                                <TableRow key={q._id} className={cn("group transition-all border-slate-50", selectedIds.includes(q._id) ? "bg-primary/5" : "hover:bg-slate-50/50")}>
                                    <TableCell className="py-6 md:py-8 pl-6 md:pl-10 align-top">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-primary rounded cursor-pointer" 
                                            checked={selectedIds.includes(q._id)}
                                            onChange={() => toggleSelection(q._id)}
                                        />
                                    </TableCell>
                                    <TableCell className="py-6 md:py-8 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                                 <Badge className="bg-slate-900 text-white border-none font-black text-[8px] uppercase px-2 py-0.5">
                                                     {q.subject}
                                                 </Badge>
                                                 <Badge className={`border-none font-black text-[8px] uppercase px-2 py-0.5 md:hidden ${
                                                     q.difficulty === "EASY" ? "bg-emerald-50 text-emerald-600" :
                                                     q.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                                 }`}>
                                                     {q.difficulty}
                                                 </Badge>
                                            </div>
                                            <div className="prose prose-sm font-bold text-slate-900 line-clamp-2 md:line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.content?.en }} />
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2 opacity-60">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200">ID: {q._id.slice(-4)}</Badge>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[120px]">{q.topic}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 md:py-8 text-center hidden md:table-cell align-top">
                                        <div className="flex flex-col items-center gap-2">
                                            <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase">
                                                {q.type.replace(/_/g, " ")}
                                            </Badge>
                                            <Badge className={`border-none font-black text-[9px] uppercase ${
                                                q.difficulty === "EASY" ? "bg-emerald-50 text-emerald-600" :
                                                q.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                            }`}>
                                                {q.difficulty}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 md:py-8 text-center align-top">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-base md:text-lg">+{q.marks}</span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-rose-500">-{q.negativeMarks}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 md:py-8 text-right pr-6 md:pr-10 align-top">
                                        <div className="flex items-center justify-end gap-1 md:gap-2">
                                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-lg md:rounded-xl hover:bg-slate-100" asChild>
                                                <Link href={`/admin/mock-tests/questions/edit/${q._id}`}><Edit className="w-4 h-4 text-slate-600" /></Link>
                                            </Button>
                                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-lg md:rounded-xl hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(q._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
