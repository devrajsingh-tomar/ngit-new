"use client";

import { useState } from "react";
import { 
    Trash2, 
    Calendar, 
    Filter, 
    AlertTriangle, 
    X, 
    Loader2, 
    CheckCircle2,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteResultsByFilters } from "@/app/actions/admin-bulk-delete";
import { toast } from "sonner";

export default function BulkDeleteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        type: "ALL" as "TYPING" | "MOCK_TEST" | "ALL",
        studentEmail: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.startDate && !formData.endDate && !formData.studentEmail) {
            toast.error("Please select at least one filter (Date or Email)");
            return;
        }

        const confirm = window.confirm("CRITICAL WARNING: This action is irreversible. All selected results, attempts, and answer logs will be permanently deleted. Do you want to proceed?");
        if (!confirm) return;

        setLoading(true);
        try {
            const res = await deleteResultsByFilters(formData);
            if (res.success) {
                toast.success(res.message);
                onClose();
                window.location.reload(); // Refresh data
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("System error during deletion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <header className="p-8 pb-0 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
                            <Trash2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Database Cleanup</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Bulk remove results and historical data</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>
                        <X className="w-6 h-6 text-slate-400" />
                    </Button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Warning Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                        <div>
                            <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Attention Required</p>
                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                                DELETING RESULTS WILL REMOVE ALL ASSOCIATED ATTEMPTS, SCORECARDS, AND STUDENT HISTORIES. THIS CANNOT BE UNDONE.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full h-14 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full h-14 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    value={formData.endDate}
                                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Result Category</label>
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            {[
                                { id: "ALL", label: "All Data" },
                                { id: "TYPING", label: "Typing" },
                                { id: "MOCK_TEST", label: "Mock Test" }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, type: opt.id as any})}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        formData.type === opt.id 
                                        ? "bg-white text-primary shadow-lg shadow-primary/10 border border-primary/20" 
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Student Email (Optional)</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                placeholder="Filter by specific student..."
                                className="w-full h-14 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                value={formData.studentEmail}
                                onChange={e => setFormData({...formData, studentEmail: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 h-14 rounded-2xl border-2 font-black text-xs uppercase tracking-widest"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Confirm Bulk Delete"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
