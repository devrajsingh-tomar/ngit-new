"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getPartnerInstituteById, updatePartnerInstitute } from "@/app/actions/referrals";
import ShareCodeModal from "@/components/admin/referrals/ShareCodeModal";
import {
    Building2,
    ArrowLeft,
    Tag,
    Users,
    Trophy,
    Calendar,
    Phone,
    Mail,
    MapPin,
    QrCode,
    Plus,
    Edit3,
    CheckCircle2,
    PauseCircle,
    XCircle,
    Loader2,
    Copy,
    Share2,
    FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function InstituteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const instituteId = resolvedParams.id;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedShareCode, setSelectedShareCode] = useState<any>(null);

    const [editForm, setEditForm] = useState({
        name: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        city: "",
        state: "",
        address: "",
        status: "ACTIVE" as "ACTIVE" | "PAUSED" | "INACTIVE",
        notes: "",
    });

    const loadInstitute = async () => {
        setLoading(true);
        try {
            const res = await getPartnerInstituteById({ id: instituteId });
            if (res.success) {
                setData(res.data);
                const inst = res.data.institute;
                setEditForm({
                    name: inst.name || "",
                    contactPerson: inst.contactPerson || "",
                    contactEmail: inst.contactEmail || "",
                    contactPhone: inst.contactPhone || "",
                    city: inst.city || "",
                    state: inst.state || "",
                    address: inst.address || "",
                    status: inst.status || "ACTIVE",
                    notes: inst.notes || "",
                });
            } else {
                toast.error(res.error || "Institute not found");
            }
        } catch {
            toast.error("Failed to fetch institute details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInstitute();
    }, [instituteId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updatePartnerInstitute({
                id: instituteId,
                ...editForm,
            });
            if (res.success) {
                toast.success("Institute profile updated!");
                setIsEditing(false);
                loadInstitute();
            } else {
                toast.error(res.error || "Failed to update institute");
            }
        } catch {
            toast.error("System error updating institute");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading institute profile...</p>
            </div>
        );
    }

    if (!data?.institute) {
        return (
            <div className="py-16 text-center">
                <p className="text-sm font-bold text-slate-700">Institute record not found.</p>
                <Link href="/admin/referrals/institutes" className="text-xs font-bold text-indigo-600 mt-2 inline-block">
                    Return to Directory
                </Link>
            </div>
        );
    }

    const { institute, codes = [], totalStudents = 0, recentReferrals = [] } = data;

    return (
        <div className="space-y-8 pb-16 animate-in fade-in duration-300">
            {/* Top Navigation & Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
                <div>
                    <Link
                        href="/admin/referrals/institutes"
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to Partner Directory
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{institute.name}</h1>
                                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                                    {institute.code}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                Onboarded on {format(new Date(institute.createdAt), "dd MMMM yyyy")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                    >
                        <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Cancel Edit" : "Edit Details"}
                    </button>
                    <Link
                        href={`/admin/referrals/codes?new=true&instId=${institute._id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Generate Code
                    </Link>
                </div>
            </div>

            {/* Edit Form Drawer / Card */}
            {isEditing && (
                <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-base font-black text-slate-900">Edit Partner Institute Profile</h3>
                        <span className="text-xs font-bold text-slate-400">ID: {institute.code}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-slate-700">Institute Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-700">Account Status</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as any }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="PAUSED">PAUSED</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-700">Contact Person</label>
                            <input
                                type="text"
                                value={editForm.contactPerson}
                                onChange={(e) => setEditForm((f) => ({ ...f, contactPerson: e.target.value }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-700">Contact Email</label>
                            <input
                                type="email"
                                value={editForm.contactEmail}
                                onChange={(e) => setEditForm((f) => ({ ...f, contactEmail: e.target.value }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-700">Contact Phone</label>
                            <input
                                type="tel"
                                value={editForm.contactPhone}
                                onChange={(e) => setEditForm((f) => ({ ...f, contactPhone: e.target.value }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-700">City</label>
                            <input
                                type="text"
                                value={editForm.city}
                                onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-700">State</label>
                            <input
                                type="text"
                                value={editForm.state}
                                onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200"
                            />
                        </div>

                        <div className="space-y-1 sm:col-span-3">
                            <label className="text-slate-700">Internal Admin Notes</label>
                            <textarea
                                rows={2}
                                value={editForm.notes}
                                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-200"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Referral Codes</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{codes.length}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">
                        {codes.filter((c: any) => c.status === "ACTIVE").length} Currently Active
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Referred Students</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{totalStudents}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Attributed to this institute</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Institute Status</p>
                    <div className="mt-2">
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full ${
                                institute.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : institute.status === "PAUSED"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-rose-50 text-rose-700"
                            }`}
                        >
                            {institute.status}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">Affiliation status</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Primary Contact</p>
                    <p className="text-sm font-black text-slate-900 mt-2 truncate">{institute.contactPerson}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{institute.contactPhone}</p>
                </div>
            </div>

            {/* Referral Codes Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900">Campaign Referral Codes</h3>
                        <p className="text-xs text-slate-400 font-semibold">Active promotional and tracking codes for this institute</p>
                    </div>
                    <Link
                        href={`/admin/referrals/codes?new=true&instId=${institute._id}`}
                        className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add New Code
                    </Link>
                </div>

                {codes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-3.5 px-6">Code</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Usage</th>
                                    <th className="py-3.5 px-6">Promotion / Discount</th>
                                    <th className="py-3.5 px-6">Validity Period</th>
                                    <th className="py-3.5 px-6 text-right">Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {codes.map((c: any) => (
                                    <tr key={c._id} className="hover:bg-slate-50/50">
                                        <td className="py-3.5 px-6">
                                            <span className="font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                                                {c.code}
                                            </span>
                                            {c.description && (
                                                <p className="text-[10px] text-slate-400 font-medium mt-1">{c.description}</p>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span
                                                className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    c.status === "ACTIVE"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : c.status === "PAUSED"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="font-black text-slate-800">{c.usageCount}</span>
                                            <span className="text-slate-400 font-semibold ml-1">
                                                / {c.usageLimit > 0 ? c.usageLimit : "∞"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            {c.discountPercent ? (
                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                    {c.discountPercent}% Off
                                                </span>
                                            ) : c.discountAmount ? (
                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                    ₹{c.discountAmount} Off
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-medium">Tracking Only (No Discount)</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6 text-slate-500 font-medium">
                                            {c.expiresAt ? `Until ${format(new Date(c.expiresAt), "dd MMM yyyy")}` : "Perpetual"}
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <button
                                                onClick={() =>
                                                    setSelectedShareCode({
                                                        code: c.code,
                                                        instituteName: institute.name,
                                                        instituteCode: institute.code,
                                                        discountPercent: c.discountPercent,
                                                        discountAmount: c.discountAmount,
                                                        expiresAt: c.expiresAt,
                                                        usageLimit: c.usageLimit,
                                                        usageCount: c.usageCount,
                                                    })
                                                }
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all"
                                            >
                                                <QrCode className="w-3.5 h-3.5" /> Share / QR
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400">
                        <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-bold">No referral codes created for this institute yet.</p>
                        <Link
                            href={`/admin/referrals/codes?new=true&instId=${institute._id}`}
                            className="inline-block mt-2 text-xs font-black text-indigo-600 hover:underline"
                        >
                            + Generate first referral code
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Students Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900">Recently Attributed Students</h3>
                        <p className="text-xs text-slate-400 font-semibold">Candidates who enrolled via this institute's links</p>
                    </div>
                    <Link
                        href={`/admin/referrals/students?instId=${institute._id}`}
                        className="text-xs font-black text-indigo-600 hover:text-indigo-800"
                    >
                        View Full Student Roster ({totalStudents})
                    </Link>
                </div>

                {recentReferrals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-3.5 px-6">Student</th>
                                    <th className="py-3.5 px-6">Code Used</th>
                                    <th className="py-3.5 px-6">Attribution Source</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentReferrals.map((r: any) => (
                                    <tr key={r._id} className="hover:bg-slate-50/50">
                                        <td className="py-3.5 px-6">
                                            <p className="font-black text-slate-900">{r.studentId?.name || "Student"}</p>
                                            <p className="text-[11px] text-slate-400">{r.studentId?.email}</p>
                                        </td>
                                        <td className="py-3.5 px-6 font-mono font-bold text-slate-700">{r.codeUsed}</td>
                                        <td className="py-3.5 px-6 text-slate-600 font-medium">{r.attributionSource}</td>
                                        <td className="py-3.5 px-6">
                                            <span
                                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    r.attributionStatus === "CONVERTED_PAID"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {r.attributionStatus}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-slate-500 font-medium">
                                            {format(new Date(r.attributedAt), "dd MMM yyyy, HH:mm")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-bold">No students registered through this institute yet.</p>
                    </div>
                )}
            </div>

            {/* Share Code Modal */}
            <ShareCodeModal
                isOpen={!!selectedShareCode}
                onClose={() => setSelectedShareCode(null)}
                codeData={selectedShareCode}
            />
        </div>
    );
}
