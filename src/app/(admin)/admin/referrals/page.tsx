"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getReferralDashboardOverview } from "@/app/actions/referrals";
import {
    Building2,
    Tag,
    Users,
    Activity,
    Trophy,
    ArrowUpRight,
    Plus,
    QrCode,
    FileSpreadsheet,
    Calendar,
    ChevronRight,
    Loader2,
    Share2,
    Clock,
    AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function ReferralsDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getReferralDashboardOverview();
            if (res.success) {
                setData(res.data);
            } else {
                setError(res.error || "Failed to load referrals overview");
            }
        } catch {
            setError("Server error while fetching referral metrics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Referrals Hub...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-lg mx-auto my-12">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-800">Error Loading Hub</h3>
                <p className="text-xs text-rose-600 mt-1 mb-4">{error}</p>
                <button
                    onClick={loadData}
                    className="bg-slate-900 text-white text-xs font-black px-6 py-2.5 rounded-xl hover:bg-black transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1.5">
                        <Share2 className="w-3.5 h-3.5" /> Growth & Marketing
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Institute Referrals & Promotions
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Manage partner institutes, track promotional campaign codes, and monitor referred student activity.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/admin/referrals/codes"
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-800 px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:shadow"
                    >
                        <Tag className="w-4 h-4 text-indigo-600" /> Manage Codes
                    </Link>
                    <Link
                        href="/admin/referrals/institutes/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" /> Add Partner Institute
                    </Link>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {data?.activeInstitutes || 0} Active
                        </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{data?.totalInstitutes || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Partner Institutes</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                            <Tag className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                            {data?.activeCodes || 0} Active
                        </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{data?.totalCodes || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Campaign Codes</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{data?.totalReferredStudents || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Referred Students</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                            Last 30 Days
                        </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{data?.active30DayCount || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Active Test Takers</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            {data?.paidAttributions || 0} Paid
                        </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{data?.conversionRate || 0}%</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Paid Conversion</p>
                </div>
            </div>

            {/* Quick Access Navigation Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/admin/referrals/institutes"
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Partner Institutes</h4>
                            <p className="text-[11px] font-semibold text-slate-400">View & manage all institutes</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    href="/admin/referrals/codes"
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-100 transition-all flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Referral Codes</h4>
                            <p className="text-[11px] font-semibold text-slate-400">Generate links & QR codes</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    href="/admin/referrals/students"
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Referred Students</h4>
                            <p className="text-[11px] font-semibold text-slate-400">Track registrations & tests</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    href="/admin/referrals/reports"
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Analytics & Reports</h4>
                            <p className="text-[11px] font-semibold text-slate-400">Export CSV & performance</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Leaderboard and Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performing Institutes */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Top Partner Institutes</h3>
                                <p className="text-xs font-semibold text-slate-400">By total referred registrations</p>
                            </div>
                            <Link
                                href="/admin/referrals/institutes"
                                className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                View All <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {data?.topInstitutes && data.topInstitutes.length > 0 ? (
                            <div className="space-y-3">
                                {data.topInstitutes.map((inst: any, idx: number) => (
                                    <div
                                        key={inst._id || idx}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-black">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h5 className="text-xs font-black text-slate-900">{inst.name}</h5>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {inst.code}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-slate-900">
                                                {inst.totalStudents} Students
                                            </span>
                                            <p className="text-[10px] font-bold text-emerald-600">
                                                {inst.paidStudents} Paid
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-xs font-bold">No partner institutes registered yet.</p>
                                <Link
                                    href="/admin/referrals/institutes/new"
                                    className="inline-block mt-3 text-xs font-black text-indigo-600 hover:underline"
                                >
                                    + Add your first partner institute
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Referred Registrations Stream */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Attributions</h3>
                                <p className="text-xs font-semibold text-slate-400">Latest students enrolled via referral</p>
                            </div>
                            <Link
                                href="/admin/referrals/students"
                                className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                View Roster <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {data?.recentReferrals && data.recentReferrals.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentReferrals.map((refItem: any) => (
                                    <div
                                        key={refItem._id}
                                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                                                {(refItem.studentId?.name || "S")[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate">
                                                    {refItem.studentId?.name || "Unknown Student"}
                                                </p>
                                                <p className="text-[10px] font-semibold text-slate-400 truncate">
                                                    Via <span className="font-bold text-slate-700">{refItem.partnerInstituteId?.name || "Institute"}</span> ({refItem.codeUsed})
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                                            {format(new Date(refItem.attributedAt), "dd MMM, HH:mm")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-xs font-bold">No referred registrations yet.</p>
                                <p className="text-[10px] mt-1 text-slate-400">
                                    Generate a code and share with partners to start tracking registrations.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
