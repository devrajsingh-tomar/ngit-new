"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    Copy,
    Check,
    Loader2,
    Trophy,
    Target,
    Activity,
    Calendar,
    Shield,
    FileText,
    ExternalLink,
    RefreshCw,
    Sparkles,
    Building2,
    CheckCircle2,
    ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    getStenoInstituteStudentsAction,
    seedStenoInstituteAccountAction,
} from "@/app/actions/steno";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function AdminStenoStudentsPage() {
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [copied, setCopied] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [instituteCode, setInstituteCode] = useState("NGIT-STENO");
    const [totalStudents, setTotalStudents] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getStenoInstituteStudentsAction("NGIT-STENO");
            if (res.success) {
                setStudents(res.students || []);
                setTotalStudents(res.totalStudents || 0);
                if (res.instituteCode) setInstituteCode(res.instituteCode);
            } else {
                toast.error(res.error || "Failed to load institute students");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSeedAccount = async () => {
        setSeeding(true);
        try {
            const res = await seedStenoInstituteAccountAction();
            if (res.success) {
                toast.success("Steno Institute Account verified and ready (stenoinstitute@ngitedu.com)");
                loadData();
            } else {
                toast.error(res.error || "Failed to initialize institute account");
            }
        } catch (err: any) {
            toast.error(err.message || "Error seeding account");
        } finally {
            setSeeding(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(instituteCode);
        setCopied(true);
        toast.success(`Institute Code copied: ${instituteCode}`);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredStudents = students.filter(
        (s) =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.mobile?.includes(searchTerm)
    );

    // Compute aggregated totals
    const totalAttempts = students.reduce((acc, s) => acc + (s.totalAttempts || 0), 0);
    const bestWpmOverall = Math.max(0, ...students.map((s) => s.bestWpm || 0));
    const avgAccuracyOverall =
        students.length > 0
            ? Math.round(
                  (students.reduce((acc, s) => acc + (s.avgAccuracy || 0), 0) /
                      students.length) *
                      10
              ) / 10
            : 0;

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold tracking-wide text-indigo-200">
                            <Building2 className="w-4 h-4 text-indigo-300" />
                            Steno Institute Management
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                            Institute Students Portal
                        </h1>
                        <p className="text-indigo-200 text-sm max-w-xl font-medium leading-relaxed">
                            Students who register using your unique Institute Code are automatically linked here. Track their practice attempts, WPM speed, accuracy, and test history in real-time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block">
                                Your Institute Code
                            </span>
                            <span className="font-mono text-2xl font-black text-white tracking-widest block">
                                {instituteCode}
                            </span>
                        </div>
                        <Button
                            onClick={copyCode}
                            variant="secondary"
                            className="h-12 px-6 rounded-xl font-black bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg shadow-black/20"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 text-emerald-600" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Code
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Linked Students
                        </p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStudents}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total Practice Attempts
                        </p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{totalAttempts}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Trophy className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Top Speed (WPM)
                        </p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{bestWpmOverall}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Target className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Avg Accuracy
                        </p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{avgAccuracyOverall}%</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search student name, email, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 rounded-2xl bg-slate-50 border-transparent focus:border-indigo-500 font-medium text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            disabled={loading}
                            variant="outline"
                            className="h-12 px-5 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 text-xs"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleSeedAccount}
                            disabled={seeding}
                            variant="secondary"
                            className="h-12 px-5 rounded-2xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs"
                        >
                            {seeding ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Shield className="w-4 h-4 mr-2" />
                            )}
                            Verify Admin Credentials
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="py-24 text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Loading Linked Institute Students...
                        </p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                            <Users className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">No Institute Students Found</h3>
                            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                                Students who enter Institute Code <span className="font-mono font-bold text-indigo-600">{instituteCode}</span> during registration or in their Settings will appear here automatically.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="p-4 pl-6">Student</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4 text-center">Attempts</th>
                                    <th className="p-4 text-center">Best Speed</th>
                                    <th className="p-4 text-center">Avg Accuracy</th>
                                    <th className="p-4 text-center">Subscription</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student._id}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-black text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                                                    {student.name?.[0]?.toUpperCase() || "S"}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium">
                                                        Code: <span className="font-mono font-bold text-indigo-600">{student.instituteCode}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-900 font-medium">{student.email}</div>
                                            <div className="text-[11px] text-slate-400">{student.mobile || "N/A"}</div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-slate-900">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                                                {student.totalAttempts}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-black text-emerald-600 text-sm">
                                                {student.bestWpm} WPM
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-slate-800">
                                                {student.avgAccuracy}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[11px]">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                Free Unlimited Access
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <Button
                                                onClick={() => setSelectedStudent(student)}
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-xs"
                                            >
                                                View Practice History
                                                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Student Practice History Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-8 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            {selectedStudent?.name}&apos;s Practice History
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-xs">
                            Email: {selectedStudent?.email} &bull; Code: {selectedStudent?.instituteCode}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
                                <span className="text-xl font-black text-slate-900">{selectedStudent?.totalAttempts || 0}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Best WPM</span>
                                <span className="text-xl font-black text-emerald-600">{selectedStudent?.bestWpm || 0} WPM</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Accuracy</span>
                                <span className="text-xl font-black text-indigo-600">{selectedStudent?.avgAccuracy || 0}%</span>
                            </div>
                        </div>

                        {!selectedStudent?.results || selectedStudent.results.length === 0 ? (
                            <div className="py-12 text-center space-y-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed">
                                <Activity className="w-8 h-8 mx-auto" />
                                <p className="text-xs font-bold">No test attempts recorded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                                            <th className="p-3 pl-4">Date</th>
                                            <th className="p-3 text-center">Speed (WPM)</th>
                                            <th className="p-3 text-center">Net WPM</th>
                                            <th className="p-3 text-center">Accuracy</th>
                                            <th className="p-3 text-center">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                        {selectedStudent.results.map((r: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/60">
                                                <td className="p-3 pl-4 text-slate-500">
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }) : "N/A"}
                                                </td>
                                                <td className="p-3 text-center font-bold text-slate-900">{r.speedWpm || 0} WPM</td>
                                                <td className="p-3 text-center font-black text-indigo-600">{r.netWpm || 0} WPM</td>
                                                <td className="p-3 text-center font-bold text-emerald-600">{r.accuracy || 0}%</td>
                                                <td className="p-3 text-center font-bold text-slate-700">{r.score || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
