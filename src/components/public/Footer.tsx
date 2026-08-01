import Link from "next/link";
import { getHeaderFooterData } from "@/app/actions/layoutContent";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default async function Footer() {
    const result = await getHeaderFooterData();
    const headerData = result.success ? result.header : null;
    const footerData = (result.success && result.footer) ? result.footer : {};

    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-white text-slate-600 border-t border-slate-100 pt-20 pb-10 overflow-hidden">
            {/* Subtle decorative background glow */}
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            {footerData.logoImage || headerData?.logoImage ? (
                                <img 
                                    src={footerData.logoImage || headerData?.logoImage} 
                                    alt="NGIT Logo" 
                                    className="h-16 md:h-20 w-auto object-contain opacity-95 group-hover:opacity-100 transition-all duration-300" 
                                />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-md">
                                        N
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                                            {footerData.logoText || "NGIT"}
                                        </h3>
                                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Institute</span>
                                    </div>
                                </div>
                            )}
                        </Link>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
                            N.G.I.T is an IT institute where we provide multiple IT courses with Professionals Trainers and Teachers. We Performs exceptionally in every course or Training.We provides quality education so our Students Secured 100% results.
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://www.facebook.com/National-Genius-Institute-of-Technology-641229979714542" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300"
                                title="Follow NGIT on Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Sitemap</h4>
                            <ul className="space-y-2.5 text-sm font-semibold">
                                <li>
                                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                                </li>
                                <li>
                                    <Link href="/about" className="hover:text-slate-900 transition-colors">About Us</Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
                                </li>
                                <li>
                                    <Link href="/verify" className="hover:text-slate-900 transition-colors">Verification</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Learning Hub</h4>
                            <ul className="space-y-2.5 text-sm font-semibold">
                                <li>
                                    <Link href="/typing" className="hover:text-slate-900 transition-colors">Typing Software</Link>
                                </li>
                                <li>
                                    <Link href="/student/login" className="hover:text-slate-900 transition-colors">Student Portal</Link>
                                </li>
                                <li>
                                    <Link href="/courses" className="hover:text-slate-900 transition-colors">All Courses</Link>
                                </li>
                                <li>
                                    <Link href="/exams" className="hover:text-slate-900 transition-colors">Mock Tests</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact & Support Column */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Contact support</h4>
                        <ul className="space-y-3.5 text-sm font-semibold">
                            <li className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <a href="tel:+918840341525" className="hover:text-slate-900 transition-colors">+91 88403 41525</a>
                                </div>
                                <div className="flex items-center gap-2 pl-6">
                                    <a href="tel:+918004958441" className="hover:text-slate-900 transition-colors text-slate-500 font-medium">+91 80049 58441</a>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                                <a href="mailto:contact@ngit.org.in" className="hover:text-slate-900 transition-colors">contact@ngit.org.in</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <a 
                                    href="https://www.google.com/maps/place/National+Genius+Institute+Of+Technology/@25.4967301,81.853729,17z/data=!3m1!4b1!4m5!3m4!1s0x399acba945e652c3:0x2b9cca1b43a5302d!8m2!3d25.4967253!4d81.8559177" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-500 hover:text-slate-900 transition-colors leading-relaxed"
                                >
                                    First Floor, Sainik Market, Rasulabad Ghat Road, near Mahila Polytechnic, Rasulabad, Teliarganj, Prayagraj, Uttar Pradesh 211004
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Baseline */}
                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="text-center sm:text-left space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                            © {currentYear} All rights reserved to {footerData.logoText || "NGIT"}.
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            ISO 9001:2015 Certified Institute • Skill India Partner
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/verify" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 active:scale-95">
                            <ShieldCheck className="w-4 h-4" />
                            Verify Certificate
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
