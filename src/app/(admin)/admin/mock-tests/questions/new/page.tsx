"use client";

import { useEffect, useState } from "react";
import { 
    ChevronLeft, Save, Plus, Trash2, Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createQuestion } from "@/app/actions/questions";
import { getAllCourses } from "@/app/actions/courses";
import { getCategories, getPaperTypes } from "@/app/actions/admin/mock-metadata";
import MetadataManager from "@/components/admin/mock-tests/MetadataManager";

const QUESTION_TYPES = [
    { value: "MCQ_SINGLE", label: "Single Correct MCQ" },
    { value: "MCQ_MULTIPLE", label: "Multiple Correct MCQ" },
    { value: "TRUE_FALSE", label: "True / False" },
    { value: "NUMERIC", label: "Numeric Answer" },
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "DESCRIPTIVE", label: "Descriptive" },
    { value: "MATCH_THE_FOLLOWING", label: "Match the Following" },
    { value: "ASSERTION_REASON", label: "Assertion / Reason" },
    { value: "TYPING", label: "Typing Test" },
];

export default function NewQuestionPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [paperTypes, setPaperTypes] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<any>({
        courseId: "",
        examCode: "",
        subject: "",
        topic: "",
        type: "MCQ_SINGLE",
        difficulty: "MEDIUM",
        content: { en: "", hi: "" },
        marks: 4,
        negativeMarks: 1,
        explanation: { en: "", hi: "" },
        options: [
            { text: { en: "" }, isCorrect: false },
            { text: { en: "" }, isCorrect: false },
            { text: { en: "" }, isCorrect: false },
            { text: { en: "" }, isCorrect: false },
        ],
        numericAnswer: "",
        shortAnswer: "",
        assertion: { en: "" },
        reason: { en: "" },
    });

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (formData.courseId) {
            loadMetadata();
        } else {
            setCategories([]);
            setPaperTypes([]);
        }
    }, [formData.courseId]);

    const loadMetadata = async () => {
        const [catRes, ptRes] = await Promise.all([
            getCategories(formData.courseId),
            getPaperTypes(formData.courseId)
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (ptRes.success) setPaperTypes(ptRes.paperTypes);
    };

    const loadCourses = async () => {
        const res = await getAllCourses();
        if (res.success) setCourses(res.courses);
    };

    const handleOptionChange = (index: number, field: string, value: any) => {
        const newOptions = [...formData.options];
        if (field === "text") {
            newOptions[index].text.en = value;
        } else if (field === "isCorrect") {
            if (formData.type === "MCQ_SINGLE") {
                newOptions.forEach((opt, i) => opt.isCorrect = i === index);
            } else {
                newOptions[index].isCorrect = value;
            }
        } else if (field === "pair") {
            if (!newOptions[index].pair) newOptions[index].pair = { en: "" };
            newOptions[index].pair.en = value;
        }
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { text: { en: "" }, isCorrect: false }]
        });
    };

    const removeOption = (index: number) => {
        const newOptions = formData.options.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async () => {
        if (!formData.content.en) return toast.error("Please enter the Question Content");

        setSubmitting(true);
        const res = await createQuestion(formData);
        if (res.success) {
            toast.success("Question created successfully");
            router.push("/admin/mock-tests/questions");
        } else {
            toast.error(res.error);
        }
        setSubmitting(false);
    };

    // Render True False Button helper
    const handleTrueFalseSelect = (isTrue: boolean) => {
        setFormData({
            ...formData,
            options: [
                { text: { en: "True" }, isCorrect: isTrue },
                { text: { en: "False" }, isCorrect: !isTrue }
            ]
        });
    };

    // Auto initialize true/false structure if needed
    useEffect(() => {
        if (formData.type === "TRUE_FALSE" && formData.options.length !== 2) {
            handleTrueFalseSelect(true); // default option
        }
    }, [formData.type]);

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/mock-tests/questions">
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Question</h1>
                        <p className="text-sm font-medium text-slate-500">Design dynamic questions for assessments</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-10">
                
                {/* 1. Context Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Target Course (Optional)</Label>
                        <select 
                            className="w-full h-14 rounded-2xl bg-slate-50 border-none px-5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            value={formData.courseId}
                            onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                        >
                            <option value="">Global / No Course</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Exam Code / Tag</Label>
                        <Input 
                            placeholder="e.g. M1-R5 or Generic"
                            className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-bold shadow-none"
                            value={formData.examCode}
                            onChange={(e) => setFormData({...formData, examCode: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Subject / Topic</Label>
                        <Input 
                            placeholder="e.g. Physics, IT Tools"
                            className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-bold shadow-none"
                            value={formData.topic}
                            onChange={(e) => setFormData({...formData, topic: e.target.value, subject: e.target.value})}
                        />
                    </div>
                </div>

                {/* 2. Question Type */}
                <div className="space-y-2 border-b border-slate-100 pb-10">
                    <Label className="font-bold text-slate-700 ml-1">Question Type</Label>
                    <select 
                        className="w-full md:w-1/2 h-14 rounded-2xl bg-slate-900 text-white border-none px-5 font-bold outline-none cursor-pointer appearance-none shadow-xl shadow-slate-900/10"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        {QUESTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                {/* 3. Question Content */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="font-bold text-slate-700 text-lg ml-1">Question Content</Label>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-rose-500 border-none bg-rose-50 px-3 py-1">Required</Badge>
                    </div>
                    <Textarea 
                        placeholder="Type the question content here... You can use HTML formatting."
                        className="min-h-[160px] rounded-[1.5rem] bg-slate-50 border-none p-6 font-medium text-lg focus-visible:ring-primary/20 shadow-none leading-relaxed"
                        value={formData.content.en}
                        onChange={(e) => setFormData({...formData, content: { ...formData.content, en: e.target.value }})}
                    />
                </div>

                {/* 4. DYNAMIC AREA */}
                <div className="bg-slate-50/50 -mx-8 px-8 py-8 border-y border-slate-50 space-y-4">
                    
                    {/* Multi / Single Choice Options */}
                    {["MCQ_SINGLE", "MCQ_MULTIPLE"].includes(formData.type) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <Label className="font-bold text-slate-700 text-lg">Options</Label>
                                    <p className="text-sm font-medium text-slate-500">Select the correct choice{formData.type === "MCQ_MULTIPLE" ? "s" : ""}</p>
                                </div>
                                <Button variant="outline" className="h-10 gap-2 uppercase font-black text-[10px] rounded-xl bg-white" onClick={addOption}>
                                    <Plus className="w-3 h-3" /> Add Option
                                </Button>
                            </div>
                            {formData.options.map((opt: any, i: number) => (
                                <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all shadow-sm ${opt.isCorrect ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-white"}`}>
                                    <div className="pt-3.5 pl-2">
                                        <input 
                                            type={formData.type === "MCQ_SINGLE" ? "radio" : "checkbox"}
                                            name="mcq_option"
                                            checked={opt.isCorrect}
                                            onChange={(e) => handleOptionChange(i, "isCorrect", e.target.checked)}
                                            className={`w-5 h-5 accent-emerald-500 cursor-pointer ${formData.type === "MCQ_SINGLE" ? "rounded-full" : "rounded"}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input 
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            className="bg-transparent border-none text-slate-800 font-bold px-2 shadow-none focus-visible:ring-0 text-base"
                                            value={opt.text.en}
                                            onChange={(e) => handleOptionChange(i, "text", e.target.value)}
                                        />
                                    </div>
                                    {formData.options.length > 2 && (
                                        <Button variant="ghost" size="icon" className="mt-1 hover:bg-rose-100 hover:text-rose-600 text-slate-400 rounded-xl" onClick={() => removeOption(i)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* True / False */}
                    {formData.type === "TRUE_FALSE" && formData.options.length >= 2 && (
                        <div className="space-y-4">
                            <Label className="font-bold text-slate-700 text-lg">Select Correct Answer</Label>
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => handleTrueFalseSelect(true)}
                                    className={`flex-1 h-14 rounded-2xl text-lg font-black transition-all border-2 ${formData.options[0]?.isCorrect ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200"}`}
                                >
                                    True
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleTrueFalseSelect(false)}
                                    className={`flex-1 h-14 rounded-2xl text-lg font-black transition-all border-2 ${formData.options[1]?.isCorrect ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200"}`}
                                >
                                    False
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Numeric Answer */}
                    {formData.type === "NUMERIC" && (
                        <div className="space-y-3">
                            <Label className="font-bold text-slate-700 text-lg">Exact Correct Answer</Label>
                            <Input 
                                type="number"
                                step="any"
                                placeholder="e.g. 3.14"
                                className="h-16 max-w-sm rounded-[1rem] bg-white border border-slate-200 px-6 font-black text-2xl focus-visible:ring-primary/20 shadow-sm"
                                value={formData.numericAnswer}
                                onChange={(e) => setFormData({...formData, numericAnswer: e.target.value})}
                            />
                            <p className="text-sm text-slate-500 font-medium">The system will precisely match this numeric value during auto-grading.</p>
                        </div>
                    )}

                    {/* Short Answer */}
                    {formData.type === "SHORT_ANSWER" && (
                        <div className="space-y-3">
                            <Label className="font-bold text-slate-700 text-lg">Correct Text Answer</Label>
                            <Input 
                                placeholder="e.g. Newton"
                                className="h-14 rounded-[1rem] bg-white border border-slate-200 px-6 font-bold text-lg focus-visible:ring-primary/20 shadow-sm"
                                value={formData.shortAnswer || ""}
                                onChange={(e) => setFormData({...formData, shortAnswer: e.target.value})}
                            />
                            <p className="text-sm text-slate-500 font-medium">The system expects this exact word or phrase (case-insensitive usually).</p>
                        </div>
                    )}

                    {/* Descriptive */}
                    {formData.type === "DESCRIPTIVE" && (
                        <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-100 flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 text-lg">Descriptive Essay Format</h4>
                                <p className="text-indigo-700/80 font-medium leading-relaxed mt-1">
                                    No automatic options required. Students will be provided a rich text area during the exam to write their detailed structured answer, which will be manually evaluated by an examiner.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Match the Following */}
                    {formData.type === "MATCH_THE_FOLLOWING" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="font-bold text-slate-700 text-lg">Match Matrix</Label>
                                <Button variant="outline" className="h-10 gap-2 uppercase font-black text-[10px] rounded-xl bg-white" onClick={addOption}>
                                    <Plus className="w-3 h-3" /> Add Pair
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mb-2 pl-12 pr-12">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Left Column (Item)</Label>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Right Column (Match)</Label>
                            </div>
                            {formData.options.map((opt: any, i: number) => (
                                <div key={i} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">{i+1}</div>
                                    <Input 
                                        placeholder={`Item ${i+1}`}
                                        className="flex-1 h-12 rounded-xl bg-slate-50 border-none font-bold"
                                        value={opt.text.en}
                                        onChange={(e) => handleOptionChange(i, "text", e.target.value)}
                                    />
                                    <div className="w-4 h-px bg-slate-200 shrink-0"></div>
                                    <Input 
                                        placeholder={`Match ${i+1}`}
                                        className="flex-1 h-12 rounded-xl bg-slate-50 border-none font-bold text-indigo-700"
                                        value={opt.pair?.en}
                                        onChange={(e) => handleOptionChange(i, "pair", e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" className="hover:bg-rose-100 hover:text-rose-600 text-slate-400 rounded-xl" onClick={() => removeOption(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Assertion Reason */}
                    {formData.type === "ASSERTION_REASON" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold text-indigo-700 ml-1">Statement 1: Assertion (A)</Label>
                                    <Textarea 
                                        className="min-h-[120px] rounded-[1.5rem] bg-indigo-50/50 border border-indigo-100 p-5 font-medium text-indigo-950 focus-visible:ring-indigo-500/20 shadow-inner"
                                        placeholder="Enter assertion..."
                                        value={formData.assertion?.en || ""}
                                        onChange={(e) => setFormData({...formData, assertion: {en: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-purple-700 ml-1">Statement 2: Reason (R)</Label>
                                    <Textarea 
                                        className="min-h-[120px] rounded-[1.5rem] bg-purple-50/50 border border-purple-100 p-5 font-medium text-purple-950 focus-visible:ring-purple-500/20 shadow-inner"
                                        placeholder="Enter reason..."
                                        value={formData.reason?.en || ""}
                                        onChange={(e) => setFormData({...formData, reason: {en: e.target.value}})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <Label className="font-bold text-slate-700 ml-1">Correct Logical Outcome</Label>
                                <div className="space-y-2">
                                    {[
                                        "A: Both A and R are true. R is the correct explanation of A.",
                                        "B: Both A and R are true but R is not the correct explanation of A.",
                                        "C: A is true but R is false.",
                                        "D: A is false but R is true.",
                                        "E: Both A and R are false."
                                    ].map((opt, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => setFormData({...formData, numericAnswer: i})}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold text-sm flex items-center gap-3 ${
                                                formData.numericAnswer === i ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm" : "border-slate-100 bg-white hover:border-slate-300 text-slate-600"
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.numericAnswer === i ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                                                {formData.numericAnswer === i && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Typing Test */}
                    {formData.type === "TYPING" && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4 items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <Info className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-black text-amber-900 text-lg">Typing Practice Passage</h4>
                                    <p className="text-amber-700/80 font-medium leading-relaxed mt-1">
                                        Enter the master text passage that students will type. The system will track WPM, Accuracy, and Errors. Use the "Question Content" area above for instructions (e.g. "Type the following passage...").
                                    </p>
                                </div>
                            </div>
                            <Label className="font-bold text-slate-700 text-lg">Master Text (Passage)</Label>
                            <Textarea 
                                placeholder="Paste the official typing passage here..."
                                className="min-h-[300px] rounded-[1.5rem] bg-white border border-slate-200 p-6 font-mono text-base focus-visible:ring-primary/20 shadow-sm leading-relaxed"
                                value={formData.shortAnswer || ""}
                                onChange={(e) => setFormData({...formData, shortAnswer: e.target.value})}
                            />
                        </div>
                    )}

                </div>
                {/* 5. Scoring System */}
                <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Marks (Positive)</Label>
                        <Input 
                            type="number"
                            className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-black text-emerald-600 text-xl shadow-none"
                            value={formData.marks}
                            onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value) || 0})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Negative Marks</Label>
                        <Input 
                            type="number"
                            className="h-14 rounded-2xl bg-slate-50 border-none px-5 font-black text-rose-500 text-xl shadow-none"
                            value={formData.negativeMarks}
                            onChange={(e) => setFormData({...formData, negativeMarks: parseInt(e.target.value) || 0})}
                        />
                    </div>
                </div>

                {/* 6. Explanation */}
                <div className="space-y-3 border-t border-slate-100 pt-10">
                    <Label className="font-bold text-slate-700 text-lg ml-1">Answer Explanation</Label>
                    <p className="text-sm text-slate-500 font-medium ml-1">Students will see this detailed explanation when they review their test results.</p>
                    <Textarea 
                        placeholder="Provide a step-by-step solution, mathematical working, or conceptual reasoning..."
                        className="min-h-[160px] rounded-[1.5rem] bg-slate-50 border-none p-6 font-medium text-[15px] focus-visible:ring-primary/20 shadow-none leading-relaxed"
                        value={formData.explanation.en}
                        onChange={(e) => setFormData({...formData, explanation: {en: e.target.value}})}
                    />
                </div>
                
                {/* 7. Action */}
                <div className="pt-6">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20 gap-2 transition-transform hover:scale-[1.01]"
                    >
                        {submitting ? "Saving Blueprint..." : "Save Question Blueprint"}
                        <Save className="w-5 h-5 ml-2 opacity-80" />
                    </Button>
                </div>

            </div>
        </div>
    );
}
