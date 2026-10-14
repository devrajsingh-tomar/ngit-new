"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getInstitutePerformanceReport } from "@/app/actions/referrals";
import {
    BarChart3,
    TrendingUp,
    Users,
    CreditCard,
    Building2,
    Calendar,
    Download,
    Search,
    ArrowLeft,
    Keyboard,
    Mic,
    CheckCircle2,
    PauseCircle,
    XCircle,
    Loader2,
    ExternalLink,
    ArrowUpDown,
    Percent,
} from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { toast } from "sonner";

export default function InstituteReportsPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"registrations" | "active" | "conversion" | "name">("registrations");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Date range filter
    const [dateRangePreset, setDateRangePreset] = useState<"all" | "7d" | "30d" | "month" | "custom">("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const handlePresetChange = (preset: "all" | "7d" | "30d" | "month" | "custom") => {
        setDateRangePreset(preset);
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");

        if (preset === "all") {
            setDateFrom("");
            setDateTo("");
        } else if (preset === "7d") {
            setDateFrom(format(subDays(today, 7), "yyyy-MM-dd"));
            setDateTo(todayStr);
        } else if (preset === "30d") {
            setDateFrom(format(subDays(today, 30), "yyyy-MM-dd"));
            setDateTo(todayStr);
        } else if (preset === "month") {
            setDateFrom(format(startOfMonth(today), "yyyy-MM-dd"));
            setDateTo(todayStr);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            const res = await getInstitutePerformanceReport({
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });

            if (res.success) {
                setReportData(res.data);
            } else {
                toast.error(res.error || "Failed to generate report");
            }
        } catch {
            toast.error("Failed to load performance report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [dateFrom, dateTo]);

    // Summary calculations
    const totalInstitutes = reportData.length;
    const totalRegistrations = reportData.reduce((acc, curr) => acc + (curr.totalRegistrations || 0), 0);
    const totalActiveStudents = reportData.reduce((acc, curr) => acc + (curr.activeStudents || 0), 0);
    const totalTyping = reportData.reduce((acc, curr) => acc + (curr.typingAttempts || 0), 0);
    const totalSteno = reportData.reduce((acc, curr) => acc + (curr.stenoAttempts || 0), 0);
    const totalPaid = reportData.reduce((acc, curr) => acc + (curr.paidStudents || 0), 0);
    const overallConversion = totalRegistrations > 0
        ? Math.round((totalPaid / totalRegistrations) * 100 * 10) / 10
        : 0;

    // Filter & Sort
    const filteredData = reportData
        .filter((item) => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                item.instituteName.toLowerCase().includes(q) ||
                item.instituteCode.toLowerCase().includes(q) ||
                item.contactPerson?.toLowerCase().includes(q) ||
                item.contactEmail?.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            let valA: any = 0;
            let valB: any = 0;
            if (sortBy === "registrations") {
                valA = a.totalRegistrations;
                valB = b.totalRegistrations;
            } else if (sortBy === "active") {
                valA = a.activeStudents;
                valB = b.activeStudents;
            } else if (sortBy === "conversion") {
                valA = a.conversionRate;
                valB = b.conversionRate;
            } else if (sortBy === "name") {
                valA = a.instituteName.toLowerCase();
                valB = b.instituteName.toLowerCase();
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    const toggleSort = (column: "registrations" | "active" | "conversion" | "name") => {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    const handleExportCSV = () => {
        if (!reportData || reportData.length === 0) {
            toast.error("No report data available to export");
            return;
        }

        const headers = [
            "Institute Name",
            "Institute Code",
            "Status",
            "Contact Person",
            "Contact Email",
            "Active Referral Codes",
            "Registrations In Period",
            "30-Day Active Students",
            "Typing Attempts",
            "Steno Attempts",
            "Paid Conversions",
            "Conversion Rate (%)",
        ];

        const rows = filteredData.map((item) => [
            `"${(item.instituteName || "").replace(/"/g, '""')}"`,
            `"${(item.instituteCode || "").replace(/"/g, '""')}"`,
            `"${item.status}"`,
            `"${(item.contactPerson || "").replace(/"/g, '""')}"`,
            `"${(item.contactEmail || "").replace(/"/g, '""')}"`,
            item.activeCodes || 0,
            item.totalRegistrations || 0,
            item.activeStudents || 0,
            item.typingAttempts || 0,
            item.stenoAttempts || 0,
            item.paidStudents || 0,
            `"${item.conversionRate}%"`,
        ].join(","));

        const dateSuffix = dateFrom && dateTo ? `${dateFrom}_to_${dateTo}` : "all_time";
        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `institute-performance-${dateSuffix}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Institute performance report exported to CSV");
    };

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
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                            Institute Performance Reports
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Analyze partner institute acquisition, student platform engagement, and paid conversions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={loading || reportData.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 text-zinc-500" />
                        Export Report CSV
                    </button>
                    <Link
                        href="/admin/referrals/students"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-sm shadow-purple-500/20"
                    >
                        <Users className="w-4 h-4" />
                        Student Directory
                    </Link>
                </div>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Institutes</span>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{totalInstitutes}</p>
                    <span className="text-[11px] text-zinc-400">Total partners</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Registrations</span>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{totalRegistrations}</p>
                    <span className="text-[11px] text-zinc-400">In selected period</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">30D Active</span>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalActiveStudents}</p>
                    <span className="text-[11px] text-zinc-400">Active students</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Typing Tests</span>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{totalTyping}</p>
                    <span className="text-[11px] text-zinc-400">Attempts taken</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Steno Tests</span>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{totalSteno}</p>
                    <span className="text-[11px] text-zinc-400">Attempts taken</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Paid Conversions</span>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalPaid}</p>
                    <span className="text-[11px] font-semibold text-blue-500">{overallConversion}% rate</span>
                </div>
            </div>

            {/* Filter and Date Range Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Date Presets */}
                    <div className="flex items-center flex-wrap gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-medium">
                        <button
                            onClick={() => handlePresetChange("all")}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                dateRangePreset === "all"
                                    ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => handlePresetChange("7d")}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                dateRangePreset === "7d"
                                    ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => handlePresetChange("30d")}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                dateRangePreset === "30d"
                                    ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }`}
                        >
                            Last 30 Days
                        </button>
                        <button
                            onClick={() => handlePresetChange("month")}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                dateRangePreset === "month"
                                    ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => handlePresetChange("custom")}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                dateRangePreset === "custom"
                                    ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Custom Date Pickers */}
                    {dateRangePreset === "custom" && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="pl-8 pr-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                            <span className="text-zinc-400 text-xs">to</span>
                            <div className="relative">
                                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="pl-8 pr-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative min-w-[220px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Filter institutes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-sm text-zinc-500">Generating performance report...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 mb-4">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No institute records found</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
                            {search
                                ? "No partner institute matches your search query."
                                : "Start by registering partner institutes to view their performance metrics."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    <th
                                        className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                                        onClick={() => toggleSort("name")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Institute
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4">Codes</th>
                                    <th
                                        className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                                        onClick={() => toggleSort("registrations")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Registrations
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th
                                        className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                                        onClick={() => toggleSort("active")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            30D Active
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4">Exam Attempts</th>
                                    <th className="py-3.5 px-4">Paid Students</th>
                                    <th
                                        className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                                        onClick={() => toggleSort("conversion")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Conversion Rate
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                                {filteredData.map((item) => (
                                    <tr
                                        key={item.instituteId}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        {/* Institute */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {item.instituteName}
                                                </div>
                                                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    {item.instituteCode}
                                                </span>
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                {item.contactPerson} • {item.contactEmail}
                                            </div>
                                        </td>

                                        {/* Active Codes */}
                                        <td className="py-3.5 px-4 text-xs">
                                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                {item.activeCodes}
                                            </span>{" "}
                                            <span className="text-zinc-400">active</span>
                                        </td>

                                        {/* Total Registrations in period */}
                                        <td className="py-3.5 px-4">
                                            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                                {item.totalRegistrations}
                                            </span>
                                        </td>

                                        {/* 30D Active */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {item.activeStudents}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Exam Attempts */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1" title="Typing attempts">
                                                    <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                        {item.typingAttempts}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1" title="Steno attempts">
                                                    <Mic className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                        {item.stenoAttempts}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Paid Students */}
                                        <td className="py-3.5 px-4">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {item.paidStudents}
                                            </span>
                                        </td>

                                        {/* Conversion Rate */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, item.conversionRate)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    {item.conversionRate}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/referrals/students?instId=${item.instituteId}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                                                >
                                                    <Users className="w-3 h-3" />
                                                    Students
                                                </Link>
                                                <Link
                                                    href={`/admin/referrals/institutes/${item.instituteId}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Profile
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
