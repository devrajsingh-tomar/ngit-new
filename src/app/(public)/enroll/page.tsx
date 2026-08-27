"use client";

import React, { useState, useRef } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { COURSE_CATALOG, CatalogCourse } from "@/lib/course-catalog";
import {
    initiateOnlineEnrollmentPayment,
    completeOnlineEnrollmentAndPayment,
} from "@/app/actions/online-enrollment";
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
    CreditCard,
    Search,
    Sparkles,
    Loader2,
    Zap,
    ArrowRight,
    Phone,
    Mail,
    FileText,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, title: "Personal Info", icon: User, description: "Basic personal details" },
    { id: 2, title: "Contact Details", icon: MapPin, description: "Address & phone numbers" },
    { id: 3, title: "Course Selection", icon: BookOpen, description: "Choose degree or diploma" },
    { id: 4, title: "Pay & Enroll", icon: CreditCard, description: "Password & online payment" },
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "Other"];
const LEVELS = ["ALL", "UG", "PG", "Diploma", "Certificate"];

export default function OnlineEnrollmentPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState("ALL");
    const [searchCourse, setSearchCourse] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Completed Enrollment State
    const [receipt, setReceipt] = useState<{
        studentIdNo: string;
        userName: string;
        userEmail: string;
        courseName: string;
        amountPaid: number;
        paymentId: string;
    } | null>(null);

    const [form, setForm] = useState({
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
        courseId: "",
        password: "",
        confirmPassword: "",
        photoUrl: "",

        // Extra Fields
        year: new Date().getFullYear().toString(),
        mode: "Online",
        gender: "Male",
        nationality: "Indian",
        religion: "",
        abcId: "",
        guardianPhone: "",
        whatsappNo: "",
    });

    const set = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const selectedCourse: CatalogCourse | undefined = COURSE_CATALOG.find(
        (c) => c.id === form.courseId
    );

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
            if (!form.gender) { toast.error("Gender selection is required"); return false; }
        }
        if (step === 2) {
            if (!form.localAddress.trim()) { toast.error("Local address is required"); return false; }
            if (!/^\d{10}$/.test(form.localPhone)) { toast.error("Enter a valid 10-digit student mobile number"); return false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Enter a valid email address"); return false; }
            if (form.guardianPhone && !/^\d{10}$/.test(form.guardianPhone)) {
                toast.error("Guardian phone number must be 10 digits"); return false;
            }
        }
        if (step === 3) {
            if (!form.courseId) { toast.error("Please select a course to enroll"); return false; }
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

    // Handle Payment & Enrollment
    const handlePaymentAndEnroll = async () => {
        if (!validateStep()) return;

        setLoading(true);
        try {
            // Step 1: Initiate Payment Order
            const res = await initiateOnlineEnrollmentPayment({
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
                courseId: form.courseId,
                password: form.password,
                photoUrl: form.photoUrl,
                year: form.year,
                mode: form.mode,
                gender: form.gender,
                nationality: form.nationality,
                religion: form.religion,
                abcId: form.abcId,
                guardianPhone: form.guardianPhone,
                whatsappNo: form.whatsappNo,
            });

            if (!res.success || !res.data) {
                toast.error(res.error || "Failed to initiate payment. Please try again.");
                setLoading(false);
                return;
            }

            const paymentData = res.data;

            // Handle Dummy / Sandbox Payment Mode
            if (paymentData.orderId.startsWith("order_mock_")) {
                toast.info("Processing Sandbox Payment...");
                setTimeout(async () => {
                    const completeRes = await completeOnlineEnrollmentAndPayment({
                        formData: {
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
                            courseId: form.courseId,
                            password: form.password,
                            photoUrl: form.photoUrl,
                            year: form.year,
                            mode: form.mode,
                            gender: form.gender,
                            nationality: form.nationality,
                            religion: form.religion,
                            abcId: form.abcId,
                            guardianPhone: form.guardianPhone,
                            whatsappNo: form.whatsappNo,
                        },
                        razorpayOrderId: paymentData.orderId,
                        razorpayPaymentId: `pay_mock_${Date.now()}`,
                        razorpaySignature: "mock_signature_success",
                    });

                    if (completeRes.success && completeRes.data) {
                        toast.success("Payment Successful! Enrollment completed.");
                        setReceipt(completeRes.data);
                    } else {
                        toast.error(completeRes.error || "Enrollment completion failed.");
                    }
                    setLoading(false);
                }, 1200);
                return;
            }

            // Real Razorpay Checkout Modal
            const options = {
                key: paymentData.key,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "NGIT Academy",
                description: `Course Fee - ${paymentData.courseTitle}`,
                order_id: paymentData.orderId,
                handler: async function (response: any) {
                    setLoading(true);
                    toast.info("Verifying payment...");
                    const completeRes = await completeOnlineEnrollmentAndPayment({
                        formData: {
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
                            courseId: form.courseId,
                            password: form.password,
                            photoUrl: form.photoUrl,
                            year: form.year,
                            mode: form.mode,
                            gender: form.gender,
                            nationality: form.nationality,
                            religion: form.religion,
                            abcId: form.abcId,
                            guardianPhone: form.guardianPhone,
                            whatsappNo: form.whatsappNo,
                        },
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    });

                    if (completeRes.success && completeRes.data) {
                        toast.success("Payment Verified! You are now enrolled.");
                        setReceipt(completeRes.data);
                    } else {
                        toast.error(completeRes.error || "Payment verification failed.");
                    }
                    setLoading(false);
                },
                prefill: {
                    name: paymentData.studentName,
                    email: paymentData.studentEmail,
                    contact: form.localPhone,
                },
                theme: { color: "#2563eb" },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function () {
                toast.error("Payment failed. Please try again.");
                setLoading(false);
            });
            rzp.open();
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    // Filter Courses
    const filteredCourses = COURSE_CATALOG.filter((c) => {
        const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;
        const matchesSearch =
            c.name.toLowerCase().includes(searchCourse.toLowerCase()) ||
            c.category.toLowerCase().includes(searchCourse.toLowerCase());
        return matchesLevel && matchesSearch;
    });

    // ── SUCCESS RECEIPT SCREEN ──────────────────────────────────────
    if (receipt) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-16">
                <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-200">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-xs uppercase px-4 py-1.5 rounded-full">
                            Payment Successful & Account Activated
                        </Badge>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Online Enrollment Receipt</h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Congratulations! Your enrollment registration is completed successfully.
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</span>
                            <span className="font-mono font-black text-primary text-base">{receipt.studentIdNo}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Name</span>
                            <span className="font-bold text-slate-800 text-sm">{receipt.userName}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Account</span>
                            <span className="font-bold text-slate-800 text-sm">{receipt.userEmail}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Course</span>
                            <span className="font-black text-slate-900 text-sm text-right">{receipt.courseName}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fee Paid</span>
                            <span className="font-black text-emerald-600 text-lg">₹{receipt.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction ID</span>
                            <span className="font-mono text-xs font-bold text-slate-600">{receipt.paymentId}</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Link href="/student/login">
                            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                                Login to Student Portal <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={() => window.print()}
                            className="w-full h-12 rounded-xl text-slate-500 font-bold hover:text-slate-900"
                        >
                            Print Receipt
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── MAIN WIZARD ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 relative overflow-hidden font-sans">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full -mr-96 -mt-96 blur-[150px] pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Online Admission Portal 2025-26
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight italic">
                        Online Course <span className="text-primary">Enrollment</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-base max-w-2xl mx-auto">
                        Fill in your student registration details, select your UG/PG or Diploma course, and make secure online fee payment to complete your admission instantly.
                    </p>
                </div>

                {/* Step Progress Tracker */}
                <div className="flex items-center justify-center gap-0">
                    {STEPS.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 ${isDone
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                            : isActive
                                                ? "bg-primary text-white shadow-xl shadow-primary/40 scale-110"
                                                : "bg-white text-slate-400 border-2 border-slate-200"
                                        }`}>
                                        {isDone ? <Check className="w-6 h-6 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                                        {s.title}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`h-1 w-12 sm:w-20 mx-2 mb-4 rounded-full transition-all duration-500 ${step > s.id ? "bg-emerald-400" : "bg-slate-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form Wizard Container */}
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Step Card Header */}
                    <div className="bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">Step {step} of {STEPS.length}</span>
                                <h2 className="text-2xl font-black italic mt-1">{STEPS[step - 1].title}</h2>
                                <p className="text-slate-400 text-xs mt-1">{STEPS[step - 1].description}</p>
                            </div>
                            {selectedCourse && (
                                <Badge className="bg-primary/20 text-white border border-primary/30 font-black text-xs px-4 py-2 rounded-xl self-start md:self-auto">
                                    Selected: {selectedCourse.name} (₹{selectedCourse.fee.toLocaleString()})
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="p-8 md:p-10 space-y-8">
                        {/* ── STEP 1: Personal Info ── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Full Name <span className="text-rose-500">*</span></label>
                                        <Input
                                            placeholder="Enter student's full name"
                                            value={form.name}
                                            onChange={(e) => set("name", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Upload Photo (Optional)</label>
                                        <div
                                            className="h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center gap-3 px-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                            onClick={() => fileRef.current?.click()}
                                        >
                                            {photoPreview ? (
                                                <>
                                                    <img src={photoPreview} className="w-8 h-8 rounded-lg object-cover" alt="preview" />
                                                    <span className="text-xs text-emerald-600 font-bold">Photo Attached ✓</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs text-slate-400 font-bold">Choose Passport Size Photo</span>
                                                </>
                                            )}
                                        </div>
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Father's Name <span className="text-rose-500">*</span></label>
                                        <Input
                                            placeholder="Enter father's name"
                                            value={form.fatherName}
                                            onChange={(e) => set("fatherName", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Mother's Name <span className="text-rose-500">*</span></label>
                                        <Input
                                            placeholder="Enter mother's name"
                                            value={form.motherName}
                                            onChange={(e) => set("motherName", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Date of Birth <span className="text-rose-500">*</span></label>
                                        <Input
                                            type="date"
                                            value={form.dateOfBirth}
                                            onChange={(e) => set("dateOfBirth", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Aadhar Number <span className="text-rose-500">*</span></label>
                                        <Input
                                            placeholder="12-digit Aadhar number"
                                            maxLength={12}
                                            value={form.aadharNo}
                                            onChange={(e) => set("aadharNo", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Gender <span className="text-rose-500">*</span></label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => set("gender", e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Nationality</label>
                                        <Input
                                            placeholder="Indian"
                                            value={form.nationality}
                                            onChange={(e) => set("nationality", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Category <span className="text-rose-500">*</span></label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => set("category", cat)}
                                                    className={cn(
                                                        "h-11 rounded-xl text-xs font-bold transition-all border",
                                                        form.category === cat
                                                            ? "bg-primary text-white border-primary shadow-md"
                                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                                    )}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">ABC ID (Optional)</label>
                                        <Input
                                            placeholder="12-digit Academic Bank of Credits ID"
                                            maxLength={12}
                                            value={form.abcId}
                                            onChange={(e) => set("abcId", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Contact Details ── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Local Address <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter present local address"
                                        value={form.localAddress}
                                        onChange={(e) => set("localAddress", e.target.value)}
                                        className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary font-bold text-sm outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end -mt-2">
                                    <button
                                        type="button"
                                        onClick={() => set("permanentAddress", form.localAddress)}
                                        className="text-xs text-primary font-bold hover:underline"
                                    >
                                        Same as Local Address
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Permanent Address <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter permanent address"
                                        value={form.permanentAddress}
                                        onChange={(e) => set("permanentAddress", e.target.value)}
                                        className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary font-bold text-sm outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Student Mobile No. <span className="text-rose-500">*</span></label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit student mobile"
                                            maxLength={10}
                                            value={form.localPhone}
                                            onChange={(e) => set("localPhone", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Email Address <span className="text-rose-500">*</span></label>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={(e) => set("email", e.target.value)}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Guardian Mobile No.</label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit guardian mobile"
                                            maxLength={10}
                                            value={form.guardianPhone}
                                            onChange={(e) => set("guardianPhone", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">WhatsApp Number</label>
                                        <Input
                                            type="tel"
                                            placeholder="10-digit whatsapp mobile"
                                            maxLength={10}
                                            value={form.whatsappNo}
                                            onChange={(e) => set("whatsappNo", e.target.value.replace(/\D/g, ""))}
                                            className="h-12 rounded-xl px-4 bg-slate-50 border-slate-200 focus:border-primary font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Course Selection ── */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {/* Search & Filter Pills */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                                        {LEVELS.map((lvl) => (
                                            <button
                                                key={lvl}
                                                type="button"
                                                onClick={() => setSelectedLevel(lvl)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0",
                                                    selectedLevel === lvl
                                                        ? "bg-slate-900 text-white shadow-md"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                )}
                                            >
                                                {lvl === "ALL" ? "All Courses" : lvl}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Search programme..."
                                            value={searchCourse}
                                            onChange={(e) => setSearchCourse(e.target.value)}
                                            className="pl-9 h-11 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Course List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                                    {filteredCourses.map((c) => {
                                        const isSelected = form.courseId === c.id;
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => set("courseId", c.id)}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 group",
                                                    isSelected
                                                        ? "bg-primary/5 border-primary shadow-lg ring-2 ring-primary/20"
                                                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                                                )}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest border-none", isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600")}>
                                                            {c.level}
                                                        </Badge>
                                                        {isSelected && (
                                                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-primary transition-colors">{c.name}</h3>
                                                    <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">{c.description}</p>
                                                </div>

                                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Course Fee</span>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-slate-900">₹{c.fee.toLocaleString()}</span>
                                                        {c.feeNote && <span className="text-[9px] font-bold text-amber-600 block">{c.feeNote}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4: Pay & Enroll ── */}
                        {step === 4 && (
                            <div className="space-y-6">
                                {/* Create Password */}
                                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-primary" /> Create Student Portal Password
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700">Set Password <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Min. 8 characters"
                                                    value={form.password}
                                                    onChange={(e) => set("password", e.target.value)}
                                                    className="h-12 rounded-xl px-4 pr-10 bg-white border-slate-200 font-bold text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700">Confirm Password <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Re-enter password"
                                                    value={form.confirmPassword}
                                                    onChange={(e) => set("confirmPassword", e.target.value)}
                                                    className="h-12 rounded-xl px-4 pr-10 bg-white border-slate-200 font-bold text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order & Enrollment Summary */}
                                {selectedCourse && (
                                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Enrollment Order Summary</p>
                                                <h4 className="text-xl font-black italic mt-1">{selectedCourse.name}</h4>
                                            </div>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-xs px-3 py-1">
                                                {selectedCourse.level}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-slate-300">
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                                                <span className="font-bold text-white text-sm">{form.name}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-slate-400">Email</span>
                                                <span className="font-bold text-white text-sm truncate block">{form.email}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-slate-400">Mobile</span>
                                                <span className="font-bold text-white text-sm">{form.localPhone}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 block">Total Admission Fee</span>
                                                <span className="text-3xl font-black text-white">₹{selectedCourse.fee.toLocaleString()}</span>
                                                {selectedCourse.feeNote && <span className="text-[10px] text-amber-400 block">{selectedCourse.feeNote}</span>}
                                            </div>
                                            <Button
                                                onClick={handlePaymentAndEnroll}
                                                disabled={loading}
                                                className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                                            >
                                                {loading ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                                ) : (
                                                    <>Proceed to Pay & Enroll <Zap className="w-4 h-4 fill-white" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
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
                                    <Button variant="ghost" className="h-12 px-4 text-slate-500 text-xs font-bold hover:text-slate-900">
                                        Already Registered? Login
                                    </Button>
                                </Link>
                            )}

                            {step < 4 && (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="gap-2 h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
