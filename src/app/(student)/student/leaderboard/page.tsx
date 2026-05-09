"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/app/actions/mockTestResults";
import { getAvailableQuizzes } from "@/app/actions/student/quizzes";
import { 
    Trophy, 
    Medal, 
    Crown, 
    Search, 
    Filter, 
    User, 
    Target, 
    Clock, 
    ChevronRight,
    TrendingUp,
    Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

export default function LeaderboardPage() {
    const [results, setResults] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [selectedQuizId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [leaderboardRes, quizzesRes] = await Promise.all([
                getLeaderboard({ quizId: selectedQuizId === "all" ? undefined : selectedQuizId }),
                getAvailableQuizzes({})
            ]);

            if (leaderboardRes.success) {
                setResults(leaderboardRes.data);
            }
            if (quizzesRes.success) {
                setQuizzes(quizzesRes.data);
            }
        } catch (error) {
            toast.error("Failed to load leaderboard data");
        }
        setLoading(false);
    };

    const filteredResults = results.filter(res => 
        res.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const topThree = filteredResults.slice(0, 3);
    const rest = filteredResults.slice(3);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                        <Crown className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Rankings</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Hall of <span className="text-primary">Fame</span></h1>
                    <p className="text-slate-500 font-medium text-lg">Compare your performance with the best students nationwide.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            value={selectedQuizId}
                            onChange={(e) => setSelectedQuizId(e.target.value)}
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer min-w-[150px]"
                        >
                            <option value="all">All Assessments</option>
                            {quizzes.map(q => (
                                <option key={q._id} value={q._id}>{q.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Rankings...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <Trophy className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900">No Data Available</h3>
                    <p className="text-slate-500 font-medium mt-2">Rankings will appear once mock tests are published.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Podium for Top 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <div className="order-2 md:order-1 flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden rotate-3 relative">
                                        {topThree[1].studentId?.image ? (
                                            <Image src={topThree[1].studentId.image} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-200 rounded-xl border-4 border-white flex items-center justify-center text-slate-600 font-black">2</div>
                                </div>
                                <div className="text-center bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100 w-full">
                                    <h4 className="font-black text-slate-900 truncate">{topThree[1].studentId?.name}</h4>
                                    <div className="mt-2 flex justify-center gap-2">
                                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-black text-[10px]">{topThree[1].score} pts</Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <div className="order-1 md:order-2 flex flex-col items-center">
                                <div className="relative mb-8 -translate-y-4">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                        <Crown className="w-12 h-12 text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-amber-50 border-4 border-amber-200 shadow-2xl shadow-amber-200/50 flex items-center justify-center overflow-hidden -rotate-3 transition-transform hover:rotate-0 duration-500 relative">
                                        {topThree[0].studentId?.image ? (
                                            <Image src={topThree[0].studentId.image} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <User className="w-16 h-16 text-amber-200" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-amber-400 rounded-2xl border-4 border-white flex items-center justify-center text-white font-black shadow-lg">1</div>
                                </div>
                                <div className="text-center bg-slate-900 p-8 rounded-[3rem] shadow-2xl w-full text-white ring-8 ring-slate-50">
                                    <h4 className="text-xl font-black truncate mb-1">{topThree[0].studentId?.name}</h4>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Master Architect</p>
                                    <div className="flex justify-center gap-2">
                                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center">
                                            <span className="text-[10px] text-white/50 uppercase font-black">Score</span>
                                            <span className="text-lg font-black">{topThree[0].score}</span>
                                        </div>
                                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center">
                                            <span className="text-[10px] text-white/50 uppercase font-black">Acc.</span>
                                            <span className="text-lg font-black">{Math.round(topThree[0].analysis?.accuracy || 0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <div className="order-3 md:order-3 flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-[2rem] bg-orange-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden -rotate-6 relative">
                                        {topThree[2].studentId?.image ? (
                                            <Image src={topThree[2].studentId.image} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-orange-200" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-orange-100 rounded-xl border-4 border-white flex items-center justify-center text-orange-600 font-black">3</div>
                                </div>
                                <div className="text-center bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100 w-full">
                                    <h4 className="font-black text-slate-900 truncate">{topThree[2].studentId?.name}</h4>
                                    <div className="mt-2 flex justify-center gap-2">
                                        <Badge variant="secondary" className="bg-orange-50 text-orange-600 font-black text-[10px]">{topThree[2].score} pts</Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table View for Rest */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                Global Leaderboard
                            </h3>
                            <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px]">
                                {filteredResults.length} TOTAL STUDENTS
                            </Badge>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Accuracy</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredResults.map((res, index) => {
                                        const rank = index + 1;
                                        return (
                                            <tr key={res._id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-110",
                                                        rank === 1 ? "bg-amber-400 text-white shadow-lg shadow-amber-200" :
                                                        rank === 2 ? "bg-slate-200 text-slate-600" :
                                                        rank === 3 ? "bg-orange-100 text-orange-600" :
                                                        "text-slate-400"
                                                    )}>
                                                        {rank}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
                                                            {res.studentId?.image ? (
                                                                <Image src={res.studentId.image} alt="Profile" fill className="object-cover" />
                                                            ) : (
                                                                <User className="w-6 h-6 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 group-hover:text-primary transition-colors">{res.studentId?.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.studentId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">{res.mockTestId?.title}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.course || "General"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="inline-flex flex-col">
                                                        <span className="text-lg font-black text-slate-900">{res.score}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">/ {res.totalMarks}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="w-16 mx-auto">
                                                        <p className={cn(
                                                            "text-sm font-black",
                                                            res.analysis?.accuracy >= 90 ? "text-emerald-500" : 
                                                            res.analysis?.accuracy >= 75 ? "text-blue-500" : "text-amber-500"
                                                        )}>
                                                            {Math.round(res.analysis?.accuracy || 0)}%
                                                        </p>
                                                        <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                            <div 
                                                                className={cn(
                                                                    "h-full rounded-full transition-all duration-1000",
                                                                    res.analysis?.accuracy >= 90 ? "bg-emerald-500" : 
                                                                    res.analysis?.accuracy >= 75 ? "bg-blue-500" : "bg-amber-500"
                                                                )}
                                                                style={{ width: `${res.analysis?.accuracy || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 text-slate-500">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-sm font-bold">{Math.floor((res.analysis?.timeTaken || 0) / 60)}m { (res.analysis?.timeTaken || 0) % 60}s</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
