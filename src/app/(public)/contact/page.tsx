import { getDynamicPageData } from "@/app/actions/cms";
import DynamicRenderer from "@/components/public/DynamicRenderer";
import { MessageSquare, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import ContactForm from "@/components/public/ContactForm";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Contact Support | NGIT Academy Prayagraj",
  description: "Contact NGIT (National Genius Institute of Technology) in Prayagraj. Call +91 88403 41525 / +91 80049 58441 or email contact@ngit.org.in.",
  path: "/contact",
});

const staticFallbackContent = (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24">
        <div className="container mx-auto px-4 lg:px-10">
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary font-black uppercase tracking-widest text-xs shadow-sm">
                    <MessageSquare className="w-4 h-4 text-primary" /> Contact Support
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight italic">
                    We're Here to Help You <span className="text-primary">Succeed</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
                    Have questions about our courses, online admissions, typing & steno tests? Reach out to our support team directly.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
                {/* Contact Information Cards */}
                <div className="space-y-8">
                    {/* Location Card */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Our Location</h3>
                        <p className="text-base text-slate-600 leading-relaxed font-semibold mb-6">
                            First Floor, Sainik Market, Rasulabad Ghat Road, near Mahila Polytechnic, Rasulabad, Teliarganj, Prayagraj, Uttar Pradesh 211004
                        </p>
                        <a
                            href="https://www.google.com/maps/place/National+Genius+Institute+Of+Technology/@25.4967301,81.853729,17z/data=!3m1!4b1!4m5!3m4!1s0x399acba945e652c3:0x2b9cca1b43a5302d!8m2!3d25.4967253!4d81.8559177"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors bg-primary/5 border border-primary/20 px-5 py-3 rounded-xl"
                        >
                            Open in Google Maps <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        {/* Phone Support */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 space-y-4">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                                <Phone className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Call Support</h3>
                                <div className="space-y-1 text-sm font-bold text-slate-700">
                                    <a href="tel:+918840341525" className="block hover:text-primary transition-colors">
                                        +91 88403 41525
                                    </a>
                                    <a href="tel:+918004958441" className="block hover:text-primary transition-colors text-slate-500">
                                        +91 80049 58441
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        {/* Email Support */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 space-y-4">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <Mail className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Email Us</h3>
                                <a href="mailto:contact@ngit.org.in" className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors break-all">
                                    contact@ngit.org.in
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <ContactForm />
            </div>
        </div>
    </div>
);

export default async function PublicContactPage() {
    const dynamicData = await getDynamicPageData("contact");
    const cmsSections = dynamicData.success && dynamicData.sections ? dynamicData.sections : [];

    return (
        <div className="min-h-screen">
            <DynamicRenderer sections={cmsSections} staticFallback={staticFallbackContent} />
        </div>
    );
}
