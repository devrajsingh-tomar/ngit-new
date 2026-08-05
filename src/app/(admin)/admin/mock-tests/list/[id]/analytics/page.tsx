import { use } from "react";
import { getQuizAnalytics } from "@/app/actions/analytics";
import {
    Users,
    TrendingUp,
    Award,
    ShieldAlert,
    Clock,
    FileText,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function QuizAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getQuizAnalytics(id);

    if (!res.success || !res.quiz || !res.attempts || !res.stats) {
        return <div className="p-8 text-center text-red-500 font-bold">{res.error || "Failed to load"}</div>;
    }

    const { quiz, attempts, stats } = res;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exam Intelligence Center</h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium mt-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-primary font-bold">{quiz.title}</span>
                        <span className="px-2 text-slate-300">•</span>
                        Course: {quiz.courseId?.title || 'Standalone'}
                    </div>
                </div>
                <Link href="/admin/mock-tests/list">
                    <Button variant="outline" className="font-bold">Back to Quizzes</Button>
                </Link>
            </div>

            {/* Core Metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Participants"
                    value={stats.totalAttempts.toString()}
                    icon={<Users className="w-6 h-6 text-indigo-500" />}
                    trend="+12% this week"
                />
                <MetricCard
                    title="Average Score"
                    value={`${stats.averageScore.toFixed(1)} / ${quiz.settings?.totalMarks || 0}`}
                    icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
                    trend="Target is 75%"
                />
                <MetricCard
                    title="Passing Rate"
                    value={`${stats.passRate.toFixed(1)}%`}
                    icon={<Award className="w-6 h-6 text-amber-500" />}
                    trend="Passing requires 40%"
                />
                <MetricCard
                    title="Security Flags"
                    value={stats.totalTabSwitches.toString()}
                    icon={<ShieldAlert className="w-6 h-6 text-red-500" />}
                    trend="Tab switches & suspicious events"
                    alert={stats.totalTabSwitches > 10}
                />
            </div>

            {/* Advanced Stats Array */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Spread */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-primary" /> Performance Curve
                    </h3>
                    <div className="h-48 flex items-end gap-2 justify-between">
                        {/* Placeholder for bar chart. We render buckets here manually. */}
                        {[0, 20, 40, 60, 80, 100].map(bucket => {
                            const count = attempts.filter((a: any) => {
                                const percentage = (a.totalScore / (quiz.settings?.totalMarks || 1)) * 100;
                                return percentage >= bucket && percentage < bucket + 20;
                            }).length;

                            const height = stats.totalAttempts > 0 ? (count / stats.totalAttempts) * 100 : 0;

                            return (
                                <div key={bucket} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-slate-100 rounded-t-lg relative group">
                                        <div
                                            className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-1000"
                                            style={{ height: `${height}%`, minHeight: count > 0 ? '10%' : '0%' }}
                                        />
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded transition-opacity">
                                            {count} students
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{bucket}% - {bucket + 20}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Extremes */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center space-y-8 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

                    <div>
                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Highest Score</p>
                        <p className="text-5xl font-black text-emerald-400">{stats.highestScore}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Lowest Score</p>
                        <p className="text-5xl font-black text-red-400">{stats.lowestScore}</p>
                    </div>
                </div>
            </div>

            {/* Attempts Data Table */}
            <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
                <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Student Submissions Ranked
                    </h3>
                    <Button variant="outline" size="sm">Export CSV</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium min-w-[900px]">
                        <thead>
                            <tr className="border-b text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Student</th>
                                <th className="px-8 py-5 text-center">Score</th>
                                <th className="px-8 py-5 text-center">Outcome</th>
                                <th className="px-8 py-5 text-right">Security Flags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700">
                            {attempts.map((attempt: any, index: number) => (
                                <tr key={attempt._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5 font-black text-slate-300">#{index + 1}</td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-slate-900">{attempt.studentId?.name || "Unknown User"}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{attempt.studentId?.email}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center font-bold text-lg text-primary">
                                        {attempt.totalScore}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {attempt.isPassed ? (
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                Passed
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                Failed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {attempt.securityLogs?.tabSwitchCount > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">
                                                <AlertTriangle className="w-3 h-3" /> {attempt.securityLogs.tabSwitchCount} tab shifts
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Clean</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, trend, alert = false }: any) {
    return (
        <div className={`p-6 rounded-[2rem] border relative overflow-hidden ${alert ? 'bg-red-50 border-red-100' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${alert ? 'bg-red-100' : 'bg-slate-50'}`}>
                    {icon}
                </div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${alert ? 'text-red-700' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-4xl font-black tracking-tight ${alert ? 'text-red-900' : 'text-slate-900'}`}>{value}</p>
            <p className={`text-xs font-bold mt-4 ${alert ? 'text-red-600' : 'text-slate-400'}`}>{trend}</p>
        </div>
    );
}
