import Link from "next/link";
import { Keyboard, BrainCircuit, Library, ShieldCheck, Bell, UserCheck, ArrowRight, GraduationCap, FileText } from "lucide-react";

export default function QuickActionsGrid() {
    const actions = [
        {
            title: "Academic Courses",
            desc: "Explore professional computer diplomas, IT certifications, and syllabus details.",
            href: "student.ngitedu.com",
            icon: GraduationCap,
            textColor: "text-violet-600",
            bg: "bg-violet-50/50"
        },
        {
            title: "Shorthand Dictations",
            desc: "Access dictation libraries, transcribing tools, and stenography practice papers.",
            href: "https://svshorthandsoftware.blogspot.com",
            icon: FileText,
            textColor: "text-fuchsia-600",
            bg: "bg-fuchsia-50/50"
        },
        {
            title: "Typing Test Simulator",
            desc: "Improve WPM & accuracy with English/Hindi government-grade typing exams.",
            href: "/typing",
            icon: Keyboard,
            textColor: "text-blue-600",
            bg: "bg-blue-50/50"
        },
        {
            title: "MCQ Mock Exams",
            desc: "Test preparation with subject-wise questions, real-time feedback & scoring.",
            href: "/exams",
            icon: BrainCircuit,
            textColor: "text-indigo-600",
            bg: "bg-indigo-50/50"
        },
        {
            title: "Study Material Hub",
            desc: "Access digital reference books, PDF study guides, and notes instantly.",
            href: "/student/login",
            icon: Library,
            textColor: "text-emerald-600",
            bg: "bg-emerald-50/50"
        },
        {
            title: "Verify Certificates",
            desc: "Check and download authentic digital diplomas issued by the institute.",
            href: "/verify",
            icon: ShieldCheck,
            textColor: "text-amber-600",
            bg: "bg-amber-50/50"
        },
        {
            title: "Notices & Bulletins",
            desc: "Read official announcements, timetables, and recent administrative updates.",
            href: "/notices",
            icon: Bell,
            textColor: "text-rose-600",
            bg: "bg-rose-50/50"
        },
        {
            title: "Student Portal Dashboard",
            desc: "Manage enrollment profile, check status, attendance, and online fees.",
            href: "/student/login",
            icon: UserCheck,
            textColor: "text-cyan-600",
            bg: "bg-cyan-50/50"
        }
    ];

    return (
        <section className="py-16 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-10 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.2em]">
                        Student Workspace
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none italic">
                        Quick <span className="text-gradient">Navigation Hub</span>
                    </h2>
                    <p className="text-slate-500 font-bold text-lg leading-relaxed">
                        Access our core assessment engines, study materials, and certification tools directly from the links below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {actions.map((item, index) => {
                        const finalHref = item.href.startsWith("http") || item.href.startsWith("/") ? item.href : `https://${item.href}`;
                        const isExternal = finalHref.startsWith("http");
                        return (
                            <Link 
                                key={index} 
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group bg-white rounded-[2.2rem] p-8 border border-slate-100/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-slate-100/50 group-hover:scale-110 duration-300 transition-transform ${item.bg}`}>
                                        <item.icon className={`w-6 h-6 ${item.textColor}`} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                                        {item.desc}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-primary transition-colors">
                                    Launch Module
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
