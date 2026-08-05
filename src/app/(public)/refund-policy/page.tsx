import { Landmark, AlertCircle, Clock, ShieldCheck, Mail } from "lucide-react";

export const metadata = {
    title: "Refund and Cancellation Policy - National Genius Institute of Technology",
    description: "Read the Refund and Cancellation Policy of National Genius Institute of Technology (NGIT) to understand rules for course cancellations, fee refunds, and transaction processing.",
};

export default function RefundPolicyPage() {
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
                        Refund & <span className="text-gradient">Cancellation Policy</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Last Updated: {lastUpdated}</span>
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-8">
                    <p className="text-slate-600 leading-relaxed font-medium">
                        At <strong>National Genius Institute of Technology (NGIT)</strong>, we strive to deliver premium quality education and online assessment tools. We want to ensure that our students have a transparent and clear experience when dealing with course registrations and online payments. Please review our policy on cancellations and refunds below.
                    </p>

                    <hr className="border-slate-100" />

                    {/* Section 1 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">1. Cancellation of Admission / Subscription</h2>
                        </div>
                        <div className="text-slate-600 leading-relaxed pl-11 text-sm font-medium space-y-2">
                            <p>
                                Students can cancel their admission registration or typing software subscription under the following terms:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>Cancellation requests must be submitted in writing to the administrative department or via email at <a href="mailto:contact@ngit.org.in" className="text-indigo-600 hover:underline">contact@ngit.org.in</a>.</li>
                                <li>Cancellations are accepted only prior to the commencement of the official class batch or prior to accessing premium learning modules/mock tests.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Landmark className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">2. Refund Terms</h2>
                        </div>
                        <div className="text-slate-600 leading-relaxed pl-11 text-sm font-medium space-y-2">
                            <p>
                                Fees once paid are subject to refund only under the following conditions:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>If a student requests cancellation at least 3 days prior to the start of the course batch, a 100% refund of the course fee (excluding registration processing charges) will be initiated.</li>
                                <li>Once a batch starts, classes are attended, or premium portal login details are accessed, the course fees become completely non-refundable.</li>
                                <li>If NGIT cancels or reschedules a batch indefinitely due to unforeseen administrative reasons, students will be offered a full refund of their payment.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">3. Processing of Refund</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            Approved refunds are initiated directly through our payment processor, <strong>Razorpay</strong>. The amount will be credited back to the original source card, bank account, or UPI handle that was used to make the payment. The refund processing takes <strong>5-7 business working days</strong> to reflect in the account depending on your banking institution.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <Mail className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">4. How to Apply for a Refund</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-11 text-sm font-medium">
                            To apply for a refund, please send an email to <a href="mailto:contact@ngit.org.in" className="text-indigo-600 hover:underline">contact@ngit.org.in</a> with the subject line <strong>&quot;Refund Request: [Admission Registration ID / Transaction Reference]&quot;</strong>. Include your payment receipt, student details, and the reason for the cancellation request.
                        </p>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-2">Grievance Support</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                            For tracking your refund status, please coordinate with our Accounts team at <a href="mailto:contact@ngit.org.in" className="text-indigo-600 hover:underline">contact@ngit.org.in</a> or by calling <a href="tel:+918840341525" className="text-indigo-600 hover:underline">+91 88403 41525</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
