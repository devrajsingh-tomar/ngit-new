"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Check, X, Search, MoreVertical, Mail, Phone,
    UserCheck, UserX, CreditCard, FileText, Eye,
    BookOpen, Calendar, MapPin, Shield, User, ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { getStudentRegistrations, approveStudent, rejectStudent } from "@/app/actions/registration";

interface StudentProfile {
    _id: string;
    name: string;
    dateOfBirth: string;
    fatherName: string;
    motherName: string;
    aadharNo: string;
    category: string;
    localAddress: string;
    localPhone: string;
    email?: string;
    permanentAddress: string;
    permanentPhone: string;
    course: string;
    photoUrl?: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
}

export default function AdminStudentsPage() {
    const [activeTab, setActiveTab] = useState("Pending");
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<StudentProfile | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState({ Pending: 0, Approved: 0, All: 0 });

    const fetchStudents = useCallback(async (pageNum = 1, status = activeTab) => {
        setLoading(true);
        const res = await getStudentRegistrations({ page: pageNum, limit: 20, status });
        if (!res.success) {
            toast.error(res.error || "Failed to load students");
            setLoading(false);
            return;
        }
        setStudents(res.data.data as StudentProfile[]);
        setTotalPages(res.data.totalPages);
        setPage(pageNum);
        setCounts(res.data.counts);
        setLoading(false);
    }, [activeTab]);

    useEffect(() => { fetchStudents(1, activeTab); }, [activeTab, fetchStudents]);

    const handleApprove = async (id: string) => {
        const res = await approveStudent({ profileId: id });
        if (res.success) {
            toast.success("Student approved! Login access granted.");
            fetchStudents();
            setSelected(null);
        } else {
            toast.error(res.error || "Failed to approve");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Reject and delete this application? This cannot be undone.")) return;
        const res = await rejectStudent({ profileId: id });
        if (res.success) {
            toast.error("Application rejected and removed.");
            fetchStudents();
            setSelected(null);
        } else {
            toast.error(res.error || "Failed to reject");
        }
    };

    const filtered = students; // Filtering is now done server-side for status. Search is client-side on current page for now.
    /*
    const filtered = students.filter((s) => {
        const matchesTab = activeTab === "All" || s.status === activeTab;
        const matchesSearch =
            !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
            s.course.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });
    */

    /*
    const counts = {
        Pending: students.filter((s) => s.status === "Pending").length,
        Approved: students.filter((s) => s.status === "Approved").length,
        All: students.length,
    };
    */

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Student Management</h1>
                    <p className="text-muted-foreground mt-1">Review registrations, approve accounts & manage enrollments.</p>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    {(["Pending", "Approved", "All"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            {tab}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === tab
                                    ? tab === "Pending" ? "bg-amber-100 text-amber-700"
                                        : tab === "Approved" ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-200 text-slate-600"
                                    : "bg-slate-200 text-slate-500"
                                }`}>
                                {counts[tab]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                {/* Search */}
                <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email or course..."
                            className="w-full h-12 bg-white border rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/students/register">
                            <Button className="gap-2 rounded-xl">
                                <User className="w-4 h-4" /> Add Student
                            </Button>
                        </Link>
                        <Button variant="outline" className="gap-2 rounded-xl">
                            <FileText className="w-4 h-4" /> Export Student Data
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        Loading students...
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course &amp; Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map((s) => (
                                <tr key={s._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            {s.photoUrl ? (
                                                <img src={s.photoUrl} alt={s.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                                    {s.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900">{s.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    {s.email || "—"}
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-0.5">DOB: {s.dateOfBirth}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700">{s.course}</p>
                                        <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                            {s.category}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Applied: {new Date(s.createdAt).toLocaleDateString("en-IN")}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                            <Phone className="w-3 h-3" /> {s.localPhone}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate max-w-[140px]">{s.localAddress}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {s.status === "Pending" ? (
                                            <span className="flex items-center gap-2 text-xs font-bold text-amber-500">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                Pending Approval
                                            </span>
                                        ) : s.status === "Approved" ? (
                                            <span className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                                                <Check className="w-4 h-4" /> Active Access
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-xs font-bold text-red-500">
                                                <X className="w-4 h-4" /> Rejected
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                onClick={() => setSelected(s)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 rounded-lg gap-1.5 px-3 text-xs font-bold text-slate-500 hover:text-primary hover:bg-primary/5"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </Button>
                                            {s.status === "Pending" && (
                                                <>
                                                    <Button
                                                        onClick={() => handleApprove(s._id)}
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 h-9 rounded-lg gap-1.5 px-4 font-bold text-xs"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" /> Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(s._id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 rounded-lg text-red-500 hover:bg-red-50 text-xs font-bold"
                                                    >
                                                        <UserX className="w-3.5 h-3.5" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="py-20 text-center text-slate-400 italic">
                        No students found in "{activeTab}" category.
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t bg-slate-50/30 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => fetchStudents(page - 1)} 
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
                                        onClick={() => fetchStudents(p)}
                                        className={`w-10 h-10 rounded-xl font-bold ${page === p ? "shadow-lg shadow-primary/20" : ""}`}
                                    >
                                        {p}
                                    </Button>
                                )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => fetchStudents(page + 1)} 
                                disabled={page === totalPages}
                                className="h-10 rounded-xl font-bold gap-2"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center gap-6 p-8 border-b">
                            {selected.photoUrl ? (
                                <img src={selected.photoUrl} alt={selected.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl">
                                    {selected.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-slate-900">{selected.name}</h2>
                                <p className="text-sm text-slate-500 mt-0.5">{selected.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${selected.status === "Approved" ? "bg-emerald-100 text-emerald-700"
                                            : selected.status === "Pending" ? "bg-amber-100 text-amber-700"
                                                : "bg-red-100 text-red-700"
                                        }`}>
                                        {selected.status}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                                        {selected.category}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: User, label: "Father's / Guardian's Name", value: selected.fatherName },
                                { icon: User, label: "Mother's Name", value: selected.motherName },
                                { icon: Shield, label: "Aadhar No.", value: selected.aadharNo },
                                { icon: Calendar, label: "Date of Birth", value: selected.dateOfBirth },
                                { icon: BookOpen, label: "Course", value: selected.course },
                                { icon: Phone, label: "Local Phone", value: selected.localPhone },
                                { icon: MapPin, label: "Local Address", value: selected.localAddress },
                                { icon: Phone, label: "Permanent Phone", value: selected.permanentPhone || "—" },
                                { icon: MapPin, label: "Permanent Address", value: selected.permanentAddress },
                                { icon: Calendar, label: "Applied On", value: new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Icon className="w-3 h-3" /> {label}
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        {selected.status === "Pending" && (
                            <div className="flex gap-3 p-8 pt-0">
                                <Button
                                    onClick={() => handleApprove(selected._id)}
                                    className="flex-1 h-12 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 gap-2"
                                >
                                    <UserCheck className="w-4 h-4" /> Approve & Grant Login Access
                                </Button>
                                <Button
                                    onClick={() => handleReject(selected._id)}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl font-bold text-red-500 border-red-200 hover:bg-red-50 gap-2"
                                >
                                    <UserX className="w-4 h-4" /> Reject Application
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
