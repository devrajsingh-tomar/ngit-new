"use client";

import { useEffect, useState } from "react";
import { getPublicMockTestResults } from "@/app/actions/mockTestResults";
import { 
    Search, Filter, Calendar, MapPin, Target,
    Trophy, ChevronRight, CheckCircle2, Medal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function PublicResultsPage() {
    const [sections, setSections] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        course: "All Courses",
        batch: "All Batches",
        examCode: "All Exam Codes",
        month: "All Months",
        year: "All Years"
    });

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        const res = await getPublicMockTestResults();
        if (res.success) {
            setSections(res.sections);
        }
        setLoading(false);
    };

    const courses = ["All Courses", ...new Set(Object.values(sections).flat().map(r => r.course || "General"))];
    const batches = ["All Batches", ...new Set(Object.values(sections).flat().map(r => r.batch || "N/A"))];
    const examCodes = ["All Exam Codes", "M1-R5", "M2-R5", "M3-R5", "M4-R5"];
    const months = ["All Months", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header Section */}
            <div className="bg-slate-900 border-b border-slate-800 pt-32 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Official Hall of Fame
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-8">
                        Mock Test <span className="text-primary italic font-serif">Results</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-xl max-w-2xl mx-auto mb-12">
                        Real-time performance evaluation and rankings of our students across all upcoming and past mock test series.
                    </p>

                    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-[2.5rem] shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="relative col-span-1 md:col-span-2">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input 
                                    placeholder="Search student or test name..." 
                                    className="pl-14 h-16 bg-white/5 border-none text-white focus-visible:ring-primary/50 text-lg rounded-[1.5rem] placeholder:text-slate-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="h-16 bg-white/5 border-none text-white rounded-[1.5rem] px-6 font-bold outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                                value={filters.course}
                                onChange={(e) => setFilters({...filters, course: e.target.value})}
                            >
                                {courses.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                            </select>
                            <Button className="h-16 rounded-[1.5rem] font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                Filter Analytics
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Filters / Batch & Date */}
            <div className="max-w-7xl mx-auto px-6 py-8 relative z-20">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 border-r pr-4">Batch</span>
                        <select 
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            value={filters.batch}
                            onChange={(e) => setFilters({...filters, batch: e.target.value})}
                        >
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 border-r pr-4">Exam Code</span>
                        <select 
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            value={filters.examCode}
                            onChange={(e) => setFilters({...filters, examCode: e.target.value})}
                        >
                            {examCodes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 border-r pr-4">Month</span>
                        <select 
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            value={filters.month}
                            onChange={(e) => setFilters({...filters, month: e.target.value})}
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 border-r pr-4">Year</span>
                        <select 
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: e.target.value})}
                        >
                            <option value="All Years">All Years</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-6 space-y-16">
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Compiling Leaderboards...</p>
                    </div>
                ) : Object.keys(sections).length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-32 text-center border border-slate-100 shadow-xl">
                        <Target className="w-24 h-24 text-slate-100 mx-auto mb-8" />
                        <h2 className="text-3xl font-black text-slate-900 mb-4">No Public Rankings Yet</h2>
                        <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">
                            Our academic team is currently evaluating the latest test batches. Results will appear here once officially published.
                        </p>
                    </div>
                ) : (
                    Object.entries(sections).map(([heading, sectionResults]) => {
                        const filtered = sectionResults.filter(r => {
                            const matchesSearch = r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesCourse = filters.course === "All Courses" || r.course === filters.course;
                            const matchesBatch = filters.batch === "All Batches" || r.batch === filters.batch;
                            const matchesExamCode = filters.examCode === "All Exam Codes" || r.mockTestId?.examCode === filters.examCode;
                            const matchesMonth = filters.month === "All Months" || new Date(r.attemptDate).toLocaleString('default', { month: 'long' }) === filters.month;
                            const matchesYear = filters.year === "All Years" || new Date(r.attemptDate).getFullYear().toString() === filters.year;
                            return matchesSearch && matchesCourse && matchesBatch && matchesExamCode && matchesMonth && matchesYear;
                        });

                        if (filtered.length === 0) return null;

                        return (
                            <section key={heading} className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
                                <div className="text-center space-y-3">
                                    <Badge className="bg-primary/5 text-primary border-none shadow-none font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1">
                                        Published Assessment Result
                                    </Badge>
                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                        {heading}
                                    </h2>
                                </div>

                                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                                    <div className="overflow-x-auto">
                                        <Table className="w-full text-left">
                                            <TableHeader className="bg-slate-900">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="py-8 px-10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-tl-[3rem] w-32">Rank</TableHead>
                                                    <TableHead className="py-8 text-white font-black uppercase tracking-[0.2em] text-[10px]">Student Details</TableHead>
                                                    <TableHead className="py-8 text-white font-black uppercase tracking-[0.2em] text-[10px]">Course / Batch</TableHead>
                                                    <TableHead className="py-8 text-center text-white font-black uppercase tracking-[0.2em] text-[10px]">Score</TableHead>
                                                    <TableHead className="py-8 pr-10 text-right text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-tr-[3rem]">Percentile</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-slate-50">
                                                {filtered.map((r) => (
                                                    <TableRow key={r._id} className="hover:bg-slate-50/80 transition-all border-none group">
                                                        <TableCell className="py-8 px-10">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                                                                r.rank === 1 ? "bg-amber-100 text-amber-600 border-2 border-amber-200" :
                                                                r.rank === 2 ? "bg-slate-100 text-slate-500 border-2 border-slate-200" :
                                                                r.rank === 3 ? "bg-orange-50 text-orange-600 border-2 border-orange-100" :
                                                                "bg-slate-50 text-slate-400 border border-slate-100"
                                                            }`}>
                                                                {r.rank === 1 ? "01" : r.rank === 2 ? "02" : r.rank === 3 ? "03" : r.rank < 10 ? `0${r.rank}` : r.rank}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-8">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg overflow-hidden relative shadow-lg">
                                                                    {r.studentId?.image ? (
                                                                        <Image src={r.studentId.image} alt="Profile" fill className="object-cover" />
                                                                    ) : (
                                                                        <span>{r.studentId?.name?.[0]}</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{r.studentId?.name}</p>
                                                                    {r.rank <= 3 && <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1 border border-primary/20 rounded-full px-2 py-0.5 inline-block">Top Performer</p>}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-8">
                                                            <div className="flex flex-col gap-1 items-start">
                                                                <p className="font-bold text-slate-700">{r.course || "Standard Course"}</p>
                                                                {r.mockTestId?.examCode && (
                                                                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">
                                                                        {r.mockTestId.examCode}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5">{r.batch || "Regular Batch"}</p>
                                                        </TableCell>
                                                        <TableCell className="py-8 text-center">
                                                            <div className="inline-flex flex-col items-center p-3 px-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                                <span className="font-black text-2xl text-slate-900 leading-none">{r.score}</span>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-tighter">Out of {r.totalMarks}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-8 pr-10 text-right">
                                                            <div className="inline-flex flex-col items-end">
                                                                <span className="text-3xl font-black text-primary italic leading-none">{r.percentile ? r.percentile.toFixed(1) : "0.0"}</span>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Efficiency</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            </section>
                        );
                    })
                )}
            </div>
        </div>
    );
}
