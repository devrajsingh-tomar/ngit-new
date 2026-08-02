"use client";

import React, { useEffect, useState } from "react";
import { User, Lock, Bell, LogOut, Loader2, Save, Camera, Contact, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { updateUserDetails, updateUserPassword, getStudentProfile, updateStudentProfile } from "@/app/actions/user";
import { ImageUpload } from "@/components/ui/image-upload";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentSettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [name, setName] = useState(session?.user?.name || "");
    const [image, setImage] = useState(session?.user?.image || "");
    const [notifications, setNotifications] = useState(true);
    const [isPassOpen, setIsPassOpen] = useState(false);
    const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
    const [passLoading, setPassLoading] = useState(false);

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        aadharNo: "",
        category: "General",
        localAddress: "",
        localPhone: "",
        permanentAddress: "",
        permanentPhone: "",
        gender: "Male",
        nationality: "Indian",
        religion: "Hindu",
        abcId: "",
        guardianPhone: "",
        whatsappNo: "",
    });

    useEffect(() => {
        if (session?.user?.name) setName(session.user.name);
        if (session?.user?.image) setImage(session.user.image);
    }, [session]);

    // Load student profile details on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await getStudentProfile();
                if (res.success && res.data) {
                    const p = res.data;
                    setProfileForm({
                        fatherName: p.fatherName === "—" ? "" : (p.fatherName || ""),
                        motherName: p.motherName === "—" ? "" : (p.motherName || ""),
                        dateOfBirth: p.dateOfBirth === "—" ? "" : (p.dateOfBirth || ""),
                        aadharNo: p.aadharNo === "—" ? "" : (p.aadharNo || ""),
                        category: p.category || "General",
                        localAddress: p.localAddress === "—" ? "" : (p.localAddress || ""),
                        localPhone: p.localPhone === "—" ? "" : (p.localPhone || ""),
                        permanentAddress: p.permanentAddress === "—" ? "" : (p.permanentAddress || ""),
                        permanentPhone: p.permanentPhone === "—" ? "" : (p.permanentPhone || ""),
                        gender: p.gender || "Male",
                        nationality: p.nationality || "Indian",
                        religion: p.religion || "Hindu",
                        abcId: p.abcId || "",
                        guardianPhone: p.guardianPhone || "",
                        whatsappNo: p.whatsappNo || "",
                    });
                }
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setProfileLoading(false);
            }
        };
        loadProfile();
    }, []);

    const setProfileField = (field: string, value: string) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
    };

    const copyLocalToPermanent = () => {
        setProfileForm(prev => ({
            ...prev,
            permanentAddress: prev.localAddress,
            permanentPhone: prev.localPhone
        }));
        toast.info("Copied local address details to permanent fields");
    };

    const handleSave = async () => {
        if (!name) return toast.error("Name cannot be empty");
        
        // Form validations
        if (!profileForm.fatherName.trim()) return toast.error("Father's Name is required");
        if (!profileForm.motherName.trim()) return toast.error("Mother's Name is required");
        if (!profileForm.dateOfBirth.trim()) return toast.error("Date of Birth is required");
        if (!profileForm.aadharNo.trim() || profileForm.aadharNo.length !== 12) {
            return toast.error("Aadhar Card Number must be exactly 12 digits");
        }
        if (!profileForm.localAddress.trim()) return toast.error("Local Address is required");
        if (!profileForm.localPhone.trim()) return toast.error("Local Phone Number is required");
        if (!profileForm.permanentAddress.trim()) return toast.error("Permanent Address is required");

        setLoading(true);
        try {
            // 1. Update basic User account details
            const resUser = await updateUserDetails({ name, image });
            if (!resUser.success) {
                throw new Error(resUser.error || "Failed to update account details");
            }
            await update({ name, image });

            // 2. Update Student Profile details
            const resProfile = await updateStudentProfile(profileForm);
            if (!resProfile.success) {
                throw new Error(resProfile.error || "Failed to update profile details");
            }

            toast.success("All profile details updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "An error occurred while saving profile changes");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) return toast.error("New passwords do not match");
        if (passData.new.length < 6) return toast.error("Password must be at least 6 characters");
        
        setPassLoading(true);
        const res = await updateUserPassword({ current: passData.current, new: passData.new });
        if (res.success) {
            toast.success("Password updated successfully!");
            setIsPassOpen(false);
            setPassData({ current: "", new: "", confirm: "" });
        } else {
            toast.error(res.error || "Failed to update password");
        }
        setPassLoading(false);
    };

    if (profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Settings Panel...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your learning identity, profile details, and security</p>
            </div>

            <div className="space-y-6">
                {/* 1. Account Settings Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Student Identity</h2>
                            <p className="text-sm text-slate-500 font-medium">Update your login profile image and full name</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Image Upload Area */}
                        <div className="flex flex-col items-center gap-4 shrink-0">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
                                    {image ? (
                                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                            <User className="w-12 h-12 text-slate-200" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <ImageUpload 
                                value={image} 
                                onChange={(url) => setImage(url)}
                                label="Upload Photo"
                                className="w-40"
                            />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    defaultValue={session?.user?.email || ""}
                                    disabled
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-100 border-2 border-transparent text-slate-400 font-medium cursor-not-allowed text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Personal Profile Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Contact className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Personal &amp; Parents Details</h2>
                            <p className="text-sm text-slate-500 font-medium">Verify or complete registration parameters</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Father's Name</label>
                            <input
                                type="text"
                                value={profileForm.fatherName}
                                onChange={(e) => setProfileField("fatherName", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                placeholder="Enter father's name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Mother's Name</label>
                            <input
                                type="text"
                                value={profileForm.motherName}
                                onChange={(e) => setProfileField("motherName", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                placeholder="Enter mother's name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Date of Birth</label>
                            <input
                                type="date"
                                value={profileForm.dateOfBirth}
                                onChange={(e) => setProfileField("dateOfBirth", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Aadhar Card Number</label>
                            <input
                                type="text"
                                maxLength={12}
                                value={profileForm.aadharNo}
                                onChange={(e) => setProfileField("aadharNo", e.target.value.replace(/\D/g, ""))}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-mono font-bold text-slate-900 text-xs"
                                placeholder="12-digit Aadhar number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Gender</label>
                            <select
                                value={profileForm.gender}
                                onChange={(e) => setProfileField("gender", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs cursor-pointer"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Category</label>
                            <select
                                value={profileForm.category}
                                onChange={(e) => setProfileField("category", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs cursor-pointer"
                            >
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Religion</label>
                            <select
                                value={profileForm.religion}
                                onChange={(e) => setProfileField("religion", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs cursor-pointer"
                            >
                                <option value="Hindu">Hindu</option>
                                <option value="Muslim">Muslim</option>
                                <option value="Sikh">Sikh</option>
                                <option value="Christian">Christian</option>
                                <option value="Jain">Jain</option>
                                <option value="Buddhist">Buddhist</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Nationality</label>
                            <input
                                type="text"
                                value={profileForm.nationality}
                                onChange={(e) => setProfileField("nationality", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                placeholder="Enter nationality"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">ABC ID (Academic Bank of Credits)</label>
                            <input
                                type="text"
                                value={profileForm.abcId}
                                onChange={(e) => setProfileField("abcId", e.target.value)}
                                className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-mono font-bold text-slate-900 text-xs"
                                placeholder="ABC ID (Optional)"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Address & Contact Details Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Home className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Address &amp; Contacts</h2>
                                <p className="text-sm text-slate-500 font-medium">Verify your current residential information</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={copyLocalToPermanent}
                            className="px-4 py-2 border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Same as Local Address
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Local Address</label>
                                <textarea
                                    value={profileForm.localAddress}
                                    onChange={(e) => setProfileField("localAddress", e.target.value)}
                                    rows={2}
                                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs leading-relaxed resize-none"
                                    placeholder="Enter your current address details"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Local Phone Number</label>
                                <input
                                    type="text"
                                    value={profileForm.localPhone}
                                    onChange={(e) => setProfileField("localPhone", e.target.value.replace(/\D/g, ""))}
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                    placeholder="Enter active local mobile"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={profileForm.whatsappNo}
                                    onChange={(e) => setProfileField("whatsappNo", e.target.value.replace(/\D/g, ""))}
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                    placeholder="Enter active WhatsApp mobile"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Permanent Address</label>
                                <textarea
                                    value={profileForm.permanentAddress}
                                    onChange={(e) => setProfileField("permanentAddress", e.target.value)}
                                    rows={2}
                                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs leading-relaxed resize-none"
                                    placeholder="Enter your home address details"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Permanent Phone Number</label>
                                <input
                                    type="text"
                                    value={profileForm.permanentPhone}
                                    onChange={(e) => setProfileField("permanentPhone", e.target.value.replace(/\D/g, ""))}
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                    placeholder="Enter permanent phone (Optional)"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Guardian / Emergency Contact Number</label>
                                <input
                                    type="text"
                                    value={profileForm.guardianPhone}
                                    onChange={(e) => setProfileField("guardianPhone", e.target.value.replace(/\D/g, ""))}
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-xs"
                                    placeholder="Enter guardian mobile (Optional)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Security Options Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Security &amp; Preferences</h2>
                            <p className="text-sm text-slate-500 font-medium">Protect your account access and preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full h-14 justify-start px-6 rounded-2xl font-bold text-slate-600 border-2 border-slate-100 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs">
                                    <Lock className="w-5 h-5 mr-3 opacity-50" />
                                    Change Security Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Change Password</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Current Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="rounded-xl h-12"
                                            value={passData.current}
                                            onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="rounded-xl h-12"
                                            value={passData.new}
                                            onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="rounded-xl h-12"
                                            value={passData.confirm}
                                            onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                        />
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" disabled={passLoading} className="w-full h-12 rounded-xl font-black">
                                            {passLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Update Password"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="destructive"
                            className="w-full h-14 justify-start px-6 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border-transparent transition-all text-xs"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out of Account
                        </Button>
                    </div>
                </div>

                {/* Save Changes Floating CTA */}
                <div className="flex justify-end pt-4">
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="h-16 px-10 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all bg-primary hover:bg-primary/95 text-white"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Account Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
