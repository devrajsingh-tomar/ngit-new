"use client";

import { useEffect, useState } from "react";
import { getPublicExams } from "@/app/actions/results";
import { 
    Search, Award, Clock, Target, ArrowRight, 
    BookOpen, Sparkles, Filter, ChevronRight, ChevronLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";

import { useSession } from "next-auth/react";

export default function PublicExamsPage() {
    const { data: session } = useSession();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchExams = async () => {
            const res = await getPublicExams();
            if (res.success) {
                setExams(res.exams);
            }
            setLoading(false);
        };
        fetchExams();
    }, []);

    const filteredExams = exams.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
    const paginatedExams = filteredExams.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
                
                <div className="container-custom relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur"
                    >
                        <Award className="w-4 h-4 text-amber-400" />
                        Exam Center
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-8"
                    >
                        Mock Tests & <span className="text-primary italic font-serif">Assessments</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium"
                    >
                        Practice with real exam scenarios and track your performance against thousands of other aspirants.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/20 shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                                <Input 
                                    placeholder="Search tests, subjects or courses..."
                                    className="h-16 pl-16 pr-6 bg-white/5 border-none text-white text-lg rounded-[2rem] focus-visible:ring-primary/50 placeholder:text-slate-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button className="h-16 px-10 rounded-[2rem] font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                Find Exams
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom -mt-10 relative z-20">
                {loading ? (
                    <div className="bg-white rounded-[3rem] p-32 text-center shadow-xl border border-slate-100">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Catalog...</p>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-32 text-center shadow-xl border border-slate-100">
                        <Target className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-slate-900 mb-4">No Tests Found</h2>
                        <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
                            We couldn't find any exams matching your search. Try different keywords or check back later for new tests.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedExams.map((exam, idx) => {
                                const startUrl = session?.user 
                                    ? `/student/quizzes/${exam._id}` 
                                    : `/student/login?callbackUrl=${encodeURIComponent(`/student/quizzes/${exam._id}`)}`;

                                return (
                                    <motion.div
                                        key={exam._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="space-y-3">
                                                <div className="flex gap-2 items-center">
                                                    <Badge className="bg-primary/5 text-primary border-none text-[10px] font-black tracking-widest uppercase px-3 py-1">
                                                        {exam.courseId?.title || "General Mock Test"}
                                                    </Badge>
                                                    <Badge className={`${exam.pricing?.type === "PAID" ? "bg-amber-500" : "bg-emerald-500"} text-white border-none text-[10px] font-black tracking-widest uppercase px-3 py-1`}>
                                                        {exam.pricing?.type === "PAID" ? `₹${exam.pricing.amount}` : "FREE"}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                                    {exam.title}
                                                </h3>
                                            </div>
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 flex items-center justify-center shrink-0 shadow-inner">
                                                <Sparkles className="w-8 h-8" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                        <Clock className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Duration</p>
                                                        <p className="font-bold text-slate-700">{exam.settings?.timeLimit || 0} Minutes</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                        <Target className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Marks</p>
                                                        <p className="font-bold text-slate-700">{exam.settings?.totalMarks || 0} Points</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-slate-500 font-medium px-2">
                                                <BookOpen className="w-4 h-4" />
                                                <span className="text-sm">English, Hindi Medium Avaliable</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 flex items-center gap-3">
                                            <Link href={startUrl} className="flex-1">
                                                <Button className="w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                                                    {session?.user ? "Start Now" : "Start Exam"}
                                                </Button>
                                            </Link>
                                            <Link href="/courses">
                                                <Button variant="outline" className="h-14 w-14 rounded-2xl p-0 border-2 hover:bg-slate-50">
                                                    <ChevronRight className="w-6 h-6 text-slate-400" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setPage(page - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }} 
                                        disabled={page === 1}
                                        className="h-12 px-6 rounded-xl font-black gap-2 border-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Previous
                                    </Button>
                                    
                                    <div className="hidden sm:flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <Button
                                                key={p}
                                                variant={page === p ? "default" : "outline"}
                                                onClick={() => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                                                className={`w-12 h-12 rounded-xl font-black border-2 ${page === p ? "shadow-lg shadow-primary/20" : ""}`}
                                            >
                                                {p}
                                            </Button>
                                        )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setPage(page + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }} 
                                        disabled={page === totalPages}
                                        className="h-12 px-6 rounded-xl font-black gap-2 border-2"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* CTA Section */}
            <div className="container-custom mt-24">
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden text-center shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <Sparkles className="w-16 h-16 text-white/50 mx-auto" />
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            Elevate Your Learning with Pro Features
                        </h2>
                        <p className="text-white/80 text-lg font-medium">
                            Get personalized feedback, detailed analysis, and rank predictions by enrolling in our full courses.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/register">
                                <Button className="h-16 px-10 rounded-2xl bg-white text-primary font-black text-lg hover:bg-slate-50 shadow-xl">
                                    Join for Free
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant={null} className="h-16 px-10 rounded-2xl border-2 border-white/30 bg-transparent text-white font-black text-lg hover:bg-white/10 transition-colors">
                                    Contact Admissions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
