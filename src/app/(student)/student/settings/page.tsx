"use client";

import React, { useEffect, useState } from "react";
import { User, Lock, Bell, LogOut, Loader2, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { updateUserDetails, updateUserPassword } from "@/app/actions/user";
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
    const [name, setName] = useState(session?.user?.name || "");
    const [image, setImage] = useState(session?.user?.image || "");
    const [notifications, setNotifications] = useState(true);
    const [isPassOpen, setIsPassOpen] = useState(false);
    const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.name) setName(session.user.name);
        if (session?.user?.image) setImage(session.user.image);
    }, [session]);

    const handleSave = async () => {
        if (!name) return toast.error("Name cannot be empty");
        setLoading(true);
        const res = await updateUserDetails({ name, image });
        if (res.success) {
            await update({ name, image });
            toast.success("Settings updated successfully!");
        } else {
            toast.error(res.error || "Failed to update settings");
        }
        setLoading(false);
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

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your preferences and security</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                            <p className="text-sm text-slate-500 font-medium">Update your public profile details</p>
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

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-slate-900"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    defaultValue={session?.user?.email || ""}
                                    disabled
                                    className="w-full h-14 px-5 rounded-2xl bg-slate-100 border-2 border-transparent text-slate-400 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications & Preferences */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
                            <p className="text-sm text-slate-500 font-medium">Customize your learning experience</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Bell className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Email Notifications</p>
                                    <p className="text-xs text-slate-500 font-bold">Receive updates about your course progress</p>
                                </div>
                            </div>
                            <Switch checked={notifications} onCheckedChange={setNotifications} />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Security</h2>
                            <p className="text-sm text-slate-500 font-medium">Protect your account access</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full h-14 justify-start px-6 rounded-2xl font-bold text-slate-600 border-2 border-slate-100 hover:bg-slate-50 hover:text-slate-900 transition-all">
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
                            className="w-full h-14 justify-start px-6 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border-transparent transition-all"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out of Account
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="h-16 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all bg-primary hover:bg-primary/95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Account Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}

