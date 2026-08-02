"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, PlusCircle, User, BookOpen, Edit2, Trash2, Loader2, X } from "lucide-react";
import { 
    getAdminFeeData, 
    assignCourseOffline, 
    deleteEnrollmentAction, 
    updateEnrollmentAction 
} from "@/app/actions/admin-payment";

export default function CourseAssignmentPage() {
    const [data, setData] = useState<{ students: any[], enrollments: any[], payments: any[] }>({
        students: [], enrollments: [], payments: []
    });
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [actionLoading, setActionLoading] = useState(false);

    // Edit Modal State
    const [editEnrollment, setEditEnrollment] = useState<any | null>(null);
    const [editCourseId, setEditCourseId] = useState<string>("");
    const [isEditOpen, setIsEditOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getAdminFeeData({});
            if (res.success) {
                setData(res.data);
            }
            // Use server-side service directly
            const { getCourses } = await import("@/services/CourseService");
            const cData = await getCourses(1, 100);
            if (cData) {
                // Sort OFFLINE courses to the top
                const sorted = [...cData].sort((a: any, b: any) => (b.type === 'OFFLINE' ? 1 : -1));
                setCourses(sorted);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

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

    const filteredStudents = data.students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Offline Course Assignment</h1>
            <p className="text-muted-foreground mt-1">Enroll students manually into offline courses and assign their learning track.</p>

            <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <label className="text-sm font-bold text-slate-700">Select Student</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Type name to filter..."
                            className="w-full h-12 bg-slate-50 border rounded-xl pl-12 pr-4 text-sm outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="h-64 overflow-y-auto border rounded-xl space-y-1 p-2 bg-slate-50">
                        {filteredStudents.map(student => (
                            <div
                                key={student._id}
                                onClick={() => setSelectedStudent(student._id)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors text-sm font-bold ${selectedStudent === student._id ? "bg-primary text-white" : "hover:bg-slate-200 text-slate-700"}`}
                            >
                                {student.name}
                                <p className={`text-[10px] ${selectedStudent === student._id ? "text-primary-foreground/70" : "text-slate-400"}`}>{student.email}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-1 space-y-4">
                    <label className="text-sm font-bold text-slate-700">Select Offline Course</label>
                    <div className="h-[300px] overflow-y-auto border rounded-xl space-y-1 p-2 bg-slate-50">
                        {courses.map(course => (
                            <div
                                key={course._id}
                                onClick={() => setSelectedCourse(course._id)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors text-sm font-bold ${selectedCourse === course._id ? "bg-primary text-white" : "hover:bg-slate-200 text-slate-700"}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{course.title}</span>
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest ${course.type === 'OFFLINE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>{course.type || 'ONLINE'}</span>
                                </div>
                                <p className={`text-[10px] mt-1 ${selectedCourse === course._id ? "text-primary-foreground/70" : "text-slate-400"}`}>Category: {course.category}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-1 flex items-end">
                    <Button
                        onClick={handleAssign}
                        className="w-full h-14 rounded-2xl gap-2 font-bold text-lg"
                        disabled={!selectedStudent || !selectedCourse || actionLoading}
                    >
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                        Enroll Offline
                    </Button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Enrollment List</h2>
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
