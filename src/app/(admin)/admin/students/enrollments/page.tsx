"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
    Search, 
    PlusCircle, 
    User, 
    BookOpen, 
    Edit2, 
    Trash2, 
    Loader2, 
    X, 
    CreditCard, 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Activity,
    ArrowUpRight,
    Award
} from "lucide-react";
import { 
    getAdminFeeData, 
    assignCourseOffline, 
    deleteEnrollmentAction, 
    updateEnrollmentAction 
} from "@/app/actions/admin-payment";
import { 
    getAdminTypingSubscriptionsAction, 
    activateOrExtendSubscriptionAdminAction 
} from "@/app/actions/subscription";
import { cn } from "@/lib/utils";

type TabOption = "courses" | "typing";
type SubFilterOption = "all" | "active" | "expired" | "pending";

export default function CourseAssignmentPage() {
    const [activeTab, setActiveTab] = useState<TabOption>("courses");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Common Data
    const [data, setData] = useState<{ students: any[], enrollments: any[], payments: any[] }>({
        students: [], enrollments: [], payments: []
    });

    // Course Assignment State
    const [courses, setCourses] = useState<any[]>([]);
    const [courseSearch, setCourseSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");

    // Course Edit Modal State
    const [editEnrollment, setEditEnrollment] = useState<any | null>(null);
    const [editCourseId, setEditCourseId] = useState<string>("");
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Typing Subscription State
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [selectedSubStudent, setSelectedSubStudent] = useState<string>("");
    const [selectedSubPlan, setSelectedSubPlan] = useState<"MONTHLY" | "QUARTERLY" | "HALF_YEARLY">("MONTHLY");
    const [subSearch, setSubSearch] = useState("");
    const [subListSearch, setSubListSearch] = useState("");
    const [subFilter, setSubFilter] = useState<SubFilterOption>("all");

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Course Data & Students
            const res = await getAdminFeeData({});
            if (res.success) {
                setData(res.data);
            }

            // Fetch Offline/Online Courses
            const { getCourses } = await import("@/services/CourseService");
            const cData = await getCourses(1, 100);
            if (cData) {
                const sorted = [...cData].sort((a: any, b: any) => (b.type === 'OFFLINE' ? 1 : -1));
                setCourses(sorted);
            }

            // Fetch Typing Subscriptions
            const subRes = await getAdminTypingSubscriptionsAction({});
            if (subRes.success && subRes.data?.success) {
                setSubscriptions(subRes.data.subscriptions || []);
            }
        } catch (error) {
            console.error("Failed to load layout data:", error);
            toast.error("Failed to fetch dashboard data.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // ── Course Assignment Handlers ──
    const handleAssign = async () => {
        if (!selectedStudent || !selectedCourse) {
            toast.error("Please select a student and a course.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await assignCourseOffline({ studentId: selectedStudent, courseId: selectedCourse });
            if (res.success) {
                toast.success("Course assigned successfully. A pending fee record was generated.");
                setSelectedStudent("");
                setSelectedCourse("");
                loadData();
            } else {
                toast.error(res.error || "Failed to assign course.");
            }
        } catch (error) {
            toast.error("Failed to assign course.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (enrollmentId: string) => {
        if (!window.confirm("Are you sure you want to remove this enrollment record?")) return;

        try {
            const res = await deleteEnrollmentAction({ id: enrollmentId });
            if (res.success) {
                toast.success("Enrollment deleted successfully.");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete enrollment.");
            }
        } catch (error) {
            toast.error("An error occurred while deleting enrollment.");
        }
    };

    const openEditModal = (enrollment: any) => {
        setEditEnrollment(enrollment);
        setEditCourseId(enrollment.courseId?._id || "");
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editEnrollment || !editCourseId) return;

        setActionLoading(true);
        try {
            const res = await updateEnrollmentAction({ id: editEnrollment._id, courseId: editCourseId });
            if (res.success) {
                toast.success("Enrollment updated successfully.");
                setIsEditOpen(false);
                setEditEnrollment(null);
                loadData();
            } else {
                toast.error(res.error || "Failed to update enrollment.");
            }
        } catch (error) {
            toast.error("An error occurred while updating enrollment.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Typing Subscription Handlers ──
    const handleActivateSubscription = async () => {
        if (!selectedSubStudent) {
            toast.error("Please select a student for the typing subscription.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await activateOrExtendSubscriptionAdminAction({
                userId: selectedSubStudent,
                planType: selectedSubPlan
            });
            if (res.success && res.data?.success) {
                toast.success(`Typing subscription manually activated (${selectedSubPlan})!`);
                setSelectedSubStudent("");
                loadData();
            } else {
                toast.error(res.error || "Failed to activate typing subscription.");
            }
        } catch (error) {
            toast.error("Failed to activate typing subscription.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Filter Logics ──
    const filteredStudentsCourse = data.students.filter(s =>
        s.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(courseSearch.toLowerCase())
    );

    const filteredStudentsSub = data.students.filter(s =>
        s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(subSearch.toLowerCase())
    );

    // Filter Typing Subscriptions list
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = 
            (sub.userId?.name || "").toLowerCase().includes(subListSearch.toLowerCase()) ||
            (sub.userId?.email || "").toLowerCase().includes(subListSearch.toLowerCase()) ||
            (sub.razorpayOrderId || "").toLowerCase().includes(subListSearch.toLowerCase());

        if (!matchesSearch) return false;

        const isExpired = new Date(sub.endDate) <= new Date() || sub.status === "EXPIRED";
        const isActive = new Date(sub.endDate) > new Date() && sub.status === "ACTIVE";

        if (subFilter === "active") return isActive;
        if (subFilter === "expired") return isExpired;
        if (subFilter === "pending") return sub.status === "PENDING";
        return true;
    });

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 md:px-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Access Assignments</h1>
                    <p className="text-slate-500 font-bold mt-1">Enroll offline students into courses or manage typing exam simulator subscriptions.</p>
                </div>
            </div>

            {/* Premium Section Tabs */}
            <div className="flex gap-2 border-b pb-1 border-slate-100">
                {[
                    { id: "courses", label: "Course Enrollments", icon: BookOpen },
                    { id: "typing", label: "Typing Subscriptions", icon: Award }
                ].map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id as TabOption)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all duration-300",
                                activeTab === t.id
                                    ? "border-primary text-slate-900"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: COURSE ENROLLMENTS */}
            {activeTab === "courses" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Student selection */}
                        <div className="md:col-span-1 space-y-4">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Select Student</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="Type name to filter..."
                                    className="w-full h-12 bg-slate-50 border rounded-xl pl-12 pr-4 text-sm font-bold text-slate-700 outline-none"
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                />
                            </div>
                            <div className="h-64 overflow-y-auto border rounded-xl space-y-1 p-2 bg-slate-50">
                                {filteredStudentsCourse.map(student => (
                                    <div
                                        key={student._id}
                                        onClick={() => setSelectedStudent(student._id)}
                                        className={cn(
                                            "p-3 rounded-lg cursor-pointer transition-colors text-sm font-bold",
                                            selectedStudent === student._id 
                                                ? "bg-primary text-white" 
                                                : "hover:bg-slate-200 text-slate-700"
                                        )}
                                    >
                                        {student.name}
                                        <p className={cn(
                                            "text-[10px]",
                                            selectedStudent === student._id ? "text-primary-foreground/70" : "text-slate-400"
                                        )}>
                                            {student.email}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course selection */}
                        <div className="md:col-span-1 space-y-4">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Select Offline Course</label>
                            <div className="h-[320px] overflow-y-auto border rounded-xl space-y-1 p-2 bg-slate-50">
                                {courses.map(course => (
                                    <div
                                        key={course._id}
                                        onClick={() => setSelectedCourse(course._id)}
                                        className={cn(
                                            "p-3 rounded-lg cursor-pointer transition-colors text-sm font-bold",
                                            selectedCourse === course._id 
                                                ? "bg-primary text-white" 
                                                : "hover:bg-slate-200 text-slate-700"
                                        )}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{course.title}</span>
                                            <span className={cn(
                                                "text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black",
                                                course.type === 'OFFLINE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'
                                            )}>
                                                {course.type || 'ONLINE'}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-[10px] mt-1",
                                            selectedCourse === course._id ? "text-primary-foreground/70" : "text-slate-400"
                                        )}>
                                            Category: {course.category}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Enroll Action */}
                        <div className="md:col-span-1 flex items-end">
                            <Button
                                onClick={handleAssign}
                                className="w-full h-14 rounded-2xl gap-2 font-bold text-lg bg-primary hover:bg-primary/95 text-white"
                                disabled={!selectedStudent || !selectedCourse || actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                                Enroll Offline
                            </Button>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Course Enrollments</h2>
                    <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolled At</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-600 font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                            Loading enrollments...
                                        </td>
                                    </tr>
                                ) : data.enrollments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-400">
                                            No enrollments found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.enrollments.map((en) => (
                                        <tr key={en._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <p className="font-bold text-slate-900">
                                                        {data.students.find(s => s._id === en.userId)?.name || "Unknown"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-slate-400" />
                                                    <p className="font-bold">{en.courseId?.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-400">
                                                {new Date(en.enrolledAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-sm text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-8 h-8 rounded-lg border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => openEditModal(en)}
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-8 h-8 rounded-lg border-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                                        onClick={() => handleDelete(en._id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: TYPING SIMULATOR SUBSCRIPTIONS */}
            {activeTab === "typing" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Student selection */}
                        <div className="md:col-span-1 space-y-4">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Select Student</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="Type name to filter..."
                                    className="w-full h-12 bg-slate-50 border rounded-xl pl-12 pr-4 text-sm font-bold text-slate-700 outline-none"
                                    value={subSearch}
                                    onChange={(e) => setSubSearch(e.target.value)}
                                />
                            </div>
                            <div className="h-64 overflow-y-auto border rounded-xl space-y-1 p-2 bg-slate-50">
                                {filteredStudentsSub.map(student => (
                                    <div
                                        key={student._id}
                                        onClick={() => setSelectedSubStudent(student._id)}
                                        className={cn(
                                            "p-3 rounded-lg cursor-pointer transition-colors text-sm font-bold",
                                            selectedSubStudent === student._id 
                                                ? "bg-primary text-white" 
                                                : "hover:bg-slate-200 text-slate-700"
                                        )}
                                    >
                                        {student.name}
                                        <p className={cn(
                                            "text-[10px]",
                                            selectedSubStudent === student._id ? "text-primary-foreground/70" : "text-slate-400"
                                        )}>
                                            {student.email}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Plan selection */}
                        <div className="md:col-span-1 space-y-4">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Select Subscription Plan</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: "MONTHLY", label: "1 Month License", detail: "₹21 Online / Manual Activation" },
                                    { id: "QUARTERLY", label: "Quarterly License (3 Months)", detail: "₹60 Manual Plan" },
                                    { id: "HALF_YEARLY", label: "6 Months License", detail: "₹120 Manual Plan" }
                                ].map((plan) => (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => setSelectedSubPlan(plan.id as any)}
                                        className={cn(
                                            "text-left p-4 rounded-xl border transition-all duration-200 flex flex-col",
                                            selectedSubPlan === plan.id
                                                ? "bg-indigo-50/50 border-indigo-500 text-slate-900 shadow-sm"
                                                : "bg-slate-50/40 border-slate-200 hover:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <span className="font-extrabold text-sm uppercase">{plan.label}</span>
                                        <span className="text-[10px] text-slate-400 font-bold mt-1">{plan.detail}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activate Action */}
                        <div className="md:col-span-1 flex items-end">
                            <Button
                                onClick={handleActivateSubscription}
                                className="w-full h-14 rounded-2xl gap-2 font-bold text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={!selectedSubStudent || actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                Activate / Extend
                            </Button>
                        </div>
                    </div>

                    {/* Subscription Filter Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-12 mb-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Typing Licenses & Subscriptions</h2>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="Search by student name..."
                                    className="w-full h-10 bg-white border rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none"
                                    value={subListSearch}
                                    onChange={(e) => setSubListSearch(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {[
                                    { id: "all", label: "All" },
                                    { id: "active", label: "Active" },
                                    { id: "expired", label: "Expired" },
                                    { id: "pending", label: "Pending" }
                                ].map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setSubFilter(f.id as SubFilterOption)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                            subFilter === f.id
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Subscriptions Table */}
                    <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">License Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Gateway / Source</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-600 font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                            Loading subscriptions...
                                        </td>
                                    </tr>
                                ) : filteredSubscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-slate-400 italic">
                                            No typing subscriptions found matching filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubscriptions.map((sub) => {
                                        const isExpired = new Date(sub.endDate) <= new Date() || sub.status === "EXPIRED";
                                        const isActive = new Date(sub.endDate) > new Date() && sub.status === "ACTIVE";

                                        return (
                                            <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 capitalize">{sub.userId?.name || "Deleted Student"}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub.userId?.email || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-xs font-bold text-slate-700">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{new Date(sub.startDate).toLocaleDateString()}</span>
                                                        <span className="text-slate-300">→</span>
                                                        <span className="font-extrabold">{new Date(sub.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className="inline-block mt-1 text-[8px] bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider font-black text-slate-400">
                                                        {sub.planType} Plan
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-lg border",
                                                        isActive 
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                            : isExpired
                                                            ? "bg-red-50 text-red-600 border-red-100"
                                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}>
                                                        {isActive ? "Active License" : isExpired ? "Expired" : sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded",
                                                            sub.paymentType === "ONLINE" ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                                                        )}>
                                                            {sub.paymentType}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-slate-400">
                                                            {sub.paymentType === "ONLINE" 
                                                                ? sub.razorpayPaymentId || sub.razorpayOrderId || "Gateway Pending"
                                                                : "Admin Activated"
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className="text-lg font-black text-slate-900">₹{sub.amount}</p>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* EDIT ENROLLMENT MODAL OVERLAY */}
            {isEditOpen && editEnrollment && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <header className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Modify Enrollment</h3>
                                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Change student's enrolled course</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl" 
                                onClick={() => { setIsEditOpen(false); setEditEnrollment(null); }}
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </Button>
                        </header>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Student Name</label>
                                <div className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center font-bold text-slate-800 text-sm">
                                    {data.students.find(s => s._id === editEnrollment.userId)?.name || "Unknown Student"}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select New Course</label>
                                <select
                                    value={editCourseId}
                                    onChange={(e) => setEditCourseId(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Choose a course...</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.title} ({course.type || 'ONLINE'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl text-xs uppercase tracking-widest font-black"
                                    onClick={() => { setIsEditOpen(false); setEditEnrollment(null); }}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl text-xs uppercase tracking-widest font-black text-white bg-primary"
                                    onClick={handleUpdate}
                                    disabled={actionLoading || !editCourseId}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
