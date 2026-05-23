"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitLeadAction } from "@/app/actions/cms-leads";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const res = await submitLeadAction({
                ...formData,
                source: "Website Contact Page"
            });

            if (res.success) {
                toast.success(res.message || "Message sent successfully!");
                setFormData({ name: "", email: "", phone: "", message: "" });
            } else {
                toast.error(res.error || "Failed to send message. Please try again.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-8 border-slate-50">
                <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter italic">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Full Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-16 px-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300 shadow-sm"
                        placeholder="Your Name"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full h-16 px-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300 shadow-sm"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full h-16 px-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300 shadow-sm"
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Your Message *</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full p-8 rounded-[2rem] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300 resize-none shadow-sm"
                        placeholder="Write your query or message here..."
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-3xl bg-slate-950 text-white hover:bg-slate-800 text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-[1.01] active:scale-98 group flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            Send Message
                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
