"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User, Mail, Phone, CheckCircle2, XCircle, Download, KeyRound, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getWebsiteUsers } from "@/app/actions/registration";
import { resetStudentPasswordAdmin } from "@/app/actions/student-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface WebsiteUser {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    isActive: boolean;
    createdAt: string;
}

export default function WebsiteUsersPage() {
    const [users, setUsers] = useState<WebsiteUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Password reset state
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<WebsiteUser | null>(null);
    const [newPasswordVal, setNewPasswordVal] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleGeneratePassword = () => {
        const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let pwd = "Ngit@";
        for (let i = 0; i < 4; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPasswordVal(pwd);
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPasswordVal || newPasswordVal.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        setResetting(true);
        try {
            const res = await resetStudentPasswordAdmin(selectedUser._id, newPasswordVal);
            if (res.success) {
                toast.success(res.message || "Password updated successfully!");
                setResetModalOpen(false);
                setNewPasswordVal("");
            } else {
                toast.error(res.error || "Failed to reset password");
            }
        } catch (err) {
            toast.error("Error resetting password");
        } finally {
            setResetting(false);
        }
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getWebsiteUsers({});
            if (!res.success) {
                toast.error(res.error || "Failed to load users");
                return;
            }
            setUsers(res.data as WebsiteUser[]);
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filtered = users.filter((u) => {
        return (
            !search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.mobile && u.mobile.includes(search))
        );
    });

    const handleDownloadCSV = () => {
        if (!filtered || filtered.length === 0) {
            toast.error("No user data available to download");
            return;
        }

        const headers = ["User ID", "Full Name", "Email Address", "Mobile Number", "Status", "Registered Date & Time"];
        
        const rows = filtered.map(u => [
            `"${u._id}"`,
            `"${u.name.replace(/"/g, '""')}"`,
            `"${u.email.replace(/"/g, '""')}"`,
            `"${u.mobile || 'N/A'}"`,
            `"${u.isActive ? 'Active' : 'Inactive'}"`,
            `"${new Date(u.createdAt).toLocaleString('en-IN')}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `website_users_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Successfully downloaded ${filtered.length} user records!`);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Website Users</h1>
                    <p className="text-muted-foreground mt-1">View all students registered for login access on the website.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users</p>
                            <p className="text-2xl font-black text-slate-900">{users.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                {/* Search & Actions */}
                <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email or mobile..."
                            className="w-full h-12 bg-white border rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={handleDownloadCSV}
                        disabled={loading || filtered.length === 0}
                        className="w-full md:w-auto px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> Download Users Data (CSV)
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        Loading users...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Registered On</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{u.name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">ID: {u._id.substring(u._id.length - 6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    {u.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {u.mobile || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {u.isActive ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit">
                                                    <XCircle className="w-3.5 h-3.5" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(u.createdAt).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button 
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setNewPasswordVal("");
                                                    setResetModalOpen(true);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-bold text-amber-700 border-amber-200 hover:bg-amber-50 rounded-xl"
                                            >
                                                <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset Pwd
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filtered.length === 0 && (
                            <div className="py-20 text-center text-slate-400 italic">
                                No users found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reset Password Modal */}
            <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
                <DialogContent className="max-w-md rounded-3xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-slate-900">Reset User Password</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Update login password for <span className="font-bold text-slate-800">{selectedUser?.name}</span> ({selectedUser?.email})
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 flex justify-between items-center">
                                <span>New Password</span>
                                <button 
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="text-[10px] text-amber-600 hover:underline font-bold flex items-center gap-1"
                                >
                                    <Lock className="w-3 h-3" /> Auto-Generate
                                </button>
                            </label>
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"}
                                    value={newPasswordVal}
                                    onChange={(e) => setNewPasswordVal(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)..."
                                    className="h-10 text-xs font-mono pr-10 bg-slate-50 border-slate-200 rounded-xl"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            onClick={() => setResetModalOpen(false)} 
                            variant="outline" 
                            className="h-9 text-xs font-semibold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleResetPassword}
                            disabled={resetting || !newPasswordVal}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs rounded-xl px-5"
                        >
                            {resetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Confirm Reset"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
