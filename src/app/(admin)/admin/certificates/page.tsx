"use client";
import React, { useState, useEffect } from "react";
import { getAdminCertificates, issueCertificate, revokeCertificate, getStudentList, getFormData, getCertificatePDF } from "@/app/actions/certificate";
import { getAllCourses } from "@/app/actions/courses";
import { Search, Award, ShieldCheck, XCircle, FileDiff, QrCode, Plus, Loader2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminCertificatesPage() {
    const [certs, setCerts] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [issuing, setIssuing] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [form, setForm] = useState({
        studentId: "",
        courseId: "",
        templateId: "",
        grade: "A+",
        percentage: 95,
        courseDuration: "12 Weeks",
        remarks: ""
    });

    useEffect(() => {
        load();
    }, []);

    const load = async (pageNum = 1) => {
        setLoading(true);
        const [cRes, crsData, fData] = await Promise.all([
            getAdminCertificates({ page: pageNum, limit: 20 }),
            getAllCourses(),
            getFormData({})
        ]);
        if (cRes.success) {
            setCerts(cRes.data.certs);
            setTotalPages(cRes.data.totalPages);
            setPage(pageNum);
        }
        setCourses(crsData.courses || []);
        if (fData.success) {
            setStudents(fData.data.students || []);
            setTemplates(fData.data.templates || []);
        }
        setLoading(false);
    };

    const handleDownload = async (certId: string) => {
        setDownloadingId(certId);
        try {
            const res = await getCertificatePDF(certId);
            if (res.success && res.pdfBase64) {
                const byteCharacters = atob(res.pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = res.filename || "certificate.pdf";
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Certificate downloaded successfully!");
            } else {
                toast.error(res.error || "Failed to download");
            }
        } catch (error) {
            toast.error("Error generating PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        setIssuing(true);
        const res = await issueCertificate(form);
        if (res.success) {
            toast.success("Certificate Issued and Published successfully!");
            setOpenAdd(false);
            load();
            setForm({ studentId: "", courseId: "", templateId: "", grade: "A+", percentage: 95, courseDuration: "12 Weeks", remarks: "" });
        } else {
            toast.error(res.error || "Failed to issue certificate");
        }
        setIssuing(false);
    };

    const handleRevoke = async (id: string, number: string) => {
        if (!confirm(`Are you sure you want to REVOKE Certificate ${number}? This action marks it INVALID globally.`)) return;
        const res = await revokeCertificate(id);
        if (res.success) {
            toast.success("Certificate Revoked");
            load();
        } else {
            toast.error("Failed to revoke");
        }
    };

    const filtered = certs; // Since we are doing server-side pagination, filtering on client will only filter current page.
    // In a future update, we can implement full server-side search.
    // For now, let's just show what we have.
    /*
    const filtered = certs.filter(c =>
        c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    */

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-500" /> Certificate Center
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Securely issue, track, and revoke diplomas across the platform.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64 md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Find by ID, name, or course..."
                            className="pl-10 h-12 rounded-2xl border-slate-200 bg-white placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Link href="/admin/certificates/templates">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold gap-2 shadow-sm border-2">
                            <FileDiff className="w-5 h-5" /> Manage Templates
                        </Button>
                    </Link>

                    <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-bold gap-2 text-white shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5" /> Issue Certificate
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none bg-white shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-900">Issue Official Certificate</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleIssue} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Select Student</label>
                                    <select
                                        required
                                        className="w-full h-12 bg-slate-50 border rounded-xl px-4 font-bold text-slate-700 outline-none"
                                        value={form.studentId}
                                        onChange={e => setForm({ ...form, studentId: e.target.value })}
                                    >
                                        <option value="">-- Click to Select Student --</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Select Program / Course</label>
                                    <select
                                        required
                                        className="w-full h-12 bg-slate-50 border rounded-xl px-4 font-bold text-slate-700 outline-none"
                                        value={form.courseId}
                                        onChange={e => setForm({ ...form, courseId: e.target.value })}
                                    >
                                        <option value="">-- Click to Select Course --</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Design Template (Optional)</label>
                                    <select
                                        className="w-full h-12 bg-slate-50 border rounded-xl px-4 font-bold text-slate-700 outline-none"
                                        value={form.templateId}
                                        onChange={e => setForm({ ...form, templateId: e.target.value })}
                                    >
                                        <option value="">-- Use System Default Design --</option>
                                        {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Grade Awarded</label>
                                        <Input
                                            required
                                            value={form.grade}
                                            onChange={e => setForm({ ...form, grade: e.target.value })}
                                            className="h-12 border-slate-200 rounded-xl font-bold"
                                            placeholder="A+, O, Pass"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Final %</label>
                                        <Input
                                            required
                                            type="number"
                                            value={form.percentage}
                                            onChange={e => setForm({ ...form, percentage: Number(e.target.value) })}
                                            className="h-12 border-slate-200 rounded-xl font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Course Duration Label</label>
                                    <Input
                                        required
                                        value={form.courseDuration}
                                        onChange={e => setForm({ ...form, courseDuration: e.target.value })}
                                        className="h-12 border-slate-200 rounded-xl font-bold"
                                        placeholder="e.g. 12 Weeks, 6 Months"
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" disabled={issuing} className="w-full h-14 rounded-2xl text-lg font-black bg-primary">
                                        {issuing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Mint Certificate"}
                                    </Button>
                                    <p className="text-center text-[10px] uppercase font-bold text-slate-400 mt-3 pt-2">
                                        Generates a unique crypto ID & PDF immediately.
                                    </p>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm pt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-4">Certificate ID</th>
                                <th className="px-8 py-4">Student</th>
                                <th className="px-8 py-4">Course Details</th>
                                <th className="px-8 py-4 text-center">Score</th>
                                <th className="px-8 py-4">Issued On</th>
                                <th className="px-8 py-4">Status & Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-12 mx-auto"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center">
                                        <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold mb-1">No Certificates Found</p>
                                        <p className="text-xs text-slate-400 max-w-sm mx-auto">Issue your first official graduation document using the button above.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(cert => (
                                <tr key={cert._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <Link href={`/verify/${cert.certificateNumber}`} target="_blank" className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded w-fit">
                                            <QrCode className="w-3.5 h-3.5" />
                                            {cert.certificateNumber}
                                        </Link>
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="font-bold text-slate-900">{cert.studentId?.name}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">{cert.studentId?.email}</p>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                                {cert.courseId?.thumbnail ? (
                                                    <img src={cert.courseId.thumbnail} alt="" className="w-full h-full object-cover" />
                                                ) : <FileDiff className="w-4 h-4 m-2 text-slate-400" />}
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700 max-w-[200px] truncate" title={cert.courseId?.title}>
                                                {cert.courseId?.title || "Unknown Course"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="font-black text-slate-900">{cert.percentage}%</span>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Grade {cert.grade}</p>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-500">
                                        {format(new Date(cert.issuedDate), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-8 py-4">
                                        {cert.status === "REVOKED" ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50 w-fit px-2.5 py-1 rounded-full border border-red-100">
                                                <XCircle className="w-3 h-3" /> Revoked
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-100">
                                                    <ShieldCheck className="w-3 h-3" /> Valid
                                                </span>
                                                <button
                                                    onClick={() => handleDownload(cert._id)}
                                                    disabled={!!downloadingId}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-dark uppercase underline disabled:opacity-50"
                                                >
                                                    {downloadingId === cert._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleRevoke(cert._id, cert.certificateNumber)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-red-400 hover:text-red-600 uppercase underline"
                                                >
                                                    Revoke
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t bg-slate-50/30 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Showing Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => load(page - 1)} 
                                disabled={page === 1}
                                className="h-10 rounded-xl font-bold gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <Button
                                        key={p}
                                        variant={page === p ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => load(p)}
                                        className={`w-10 h-10 rounded-xl font-bold ${page === p ? "shadow-lg shadow-primary/20" : ""}`}
                                    >
                                        {p}
                                    </Button>
                                )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => load(page + 1)} 
                                disabled={page === totalPages}
                                className="h-10 rounded-xl font-bold gap-2"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
