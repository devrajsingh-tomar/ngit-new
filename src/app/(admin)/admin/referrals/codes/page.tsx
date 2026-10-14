"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getReferralCodes, createReferralCode, toggleReferralCodeStatus } from "@/app/actions/referrals";
import ShareCodeModal from "@/components/admin/referrals/ShareCodeModal";
import {
    Tag,
    Plus,
    Search,
    Filter,
    QrCode,
    Copy,
    Building2,
    Calendar,
    Users,
    Percent,
    AlertCircle,
    CheckCircle2,
    PauseCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    Sparkles,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function ReferralCodesContent() {
    const searchParams = useSearchParams();
    const defaultInstId = searchParams.get("instId") || "ALL";
    const openNewModalOnMount = searchParams.get("new") === "true";

    const [codes, setCodes] = useState<any[]>([]);
    const [institutes, setInstitutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [selectedInstitute, setSelectedInstitute] = useState(defaultInstId);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Share modal state
    const [shareCode, setShareCode] = useState<any>(null);

    // Create Code modal state
    const [isCreateOpen, setIsCreateOpen] = useState(openNewModalOnMount);
    const [creating, setCreating] = useState(false);
    const [newForm, setNewForm] = useState({
        partnerInstituteId: defaultInstId !== "ALL" ? defaultInstId : "",
        code: "",
        startsAt: "",
        expiresAt: "",
        usageLimit: 0,
        discountPercent: undefined as number | undefined,
        discountAmount: undefined as number | undefined,
        description: "",
    });

    const loadCodes = async () => {
        setLoading(true);
        try {
            const res = await getReferralCodes({
                instituteId: selectedInstitute !== "ALL" ? selectedInstitute : undefined,
                status: status !== "ALL" ? status : undefined,
                search,
                page,
                limit: 15,
            });
            if (res.success) {
                setCodes(res.data.codes);
                setInstitutes(res.data.institutes);
                setTotalPages(res.data.totalPages);
                setTotal(res.data.total);
            } else {
                toast.error(res.error || "Failed to load referral codes");
            }
        } catch {
            toast.error("Failed to fetch referral codes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCodes();
    }, [search, status, selectedInstitute, page]);

    const handleGenerateRandomCode = () => {
        const inst = institutes.find((i) => i._id === newForm.partnerInstituteId);
        const prefix = inst ? inst.code.replace(/[^A-Za-z0-9]/g, "").substring(0, 4) : "NGIT";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const year = new Date().getFullYear();
        setNewForm((f) => ({ ...f, code: `${prefix}${year}-${randomNum}`.toUpperCase() }));
    };

    const handleCreateCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newForm.partnerInstituteId) {
            toast.error("Please select a partner institute");
            return;
        }

        setCreating(true);
        try {
            const res = await createReferralCode({
                partnerInstituteId: newForm.partnerInstituteId,
                code: newForm.code.trim().toUpperCase(),
                startsAt: newForm.startsAt || undefined,
                expiresAt: newForm.expiresAt || undefined,
                usageLimit: Number(newForm.usageLimit) || 0,
                discountPercent: newForm.discountPercent ? Number(newForm.discountPercent) : undefined,
                discountAmount: newForm.discountAmount ? Number(newForm.discountAmount) : undefined,
                description: newForm.description.trim() || undefined,
            });

            if (res.success) {
                toast.success(`Referral code "${res.data.code.code}" generated successfully!`);
                setIsCreateOpen(false);
                setNewForm({
                    partnerInstituteId: "",
                    code: "",
                    startsAt: "",
                    expiresAt: "",
                    usageLimit: 0,
                    discountPercent: undefined,
                    discountAmount: undefined,
                    description: "",
                });
                loadCodes();
            } else {
                toast.error(res.error || "Failed to create code");
            }
        } catch {
            toast.error("System error creating code");
        } finally {
            setCreating(false);
        }
    };

    const handleToggleStatus = async (id: string, newStatus: "ACTIVE" | "PAUSED" | "DISABLED") => {
        try {
            const res = await toggleReferralCodeStatus({ id, status: newStatus });
            if (res.success) {
                toast.success(`Code status updated to ${newStatus}`);
                loadCodes();
            } else {
                toast.error(res.error || "Failed to update code");
            }
        } catch {
            toast.error("Error updating status");
        }
    };

    return (
        <div className="space-y-8 pb-16 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
                <div>
                    <Link
                        href="/admin/referrals"
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to Referrals
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Referral Codes & Campaigns</h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Generate promotional codes, track student quotas, and share instant QR registration links.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsCreateOpen(true);
                        if (!newForm.code) handleGenerateRandomCode();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" /> Generate New Referral Code
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by referral code..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Institute Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Institute:</span>
                        <select
                            value={selectedInstitute}
                            onChange={(e) => {
                                setSelectedInstitute(e.target.value);
                                setPage(1);
                            }}
                            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none max-w-[200px]"
                        >
                            <option value="ALL">All Institutes</option>
                            {institutes.map((i) => (
                                <option key={i._id} value={i._id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5">
                        {["ALL", "ACTIVE", "PAUSED", "DISABLED"].map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setStatus(s);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
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
            </div>

            {/* Codes Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading codes...</p>
                    </div>
                ) : codes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">Referral Code</th>
                                    <th className="py-4 px-6">Partner Institute</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Usage Progress</th>
                                    <th className="py-4 px-6">Discount / Promo</th>
                                    <th className="py-4 px-6">Validity</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {codes.map((c) => {
                                    const inst = c.partnerInstituteId;
                                    const isLimitReached = c.usageLimit > 0 && c.usageCount >= c.usageLimit;
                                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();

                                    return (
                                        <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                                                        {c.code}
                                                    </span>
                                                </div>
                                                {c.description && (
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[200px]">
                                                        {c.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {inst ? (
                                                    <Link
                                                        href={`/admin/referrals/institutes/${inst._id}`}
                                                        className="font-bold text-slate-900 hover:text-indigo-600 block transition-colors"
                                                    >
                                                        {inst.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">Unassigned</span>
                                                )}
                                                <span className="text-[10px] font-mono text-slate-400">{inst?.code}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {isLimitReached ? (
                                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                                                        Limit Reached
                                                    </span>
                                                ) : isExpired ? (
                                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                                        Expired
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                                                            c.status === "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                                : c.status === "PAUSED"
                                                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {c.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-baseline gap-1 font-mono">
                                                    <span className="font-black text-slate-900 text-sm">{c.usageCount}</span>
                                                    <span className="text-slate-400 font-bold">
                                                        / {c.usageLimit > 0 ? c.usageLimit : "Unlimited"}
                                                    </span>
                                                </div>
                                                {c.usageLimit > 0 && (
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                isLimitReached ? "bg-rose-500" : "bg-indigo-600"
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(100, (c.usageCount / c.usageLimit) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {c.discountPercent ? (
                                                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                                        {c.discountPercent}% Discount
                                                    </span>
                                                ) : c.discountAmount ? (
                                                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                                        ₹{c.discountAmount} Discount
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-medium">Tracking Only</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-slate-500 font-medium">
                                                {c.expiresAt ? (
                                                    <span>Valid till {format(new Date(c.expiresAt), "dd MMM yyyy")}</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-bold">No Expiry</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setShareCode({
                                                                code: c.code,
                                                                instituteName: inst?.name || "NGIT Partner",
                                                                instituteCode: inst?.code,
                                                                discountPercent: c.discountPercent,
                                                                discountAmount: c.discountAmount,
                                                                expiresAt: c.expiresAt,
                                                                usageLimit: c.usageLimit,
                                                                usageCount: c.usageCount,
                                                            })
                                                        }
                                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
                                                        title="Share Link & QR"
                                                    >
                                                        <QrCode className="w-3.5 h-3.5" /> Share
                                                    </button>
                                                    <select
                                                        value={c.status}
                                                        onChange={(e) => handleToggleStatus(c._id, e.target.value as any)}
                                                        className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-700"
                                                    >
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="PAUSED">Pause</option>
                                                        <option value="DISABLED">Disable</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center text-slate-400">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-black text-slate-700">No referral codes found</p>
                        <p className="text-xs mt-1">Generate a code to distribute to your partner institutes.</p>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="mt-4 bg-indigo-600 text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                        >
                            + Generate Referral Code
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                        <span>Showing page {page} of {totalPages} ({total} total codes)</span>
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

            {/* Create Referral Code Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsCreateOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Generate Referral Code</h3>
                                <p className="text-xs font-semibold text-slate-400">Create a partner campaign tracking code</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateCode} className="space-y-4 text-xs font-bold">
                            <div className="space-y-1">
                                <label className="text-slate-700">Associated Partner Institute *</label>
                                <select
                                    required
                                    value={newForm.partnerInstituteId}
                                    onChange={(e) => {
                                        setNewForm((f) => ({ ...f, partnerInstituteId: e.target.value }));
                                    }}
                                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">-- Choose Partner Institute --</option>
                                    {institutes.map((i) => (
                                        <option key={i._id} value={i._id}>
                                            {i.name} ({i.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-slate-700">Referral Code *</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateRandomCode}
                                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                                    >
                                        <Sparkles className="w-2.5 h-2.5" /> Auto-Generate
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. APEX2026"
                                    value={newForm.code}
                                    onChange={(e) => setNewForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <p className="text-[10px] text-slate-400">Codes are case-insensitive and must be unique.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-slate-700">Starts At (Optional)</label>
                                    <input
                                        type="date"
                                        value={newForm.startsAt}
                                        onChange={(e) => setNewForm((f) => ({ ...f, startsAt: e.target.value }))}
                                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700">Expires At (Optional)</label>
                                    <input
                                        type="date"
                                        value={newForm.expiresAt}
                                        onChange={(e) => setNewForm((f) => ({ ...f, expiresAt: e.target.value }))}
                                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-slate-700">Max Usage Quota</label>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="0 for unlimited"
                                        value={newForm.usageLimit}
                                        onChange={(e) => setNewForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))}
                                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400">Leave 0 for unlimited students</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700">Discount Percent (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="e.g. 10 (Optional)"
                                        value={newForm.discountPercent || ""}
                                        onChange={(e) =>
                                            setNewForm((f) => ({
                                                ...f,
                                                discountPercent: e.target.value ? Number(e.target.value) : undefined,
                                            }))
                                        }
                                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-slate-700">Description / Campaign Purpose</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Diwali Steno Admission Drive 2026"
                                    value={newForm.description}
                                    onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Create Referral Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Code Modal */}
            <ShareCodeModal
                isOpen={!!shareCode}
                onClose={() => setShareCode(null)}
                codeData={shareCode}
            />
        </div>
    );
}

export default function ReferralCodesPage() {
    return (
        <Suspense fallback={
            <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Codes Hub...</p>
            </div>
        }>
            <ReferralCodesContent />
        </Suspense>
    );
}
