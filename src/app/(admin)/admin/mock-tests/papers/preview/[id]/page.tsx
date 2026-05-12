"use client";

import { useEffect, useState, use } from "react";
import { 
    ChevronLeft, Save, Plus, Search, Trash2, BrainCircuit, Database, CheckCircle2, Zap, ArrowRight, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllCourses } from "@/app/actions/courses";
import { getQuestions } from "@/app/actions/questions";
import { getPaperSetById, updatePaperSet } from "@/app/actions/paperSets";

export default function EditPaperSetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [allQuestions, setAllQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<any>({
        name: "",
        courseIds: [],
        examCode: "",
        subject: "",
        totalQuestions: 0,
        totalMarks: 0,
        duration: 90,
        negativeMarking: true,
        questions: [],
    });

    // Filtering for question bank
    const [searchQ, setSearchQ] = useState("");
    const [useBlueprintFilters, setUseBlueprintFilters] = useState(true);

    useEffect(() => {
        const init = async () => {
             const [cRes, qRes, pRes] = await Promise.all([
                 getAllCourses(), 
                 getQuestions(),
                 getPaperSetById(id)
             ]);
             
             if (cRes.success) setCourses(cRes.courses);
             if (qRes.success) setAllQuestions(qRes.questions);
             if (pRes.success) {
                  const ps = pRes.paperSet;
                  setFormData({
                      ...ps,
                      courseIds: ps.courseIds || (ps.courseId ? [ps.courseId?._id || ps.courseId] : [])
                  });
             } else {
                 toast.error(pRes.error);
                 router.push("/admin/mock-tests/papers");
             }
             setLoading(false);
        };
        init();
    }, [id]);

    const toggleQuestion = (q: any) => {
        const isSelected = formData.questions.some((qid: string) => qid === q._id);
        const newQuestions = isSelected 
            ? formData.questions.filter((qid: string) => qid !== q._id)
            : [...formData.questions, q._id];
            
        const newTotalMarks = isSelected 
            ? formData.totalMarks - q.marks
            : formData.totalMarks + q.marks;

        setFormData({
            ...formData,
            questions: newQuestions,
            totalQuestions: newQuestions.length,
            totalMarks: newTotalMarks
        });
    };

    const selectAllFiltered = () => {
        const newQuestions = [...formData.questions];
        let newTotalMarks = formData.totalMarks;

        filteredPool.forEach(q => {
            if (!newQuestions.includes(q._id)) {
                newQuestions.push(q._id);
                newTotalMarks += q.marks;
            }
        });

        setFormData({
            ...formData,
            questions: newQuestions,
            totalQuestions: newQuestions.length,
            totalMarks: newTotalMarks
        });
        toast.success(`Added ${filteredPool.length} questions to the set.`);
    };

    const deselectAllFiltered = () => {
        const filteredIds = filteredPool.map(q => q._id);
        const remainingQuestions = formData.questions.filter((qid: string) => !filteredIds.includes(qid));
        
        // Calculate new marks
        const remainingObjects = allQuestions.filter(q => remainingQuestions.includes(q._id));
        const newTotalMarks = remainingObjects.reduce((acc, q) => acc + q.marks, 0);

        setFormData({
            ...formData,
            questions: remainingQuestions,
            totalQuestions: remainingQuestions.length,
            totalMarks: newTotalMarks
        });
        toast.info("Removed filtered questions from selection.");
    };

    const handleAutoGenerate = () => {
        const pool = allQuestions.filter(q => 
            (formData.courseIds.length === 0 || formData.courseIds.includes(q.courseId?._id)) &&
            (!formData.examCode || q.examCode === formData.examCode) &&
            (!formData.subject || q.subject?.toLowerCase() === formData.subject?.toLowerCase())
        );

        if (pool.length === 0) {
            toast.error("No questions match your current blueprint filters.");
            return;
        }

        const count = parseInt(prompt("Total questions for this selection?", "10") || "0");
        if (count <= 0) return;
        
        const selected = pool.sort(() => 0.5 - Math.random()).slice(0, count);
        setFormData({
            ...formData,
            questions: selected.map(q => q._id),
            totalQuestions: selected.length,
            totalMarks: selected.reduce((s, q) => s + q.marks, 0)
        });
        toast.success(`Selected ${selected.length} random questions.`);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Please provide a Template Name.");
            return;
        }
        if (formData.questions.length === 0) {
            toast.error("Please select at least one question for the paper set.");
            return;
        }

        setSubmitting(true);
        const res = await updatePaperSet(id, formData);
        if (res.success) {
            toast.success("Paper blueprint updated!");
            router.push("/admin/mock-tests/papers");
        } else {
            toast.error(res.error);
        }
        setSubmitting(false);
    };

    const filteredPool = allQuestions.filter(q => {
        const qCourseId = q.courseId?._id || q.courseId;

        const matchesCourse = !useBlueprintFilters || formData.courseIds.length === 0 || formData.courseIds.includes(qCourseId);
        const matchesExamCode = !useBlueprintFilters || !formData.examCode || q.examCode === formData.examCode;
        const matchesSubject = !useBlueprintFilters || !formData.subject || q.subject?.toLowerCase() === formData.subject?.toLowerCase();
        const matchesSearch = !searchQ || q.content?.en?.toLowerCase().includes(searchQ.toLowerCase());
        return matchesCourse && matchesExamCode && matchesSubject && matchesSearch;
    });

    if (loading) return <div className="p-20 text-center font-black animate-pulse opacity-40">Loading blueprint...</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <Link href="/admin/mock-tests/papers">
                    <Button variant="ghost" className="rounded-xl gap-2 h-12 font-bold">
                        <ChevronLeft className="w-5 h-5" /> Manage Library
                    </Button>
                </Link>
                <div className="flex gap-4">
                    <Button 
                        className="rounded-2xl h-14 px-10 font-black gap-2 shadow-2xl shadow-primary/20"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Blueprint Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
                                <Database className="w-5 h-5 text-primary" />
                                Modify Blueprint
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {id.slice(-6).toUpperCase()}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <Label className="font-bold text-slate-700 ml-1">Template Name <span className="text-rose-500">*</span></Label>
                                <Input 
                                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="font-bold text-slate-700 ml-1">Target Courses (Optional)</Label>
                                <div className="max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                                    {courses.map(c => (
                                        <label key={c._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-colors cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                checked={formData.courseIds?.includes(c._id)}
                                                onChange={(e) => {
                                                    const newIds = e.target.checked 
                                                        ? [...(formData.courseIds || []), c._id]
                                                        : (formData.courseIds || []).filter((id: string) => id !== c._id);
                                                    setFormData({...formData, courseIds: newIds});
                                                }}
                                            />
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{c.title}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Leave empty to allow this blueprint for all courses.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="font-bold text-slate-700 ml-1">Test Duration</Label>
                                    <Input 
                                        type="number"
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-xl"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="font-bold text-slate-700 ml-1 text-xs">Neg Marking</Label>
                                    <div className="h-14 flex items-center gap-3 bg-slate-50 rounded-2xl px-4">
                                        <Switch checked={formData.negativeMarking} onCheckedChange={(val) => setFormData({...formData, negativeMarking: val})} />
                                        <span className="text-[9px] font-black uppercase text-slate-400">{formData.negativeMarking ? "On" : "Off"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-slate-900 rounded-[2rem] p-5 text-white">
                                    <p className="text-3xl font-black">{formData.questions.length}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Items</p>
                                </div>
                                <div className="bg-primary rounded-[2rem] p-5 text-white">
                                    <p className="text-3xl font-black">{formData.totalMarks}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total Pts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-300" /> Auto Selection
                        </h3>
                        <p className="text-xs font-medium text-indigo-100">Automatically replace all selections with a random pool from your bank.</p>
                        <Button 
                            variant="outline" 
                            className="w-full h-14 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-600 font-black uppercase tracking-widest text-xs"
                            onClick={handleAutoGenerate}
                        >
                            <ArrowRight className="w-4 h-4 mr-2" /> Replace with Random
                        </Button>
                    </div>
                </div>

                {/* Right Panel: List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col h-[750px]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Select Questions</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Filter and toggle questions from your global bank ({filteredPool.length} items)</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-xl">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold"
                                        placeholder="Search global bank..."
                                        value={searchQ}
                                        onChange={(e) => setSearchQ(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 whitespace-nowrap">
                                    <Switch checked={useBlueprintFilters} onCheckedChange={setUseBlueprintFilters} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter by Blueprint</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl font-bold text-xs gap-2"
                                onClick={selectAllFiltered}
                                disabled={filteredPool.length === 0}
                            >
                                <CheckCircle2 className="w-4 h-4" /> Select All Filtered
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-xl font-bold text-xs gap-2 text-rose-500 hover:text-rose-600"
                                onClick={deselectAllFiltered}
                                disabled={formData.questions.length === 0}
                            >
                                <Trash2 className="w-4 h-4" /> Clear Current Selection
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                            {filteredPool.map((q) => {
                                const isSelected = formData.questions.some((qid: string) => qid === q._id);
                                return (
                                    <div 
                                        key={q._id}
                                        onClick={() => toggleQuestion(q)}
                                        className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-start gap-6 ${isSelected ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white border-slate-100 hover:border-primary/20"}`}
                                    >
                                        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black ${isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                                            {isSelected ? <CheckCircle2 className="w-6 h-6" /> : q.content?.en?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={`${isSelected ? "bg-white/10" : "bg-primary/5 text-primary"} border-none text-[8px] font-black uppercase px-2 py-0.5`}>
                                                    {q.type.replace(/_/g, " ")}
                                                </Badge>
                                                <span className={`text-[10px] font-bold ${isSelected ? "text-white/40" : "text-slate-400"}`}>{q.subject} • {q.difficulty}</span>
                                            </div>
                                            <p className={`text-sm font-bold line-clamp-2 ${isSelected ? "text-white" : "text-slate-700"}`} dangerouslySetInnerHTML={{ __html: q.content?.en }} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black leading-none">+{q.marks}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
