"use client";

import { useEffect, useState } from "react";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, Download, Keyboard, Timer, Target, AlertCircle, Eye, MoreVertical, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function TypingResultsAdminPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/typing/results");
            const data = await res.json();
            if (Array.isArray(data)) {
                setResults(data);
            }
        } catch (error) {
            toast.error("Failed to load typing results");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (results.length === 0) return;
        const headers = ["Student Name", "Email", "Exam Title", "WPM", "Accuracy", "Errors", "Date"];
        const rows = results.map(r => [
            r.userId?.name || "N/A",
            r.userId?.email || "N/A",
            r.examId?.title || "N/A",
            r.wpm,
            `${r.accuracy}%`,
            r.errorCount || 0,
            new Date(r.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `typing_results_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredResults = results.filter(res => 
        res.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        res.examId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 p-4 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Typing <span className="text-indigo-600">Results</span></h1>
                    <p className="text-slate-500 mt-2 font-bold flex items-center gap-2">
                        <Keyboard className="w-4 h-4" />
                        Monitor student typing performance across all exams
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button onClick={handleExportCSV} className="rounded-2xl h-14 font-black gap-2 px-8 bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-transform">
                        <Download className="w-5 h-5" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Filters bar */}
            <div className="bg-white rounded-[2.5rem] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search by student name or exam title..." 
                        className="pl-14 h-14 rounded-2xl border-none bg-slate-50 font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-900">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 pl-10">Candidate</TableHead>
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Typing Exam</TableHead>
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Net Speed</TableHead>
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Accuracy</TableHead>
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Mistakes</TableHead>
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Status</TableHead>
                                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-right pr-10">Report</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={7} className="h-24 bg-slate-50/20" />
                                    </TableRow>
                                ))
                            ) : filteredResults.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                                                <AlertCircle className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No typing results found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredResults.map((res) => (
                                    <TableRow key={res._id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                        <TableCell className="py-8 pl-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-base shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                    {res.userId?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase tracking-tight">{res.userId?.name || "Deleted User"}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{res.userId?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8">
                                            <div className="flex flex-col">
                                                <p className="font-black text-slate-800">{res.examId?.title || "Deleted Exam"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">
                                                        {res.examId?.language}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-slate-400">{new Date(res.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="font-black text-xl text-indigo-600 leading-none">{res.wpm}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">WPM</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="font-black text-xl text-emerald-600 leading-none">{res.accuracy}%</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Accuracy</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="font-black text-xl text-rose-600 leading-none">{res.errorCount || 0}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Mistakes</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8">
                                            {(() => {
                                                const lang = res.examId?.language?.toLowerCase() || "";
                                                const isHindi = lang.includes("hindi") || lang.includes("mangal") || lang.includes("kruti");
                                                const passingWpm = isHindi ? 25 : 30;
                                                const isQualified = res.wpm >= passingWpm;
                                                return (
                                                    <Badge className={isQualified ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}>
                                                        {isQualified ? "QUALIFIED" : "DISQUALIFIED"}
                                                    </Badge>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell className="py-8 text-right pr-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-slate-100 transition-colors">
                                                        <MoreVertical className="h-6 w-6 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-[1.5rem] p-3 border-none shadow-2xl w-56">
                                                    <DropdownMenuItem asChild className="rounded-xl font-bold py-3 cursor-pointer gap-3 mb-1">
                                                        <Link href={`/typing/results/${res._id}`} target="_blank">
                                                            <Eye className="w-4 h-4 text-slate-400" /> View Detailed Report
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                                    <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                                                        <Trash2 className="w-4 h-4" /> Remove Result
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
