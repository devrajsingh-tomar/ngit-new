import { getNotices } from "@/app/actions/notice";
import { Bell, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Official Announcements & Notices | NGIT",
    description: "Stay updated with the latest announcements, schedules, and official notices from NGIT Institute."
};

export default async function NoticesPublicPage() {
    const res = await getNotices(false);
    const notices = res.success ? res.notices : [];

    return (
        <div className="min-h-screen bg-slate-50 relative pt-16 md:pt-24 pb-20 overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

            <div className="container px-6 mx-auto relative z-10 max-w-5xl">
                {/* Header Section */}
                <div className="text-center md:text-left mb-10 md:mb-16 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 shadow-sm text-[10px] md:text-xs tracking-widest uppercase mt-8 md:mt-0">
                        <Bell className="w-4 h-4" /> Live Broadcast
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
                        Official Updates & Announcements
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">
                        Stay informed with the latest organizational directives, exam schedules, and institutional events posted by the NGIT administrative board.
                    </p>
                </div>

                {notices.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-200 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-200" />
                        <Bell className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Notices</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">There are currently no live announcements or critical updates posted.</p>
                    </div>
                ) : (
                    <div className="space-y-8 relative">
                        {/* Timeline wire */}
                        <div className="absolute left-[39px] top-4 md:left-[51px] bottom-4 w-1 bg-gradient-to-b from-emerald-100 via-slate-200 to-transparent rounded-full hidden md:block" />

                        {notices.map((notice: any, index: number) => {
                            const dateObj = new Date(notice.date);
                            const day = dateObj.toLocaleDateString('en-GB', { day: '2-digit' });
                            const month = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
                            
                            return (
                                <div key={notice._id} className="relative flex flex-col md:flex-row items-stretch md:items-start gap-6 md:gap-10 group animate-in fade-in slide-in-from-bottom-4 w-full" style={{ animationDelay: `${index * 100}ms` }}>
                                    
                                    {/* Date Bubble */}
                                    <div className="flex-shrink-0 flex items-center justify-start md:w-auto">
                                        <div className="relative z-10 w-16 h-16 md:w-28 md:h-28 bg-white rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center border-2 border-slate-100 shadow-lg shadow-slate-200/50 group-hover:border-primary group-hover:shadow-primary/20 transition-all duration-300 group-hover:-translate-y-1">
                                            <span className="text-[10px] md:text-xs font-black text-slate-400 tracking-widest uppercase mb-0.5">{month}</span>
                                            <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{day}</span>
                                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">{dateObj.getFullYear()}</span>
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 w-full bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="p-6 md:p-10">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                                    {notice.title}
                                                </h2>
                                                {notice.showInScroller && (
                                                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 font-black text-[10px] uppercase tracking-widest rounded-full border border-amber-100 whitespace-nowrap self-start shrink-0">
                                                        Highlights
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-slate-600 bg-slate-50/50 p-6 rounded-2xl font-medium leading-relaxed mb-6 border border-slate-100 border-dashed whitespace-pre-wrap">
                                                {notice.description}
                                            </p>

                                            {notice.link && (
                                                <div className="pt-4 border-t border-slate-100">
                                                    <Link href={notice.link} target={notice.link.startsWith('http') ? '_blank' : '_self'}>
                                                        <Button className="font-bold bg-slate-900 text-white rounded-xl h-12 px-6 group/btn hover:bg-primary transition-colors shadow-lg">
                                                            <span>Read More / Act Now</span>
                                                            {notice.link.startsWith('http') ? (
                                                                <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                            ) : (
                                                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                            )}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
