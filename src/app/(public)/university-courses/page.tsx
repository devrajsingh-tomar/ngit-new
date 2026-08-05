"use client";

import { useState } from "react";
import { 
    BookOpen, 
    TrendingUp, 
    Briefcase, 
    Laptop, 
    Code, 
    GraduationCap, 
    LineChart, 
    Library, 
    Atom, 
    Building, 
    Terminal, 
    Activity, 
    Scale, 
    Settings, 
    Send,
    MessageCircle,
    CheckCircle2,
    Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CourseItem {
    id: string;
    title: string;
    fullName: string;
    icon: any;
    color: string;
    category: "Undergraduate" | "Postgraduate" | "Diploma" | "Professional";
}

export default function UniversityCoursesPage() {
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [qualification, setQualification] = useState("");
    const [notes, setNotes] = useState("");

    const courses: CourseItem[] = [
        { id: "pgdca", title: "PGDCA", fullName: "Post Graduate Diploma in Computer Applications", icon: Code, color: "from-purple-500 to-pink-500", category: "Diploma" },
        { id: "mba", title: "MBA", fullName: "Master of Business Administration", icon: Building, color: "from-indigo-500 to-purple-500", category: "Postgraduate" },
        { id: "bca", title: "BCA", fullName: "Bachelor of Computer Applications", icon: Laptop, color: "from-violet-500 to-purple-500", category: "Undergraduate" },
        { id: "bcom", title: "B.Com.", fullName: "Bachelor of Commerce", icon: TrendingUp, color: "from-cyan-500 to-blue-500", category: "Undergraduate" },
        { id: "bba", title: "BBA", fullName: "Bachelor of Business Administration", icon: Briefcase, color: "from-sky-500 to-indigo-500", category: "Undergraduate" },
        { id: "ma", title: "M.A.", fullName: "Master of Arts", icon: GraduationCap, color: "from-emerald-500 to-teal-500", category: "Postgraduate" },
        { id: "blib", title: "B.Lib.", fullName: "Bachelor of Library Science", icon: Library, color: "from-orange-500 to-amber-500", category: "Undergraduate" },
        { id: "llb", title: "LLB", fullName: "Bachelor of Laws", icon: Scale, color: "from-slate-700 to-slate-900", category: "Professional" },
        { id: "yoga", title: "YOGA", fullName: "Diploma / Degree in Yoga Science", icon: Activity, color: "from-green-500 to-emerald-500", category: "Professional" },
        { id: "ba", title: "B.A.", fullName: "Bachelor of Arts", icon: BookOpen, color: "from-blue-500 to-indigo-500", category: "Undergraduate" },
        { id: "mcom", title: "M.Com.", fullName: "Master of Commerce", icon: LineChart, color: "from-teal-500 to-cyan-500", category: "Postgraduate" },
        { id: "mlib", title: "M.Lib.", fullName: "Master of Library Science", icon: Library, color: "from-amber-500 to-yellow-500", category: "Postgraduate" },
        { id: "msc", title: "M.Sc.", fullName: "Master of Science", icon: Atom, color: "from-rose-500 to-pink-500", category: "Postgraduate" },
        { id: "mca", title: "MCA", fullName: "Master of Computer Applications", icon: Terminal, color: "from-fuchsia-500 to-purple-500", category: "Postgraduate" },
        { id: "btech", title: "B.Tech", fullName: "Bachelor of Technology", icon: Cpu, color: "from-red-500 to-rose-600", category: "Professional" },
        { id: "polytechnic", title: "POLYTECHNIC", fullName: "Diploma in Engineering", icon: Settings, color: "from-amber-600 to-orange-600", category: "Diploma" }
    ];

    const handleSendWhatsApp = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCourse) {
            toast.error("Please select a university course first!");
            return;
        }
        if (!name.trim()) {
            toast.error("Please enter your name.");
            return;
        }
        if (!phone.trim()) {
            toast.error("Please enter your WhatsApp contact number.");
            return;
        }

        const courseObj = courses.find(c => c.id === selectedCourse);
        const courseNameStr = courseObj ? `${courseObj.title} (${courseObj.fullName})` : selectedCourse;

        // Build the text block
        const messageText = `*🎓 NGIT UNIVERSITY ADMISSION INQUIRY*

*Student Details:*
👤 *Name:* ${name.trim()}
📞 *WhatsApp:* ${phone.trim()}
🎓 *Highest Qualification:* ${qualification.trim() || "Not Specified"}

*Selected Course:*
✨ *Program:* ${courseNameStr}

*Additional Notes:*
📝 ${notes.trim() || "None"}

---
Sent from NGIT University Admission Portal`;

        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/919598733746?text=${encodedMessage}`;

        // Launch in new window
        window.open(whatsappUrl, "_blank");
        toast.success("Redirecting to WhatsApp for enrollment inquiry...");
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden py-16">
            {/* Background glowing decorations */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Heading */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.2em]">
                        Admission Portal 2026
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                        University <span className="text-gradient">Courses & Degrees</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        Select your desired academic program below, fill in your details, and submit directly via WhatsApp to initiate enrollment support.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Courses Grid (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                                Available Programs ({courses.length})
                            </h2>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Click to select
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {courses.map((course) => {
                                const IconComponent = course.icon;
                                const isSelected = selectedCourse === course.id;
                                return (
                                    <button
                                        key={course.id}
                                        onClick={() => setSelectedCourse(course.id)}
                                        className={`group relative text-left p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[150px] ${
                                            isSelected 
                                                ? "bg-white border-primary shadow-xl ring-2 ring-primary/25 -translate-y-1" 
                                                : "bg-white border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-white shadow-md`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            {isSelected && (
                                                <span className="bg-primary/10 text-primary p-1 rounded-full">
                                                    <CheckCircle2 className="w-4 h-4 fill-current text-primary" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                {course.category}
                                            </span>
                                            <h3 className="text-xl font-black text-slate-900 mt-0.5">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">
                                                {course.fullName}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Lead Form (4 Cols) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl relative sticky top-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                Enrollment Request
                            </h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wide mb-6">
                                Complete fields to chat with counselor
                            </p>

                            <form onSubmit={handleSendWhatsApp} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-black uppercase text-slate-500 tracking-wider">
                                        Your Full Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        required
                                        placeholder="e.g. Devraj Singh"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 border-slate-200 rounded-xl font-bold text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase text-slate-500 tracking-wider">
                                        WhatsApp Phone Number <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        required
                                        type="tel"
                                        placeholder="e.g. 9598733746"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="h-12 border-slate-200 rounded-xl font-bold text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="qual" className="text-xs font-black uppercase text-slate-500 tracking-wider">
                                        Highest Qualification
                                    </Label>
                                    <Input
                                        id="qual"
                                        placeholder="e.g. 12th Pass, Graduate"
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                        className="h-12 border-slate-200 rounded-xl font-bold text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="notes" className="text-xs font-black uppercase text-slate-500 tracking-wider">
                                        Additional Message / Notes
                                    </Label>
                                    <textarea
                                        id="notes"
                                        placeholder="Enter any other requirements or course questions..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full min-h-[80px] bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* Selection Summary */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold space-y-1.5 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Selected Program:</span>
                                        <span className="text-slate-900 font-extrabold uppercase">
                                            {selectedCourse ? courses.find(c => c.id === selectedCourse)?.title : "None Selected"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Counselor Number:</span>
                                        <span className="text-slate-900 font-mono font-extrabold">+91 95987 33746</span>
                                    </div>
                                </div>

                                <Button 
                                    type="submit"
                                    className="w-full h-14 mt-4 rounded-xl text-md font-black bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 border-none transition-all duration-300"
                                >
                                    <MessageCircle className="w-5 h-5 fill-current" />
                                    Send Details via WhatsApp
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
