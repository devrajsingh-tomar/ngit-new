"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPartnerInstitutes, toggleInstituteStatus } from "@/app/actions/referrals";
import {
    Building2,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    Phone,
    Mail,
    MapPin,
    Tag,
    Users,
    Trophy,
    MoreVertical,
    CheckCircle2,
    PauseCircle,
    XCircle,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function PartnerInstitutesPage() {
    const [institutes, setInstitutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const loadInstitutes = async () => {
        setLoading(true);
        try {
            const res = await getPartnerInstitutes({ search, status, page, limit: 15 });
            if (res.success) {
                setInstitutes(res.data.institutes);
                setTotalPages(res.data.totalPages);
                setTotal(res.data.total);
            } else {
                toast.error(res.error || "Failed to load partner institutes");
            }
        } catch {
            toast.error("Failed to fetch institutes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInstitutes();
    }, [search, status, page]);

    const handleStatusToggle = async (id: string, newStatus: "ACTIVE" | "PAUSED" | "INACTIVE") => {
        try {
            const res = await toggleInstituteStatus({ id, status: newStatus });
            if (res.success) {
                toast.success(`Institute status updated to ${newStatus}`);
                loadInstitutes();
            } else {
                toast.error(res.error || "Failed to update status");
            }
        } catch {
            toast.error("Error updating institute status");
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link
                            href="/admin/referrals"
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Referrals
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Institutes</h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Directory of affiliated coaching institutes, typing schools, and promotional partners.
                    </p>
                </div>

                <Link
                    href="/admin/referrals/institutes/new"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" /> Add Partner Institute
                </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by institute name, code, contact person, or city..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 ml-1">
                        Status:
                    </span>
                    {["ALL", "ACTIVE", "PAUSED", "INACTIVE"].map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setStatus(s);
                                setPage(1);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                                status === s
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Institutes Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading directory...</p>
                    </div>
                ) : institutes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">Institute</th>
                                    <th className="py-4 px-6">Contact Details</th>
                                    <th className="py-4 px-6">Location</th>
                                    <th className="py-4 px-6">Codes</th>
                                    <th className="py-4 px-6">Students</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {institutes.map((inst) => (
                                    <tr key={inst._id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="py-4 px-6">
                                            <Link
                                                href={`/admin/referrals/institutes/${inst._id}`}
                                                className="block font-black text-slate-900 group-hover:text-indigo-600 transition-colors"
                                            >
                                                {inst.name}
                                            </Link>
                                            <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                {inst.code}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-slate-800">{inst.contactPerson}</p>
                                            <p className="text-[11px] text-slate-400 font-semibold">{inst.contactEmail}</p>
                                            <p className="text-[10px] text-slate-400">{inst.contactPhone}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{inst.city ? `${inst.city}, ${inst.state || "IN"}` : "Not specified"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-black text-slate-900">{inst.totalCodes}</span>
                                            <span className="text-[10px] font-bold text-emerald-600 ml-1">
                                                ({inst.activeCodes} Active)
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-black text-slate-900">{inst.totalStudents}</span>
                                            <span className="text-[10px] font-bold text-slate-400 ml-1">
                                                ({inst.paidStudents} Paid)
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                    inst.status === "ACTIVE"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : inst.status === "PAUSED"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                        : "bg-rose-50 text-rose-700 border border-rose-100"
                                                }`}
                                            >
                                                {inst.status === "ACTIVE" ? (
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                ) : inst.status === "PAUSED" ? (
                                                    <PauseCircle className="w-3 h-3 text-amber-600" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-rose-600" />
                                                )}
                                                {inst.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select
                                                    value={inst.status}
                                                    onChange={(e) => handleStatusToggle(inst._id, e.target.value as any)}
                                                    className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-700"
                                                >
                                                    <option value="ACTIVE">Set Active</option>
                                                    <option value="PAUSED">Set Paused</option>
                                                    <option value="INACTIVE">Set Inactive</option>
                                                </select>
                                                <Link
                                                    href={`/admin/referrals/institutes/${inst._id}`}
                                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors"
                                                    title="View Details"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center text-slate-400">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-black text-slate-700">No partner institutes found</p>
                        <p className="text-xs mt-1">Try adjusting your search criteria or register a new institute.</p>
                        <Link
                            href="/admin/referrals/institutes/new"
                            className="inline-block mt-4 bg-indigo-600 text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                        >
                            + Add New Partner Institute
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                        <span>Showing page {page} of {totalPages} ({total} total institutes)</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
