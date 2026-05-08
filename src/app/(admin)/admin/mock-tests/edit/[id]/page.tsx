"use client";

import { useEffect, useState, use } from "react";
import { 
    ChevronLeft, 
    Save, 
    Calendar,
    Clock,
    Settings,
    Shield,
    Info,
    CheckCircle2,
    Layers,
    Trophy,
    BadgeDollarSign,
    Gamepad2,
    Monitor,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllCourses } from "@/app/actions/courses";
import { getPaperSets } from "@/app/actions/paperSets";
import { getAdminQuiz, updateAdminQuiz } from "@/app/actions/admin-quizzes";
import { ImageUpload } from "@/components/ui/image-upload";

export default function EditMockTestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [paperSets, setPaperSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<any>({
        title: "",
        description: "",
        courseId: "",
        examCode: "M1-R5",
        isMockTest: false,
        paperSetId: "",
        pricing: {
            type: "FREE",
            amount: 0,
            currency: "INR"
        },
        settings: {
            timeLimit: 90,
            totalMarks: 0,
            passingMarks: 40,
            shuffleQuestions: true,
            shuffleOptions: true,
            availableLanguages: ["en"]
        },
        schedule: {
            startDate: "",
            endDate: "",
            gracePeriodMinutes: 15
        },
        security: {
            maxAttempts: 1,
            preventTabSwitch: true,
            requireFullscreen: true,
            trackIpDevice: true
        },
        instructions: {
            en: ""
        }
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        const [cRes, pRes, qRes] = await Promise.all([
            getAllCourses(), 
            getPaperSets(),
             getAdminQuiz(id)
        ]);
        
        if (cRes.success) setCourses(cRes.courses);
        if (pRes.success) setPaperSets(pRes.paperSets);
        
        if (qRes.success) {
            const q = qRes.quiz;
            setFormData({
                ...q,
                courseId: q.courseId?._id || q.courseId,
                schedule: {
                    ...q.schedule,
                    startDate: q.schedule.startDate ? new Date(q.schedule.startDate).toISOString().slice(0, 16) : "",
                    endDate: q.schedule.endDate ? new Date(q.schedule.endDate).toISOString().slice(0, 16) : ""
                }
            });
        } else {
            toast.error(qRes.error);
            router.push("/admin/mock-tests");
        }
        setLoading(false);
    };

    const handlePaperSetSelect = (setId: string) => {
        const selected = paperSets.find(p => p._id === setId);
        if (selected) {
            setFormData({
                ...formData,
                paperSetId: setId,
                settings: {
                    ...formData.settings,
                    timeLimit: selected.duration,
                    totalMarks: selected.totalMarks
                },
                questions: selected.questions || []
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.courseId) {
            toast.error("Please fill all required fields.");
            return;
        }

        setSubmitting(true);
        const res = await updateAdminQuiz(id, formData);
        if (res.success) {
            toast.success("Mock Test updated successfully!");
            router.push("/admin/mock-tests");
        } else {
            toast.error(res.error);
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-20 text-center font-black">Loading assessment...</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <Link href="/admin/mock-tests">
                    <Button variant="ghost" className="rounded-xl gap-2 font-bold">
                        <ChevronLeft className="w-5 h-5" /> Mock Portal
                    </Button>
                </Link>
                <div className="flex gap-4">
                     <Badge className="bg-primary/10 text-primary border-none self-center h-fit px-4 py-2 rounded-xl text-xs font-black">EDITING MODE</Badge>
                    <Button 
                        className="rounded-2xl h-14 px-12 font-black gap-2 shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Panel: Primary Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Gamepad2 className="w-8 h-8 text-primary" />
                                Assessment Core Information
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Update the identity and basic details of this mock test.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 ml-2">Mock Test Title</Label>
                                <Input 
                                    className="h-16 rounded-2xl bg-slate-50 border-none px-6 font-black text-xl placeholder:text-slate-300"
                                    placeholder="e.g. All India JEE Main Mock 01"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="font-bold text-slate-700 ml-2">Exam Header Logo</Label>
                                <ImageUpload 
                                    value={formData.logo || ""}
                                    onChange={(url) => setFormData({...formData, logo: url})}
                                    label="Upload Exam Logo"
                                    className="max-w-xs"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">If left blank, the default N-GIT logo will be used in the exam header.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 ml-2">Description / Short Intro</Label>
                                <Textarea 
                                    className="min-h-[100px] rounded-2xl bg-slate-50 border-none p-6 font-medium italic focus-visible:ring-primary/20"
                                    placeholder="Briefly describe the purpose of this test..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 ml-2">Target Course</Label>
                                    <select 
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-900 outline-none"
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 ml-2">Exam Code</Label>
                                    <select 
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-900 outline-none"
                                        value={formData.examCode}
                                        onChange={(e) => setFormData({...formData, examCode: e.target.value})}
                                    >
                                        <option value="M1-R5">M1-R5</option>
                                        <option value="M2-R5">M2-R5</option>
                                        <option value="M3-R5">M3-R5</option>
                                        <option value="M4-R5">M4-R5</option>
                                    </select>
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <Label className="font-bold text-slate-700 ml-2">Change Paper Set (Optional)</Label>
                                    <select 
                                        className="w-full h-14 rounded-2xl bg-indigo-50 border-none px-6 font-bold text-indigo-900 outline-none"
                                        value={formData.paperSetId}
                                        onChange={(e) => handlePaperSetSelect(e.target.value)}
                                    >
                                        <option value="">No Change</option>
                                        {paperSets.map(p => <option key={p._id} value={p._id}>{p.name} ({p.questions?.length} Qs)</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4 lg:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Public Mock Test</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Make this test visible to all students on the homepage</p>
                                    </div>
                                    <Switch 
                                        checked={formData.isMockTest} 
                                        onCheckedChange={(val) => setFormData({...formData, isMockTest: val})} 
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Info className="w-8 h-8 text-primary" />
                                Candidate Instructions
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">What should the student know before starting the test?</p>
                        </div>
                        <Textarea 
                            className="min-h-[250px] rounded-3xl bg-slate-50 border-none p-8 font-medium leading-relaxed"
                            placeholder="Enter detailed instructions here (Support HTML listing, emphasis)..."
                            value={formData.instructions?.en || ""}
                            onChange={(e) => setFormData({...formData, instructions: {en: e.target.value}})}
                        />
                    </div>
                </div>

                {/* Right Panel: Settings & Schedule */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Schedule */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Schedule Feed
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-xs">Start Date & Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" 
                                    value={formData.schedule?.startDate || ""}
                                    onChange={(e) => setFormData({...formData, schedule: { ...formData.schedule, startDate: e.target.value }})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-xs">End Date & Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" 
                                    value={formData.schedule?.endDate || ""}
                                    onChange={(e) => setFormData({...formData, schedule: { ...formData.schedule, endDate: e.target.value }})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className={`rounded-[2.5rem] p-8 border shadow-xl transition-all duration-500 ${(formData.pricing?.type === "PAID") ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white border-slate-100"}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${(formData.pricing?.type === "PAID") ? "text-emerald-100" : "text-slate-400"}`}>
                                <BadgeDollarSign className="w-5 h-5" /> Revenue Model
                            </h3>
                            <div className={`p-1 rounded-xl flex ${(formData.pricing?.type === "PAID") ? "bg-white/10" : "bg-slate-100"}`}>
                                <button 
                                    onClick={() => setFormData({...formData, pricing: { ...formData.pricing, type: "FREE", amount: 0 }})}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${(formData.pricing?.type === "FREE") ? "bg-white text-slate-900 shadow-sm" : "opacity-50"}`}
                                >
                                    Free
                                </button>
                                <button 
                                    onClick={() => setFormData({...formData, pricing: { ...formData.pricing, type: "PAID" }})}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${(formData.pricing?.type === "PAID") ? "bg-emerald-500 text-white shadow-sm" : "opacity-50"}`}
                                >
                                    Paid
                                </button>
                            </div>
                        </div>

                        {formData.pricing?.type === "PAID" && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label className="font-bold text-emerald-50 text-xs">Test Access Price (INR)</Label>
                                    <Input 
                                        type="number"
                                        className="h-14 rounded-2xl bg-white/20 border-white/20 text-white text-2xl font-black placeholder:text-white/30"
                                        placeholder="0.00"
                                        value={formData.pricing.amount}
                                        onChange={(e) => setFormData({...formData, pricing: { ...formData.pricing, amount: parseFloat(e.target.value) }})}
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest leading-relaxed">Students will need to pay and get admin approval before starting this test.</p>
                            </div>
                        )}
                    </div>

                    {/* Examination Rules */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-400" /> Exam Security
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between group">
                                <div className="space-y-0.5">
                                    <p className="font-black text-xs uppercase tracking-widest">Tab Lock</p>
                                    <p className="text-[10px] text-white/40 font-bold">Autosubmit on tab switch</p>
                                </div>
                                <Switch checked={formData.security?.preventTabSwitch} onCheckedChange={(val) => setFormData({...formData, security: { ...formData.security, preventTabSwitch: val }})} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="space-y-0.5">
                                    <p className="font-black text-xs uppercase tracking-widest">Fullscreen</p>
                                    <p className="text-[10px] text-white/40 font-bold">Mandatory fullscreen mode</p>
                                </div>
                                <Switch checked={formData.security?.requireFullscreen} onCheckedChange={(val) => setFormData({...formData, security: { ...formData.security, requireFullscreen: val }})} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="space-y-0.5">
                                    <p className="font-black text-xs uppercase tracking-widest">IP Tracking</p>
                                    <p className="text-[10px] text-white/40 font-bold">Record device & IP logs</p>
                                </div>
                                <Switch checked={formData.security?.trackIpDevice} onCheckedChange={(val) => setFormData({...formData, security: { ...formData.security, trackIpDevice: val }})} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between group pt-4 border-t border-white/5">
                                <div className="space-y-0.5">
                                    <p className="font-black text-xs uppercase tracking-widest">Shuffle</p>
                                    <p className="text-[10px] text-white/40 font-bold">Randomize questions</p>
                                </div>
                                <Switch checked={formData.settings?.shuffleQuestions} onCheckedChange={(val) => setFormData({...formData, settings: { ...formData.settings, shuffleQuestions: val }})} className="data-[state=checked]:bg-primary" />
                            </div>
                        </div>

                        <div className="bg-white/10 p-5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Max Attempts</span>
                            </div>
                            <input 
                                type="number" 
                                className="w-12 bg-transparent text-right font-black text-xl outline-none" 
                                value={formData.security?.maxAttempts || 1}
                                onChange={(e) => setFormData({...formData, security: { ...formData.security, maxAttempts: parseInt(e.target.value) }})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
