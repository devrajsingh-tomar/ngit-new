"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { registerStudent } from "@/app/actions/registration";
import {
    GraduationCap,
    User,
    MapPin,
    BookOpen,
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    Upload,
    Eye,
    EyeOff,
    CheckCircle2,
    Lock,
} from "lucide-react";

const STEPS = [
    { id: 1, title: "Personal Info", icon: User, description: "Basic personal details" },
    { id: 2, title: "Contact Details", icon: MapPin, description: "Address & phone" },
    { id: 3, title: "Academic Info", icon: BookOpen, description: "Course & category" },
    { id: 4, title: "Set Password", icon: Lock, description: "Create your login" },
];

const COURSES = [
    "B.Sc.",
    "PGDCA",
    "LLB",
    "BACHELOR OF ARTS",
    "BACHELOR OF LIBRARY AND INFORMATION SCIENCES",
    "BACHELOR OF BUSINESS ADMINISTRATION",
    "BACHELOR OF COMMERCE",
    "BACHELOR OF COMMERCE (HONORS)",
    "BACHELOR OF ARTS (JMC)",
    "MASTER OF ARTS (BUDDHIST STUDIES)",
    "MASTER OF ARTS (EDUCATION)",
    "MASTER OF ARTS (PUBLIC ADMINISTRATION)",
    "MASTER OF ARTS (HOME SCIENCE)",
    "MASTER OF LIBRARY AND INFORMATION SCIENCES",
    "MASTER OF BUSINESS ADMINISTRATION",
    "MASTER OF COMMERCE",
    "MASTER OF ARTS (JMC)",
    "MASTER OF ARTS (POLITICAL SCIENCES)",
    "MASTER OF ARTS (MATHEMATICS)",
    "MASTER OF ARTS (SOCIOLOGY)",
    "MASTER OF ARTS (HISTORY)",
    "MASTER OF ARTS (HINDI)",
    "MASTER OF ARTS (ECONOMICS)",
    "MASTER OF ARTS (ENGLISH)",
    "NTT (1 Year)",
    "NTT (2 Years)",
    "O Level – ELITE Batch",
    "O Level",
    "A Level",
    "CCC (Course on Computer Concepts)",
    "Tally with GST",
    "DCA (Diploma in Computer Applications)",
    "Web Designing",
    "MS Office",
    "Typing (Hindi/English)",
    "Programming (Python/Java/C++)",
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "Other"];

interface FormData {
    name: string;
    dateOfBirth: string;
    fatherName: string;
    motherName: string;
    aadharNo: string;
    category: string;
    localAddress: string;
    localPhone: string;
    email: string;
    permanentAddress: string;
    permanentPhone: string;
    course: string;
    password: string;
    confirmPassword: string;
    photoUrl: string;

    // Offline Form Fields
    year: string;
    mode: string;
    idNo: string;
    gender: string;
    nationality: string;
    religion: string;
    abcId: string;
    guardianPhone: string;
    whatsappNo: string;
}

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<FormData>({
        name: "",
        dateOfBirth: "",
        fatherName: "",
        motherName: "",
        aadharNo: "",
        category: "General",
        localAddress: "",
        localPhone: "",
        email: "",
        permanentAddress: "",
        permanentPhone: "",
        course: "",
        password: "",
        confirmPassword: "",
        photoUrl: "",

        // Offline Form Fields
        year: new Date().getFullYear().toString(),
        mode: "Offline",
        idNo: "",
        gender: "Male",
        nationality: "Indian",
        religion: "",
        abcId: "",
        guardianPhone: "",
        whatsappNo: "",
    });

    const set = (field: keyof FormData, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setPhotoPreview(result);
                set("photoUrl", result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateStep = (): boolean => {
        if (step === 1) {
            if (!form.name.trim()) { toast.error("Full name is required"); return false; }
            if (!form.dateOfBirth) { toast.error("Date of birth is required"); return false; }
            if (!form.fatherName.trim()) { toast.error("Father's name is required"); return false; }
            if (!form.motherName.trim()) { toast.error("Mother's name is required"); return false; }
            if (form.aadharNo.length !== 12 || !/^\d+$/.test(form.aadharNo)) {
                toast.error("Aadhar number must be exactly 12 digits"); return false;
            }
            if (!form.gender) { toast.error("Gender is required"); return false; }
            if (!form.nationality.trim()) { toast.error("Nationality is required"); return false; }
        }
        if (step === 2) {
            if (!form.localAddress.trim()) { toast.error("Local address is required"); return false; }
            if (!/^\d{10}$/.test(form.localPhone)) { toast.error("Enter a valid 10-digit student phone number"); return false; }
            if (!/^\d{10}$/.test(form.guardianPhone)) { toast.error("Enter a valid 10-digit guardian phone number"); return false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Enter a valid email address"); return false; }
            if (form.whatsappNo && !/^\d{10}$/.test(form.whatsappNo)) {
                toast.error("Whatsapp number must be 10 digits"); return false;
            }
            if (form.abcId && (form.abcId.length !== 12 || !/^\d+$/.test(form.abcId))) {
                toast.error("ABC ID must be exactly 12 digits"); return false;
            }
        }
        if (step === 3) {
            if (!form.course) { toast.error("Please select a course"); return false; }
            if (!form.year.trim()) { toast.error("Year/Session is required"); return false; }
            if (!form.mode) { toast.error("Please select a mode"); return false; }
        }
        if (step === 4) {
            if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return false; }
            if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return false; }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) setStep((s) => Math.min(s + 1, 4));
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setLoading(true);
        try {
            const result = await registerStudent({
                name: form.name,
                dateOfBirth: form.dateOfBirth,
                fatherName: form.fatherName,
                motherName: form.motherName,
                aadharNo: form.aadharNo,
                category: form.category,
                localAddress: form.localAddress,
                localPhone: form.localPhone,
                email: form.email,
                permanentAddress: form.permanentAddress || form.localAddress,
                permanentPhone: form.permanentPhone || form.localPhone,
                course: form.course,
                password: form.password,
                photoUrl: form.photoUrl,
                
                // Offline Form Fields
                year: form.year,
                mode: form.mode,
                idNo: form.idNo,
                gender: form.gender,
                nationality: form.nationality,
                religion: form.religion,
                abcId: form.abcId,
                guardianPhone: form.guardianPhone,
                whatsappNo: form.whatsappNo,
            });
            if (result.success) {
                setSuccess(true);
            } else {
                toast.error(result.error || "Registration failed. Please try again.");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── SUCCESS SCREEN ──────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-12 text-center space-y-6 border border-slate-100">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Student Registered!</h1>
                        <p className="text-slate-500 mt-3 leading-relaxed text-sm">
                            The student's registration is complete and under review. Approve it from the students list.
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Details</p>
                        <p className="text-sm font-bold text-slate-800">{form.name}</p>
                        <p className="text-xs text-slate-500">{form.email} · {form.course}</p>
                    </div>
                    <Link href="/admin/students">
                        <Button className="w-full h-12 rounded-2xl font-bold shadow-lg">
                            Go to Students List
                        </Button>
                    </Link>
                    <Button onClick={() => window.location.reload()} variant="ghost" className="w-full text-slate-500 hover:text-slate-900">
                        Register Another Student
                    </Button>
                </div>
            </div>
        );
    }

    // ── MAIN FORM ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-12 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-xl shadow-primary/30">
                        <GraduationCap className="w-9 h-9" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900">Student Registration</h1>
                    <p className="text-slate-500 mt-2 text-base">Fill in your details to create your NGIT student account</p>
                </div>

                {/* Step Progress */}
                <div className="flex items-center justify-center mb-10 gap-0">
                    {STEPS.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${isDone
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                            : isActive
                                                ? "bg-primary text-white shadow-xl shadow-primary/40 scale-110"
                                                : "bg-white text-slate-400 border-2 border-slate-200"
                                        }`}>
                                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-[10px] font-bold hidden sm:block ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                                        {s.title}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`h-0.5 w-16 sm:w-24 mx-2 mb-4 rounded-full transition-all duration-500 ${step > s.id ? "bg-emerald-400" : "bg-slate-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-primary/5 to-blue-50/80 px-10 py-6 border-b border-slate-100">
                        <p className="text-xs font-bold text-primary/70 uppercase tracking-widest">Step {step} of {STEPS.length}</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">{STEPS[step - 1].title}</h2>
                        <p className="text-slate-500 text-sm mt-0.5">{STEPS[step - 1].description}</p>
                    </div>

                    <div className="p-10">
                        {/* ── STEP 1: Personal Info ── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Name + Photo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="Enter your full name"
                                            value={form.name}
                                            onChange={(e) => set("name", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Upload Photo</label>
                                        <div
                                            className="h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center gap-3 px-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                            onClick={() => fileRef.current?.click()}
                                        >
                                            {photoPreview ? (
                                                <>
                                                    <img src={photoPreview} className="w-8 h-8 rounded-lg object-cover" alt="preview" />
                                                    <span className="text-sm text-emerald-600 font-bold">Photo uploaded ✓</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-400">Choose photo file</span>
                                                </>
                                            )}
                                        </div>
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </div>
                                </div>

                                {/* Father + Mother */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Father's / Guardian's Name <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="Enter father's name"
                                            value={form.fatherName}
                                            onChange={(e) => set("fatherName", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Mother's Name <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="Enter mother's name"
                                            value={form.motherName}
                                            onChange={(e) => set("motherName", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* DOB + Aadhar */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                                        <Input
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={(e) => set("dateOfBirth", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Aadhar No. <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="12-digit Aadhar number"
                                            maxLength={12}
                                            value={form.aadharNo}
                                            onChange={(e) => set("aadharNo", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Sex + Nationality */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Sex / Gender <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => set("gender", e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none font-medium text-slate-800 transition-all focus:bg-white"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Nationality <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="e.g. Indian"
                                            value={form.nationality}
                                            onChange={(e) => set("nationality", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Religion + ABC ID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Religion</label>
                                        <Input
                                            placeholder="e.g. Hindu, Muslim, sikh, etc."
                                            value={form.religion}
                                            onChange={(e) => set("religion", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">ABC ID (Academic Bank of Credits)</label>
                                        <Input
                                            placeholder="12-digit ABC ID (optional)"
                                            maxLength={12}
                                            value={form.abcId}
                                            onChange={(e) => set("abcId", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Contact ── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Local Address <span className="text-red-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter current local address"
                                        value={form.localAddress}
                                        onChange={(e) => set("localAddress", e.target.value)}
                                        className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none resize-none text-sm"
                                    />
                                </div>

                                <div className="flex justify-end -mt-3">
                                    <button
                                        type="button"
                                        onClick={() => set("permanentAddress", form.localAddress)}
                                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                    >
                                        Copy Local Address to Permanent
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Permanent Address <span className="text-red-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter permanent address"
                                        value={form.permanentAddress}
                                        onChange={(e) => set("permanentAddress", e.target.value)}
                                        className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none resize-none text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) => set("email", e.target.value)}
                                        className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Student Mobile No. <span className="text-red-500">*</span></label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            value={form.localPhone}
                                            onChange={(e) => set("localPhone", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Guardian Mobile No. <span className="text-red-500">*</span></label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit guardian mobile number"
                                            maxLength={10}
                                            value={form.guardianPhone}
                                            onChange={(e) => set("guardianPhone", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">WhatsApp Mobile No.</label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit whatsapp number"
                                            maxLength={10}
                                            value={form.whatsappNo}
                                            onChange={(e) => set("whatsappNo", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Permanent Phone (Optional)</label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit permanent phone"
                                            maxLength={10}
                                            value={form.permanentPhone}
                                            onChange={(e) => set("permanentPhone", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Academic ── */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Select Course <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.course}
                                        onChange={(e) => set("course", e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none font-medium text-slate-800 transition-all focus:bg-white"
                                    >
                                        <option value="">-- Select a course --</option>
                                        {COURSES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Year / Session <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="e.g. 2026"
                                            value={form.year}
                                            onChange={(e) => set("year", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Mode <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.mode}
                                            onChange={(e) => set("mode", e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none font-medium text-slate-800 transition-all focus:bg-white"
                                        >
                                            <option value="Offline">Offline</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Id No. (Optional)</label>
                                    <Input
                                        placeholder="Enter Manual Student Id No."
                                        value={form.idNo}
                                        onChange={(e) => set("idNo", e.target.value)}
                                        className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Category <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => set("category", cat)}
                                                className={`h-12 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${form.category === cat
                                                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/50 hover:bg-primary/5"
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary Preview */}
                                {form.name && (
                                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl p-6 border border-slate-200 space-y-3 mt-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration Summary</p>
                                        <div className="flex items-center gap-4">
                                            {photoPreview ? (
                                                <img src={photoPreview} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow" alt="student" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                                    {form.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-black text-slate-900">{form.name}</p>
                                                <p className="text-xs text-slate-500">{form.email}</p>
                                                <p className="text-xs text-primary font-bold mt-0.5">{form.course || "No course selected"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STEP 4: Password ── */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                                    <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                        Set a secure password for your student portal login. You'll use your <strong>email + this password</strong> to sign in after admin approval.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Create Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            value={form.password}
                                            onChange={(e) => set("password", e.target.value)}
                                            className="h-12 rounded-xl px-4 pr-12 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {form.password && (
                                        <div className="flex gap-1 mt-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= i * 2
                                                        ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-yellow-400" : "bg-emerald-500"
                                                        : "bg-slate-200"
                                                    }`} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={form.confirmPassword}
                                            onChange={(e) => set("confirmPassword", e.target.value)}
                                            className={`h-12 rounded-xl px-4 pr-12 bg-slate-50 border-slate-200 focus:border-primary focus:bg-white transition-all ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-300 focus:border-red-400" : ""
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {form.confirmPassword && form.password !== form.confirmPassword && (
                                        <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                                    )}
                                    {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8 && (
                                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passwords match!</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Navigation Buttons ── */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                            {step > 1 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="gap-2 h-12 px-6 rounded-xl font-bold border-2 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </Button>
                            ) : (
                                <Link href="/student/login">
                                    <Button variant="ghost" className="gap-2 h-12 px-6 text-slate-500 hover:text-slate-900">
                                        Already registered? Login
                                    </Button>
                                </Link>
                            )}

                            {step < 4 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="gap-2 h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="gap-2 h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:scale-100"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Submit Registration
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    By registering, you agree to NGIT's Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
