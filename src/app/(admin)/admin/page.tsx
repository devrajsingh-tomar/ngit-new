import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/app/actions/dashboard";
import {
    Users,
    BookOpen,
    Wallet,
    AlertCircle,
    TrendingUp,
    ShieldAlert,
    Award,
    ChevronRight,
    BrainCircuit,
    Trophy,
    ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
        redirect("/admin/login");
    }

    const res = await getDashboardStats();

    // Fallback if DB fetch fails
    const s = res.success ? (res.stats as any) : {
        totalStudents: 0,
        activeCourses: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        recentAttempts: [],
        recentStudents: []
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                        Command <span className="text-gradient">Center</span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System fully operational • Real-time metrics
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/mock-tests/list">
                        <Button variant="outline" className="h-12 border-2 rounded-xl font-bold px-6">
                            View All Tasks
                        </Button>
                    </Link>
                    <Link href="/admin/mock-tests/new">
                        <Button className="btn-primary h-12 px-8">
                            New Assessment
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard
                    label="Active Students"
                    value={s.totalStudents}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    trend="+12%"
                    color="blue"
                />
                <MetricCard
                    label="Total Revenue"
                    value={`₹${s.totalRevenue.toLocaleString()}`}
                    icon={<Wallet className="w-6 h-6 text-emerald-600" />}
                    trend="+18%"
                    color="emerald"
                />
                <MetricCard
                    label="Pending Actions"
                    value={s.pendingApprovals}
                    icon={<AlertCircle className="w-6 h-6 text-rose-600" />}
                    trend="Needs Review"
                    color="rose"
                    alert={true}
                />
            </div>

            {/* Premium Assessment Hub Widget */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white rounded-[2.8rem] p-1 shadow-2xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2.6rem] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-50 -skew-x-12 translate-x-1/2 opacity-30" />
                        
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-indigo-100/50 text-indigo-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-indigo-200/50">
                                    <BrainCircuit className="w-4 h-4" /> Intelligence Hub
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                                    Mock Test <span className="text-gradient">Performance.</span>
                                </h2>
                                <p className="text-slate-500 font-bold max-w-md leading-relaxed">System-wide diagnostic metrics and student growth analytics portal.</p>
                            </div>
                            <Link href="/admin/results">
                                <Button className="btn-primary h-20 px-12 rounded-[1.8rem] gap-4 shadow-2xl shadow-primary/30 group/btn">
                                    Global Analytics <TrendingUp className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-16 relative z-10 border-t border-slate-100 pt-12">
                            <StatItem label="Exams Conducted" value={s.mockMetrics?.totalTests || 0} icon={<Award className="w-6 h-6 text-amber-500" />} />
                            <StatItem label="Global Attempts" value={s.mockMetrics?.totalAttempts || 0} icon={<Users className="w-6 h-6 text-blue-500" />} />
                            <StatItem label="Zenith Score" value={s.mockMetrics?.highestScore || 0} icon={<Trophy className="w-6 h-6 text-indigo-500" />} unit="pts" />
                            <StatItem label="Performance Mean" value={s.mockMetrics?.avgScore || 0} icon={<TrendingUp className="w-6 h-6 text-emerald-500" />} unit="%" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Global Live Feed */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Submissions</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Global Activity Stream</p>
                        </div>
                        <Link href="/admin/results"><Button variant="ghost" className="font-bold gap-2">View History <ChevronRight className="w-4 h-4" /></Button></Link>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-5 pr-4 scrollbar-hide">
                        {s.recentAttempts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <ClipboardList className="w-16 h-16 mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-widest text-xs">Awaiting Activity</p>
                            </div>
                        ) : (
                            s.recentAttempts.map((attempt: any) => (
                                <div key={attempt._id} className="flex items-center justify-between p-6 rounded-3xl border border-transparent bg-slate-50/50 hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300 group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg border-2 border-slate-50 group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all">
                                            {attempt.studentId?.name?.charAt(0) || "S"}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg leading-tight">{attempt.studentId?.name || "Anonymous"}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                                                    {attempt.quizId?.title}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <time className="text-[10px] font-bold text-slate-400">Just now</time>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className={`px-4 py-1.5 rounded-xl text-sm font-black shadow-sm ${attempt.isPassed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                            {attempt.totalScore} / {attempt.totalMarks}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right panel - New Signups */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white flex flex-col h-[600px] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
                    
                    <div className="mb-10 relative z-10">
                        <h2 className="text-2xl font-black tracking-tight">New Members</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Recently Registered Students</p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10 scrollbar-hide">
                        {s.recentStudents.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-700">
                                <p className="font-black uppercase tracking-widest text-[10px]">Ghost Town</p>
                            </div>
                        ) : (
                            s.recentStudents.map((u: any) => (
                                <div key={u._id} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center gap-5 hover:bg-white/10 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center font-black text-indigo-400 border border-indigo-500/30">
                                        {u.name?.charAt(0) || "S"}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-black text-slate-100 truncate text-base">{u.name}</p>
                                        <p className="text-xs font-bold text-slate-500 truncate mt-1">{u.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link href="/admin/students" className="mt-8 relative z-10">
                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black h-16 rounded-2xl shadow-xl shadow-black/50">
                            User Directory
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, trend, alert, color }: any) {
    const variants: Record<string, string> = {
        blue: "bg-blue-50/50 border-blue-100 text-blue-600 shadow-blue-500/5",
        indigo: "bg-indigo-50/50 border-indigo-100 text-indigo-600 shadow-indigo-500/5",
        emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600 shadow-emerald-500/5",
        rose: "bg-rose-50/50 border-rose-100 text-rose-600 shadow-rose-500/5"
    };

    return (
        <div className={cn(
            "p-8 rounded-[2.5rem] border bg-white relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 group",
            alert && "bg-rose-50/50 border-rose-100"
        )}>
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 duration-300",
                variants[color] || "bg-slate-50"
            )}>
                {icon}
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
            <div className="mt-6 flex items-center gap-2">
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    alert ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                )}>
                    {trend}
                </span>
                {!alert && <TrendingUp className="w-4 h-4 text-emerald-500" />}
            </div>
        </div>
    );
}

function StatItem({ label, value, icon, unit }: any) {
    return (
        <div className="space-y-3 group/stat">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/stat:bg-white group-hover/stat:shadow-sm transition-all">
                    {icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter flex items-baseline gap-1">
                {value}
                {unit && <span className="text-sm font-bold text-slate-400 tracking-normal">{unit}</span>}
            </p>
        </div>
    );
}
