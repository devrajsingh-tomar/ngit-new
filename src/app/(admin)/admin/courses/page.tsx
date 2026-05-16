"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Plus, Search, BookOpen, Users,
    CheckCircle, XCircle, Settings, Layers, Trash2
} from "lucide-react";
import Link from "next/link";
import { deleteCourse, getCourses } from "@/services/CourseService";
import { toast } from "sonner";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        async function load() {
            const data = await getCourses();
            setCourses(data);
            setFiltered(data);
            setLoading(false);
        }
        load();
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
        setFiltered(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course? All associated data will be removed.")) return;
        const res = await deleteCourse(id);
        if (res.success) {
            toast.success("Course deleted successfully");
            loadCourses();
        } else {
            toast.error(res.error || "Failed to delete course");
        }
    };

    useEffect(() => {
        const q = query.toLowerCase();
        setFiltered(
            q
                ? courses.filter(c =>
                    c.title.toLowerCase().includes(q) ||
                    c.category?.toLowerCase().includes(q)
                )
                : courses
        );
        setCurrentPage(1);
    }, [query, courses]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedCourses = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">LMS — Courses</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Manage your academic programs, syllabuses, and video content.
                    </p>
                </div>
                <Link href="/admin/courses/new">
                    <Button className="gap-2 h-12 rounded-2xl px-6 shadow-xl shadow-primary/20 font-bold">
                        <Plus className="w-5 h-5" />
                        Create New Course
                    </Button>
                </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Courses", value: courses.length, color: "text-slate-700" },
                    { label: "Published", value: courses.filter(c => c.isPublished).length, color: "text-emerald-600" },
                    { label: "Drafts", value: courses.filter(c => !c.isPublished).length, color: "text-amber-600" },
                    { label: "Categories", value: new Set(courses.map(c => c.category)).size, color: "text-primary" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white border rounded-2xl p-4 text-center shadow-sm">
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search courses or category..."
                    className="w-full bg-white border rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-sm"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-72 bg-slate-100 rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCourses.map((course) => (
                            <div
                                key={course._id}
                                className="bg-white border rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Publish badge */}
                                    <div className="absolute top-3 right-3">
                                        {course.isPublished ? (
                                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1 shadow">
                                                <CheckCircle className="w-3 h-3" /> Published
                                            </span>
                                        ) : (
                                            <span className="bg-slate-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1 shadow">
                                                <XCircle className="w-3 h-3" /> Draft
                                            </span>
                                        )}
                                    </div>
                                    {/* Category pill */}
                                    {course.category && (
                                        <div className="absolute bottom-3 left-3">
                                            <span className="bg-white/90 backdrop-blur text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow">
                                                {course.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed min-h-[2.5rem]">
                                        {course.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 border-t pt-4 mt-4 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5" />
                                            {course.lessonCount ?? "—"} Lessons
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            {course.enrollmentCount ?? "—"} Students
                                        </span>
                                        <span className="flex items-center gap-1.5 ml-auto font-black text-slate-600">
                                            ₹{course.price}
                                        </span>
                                    </div>

                                     {/* Actions */}
                                     <div className="mt-5 grid grid-cols-2 gap-2">
                                         {/* Manage Content → curriculum tab */}
                                         <Link href={`/admin/courses/${course._id}`} className="flex-1">
                                             <Button variant="outline" className="w-full h-11 rounded-2xl font-bold gap-2 border-2 hover:border-primary/40 hover:text-primary transition-all">
                                                 <BookOpen className="w-4 h-4" />
                                                 Content
                                             </Button>
                                         </Link>
                                         {/* Edit → settings tab via query param */}
                                         <div className="flex gap-2">
                                             <Link href={`/admin/courses/${course._id}?tab=settings`} className="flex-1">
                                                 <Button className="w-full h-11 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20 transition-all">
                                                     <Settings className="w-4 h-4" />
                                                     Edit
                                                 </Button>
                                             </Link>
                                             <Button 
                                                 variant="ghost" 
                                                 className="h-11 w-11 shrink-0 rounded-2xl border-2 border-slate-100 text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
                                                 onClick={() => handleDelete(course._id)}
                                             >
                                                 <Trash2 className="w-4 h-4" />
                                             </Button>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && !loading && (
                            <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed rounded-[3rem] text-center">
                                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">
                                    {query ? `No courses match "${query}"` : "No courses yet. Create your first program!"}
                                </p>
                                {!query && (
                                    <Link href="/admin/courses/new">
                                        <Button className="mt-6 rounded-2xl font-bold gap-2 h-12 px-8">
                                            <Plus className="w-4 h-4" /> Create First Course
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        setCurrentPage(prev => prev - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="rounded-xl font-bold"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        setCurrentPage(prev => prev + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="rounded-xl font-bold"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
