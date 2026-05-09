"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, User, Mail, Phone, GraduationCap, Briefcase, Sparkles, Quote } from "lucide-react";
import { getCMSContent, updateCMSContent } from "@/services/CMSService";

export default function DirectorManagementPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [directorData, setDirectorData] = useState({
        name: "",
        position: "",
        qualification: "",
        email: "",
        phone: "",
        image: "",
        message: "",
        establishedYear: "2009"
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getCMSContent("DIRECTOR_INFO");
        if (data) {
            setDirectorData(data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateCMSContent("DIRECTOR_INFO", directorData);
        if (result.success) {
            toast.success("Director information updated!");
        } else {
            toast.error(result.error || "Failed to update information");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 pb-20 max-w-5xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Director <span className="text-primary">Profile</span></h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Separate Management from Faculty</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-14 rounded-2xl shadow-2xl transition-all font-black gap-3 group"
                >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {saving ? "Architecting..." : "SAVE PROFILE"}
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Left Column: Visual Identity */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-black text-slate-900 uppercase italic">Visual Identity</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border-4 border-slate-50 shadow-inner group">
                                {directorData.image ? (
                                    <img src={directorData.image} alt="Director" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 p-8 text-center">
                                        <User className="w-16 h-16 mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Image Provided</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Image URL</label>
                                <Input 
                                    value={directorData.image} 
                                    onChange={(e) => setDirectorData({...directorData, image: e.target.value})}
                                    placeholder="https://..."
                                    className="h-12 rounded-xl border-slate-200 font-bold focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Established Year</label>
                                <Input 
                                    value={directorData.establishedYear} 
                                    onChange={(e) => setDirectorData({...directorData, establishedYear: e.target.value})}
                                    placeholder="2009"
                                    className="h-12 rounded-xl border-slate-200 font-bold focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Intellectual Data */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary" /> Full Name
                                </label>
                                <Input 
                                    value={directorData.name} 
                                    onChange={(e) => setDirectorData({...directorData, name: e.target.value})}
                                    className="h-14 rounded-2xl border-slate-200 text-xl font-black focus:ring-primary shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Briefcase className="w-3 h-3 text-primary" /> Current Position
                                </label>
                                <Input 
                                    value={directorData.position} 
                                    onChange={(e) => setDirectorData({...directorData, position: e.target.value})}
                                    className="h-14 rounded-2xl border-slate-200 text-lg font-bold text-primary focus:ring-primary shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <GraduationCap className="w-3 h-3 text-primary" /> Academic Qualifications
                                </label>
                                <Input 
                                    value={directorData.qualification} 
                                    onChange={(e) => setDirectorData({...directorData, qualification: e.target.value})}
                                    className="h-14 rounded-2xl border-slate-200 font-bold focus:ring-primary shadow-sm"
                                    placeholder="e.g. M.SC, LLB"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-primary" /> Public Email
                                </label>
                                <Input 
                                    value={directorData.email} 
                                    onChange={(e) => setDirectorData({...directorData, email: e.target.value})}
                                    className="h-14 rounded-2xl border-slate-200 font-bold focus:ring-primary shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone className="w-3 h-3 text-primary" /> Contact Hotline
                            </label>
                            <Input 
                                value={directorData.phone} 
                                onChange={(e) => setDirectorData({...directorData, phone: e.target.value})}
                                className="h-14 rounded-2xl border-slate-200 font-bold focus:ring-primary shadow-sm max-w-md"
                            />
                        </div>

                        <div className="space-y-4 pt-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Quote className="w-3 h-3 text-primary" /> Visionary Message (Bio)
                            </label>
                            <Textarea 
                                value={directorData.message} 
                                onChange={(e) => setDirectorData({...directorData, message: e.target.value})}
                                className="rounded-[2.5rem] border-slate-200 min-h-[220px] p-8 text-xl font-medium leading-relaxed italic focus:ring-primary shadow-inner bg-slate-50/30"
                                placeholder="Craft the institution's vision..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
