"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    ArrowUpRight,
    Loader2,
    Edit2,
    Trash2,
    Save
} from "lucide-react";
import { 
    getGlobalPaymentsData, 
    updatePaymentAction, 
    deletePaymentAction 
} from "@/app/actions/admin-payment";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingCount: 0,
        failedCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [editAmount, setEditAmount] = useState<number>(0);
    const [editStatus, setEditStatus] = useState<string>("PENDING");
    const [updating, setUpdating] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getGlobalPaymentsData({});
        if (res.success) {
            setPayments(res.data.payments || []);
            setStats({
                totalRevenue: res.data.totalRevenue || 0,
                pendingCount: res.data.pendingCount || 0,
                failedCount: res.data.failedCount || 0
            });
        } else {
            toast.error("Failed to fetch payments data");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case "PENDING": return <Clock className="w-4 h-4 text-amber-500" />;
            case "FAILED": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const handleEditClick = (p: any) => {
        setSelectedPayment(p);
        setEditAmount(p.amount);
        setEditStatus(p.status);
        setEditModalOpen(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedPayment) return;
        setUpdating(true);
        const res = await updatePaymentAction({
            id: selectedPayment.id,
            amount: editAmount,
            status: editStatus as any
        });
        if (res.success) {
            toast.success("Payment transaction updated successfully!");
            setEditModalOpen(false);
            loadData();
        } else {
            toast.error(res.error || "Failed to update payment");
        }
        setUpdating(false);
    };

    const handleDeletePayment = async () => {
        if (!selectedPayment) return;
        if (!confirm(`Are you absolutely sure you want to delete this payment record for ${selectedPayment.student}? This cannot be undone.`)) return;
        
        setUpdating(true);
        const res = await deletePaymentAction({ id: selectedPayment.id });
        if (res.success) {
            toast.success("Payment transaction deleted successfully!");
            setEditModalOpen(false);
            loadData();
        } else {
            toast.error(res.error || "Failed to delete payment");
        }
        setUpdating(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment Transactions</h1>
                    <p className="text-muted-foreground mt-1">Monitor revenue and enrollment payments across the institute.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="gap-2 h-12 rounded-xl">
                        Export CSV <ArrowUpRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Revenue", val: `₹${stats.totalRevenue.toLocaleString()}`, delta: "Realtime", color: "bg-emerald-50 text-emerald-600" },
                    { label: "Pending Orders", val: String(stats.pendingCount), delta: "Awaiting Capture", color: "bg-amber-50 text-amber-600" },
                    { label: "Failed Payments", val: String(stats.failedCount), delta: "Requires attention", color: "bg-red-50 text-red-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>}
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <div className="flex items-baseline gap-3 mt-2">
                            <h2 className="text-4xl font-black text-slate-900 line-clamp-1">{stat.val}</h2>
                            <span className={stat.color + " text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tight whitespace-nowrap"}>{stat.delta}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Find transaction by ID or name..."
                            className="w-full h-12 bg-white border rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11"><MoreVertical className="w-4 h-4" /></Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Product</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-600 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-8 text-center text-slate-400 italic">No payments found.</td>
                                </tr>
                            ) : payments.filter(p =>
                                p.student?.toLowerCase().includes(search.toLowerCase()) ||
                                p.orderId?.toLowerCase().includes(search.toLowerCase())
                            ).map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 capitalize">{p.student}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.orderId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm">
                                        <p className="font-bold">{p.course}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{p.date}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(p.status)}
                                            <span className="text-[10px] font-black tracking-widest uppercase">{p.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-xl font-black text-slate-900">₹{p.amount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(p)}
                                            className="h-8 rounded-lg text-xs font-bold gap-1 border-slate-200"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT/MANAGE DIALOG */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Manage Transaction</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-bold border">
                                <div>
                                    <span className="text-slate-400 uppercase tracking-wider block mb-0.5">Student</span>
                                    <span className="text-slate-800 capitalize block text-sm font-extrabold">{selectedPayment.student}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase tracking-wider block mb-0.5">Course</span>
                                    <span className="text-slate-800 block text-sm font-extrabold">{selectedPayment.course}</span>
                                </div>
                                <div className="col-span-2 border-t pt-2 mt-2">
                                    <span className="text-slate-400 uppercase tracking-wider block mb-0.5">Transaction Order ID</span>
                                    <span className="text-slate-800 font-mono text-[10px] tracking-wide block">{selectedPayment.orderId}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="font-bold text-slate-700">Transaction Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(Number(e.target.value))}
                                    className="rounded-xl h-11"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-700">Payment Status</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["PENDING", "SUCCESS", "FAILED"].map((st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setEditStatus(st)}
                                            className={`h-11 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border ${
                                                editStatus === st
                                                    ? st === "SUCCESS"
                                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                        : st === "PENDING"
                                                        ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                                                        : "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeletePayment}
                            disabled={updating}
                            className="w-full sm:w-auto h-11 rounded-xl font-bold gap-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                        <div className="flex gap-2 w-full sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                                disabled={updating}
                                className="h-11 rounded-xl font-bold border-slate-200 flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveChanges}
                                disabled={updating}
                                className="h-11 rounded-xl font-bold gap-1 flex-1 sm:flex-none bg-primary hover:bg-primary/95 text-white"
                            >
                                {updating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
