import Link from "next/link";
import { getHeaderFooterData, getFloatingSocialsData } from "@/app/actions/layoutContent";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default async function Footer() {
    const [result, socialsRes] = await Promise.all([
        getHeaderFooterData(),
        getFloatingSocialsData()
    ]);
    const headerData = result.success ? result.header : null;
    const footerData = (result.success && result.footer) ? result.footer : {};
    const socials = socialsRes.success ? socialsRes.data : [];
    const activeSocials = socials.filter((s: any) => s.isActive !== false);

    const currentYear = new Date().getFullYear();

    const getPlatformStyles = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes("whatsapp")) {
            return {
                bg: "bg-[#25D366] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]",
                svg: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45h.007c5.584 0 10.122-4.516 10.126-10.064.002-2.687-1.042-5.212-2.94-7.114C16.65 1.524 14.128.482 11.44.482c-5.588 0-10.13 4.516-10.134 10.065-.001 2.01.523 3.976 1.52 5.71l-1.011 3.69 3.824-.993zm11.366-5.873c-.3-.15-1.77-.875-2.043-.974-.275-.098-.475-.148-.675.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-1.041-.519-1.714-.947-2.393-2.117-.174-.3-.174-.557-.026-.708.134-.135.3-.349.45-.524.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.675-1.624-.925-2.224-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.224 5.11 4.525.714.31 1.272.495 1.706.634.717.228 1.368.196 1.884.119.575-.085 1.77-.724 2.02-1.375.25-.65.25-1.209.175-1.325-.075-.115-.275-.189-.575-.339z" />
                    </svg>
                )
            };
        }
        if (p.includes("telegram")) {
            return {
                bg: "bg-[#0088cc] hover:shadow-[0_0_15px_rgba(0,136,204,0.4)]",
                svg: (
                    <svg className="w-5 h-5 fill-current mr-[1px] mt-[1px]" viewBox="0 0 24 24">
                        <path d="M11.944 0C5.347 0 0 5.347 0 11.944 0 18.54 5.348 23.89 11.944 23.89c6.596 0 11.944-5.348 11.944-11.944C23.888 5.347 18.54 0 11.944 0zm5.823 8.358l-1.97 9.278c-.147.662-.54 8.2-.54.82L12.38 16.22l-2.07 1.99c-.208.208-.383.383-.783.383l.307-4.36 7.947-7.18c.346-.307-.075-.478-.537-.17L7.333 13.06l-4.225-1.32c-.92-.288-.936-.92.193-1.362L19.82 3.97c.763-.28 1.428.176 1.134 1.39l-3.187 2.998z" />
                    </svg>
                )
            };
        }
        if (p.includes("instagram")) {
            return {
                bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:shadow-[0_0_15px_rgba(238,42,123,0.4)]",
                svg: (
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                )
            };
        }
        if (p.includes("facebook") || p.includes("fb")) {
            return {
                bg: "bg-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]",
                svg: (
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                )
            };
        }
        if (p.includes("youtube") || p.includes("yt")) {
            return {
                bg: "bg-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]",
                svg: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.863.51 9.388.51 9.388.51s7.524 0 9.388-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                )
            };
        }
        return {
            bg: "bg-slate-800 hover:shadow-[0_0_15px_rgba(51,65,85,0.4)]",
            svg: (
                <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            )
        };
    };

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
                            {activeSocials.map((social: any, index: number) => {
                                const styles = getPlatformStyles(social.platform);
                                return (
                                    <a 
                                        key={index}
                                        href={social.url} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ${styles.bg}`}
                                        title={`Follow NGIT on ${social.platform}`}
                                    >
                                        {styles.svg}
                                    </a>
                                );
                            })}
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
                                    <Link href="/enroll" className="text-indigo-600 font-bold hover:text-slate-900 transition-colors">Online Admission</Link>
                                </li>
                                <li>
                                    <Link href="/tools" className="hover:text-slate-900 transition-colors">Practical Tools</Link>
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
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Learning Software</h4>
                            <ul className="space-y-2 text-xs font-semibold">
                                <li>
                                    <Link href="/typing-software" className="hover:text-slate-900 transition-colors">Typing Software</Link>
                                </li>
                                <li>
                                    <Link href="/steno-software" className="hover:text-slate-900 transition-colors">Steno Software</Link>
                                </li>
                                <li>
                                    <Link href="/typing-software-prayagraj" className="hover:text-slate-900 transition-colors">Typing Software Prayagraj</Link>
                                </li>
                                <li>
                                    <Link href="/steno-software-prayagraj" className="hover:text-slate-900 transition-colors">Steno Software Prayagraj</Link>
                                </li>
                                <li>
                                    <Link href="/typing" className="hover:text-slate-900 transition-colors">Online Typing Test</Link>
                                </li>
                                <li>
                                    <Link href="/steno" className="hover:text-slate-900 transition-colors">Online Steno Practice</Link>
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
                        <p className="text-[10px] font-bold text-slate-500 tracking-wider">
                            Designed & Developed by{" "}
                            <a 
                                href="https://devrajsinghtomar.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-extrabold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
                            >
                                Devraj Singh Tomar
                            </a>
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-wider text-slate-400 pt-2 justify-center sm:justify-start">
                            <Link href="/terms-and-conditions" className="hover:text-indigo-600 transition-colors">Terms & Conditions</Link>
                            <span>•</span>
                            <Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                            <span>•</span>
                            <Link href="/refund-policy" className="hover:text-indigo-600 transition-colors">Refund Policy</Link>
                        </div>
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
