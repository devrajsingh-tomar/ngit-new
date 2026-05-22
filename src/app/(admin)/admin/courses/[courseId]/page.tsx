"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft, Plus, Video, FileText, Brain,
    Trash2, GripVertical, X, Loader2, Save,
    Eye, EyeOff, Users, BookOpen, Settings,
    CheckCircle, Clock, Globe, Lock, Pencil, Upload
} from "lucide-react";
import { toast } from "sonner";
import {
    getCourseForAdmin, createLesson, deleteLesson,
    updateCourse, updateLesson, togglePublish, getQuizzesForCourse
} from "@/app/actions/courses";
import { getPaperSets } from "@/app/actions/paperSets";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { uploadImageAction } from "@/app/actions/upload";

type Tab = "curriculum" | "settings";

const LESSON_TYPES = [
    { value: "VIDEO", label: "Video Lesson", icon: Video, color: "text-indigo-600", bg: "bg-indigo-50" },
    { value: "PDF", label: "PDF / Document", icon: FileText, color: "text-red-600", bg: "bg-red-50" },
    { value: "QUIZ", label: "Quiz / Test", icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
    { value: "YOUTUBE_LIVE", label: "YouTube Live", icon: Globe, color: "text-red-500", bg: "bg-red-50" },
    { value: "YOUTUBE_RECORDED", label: "YouTube Rec.", icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
];

const EMPTY_LESSON = {
    title: "", description: "", contentUrl: "",
    type: "VIDEO", duration: "", isFree: false,
    quizId: "", videoUrl: "", scheduledDate: "",
    scheduledTime: "",
};

export default function CourseContentPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    // ── Data ──────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [enrolled, setEnrolled] = useState(0);
    const [tab, setTab] = useState<Tab>("curriculum");

    // Auto-open tab from ?tab= URL param (?tab=settings opens Course Settings)
    const searchParams = useSearchParams();
    useEffect(() => {
        const t = searchParams.get("tab") as Tab | null;
        if (t === "settings" || t === "curriculum") setTab(t);
    }, [searchParams]);

    // ── Add / Edit Lesson Modal ──────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [editLesson, setEditLesson] = useState<any | null>(null);
    const [lessonForm, setLessonForm] = useState({ ...EMPTY_LESSON });
    const [saving, setSaving] = useState(false);
    const [quizzes, setQuizzes] = useState<any[]>([]); // quizzes for this course
    const [paperSets, setPaperSets] = useState<any[]>([]); // available paper sets

    // ── Course Settings Edit ─────────────────────────────────
    const [courseForm, setCourseForm] = useState<any>({});
    const [savingCourse, setSavingCourse] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploading, setUploading] = useState(false);

    // ── Load ─────────────────────────────────────────────────
    useEffect(() => { if (courseId) load(); }, [courseId]);


    const load = async () => {
        setLoading(true);
        const res = await getCourseForAdmin(courseId);
        if (res.success) {
            setCourse(res.course);
            setLessons(res.lessons ?? []);
            setEnrolled(res.enrollmentCount ?? 0);
            setCourseForm({
                title: res.course.title,
                description: res.course.description,
                price: res.course.price,
                category: res.course.category,
                thumbnail: res.course.thumbnail,
                syllabusUrl: res.course.syllabusUrl ?? "",
                paperSetIds: res.course.paperSetIds || [],
            });
        } else {
            toast.error(res.error || "Failed to load course");
            router.push("/admin/courses");
        }
        setLoading(false);
        const pRes = await getPaperSets();
        if (pRes.success) setPaperSets(pRes.paperSets);
    };

    // ── Publish Toggle ────────────────────────────────────────
    const handlePublish = async () => {
        setPublishing(true);
        const next = !course.isPublished;
        const res = await togglePublish(courseId, next);
        if (res.success) {
            setCourse((c: any) => ({ ...c, isPublished: next }));
            toast.success(next ? "Course published! 🚀" : "Course set to Draft.");
        } else {
            toast.error(res.error || "Failed to update");
        }
        setPublishing(false);
    };

    // ── Save Course Settings ──────────────────────────────────
    const handleSaveCourse = async () => {
        setSavingCourse(true);
        const res = await updateCourse(courseId, courseForm);
        if (res.success) {
            setCourse(res.course);
            toast.success("Course details saved!");
        } else {
            toast.error(res.error || "Failed to save");
        }
        setSavingCourse(false);
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Uploading course thumbnail...");
        
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("title", `Course Thumbnail - ${courseForm.title || (course && course.title) || "Course"}`);
            formDataUpload.append("category", "Courses");

            const res = await uploadImageAction(formDataUpload);
            if (res.success && res.url) {
                setCourseForm((prev: any) => ({ ...prev, thumbnail: res.url }));
                toast.success("Thumbnail uploaded successfully!", { id: toastId });
            } else {
                toast.error(res.error || "Failed to upload image", { id: toastId });
            }
        } catch (err) {
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    // ── Open modal for Add / Edit ─────────────────────────────
    const openAdd = async () => {
        setEditLesson(null);
        setLessonForm({ ...EMPTY_LESSON });
        setModalOpen(true);
        const q = await getQuizzesForCourse(courseId);
        if (q.success) setQuizzes(q.quizzes ?? []);
    };

    const openEdit = async (lesson: any) => {
        setEditLesson(lesson);
        setLessonForm({
            title: lesson.title,
            description: lesson.description ?? "",
            contentUrl: lesson.contentUrl ?? "",
            type: lesson.type,
            duration: lesson.duration?.toString() ?? "",
            isFree: lesson.isFree,
            quizId: lesson.quizId ?? "",
            videoUrl: lesson.videoUrl ?? "",
            scheduledDate: lesson.scheduledDate ? new Date(lesson.scheduledDate).toISOString().split('T')[0] : "",
            scheduledTime: lesson.scheduledTime ?? "",
        });
        setModalOpen(true);
        const q = await getQuizzesForCourse(courseId);
        if (q.success) setQuizzes(q.quizzes ?? []);
    };

    // ── Save Lesson (Add or Edit) ─────────────────────────────
    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lessonForm.title.trim()) { toast.error("Lesson title is required"); return; }
        if (lessonForm.type === "VIDEO" && !lessonForm.contentUrl.trim()) {
            toast.error("Video URL is required"); return;
        }
        if ((lessonForm.type === "YOUTUBE_LIVE" || lessonForm.type === "YOUTUBE_RECORDED") && !lessonForm.videoUrl?.trim()) {
            toast.error("YouTube URL is required"); return;
        }
        if (lessonForm.type === "PDF" && !lessonForm.contentUrl.trim()) {
            toast.error("PDF URL is required"); return;
        }
        if (lessonForm.type === "QUIZ" && !lessonForm.quizId) {
            toast.error("Please select a quiz to link to this lesson"); return;
        }

        setSaving(true);
        try {
            if (editLesson) {
                const res = await updateLesson(editLesson._id, courseId, lessonForm);
                if (res.success) { toast.success("Lesson updated!"); setModalOpen(false); load(); }
                else toast.error(res.error || "Update failed");
            } else {
                const res = await createLesson(courseId, lessonForm);
                if (res.success) { toast.success("Lesson added!"); setModalOpen(false); load(); }
                else toast.error(res.error || "Failed to add lesson");
            }
        } finally {
            setSaving(false);
        }
    };


    // ── Delete Lesson ─────────────────────────────────────────
    const handleDelete = async (lessonId: string) => {
        if (!confirm("Delete this lesson permanently?")) return;
        const res = await deleteLesson(lessonId, courseId);
        if (res.success) { toast.success("Lesson deleted"); load(); }
        else toast.error("Failed to delete");
    };

    // ── Loading ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }
    if (!course) return null;

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">

            {/* ── Page Header ──────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/courses">
                        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 line-clamp-1">
                                {course.title}
                            </h1>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1",
                                course.isPublished
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                            )}>
                                {course.isPublished
                                    ? <><Globe className="w-3 h-3" /> Published</>
                                    : <><Lock className="w-3 h-3" /> Draft</>
                                }
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400">
                            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{lessons.length} Lessons</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{enrolled} Enrolled</span>
                            <span className="flex items-center gap-1"><span className="font-bold text-slate-600">₹{course.price}</span></span>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handlePublish}
                        disabled={publishing}
                        className={cn(
                            "h-11 rounded-2xl font-bold gap-2 border-2",
                            course.isPublished
                                ? "border-slate-200 hover:border-red-200 hover:text-red-600"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        )}
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                        }
                        {course.isPublished ? "Unpublish" : "Publish Course"}
                    </Button>
                    <Button onClick={openAdd} className="h-11 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20 px-6">
                        <Plus className="w-5 h-5" /> Add Lesson
                    </Button>
                </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                {([
                    { id: "curriculum", label: "Curriculum", icon: BookOpen },
                    { id: "settings", label: "Course Settings", icon: Settings },
                ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                            tab === id ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* ── CURRICULUM TAB ─────────────────────────── */}
            {tab === "curriculum" && (
                <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Course Curriculum</h2>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">
                                Build your course content step by step. Each lesson appears in this order for students.
                            </p>
                        </div>
                        <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl text-slate-500 font-black">
                            {lessons.length} Lessons
                        </span>
                    </div>

                    {lessons.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                <Video className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No lessons yet</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mt-1 text-sm">
                                Start building your course by adding the first lesson — video, PDF, or quiz.
                            </p>
                            <Button onClick={openAdd} className="mt-6 rounded-2xl font-bold gap-2 h-12 px-8 shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" /> Add First Lesson
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lessons.map((lesson, index) => {
                                const typeMeta = LESSON_TYPES.find(t => t.value === lesson.type) ?? LESSON_TYPES[0];
                                const Icon = typeMeta.icon;
                                return (
                                    <div
                                        key={lesson._id}
                                        className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/20 hover:shadow-md transition-all"
                                    >
                                        {/* Drag handle */}
                                        <div className="text-slate-200 cursor-grab hover:text-slate-400 shrink-0">
                                            <GripVertical className="w-5 h-5" />
                                        </div>

                                        {/* Step number */}
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                                            {index + 1}
                                        </div>

                                        {/* Type icon */}
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeMeta.bg, typeMeta.color)}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 line-clamp-1">{lesson.title}</h4>
                                            {lesson.description && (
                                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{lesson.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded", typeMeta.bg, typeMeta.color)}>
                                                    {typeMeta.label}
                                                </span>
                                                {lesson.duration && (
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                        <Clock className="w-3 h-3" />{lesson.duration}
                                                    </span>
                                                )}
                                                {lesson.isFree && (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                        Free Preview
                                                    </span>
                                                )}
                                                {lesson.contentUrl && lesson.type !== "YOUTUBE_LIVE" && lesson.type !== "YOUTUBE_RECORDED" && (
                                                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                                                        {lesson.contentUrl}
                                                    </span>
                                                )}
                                                {lesson.videoId && (lesson.type === "YOUTUBE_LIVE" || lesson.type === "YOUTUBE_RECORDED") && (
                                                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                                                        YouTube ID: {lesson.videoId}
                                                    </span>
                                                )}
                                                {lesson.status === "live" && <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded animate-pulse">LIVE NOW</span>}
                                                {lesson.status === "upcoming" && lesson.type === "YOUTUBE_LIVE" && <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded">UPCOMING</span>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Button
                                                onClick={() => openEdit(lesson)}
                                                variant="ghost" size="icon"
                                                className="rounded-xl hover:bg-primary/10 hover:text-primary text-slate-300"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(lesson._id)}
                                                variant="ghost" size="icon"
                                                className="rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add more */}
                            <button
                                onClick={openAdd}
                                className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-sm font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Another Lesson
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── SETTINGS TAB ─────────────────────────────── */}
            {tab === "settings" && (
                <div className="bg-white border rounded-[2.5rem] shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Course Settings</h2>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">Edit the course details visible to students and on the public site.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Course Title <span className="text-red-400">*</span></label>
                            <Input
                                value={courseForm.title}
                                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                className="h-14 rounded-2xl px-5 text-base font-bold bg-slate-50/50"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Description <span className="text-red-400">*</span></label>
                            <Textarea
                                value={courseForm.description}
                                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                className="min-h-[120px] rounded-2xl px-5 py-4 bg-slate-50/50 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Price (₹)</label>
                                <Input
                                    type="number"
                                    value={courseForm.price}
                                    onChange={e => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                                    className="h-12 rounded-2xl px-5 bg-slate-50/50"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Category</label>
                                <select
                                    value={courseForm.category}
                                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                    className="flex h-12 w-full rounded-2xl border border-input bg-slate-50/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option>Academic</option>
                                    <option>Competitive Exams</option>
                                    <option>Skill Development</option>
                                    <option>Management</option>
                                </select>
                            </div>

                            {/* Duration label */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Duration Label</label>
                                <Input
                                    placeholder='e.g. "6 Months" or "120 Hours"'
                                    value={courseForm.duration ?? ""}
                                    onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                                    className="h-12 rounded-2xl px-5 bg-slate-50/50"
                                />
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700">Course Thumbnail</label>
                            <input 
                                type="file" 
                                id="course-thumbnail-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                            />
                            <div 
                                onClick={() => document.getElementById("course-thumbnail-upload")?.click()}
                                className="w-full aspect-video rounded-2xl bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 group hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer overflow-hidden shadow-inner relative"
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-xs font-bold text-slate-400">Uploading image...</p>
                                    </div>
                                ) : courseForm.thumbnail ? (
                                    <img src={courseForm.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-2 opacity-30 group-hover:scale-110 group-hover:text-primary transition-all" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Identity Visual</p>
                                    </>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Asset URL / Secure Source</label>
                                <Input
                                    placeholder="Enter secure image URL..."
                                    className="h-12 rounded-2xl px-5 font-mono text-xs bg-slate-50/50"
                                    value={courseForm.thumbnail}
                                    onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Syllabus URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Syllabus PDF URL (optional)</label>
                            <Input
                                placeholder="https://drive.google.com/..."
                                value={courseForm.syllabusUrl}
                                onChange={e => setCourseForm({ ...courseForm, syllabusUrl: e.target.value })}
                                className="h-12 rounded-2xl px-5 font-mono text-xs bg-slate-50/50"
                            />
                        </div>

                        {/* Paper Sets Selection */}
                        <div className="space-y-4 pt-4 border-t">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Assign Paper Blueprints</label>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select mock test templates available for this course</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                                {paperSets.map(ps => (
                                    <label key={ps._id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                            checked={courseForm.paperSetIds?.includes(ps._id)}
                                            onChange={(e) => {
                                                const newIds = e.target.checked 
                                                    ? [...(courseForm.paperSetIds || []), ps._id]
                                                    : (courseForm.paperSetIds || []).filter((id: string) => id !== ps._id);
                                                setCourseForm({...courseForm, paperSetIds: newIds});
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-700 line-clamp-1">{ps.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ps.subject} • {ps.questions?.length} Qs</p>
                                        </div>
                                    </label>
                                ))}
                                {paperSets.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-slate-400 italic text-sm">
                                        No paper blueprints found. Create some in the Mock Test manager.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                        <Button
                            onClick={handleSaveCourse}
                            disabled={savingCourse}
                            className="h-13 px-10 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20 text-base"
                        >
                            {savingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {savingCourse ? "Saving..." : "Save Changes"}
                        </Button>
                        <p className="text-xs text-slate-400">
                            Changes are saved immediately and reflected on the public site.
                        </p>
                    </div>
                </div>
            )}

            {/* ──────────────────────────────────────────────────────────
                Add / Edit Lesson Modal
            ──────────────────────────────────────────────────────────── */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editLesson ? "Edit Lesson" : "Add New Lesson"}
                                </h2>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    {editLesson ? "Update the lesson details below." : "Fill in the details for your new lesson."}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSaveLesson} className="space-y-5">
                            {/* Lesson Type Picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Lesson Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {LESSON_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
                                        <button
                                            type="button"
                                            key={value}
                                            onClick={() => setLessonForm({ ...lessonForm, type: value })}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-center",
                                                lessonForm.type === value
                                                    ? "border-primary bg-primary/5 shadow-md"
                                                    : "border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bg, color)}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 leading-tight">{label}</span>
                                            {lessonForm.type === value && (
                                                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Lesson Title <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    required
                                    placeholder="e.g. Introduction to Calculus"
                                    className="h-12 rounded-xl font-bold"
                                    value={lessonForm.title}
                                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Short Description (optional)
                                </label>
                                <Textarea
                                    placeholder="What will students learn in this lesson?"
                                    className="rounded-xl resize-none"
                                    rows={2}
                                    value={lessonForm.description}
                                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                                />
                            </div>

                            {/* ── Type-specific Content Fields ── */}

                            {/* VIDEO: YouTube URL */}
                            {lessonForm.type === "VIDEO" && (
                                <div className="space-y-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <label className="text-xs font-black uppercase tracking-wider text-indigo-600">
                                        Video URL / YouTube ID <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://example.com/video.mp4 or YouTube URL"
                                        className="h-11 rounded-xl font-mono text-xs bg-white border-indigo-200"
                                        value={lessonForm.contentUrl}
                                        onChange={e => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                                    />
                                    <div className="text-[10px] text-indigo-500 space-y-0.5">
                                        <p>✅ <strong>Direct MP4:</strong> https://example.com/video.mp4</p>
                                        <p>✅ <strong>YouTube watch URL:</strong> https://youtube.com/watch?v=dQw4w9WgXcQ</p>
                                    </div>
                                </div>
                            )}

                            {/* YOUTUBE_LIVE / YOUTUBE_RECORDED */}
                            {(lessonForm.type === "YOUTUBE_LIVE" || lessonForm.type === "YOUTUBE_RECORDED") && (
                                <div className="space-y-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-red-600">
                                            YouTube URL <span className="text-red-400">*</span>
                                        </label>
                                        <Input
                                            placeholder="https://youtube.com/watch?v=... or youtu.be/..."
                                            className="h-11 rounded-xl font-mono text-xs bg-white border-red-200"
                                            value={lessonForm.videoUrl || ""}
                                            onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                        />
                                    </div>
                                    
                                    {lessonForm.type === "YOUTUBE_LIVE" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-red-600">Scheduled Date</label>
                                                <Input
                                                    type="date"
                                                    className="h-11 rounded-xl bg-white border-red-200"
                                                    value={lessonForm.scheduledDate || ""}
                                                    onChange={e => setLessonForm({ ...lessonForm, scheduledDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-red-600">Scheduled Time</label>
                                                <Input
                                                    type="time"
                                                    className="h-11 rounded-xl bg-white border-red-200"
                                                    value={lessonForm.scheduledTime || ""}
                                                    onChange={e => setLessonForm({ ...lessonForm, scheduledTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PDF: Google Drive / Direct URL */}
                            {lessonForm.type === "PDF" && (
                                <div className="space-y-2 p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <label className="text-xs font-black uppercase tracking-wider text-red-600">
                                        PDF / Document URL <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://drive.google.com/file/d/... or https://example.com/doc.pdf"
                                        className="h-11 rounded-xl font-mono text-xs bg-white border-red-200"
                                        value={lessonForm.contentUrl}
                                        onChange={e => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                                    />
                                    <div className="text-[10px] text-red-500 space-y-0.5">
                                        <p>✅ <strong>Google Drive:</strong> share link set to &quot;Anyone with link can view&quot;</p>
                                        <p>✅ <strong>Direct PDF:</strong> https://example.com/syllabus.pdf</p>
                                        <p>✅ <strong>S3 / CDN link:</strong> any publicly accessible PDF URL</p>
                                    </div>
                                    {lessonForm.contentUrl && (
                                        <a
                                            href={lessonForm.contentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 underline hover:text-red-800"
                                        >
                                            <FileText className="w-3 h-3" /> Preview PDF ↗
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* QUIZ: Select from existing quizzes */}
                            {lessonForm.type === "QUIZ" && (
                                <div className="space-y-2 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <label className="text-xs font-black uppercase tracking-wider text-purple-600">
                                        Link to a Quiz <span className="text-red-400">*</span>
                                    </label>

                                    {quizzes.length === 0 ? (
                                        <div className="py-6 text-center border-2 border-dashed border-purple-200 rounded-xl bg-white">
                                            <Brain className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-slate-600">No quizzes found for this course</p>
                                            <p className="text-xs text-slate-400 mt-1">Create a quiz first, then come back to link it.</p>
                                            <Link
                                                href={`/admin/mock-tests/new?courseId=${courseId}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 mt-3 text-xs font-black text-purple-600 hover:text-purple-800 underline"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Create a Quiz ↗
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {quizzes.map((quiz: any) => (
                                                <label
                                                    key={quiz._id}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all",
                                                        lessonForm.quizId === quiz._id
                                                            ? "border-purple-400 bg-purple-50 shadow-sm"
                                                            : "border-transparent bg-white hover:border-purple-200"
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="selectedQuiz"
                                                        value={quiz._id}
                                                        checked={lessonForm.quizId === quiz._id}
                                                        onChange={() => setLessonForm({ ...lessonForm, quizId: quiz._id })}
                                                        className="accent-purple-600"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{quiz.title}</p>
                                                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 font-bold">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quiz.timeLimit} min</span>
                                                            <span>{quiz.totalMarks} marks</span>
                                                            <span>Pass: {quiz.passingMarks}</span>
                                                            {quiz.isMockTest && <span className="text-purple-600 bg-purple-50 px-1.5 rounded">Mock</span>}
                                                            {quiz.isPublished
                                                                ? <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded">Published</span>
                                                                : <span className="text-amber-600 bg-amber-50 px-1.5 rounded">Draft</span>
                                                            }
                                                        </div>
                                                    </div>
                                                    {lessonForm.quizId === quiz._id && (
                                                        <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-purple-500 mt-2">
                                        Students will take this quiz as part of the lesson. Scores are auto-recorded.
                                    </p>
                                </div>
                            )}



                            {/* Duration */}
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Duration (optional)</label>
                                <Input
                                    placeholder='e.g. "45:00" or "45 mins"'
                                    className="h-11 rounded-xl"
                                    value={lessonForm.duration}
                                    onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                />
                            </div>

                            {/* Free Preview */}
                            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    checked={lessonForm.isFree}
                                    onChange={e => setLessonForm({ ...lessonForm, isFree: e.target.checked })}
                                />
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Enable Free Preview</p>
                                    <p className="text-xs text-slate-400">Non-enrolled users can view this lesson for free.</p>
                                </div>
                            </label>

                            {/* Footer Buttons */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="rounded-2xl font-bold h-13">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving} className="rounded-2xl font-bold gap-2 h-13 shadow-lg shadow-primary/20">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? "Saving..." : editLesson ? "Update Lesson" : "Add Lesson"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
