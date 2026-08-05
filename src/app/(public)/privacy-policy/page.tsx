import { Eye, Shield, Lock, Users, Clock, Mail } from "lucide-react";

export const metadata = {
    title: "Privacy Policy - National Genius Institute of Technology",
    description: "Read the Privacy Policy of National Genius Institute of Technology (NGIT) regarding how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
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
                        Privacy <span className="text-gradient">Policy</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Last Updated: {lastUpdated}</span>
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-8">
                    <p className="text-slate-600 leading-relaxed font-medium">
                        At <strong>National Genius Institute of Technology (NGIT)</strong>, we prioritize the privacy of our visitors and students. This Privacy Policy document contains types of information that is collected and recorded by NGIT and how we use it.
                    </p>

                    <hr className="border-slate-100" />

                    {/* Section 1 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Eye className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
                        </div>
                        <div className="text-slate-600 leading-relaxed pl-11 text-sm font-medium space-y-2">
                            <p>
                                When you enroll or interact with our portal, we may collect:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li><strong>Personal Details:</strong> Name, Date of Birth, Father&apos;s/Mother&apos;s Name, Aadhaar Number, and Gender.</li>
                                <li><strong>Contact Info:</strong> Local & Permanent Addresses, Email address, WhatsApp/Contact numbers.</li>
                                <li><strong>Academic Credentials:</strong> Educational certificates, qualifications, and batch preferences.</li>
                                <li><strong>Payment Details:</strong> Transaction details processed via our payment gateway partner (Razorpay). <em>Note: We do not store credit/debit card numbers or CVV.</em></li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
                        </div>
                        <div className="text-slate-600 leading-relaxed pl-11 text-sm font-medium space-y-2">
                            <p>
                                We use the collected information for various purposes:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>To process admission requests, examinations, certificates, and student records.</li>
                                <li>To manage your account, billing, and credentials for student portal and typing software.</li>
                                <li>To send important updates, fee receipts, notification alerts, and class reminders.</li>
                                <li>To secure and improve our educational services, diagnostic web systems, and server performance.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                                <Lock className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">3. Data Security and Encryption</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            NGIT is committed to ensuring that your information is secure. We implement secure hosting architectures, standard Secure Sockets Layer (SSL) certificates, and firewalls. All online payments are handled securely using encrypted merchant channels integrated directly with Razorpay, a certified PCI-DSS compliant entity.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <Users className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">4. Sharing of Information</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            We do not sell, trade, or transfer your personal data to outside advertisers or marketing firms. Data is only shared with authorized entities such as our payment gateway (Razorpay) for transaction approval, or government/university bodies for course registration or certificate verification.
                        </p>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                <Mail className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">5. Grievance Officer & Contact</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            For any inquiries regarding data access, corrections, or processing of your information, you can contact our privacy desk at <a href="mailto:contact@ngit.org.in" className="text-indigo-600 hover:underline">contact@ngit.org.in</a> or by visiting our regional office at Sainik Market, Rasulabad, Prayagraj, UP - 211004.
                        </p>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-2">Consent Notice</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                            By using our website and enrolling in our services, you hereby consent to our Privacy Policy and agree to its terms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
