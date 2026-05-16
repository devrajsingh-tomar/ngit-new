"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle, FileText, Clock, Edit, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { getAdminQuizzes, toggleQuizStatus, deleteAdminQuiz } from "@/app/actions/admin-quizzes";

export default function AdminQuizzesPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTitle, setSearchTitle] = useState("");
    const [filterExamCode, setFilterExamCode] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchQuizzes = async () => {
            const res = await getAdminQuizzes();
            if (res.success) {
                setQuizzes(res.quizzes || []);
            } else {
                toast.error(res.error || "Failed to load quizzes");
            }
            setLoading(false);
        };
        fetchQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(quiz =>
        (filterExamCode === "ALL" || quiz.examCode === filterExamCode) &&
        (quiz.title.toLowerCase().includes(searchTitle.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
    const paginatedQuizzes = filteredQuizzes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Quiz & Mock Test Engine</h1>
                    <p className="text-muted-foreground mt-1 font-medium text-sm md:text-base">Create and analyze performance across all published asessments.</p>
                </div>
                <Link href="/admin/mock-tests/new">
                    <Button className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-2xl gap-2 font-black shadow-xl shadow-primary/20">
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6" /> Create New Test
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Quizzes</p>
                    <p className="text-4xl font-black text-slate-900 mt-2">{filteredQuizzes.length}</p>
                </div>
            </div>

            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Find mock tests by name..."
                            value={searchTitle}
                            onChange={(e) => {
                                setSearchTitle(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-12 bg-white border rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="h-12 bg-white border rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none font-medium text-slate-700"
                            value={filterExamCode}
                            onChange={(e) => {
                                setFilterExamCode(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL">All Exam Codes</option>
                            <option value="M1-R5">M1-R5</option>
                            <option value="M2-R5">M2-R5</option>
                            <option value="M3-R5">M3-R5</option>
                            <option value="M4-R5">M4-R5</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-medium animate-pulse">
                        Loading test banks...
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50/50">
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment Detail</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Time & Marks</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Pricing</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-6 md:pr-10">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-600">
                                {paginatedQuizzes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic font-medium">No quizzes published yet. Start creating!</td>
                                    </tr>
                                )}
                                {paginatedQuizzes.map((quiz) => (
                                    <tr key={quiz._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <td className="px-6 md:px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-xl hidden md:flex items-center justify-center text-indigo-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm md:text-base leading-tight">{quiz.title}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1.5 opacity-80">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                            {quiz.courseId?.title || "Standalone"}
                                                        </p>
                                                        <div className="flex gap-1">
                                                            {quiz.isMockTest ? (
                                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[8px] px-1.5 h-3.5">MOCK</Badge>
                                                            ) : (
                                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[8px] px-1.5 h-3.5">REGULAR</Badge>
                                                            )}
                                                            {quiz.isPublic ? (
                                                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none text-[8px] px-1.5 h-3.5">PUBLIC</Badge>
                                                            ) : (
                                                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none text-[8px] px-1.5 h-3.5">PRIVATE</Badge>
                                                            )}
                                                            {quiz.isPublished ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[8px] px-1.5 h-3.5">LIVE</Badge> : <Badge className="bg-slate-100 text-slate-400 hover:bg-slate-100 border-none text-[8px] px-1.5 h-3.5">DRAFT</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm hidden lg:table-cell">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                <Clock className="w-4 h-4 text-slate-400" /> {quiz.timeLimit} mins
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                                                Total marks: {quiz.totalMarks}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 hidden sm:table-cell">
                                            <div className="flex flex-col gap-1 items-start">
                                                {quiz.pricing?.type === "PAID" ? (
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                        PAID (₹{quiz.pricing.amount})
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                        FREE
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-right pr-6 md:pr-10">
                                            <div className="flex justify-end gap-1 md:gap-2">
                                                <Button
                                                    onClick={async () => {
                                                        const res = await toggleQuizStatus(quiz._id, !quiz.isPublished);
                                                        if (res.success) {
                                                            toast.success("Status updated");
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`h-8 px-2 md:h-9 md:px-3 rounded-lg md:rounded-xl text-[9px] font-black uppercase ${quiz.isPublished ? "text-rose-500 border-rose-100" : "text-emerald-500 border-emerald-100"}`}
                                                >
                                                    {quiz.isPublished ? "Drop" : "Live"}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 md:h-9 md:w-9 p-0 rounded-lg md:rounded-xl text-slate-400 hover:text-primary" asChild>
                                                    <Link href={`/admin/mock-tests/edit/${quiz._id}`}><Edit className="w-4 h-4 text-slate-600" /></Link>
                                                </Button>
                                                <Button 
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to delete this test?")) {
                                                            const res = await deleteAdminQuiz(quiz._id);
                                                            if (res.success) {
                                                                toast.success("Deleted successfully");
                                                                window.location.reload();
                                                            }
                                                        }
                                                    }}
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 md:h-9 md:w-9 p-0 rounded-lg md:rounded-xl text-slate-400 hover:text-rose-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-6 border-t flex items-center justify-between bg-slate-50/30">
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
                    </>
                )}
            </div>
        </div>
    );
}
