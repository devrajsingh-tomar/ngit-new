"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPartnerInstitute } from "@/app/actions/referrals";
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function NewPartnerInstitutePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        code: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        city: "",
        state: "",
        address: "",
        status: "ACTIVE" as "ACTIVE" | "PAUSED" | "INACTIVE",
        notes: "",
    });

    const set = (key: string, val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    const handleAutoGenerateCode = () => {
        if (!form.name.trim()) {
            toast.error("Please enter an institute name first");
            return;
        }
        const initials = form.name
            .trim()
            .split(/\s+/)
            .map((w) => w[0].toUpperCase())
            .join("");
        const generated = `${initials.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
        set("code", generated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createPartnerInstitute({
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                contactPerson: form.contactPerson.trim(),
                contactEmail: form.contactEmail.trim(),
                contactPhone: form.contactPhone.trim(),
                city: form.city.trim() || undefined,
                state: form.state.trim() || undefined,
                address: form.address.trim() || undefined,
                status: form.status,
                notes: form.notes.trim() || undefined,
            });

            if (res.success) {
                toast.success("Partner institute registered successfully!");
                router.push(`/admin/referrals/institutes/${res.data.instituteId}`);
            } else {
                toast.error(res.error || "Failed to create partner institute");
            }
        } catch {
            toast.error("A system error occurred while registering the institute");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Link
                    href="/admin/referrals/institutes"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-3"
                >
                    <ArrowLeft className="w-3 h-3" /> Back to Institutes Directory
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Register Partner Institute</h1>
                        <p className="text-xs font-semibold text-slate-500">
                            Onboard an affiliate coaching center or partner academy for student referral attribution.
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm space-y-8">
                {/* Section 1: Basic Profile */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                        Institute Identification
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-black text-slate-700">Institute Legal Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Allahabad Steno & Typing Academy"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-700">Unique Code Identifier *</label>
                                <button
                                    type="button"
                                    onClick={handleAutoGenerateCode}
                                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    <Sparkles className="w-2.5 h-2.5" /> Auto-Suggest
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="e.g. ASTA-2026"
                                value={form.code}
                                onChange={(e) => set("code", e.target.value.toUpperCase())}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold uppercase text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <p className="text-[10px] text-slate-400">Used as the default prefix and identifier for this partner.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">Account Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => set("status", e.target.value as any)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="ACTIVE">Active (Can receive referrals immediately)</option>
                                <option value="PAUSED">Paused (Temporarily halt attributions)</option>
                                <option value="INACTIVE">Inactive (Disabled)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                        Primary Contact Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" /> Contact Person *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Director or Coordinator name"
                                value={form.contactPerson}
                                onChange={(e) => set("contactPerson", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="director@institute.com"
                                value={form.contactEmail}
                                onChange={(e) => set("contactEmail", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number *
                            </label>
                            <input
                                type="tel"
                                required
                                placeholder="+91 9876543210"
                                value={form.contactPhone}
                                onChange={(e) => set("contactPhone", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Location */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                        Location & Notes
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">City</label>
                            <input
                                type="text"
                                placeholder="e.g. Prayagraj"
                                value={form.city}
                                onChange={(e) => set("city", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">State / Region</label>
                            <input
                                type="text"
                                placeholder="e.g. Uttar Pradesh"
                                value={form.state}
                                onChange={(e) => set("state", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-black text-slate-700">Full Campus Address (Optional)</label>
                            <input
                                type="text"
                                placeholder="Branch address or landmark"
                                value={form.address}
                                onChange={(e) => set("address", e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-black text-slate-700">Internal Administration Notes</label>
                            <textarea
                                rows={3}
                                placeholder="Any contractual notes, referral agreements, or commercial terms..."
                                value={form.notes}
                                onChange={(e) => set("notes", e.target.value)}
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/admin/referrals/institutes"
                        className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-black hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" /> Save & Register Institute
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
