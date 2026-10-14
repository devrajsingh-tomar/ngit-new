"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getReferredStudents, getPartnerInstitutes } from "@/app/actions/referrals";
import {
    Users,
    Search,
    Filter,
    Download,
    Building2,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Activity,
    CreditCard,
    Keyboard,
    Mic,
    Loader2,
    RotateCcw,
    ExternalLink,
    Tag,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function ReferredStudentsContent() {
    const searchParams = useSearchParams();
    const defaultInstId = searchParams.get("instId") || "ALL";
    const defaultCode = searchParams.get("code") || "";

    const [students, setStudents] = useState<any[]>([]);
    const [institutes, setInstitutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedInstitute, setSelectedInstitute] = useState(defaultInstId);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getReferredStudents({
                instituteId: selectedInstitute !== "ALL" ? selectedInstitute : undefined,
                search: search.trim() || undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                page,
                limit: 15,
            });

            if (res.success) {
                setStudents(res.data.students);
                setInstitutes(res.data.institutes);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages);
            } else {
                toast.error(res.error || "Failed to load referred students");
            }
        } catch {
            toast.error("Failed to fetch referred students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search, selectedInstitute, dateFrom, dateTo, page]);

    const handleResetFilters = () => {
        setSearch("");
        setSelectedInstitute("ALL");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    };

    const handleExportCSV = () => {
        if (!students || students.length === 0) {
            toast.error("No student data available to export");
            return;
        }

        const headers = [
            "Student Name",
            "Student Email",
            "Student Mobile",
            "Partner Institute",
            "Institute Code",
            "Referral Code Used",
            "Attribution Source",
            "Attribution Date",
            "Typing Exams Taken",
            "Steno Exams Taken",
            "30-Day Active Status",
            "Customer Status",
        ];

        const rows = students.map((r) => {
            const student = r.studentId || {};
            const institute = r.partnerInstituteId || {};
            const is30DActive = r.isActiveStudent ? "Active (30D)" : "Inactive";
            const customerStatus = r.isPaidCustomer ? "Paid Customer" : "Free User";
            const dateStr = r.attributedAt ? format(new Date(r.attributedAt), "yyyy-MM-dd HH:mm:ss") : "";

            return [
                `"${(student.name || "").replace(/"/g, '""')}"`,
                `"${(student.email || "").replace(/"/g, '""')}"`,
                `"${(student.mobile || "").replace(/"/g, '""')}"`,
                `"${(institute.name || "").replace(/"/g, '""')}"`,
                `"${(institute.code || "").replace(/"/g, '""')}"`,
                `"${(r.codeUsed || "").replace(/"/g, '""')}"`,
                `"${(r.attributionSource || "").replace(/"/g, '""')}"`,
                `"${dateStr}"`,
                r.typingExamsCount || 0,
                r.stenoExamsCount || 0,
                `"${is30DActive}"`,
                `"${customerStatus}"`,
            ].join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `referred-students-${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Referred students exported to CSV");
    };

    // Calculate metrics for current page
    const activeCount = students.filter((s) => s.isActiveStudent).length;
    const paidCount = students.filter((s) => s.isPaidCustomer).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/referrals"
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <Users className="w-6 h-6 text-purple-600" />
                            Referred Students Directory
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Track real student registrations, attribution sources, and platform activity.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={loading || students.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 text-zinc-500" />
                        Export CSV
                    </button>
                    <Link
                        href="/admin/referrals/reports"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-sm shadow-purple-500/20"
                    >
                        <Activity className="w-4 h-4" />
                        Performance Reports
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Filtered</span>
                        <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">{total}</p>
                    <span className="text-xs text-zinc-500">attributions found</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">30D Active</span>
                        <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{activeCount}</p>
                    <span className="text-xs text-zinc-500">on this page</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Paid Conversions</span>
                        <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{paidCount}</p>
                    <span className="text-xs text-zinc-500">on this page</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Partner Institutes</span>
                        <Building2 className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">{institutes.length}</p>
                    <span className="text-xs text-zinc-500">active partners</span>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search student, email, phone..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Institute Filter */}
                    <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <select
                            value={selectedInstitute}
                            onChange={(e) => {
                                setSelectedInstitute(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none"
                        >
                            <option value="ALL">All Partner Institutes</option>
                            {institutes.map((inst) => (
                                <option key={inst._id} value={inst._id}>
                                    {inst.name} ({inst.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date From */}
                    <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Date To & Reset */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                setDateTo(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                        {(search || selectedInstitute !== "ALL" || dateFrom || dateTo) && (
                            <button
                                onClick={handleResetFilters}
                                title="Reset filters"
                                className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-sm text-zinc-500">Loading referred students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 mb-4">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No referred students found</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-6">
                            {search || selectedInstitute !== "ALL" || dateFrom || dateTo
                                ? "No attributions match your current filters. Try resetting the search or date parameters."
                                : "No students have registered using institute referral links or codes yet."}
                        </p>
                        {(search || selectedInstitute !== "ALL" || dateFrom || dateTo) && (
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Student</th>
                                    <th className="py-3.5 px-4">Institute & Code</th>
                                    <th className="py-3.5 px-4">Attribution Date</th>
                                    <th className="py-3.5 px-4">Activity (Exams)</th>
                                    <th className="py-3.5 px-4">Active Status</th>
                                    <th className="py-3.5 px-4">Conversion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                                {students.map((r) => {
                                    const student = r.studentId || {};
                                    const institute = r.partnerInstituteId || {};

                                    return (
                                        <tr
                                            key={r._id}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                                        >
                                            {/* Student Details */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {student.name || "Unknown Student"}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                    {student.email || "No email"}
                                                </div>
                                                {student.mobile && (
                                                    <div className="text-xs text-zinc-400 mt-0.5">
                                                        Ph: {student.mobile}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Institute & Code Used */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                                                    <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                                    <span className="truncate max-w-[160px]" title={institute.name}>
                                                        {institute.name || "Unknown Institute"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                                        {r.codeUsed}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400">
                                                        via {r.attributionSource === "MANUAL_INPUT" ? "Manual" : "Link"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Attribution Date */}
                                            <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                {r.attributedAt ? (
                                                    <>
                                                        <div className="font-medium text-zinc-700 dark:text-zinc-300">
                                                            {format(new Date(r.attributedAt), "dd MMM yyyy")}
                                                        </div>
                                                        <div className="text-zinc-400">
                                                            {format(new Date(r.attributedAt), "hh:mm a")}
                                                        </div>
                                                    </>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            {/* Exams Activity */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-xs" title="Typing Exams Taken">
                                                        <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
                                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                            {r.typingExamsCount || 0}
                                                        </span>
                                                        <span className="text-zinc-400 text-[11px]">Typing</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs" title="Steno Exams Taken">
                                                        <Mic className="w-3.5 h-3.5 text-zinc-400" />
                                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                            {r.stenoExamsCount || 0}
                                                        </span>
                                                        <span className="text-zinc-400 text-[11px]">Steno</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 30-Day Activity Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {r.isActiveStudent ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active (30D)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            {/* Conversion Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {r.isPaidCustomer ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                                        <CreditCard className="w-3 h-3 text-blue-600" />
                                                        Paid Subscriber
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                        Free Student
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                        <div className="text-zinc-500 text-xs">
                            Showing page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</span> of{" "}
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages}</span> ({total} total)
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                            </button>
                            <span className="px-3 py-1 font-medium text-xs text-zinc-700 dark:text-zinc-300">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReferredStudentsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            }
        >
            <ReferredStudentsContent />
        </Suspense>
    );
}
