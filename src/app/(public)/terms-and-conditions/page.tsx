import { FileText, ShieldAlert, Clock, Scale, BookOpen } from "lucide-react";

export const metadata = {
    title: "Terms and Conditions - National Genius Institute of Technology",
    description: "Read the Terms and Conditions of National Genius Institute of Technology (NGIT) regarding course enrollments, payments, and website usage.",
};

export default function TermsAndConditionsPage() {
    const lastUpdated = "August 05, 2026";

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden py-16">
            {/* Background glowing decorations */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                {/* Heading */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.2em]">
                        Legal Agreements
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Terms & <span className="text-gradient">Conditions</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Last Updated: {lastUpdated}</span>
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-8">
                    <p className="text-slate-600 leading-relaxed font-medium">
                        Welcome to the <strong>National Genius Institute of Technology (NGIT)</strong>. These terms and conditions outline the rules and regulations for the use of NGIT's website and services. By accessing this website or enrolling in our courses, we assume you accept these terms and conditions in full. Do not continue to use NGIT's services if you do not agree to all of the terms and conditions stated on this page.
                    </p>

                    <hr className="border-slate-100" />

                    {/* Section 1 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">1. Services & Course Enrollment</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            NGIT offers various information technology, vocational, typing software access, certificate verification, and university courses/academic programs. Admission requests made through our online portal are subject to seat availability, verification of eligible qualifications, and receipt of course fees.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Scale className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">2. Payments & Transaction Safety</h2>
                        </div>
                        <div className="text-slate-600 leading-relaxed pl-11 text-sm font-medium space-y-2">
                            <p>
                                Online payments are integrated using securely verified payment gateways (including <strong>Razorpay</strong>). By choosing to make a payment online:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>You agree to provide accurate credit card, debit card, UPI, or netbanking details.</li>
                                <li>All fees must be paid in Indian Rupees (INR) unless otherwise specified.</li>
                                <li>Payments are processed using industry-standard SSL encryption technology. We do not store your complete card credentials on our servers.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">3. Fee Structure and Taxes</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            Course fees are subject to change without prior notice. All applicable taxes (including GST) are calculated and included in the total checkout value before payment completion. Students are obligated to pay the entire scheduled fee for the selected duration of the academic course or training programs.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">4. User Account & Conduct</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            Upon registration, students may be provided with credentials for our student portal and typing practice software. You are solely responsible for maintaining the confidentiality of your account credentials. Any unauthorized share or redistribution of materials, practice tests, or credentials will lead to immediate cancellation of your admission without refund.
                        </p>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                <Scale className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">5. Governing Law & Jurisdiction</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Prayagraj, Uttar Pradesh, India</strong>.
                        </p>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-2">Need Help with Terms?</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                            If you have any questions or queries regarding our terms and conditions, please contact our administrative support desk at <a href="mailto:contact@ngit.org.in" className="text-indigo-600 hover:underline">contact@ngit.org.in</a> or call us directly at <a href="tel:+918840341525" className="text-indigo-600 hover:underline">+91 88403 41525</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
