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
    Save,
    PlusCircle,
    CalendarDays,
    IndianRupee,
    User,
    BookOpen
} from "lucide-react";
import { 
    getGlobalPaymentsData, 
    updatePaymentAction, 
    deletePaymentAction,
    getAdminFeeData,
    addManualPayment
} from "@/app/actions/admin-payment";
import { 
    getAdminInvoices, 
    payInstallment, 
    createInvoice 
} from "@/app/actions/admin-invoice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ActiveTab = "transactions" | "balances" | "invoices";

export default function AdminPaymentsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("transactions");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Transactions State
    const [payments, setPayments] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingCount: 0,
        failedCount: 0
    });

    // Balances/Ledger State
    const [feeData, setFeeData] = useState<{ students: any[], enrollments: any[], payments: any[] }>({
        students: [], enrollments: [], payments: []
    });
    const [manualAmounts, setManualAmounts] = useState<Record<string, number>>({});

    // Invoices State
    const [invoices, setInvoices] = useState<any[]>([]);
    const [openAddInvoice, setOpenAddInvoice] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        studentId: "", courseId: "", totalAmount: 0, dueDate: "", installments: [{ amount: 0, dueDate: "" }], notes: ""
    });
    const [creatingInvoice, setCreatingInvoice] = useState(false);

    // Edit Transaction Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [editAmount, setEditAmount] = useState<number>(0);
    const [editStatus, setEditStatus] = useState<string>("PENDING");
    const [updating, setUpdating] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [txRes, feeRes, invRes] = await Promise.all([
                getGlobalPaymentsData({}),
                getAdminFeeData({}),
                getAdminInvoices()
            ]);

            if (txRes.success) {
                setPayments(txRes.data.payments || []);
                setStats({
                    totalRevenue: txRes.data.totalRevenue || 0,
                    pendingCount: txRes.data.pendingCount || 0,
                    failedCount: txRes.data.failedCount || 0
                });
            } else {
                toast.error("Failed to fetch payments data");
            }

            if (feeRes.success) {
                setFeeData(feeRes.data);
            } else {
                toast.error(feeRes.error || "Failed to load fee data");
            }

            if (invRes.success) {
                setInvoices(invRes.invoices || []);
            } else {
                toast.error(invRes.error || "Failed to load invoices");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load finance data");
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

    // ── Edit/Update/Delete Transaction Actions ──
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

    // ── Fee Ledger Manual Logging ──
    const handleMarkPaid = async (userId: string, courseId: string, amount: number) => {
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }
        if (!confirm(`Mark ₹${amount} as PAID manually?`)) return;
        try {
            const res = await addManualPayment({ userId, courseId, amount });
            if (res.success) {
                toast.success("Payment recorded!");
                loadData();
            } else {
                toast.error(res.error || "Failed to log payment");
            }
        } catch (error) {
            toast.error("Error confirming payment.");
        }
    };

    // ── Installment Management Actions ──
    const handlePayInstallment = async (invoiceId: string, index: number, amt: number) => {
        if (!confirm(`Record manual payment of ₹${amt} for this installment?`)) return;
        try {
            const res = await payInstallment(invoiceId, index);
            if (res.success) {
                toast.success("Installment paid successfully!");
                loadData();
            } else {
                toast.error(res.error || "Failed to pay installment");
            }
        } catch (error) {
            toast.error("Server error");
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingInvoice(true);

        const totalInstAmt = invoiceForm.installments.reduce((acc, inst) => acc + (inst.amount || 0), 0);
        if (totalInstAmt !== invoiceForm.totalAmount) {
            toast.error(`Installments (₹${totalInstAmt}) must exactly equal Total Amount (₹${invoiceForm.totalAmount})`);
            setCreatingInvoice(false);
            return;
        }

        try {
            const res = await createInvoice({
                ...invoiceForm,
                dueDate: new Date(invoiceForm.dueDate),
                installments: invoiceForm.installments.map(i => ({ amount: i.amount, dueDate: new Date(i.dueDate) }))
            });

            if (res.success) {
                toast.success("Custom Invoice & Installments Created!");
                setOpenAddInvoice(false);
                setInvoiceForm({
                    studentId: "", courseId: "", totalAmount: 0, dueDate: "", installments: [{ amount: 0, dueDate: "" }], notes: ""
                });
                loadData();
            } else {
                toast.error(res.error || "Failed to create invoice");
            }
        } catch (error) {
            toast.error("Server Error");
        }
        setCreatingInvoice(false);
    };

    // ── Fee Ledger Aggregation ──
    const studentFeeRecords: any[] = [];
    feeData.enrollments.forEach(en => {
        const student = feeData.students.find(s => s._id === en.userId);
        if (!student) return;

        const amount = en.courseId?.price || 0;
        const coursePayments = feeData.payments.filter(p => p.userId === student._id && p.courseId?._id === en.courseId?._id && p.status === "SUCCESS");
        const totalPaid = coursePayments.reduce((sum, p) => sum + p.amount, 0);
        const balance = amount - totalPaid;
        const isPaid = balance <= 0;

        studentFeeRecords.push({
            studentId: student._id,
            studentName: student.name,
            studentEmail: student.email,
            courseId: en.courseId?._id,
            courseName: en.courseId?.title,
            coursePrice: amount,
            totalPaid,
            balance,
            status: isPaid ? "PAID" : "PARTIAL"
        });
    });

    const filteredPayments = payments.filter(p =>
        (p.student || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.course || "").toLowerCase().includes(search.toLowerCase())
    );

    const filteredBalances = studentFeeRecords.filter(r =>
        (r.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.courseName || "").toLowerCase().includes(search.toLowerCase())
    );

    const filteredInvoices = invoices.filter(i =>
        (i.studentId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.invoiceNumber || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Finance & Payments Center</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor revenue, log manual collections, and manage installment structures.</p>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab === "invoices" && (
                        <Dialog open={openAddInvoice} onOpenChange={setOpenAddInvoice}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                                    <PlusCircle className="w-5 h-5 mr-2" /> Custom Invoice
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-8 border-none bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Create Installment Invoice</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Student</label>
                                            <select
                                                required className="w-full h-12 bg-slate-50 border rounded-xl px-4 font-bold text-slate-700 outline-none"
                                                value={invoiceForm.studentId} onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                                            >
                                                <option value="">-- Select Student --</option>
                                                {feeData.students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Course</label>
                                            <select
                                                required className="w-full h-12 bg-slate-50 border rounded-xl px-4 font-bold text-slate-700 outline-none"
                                                value={invoiceForm.courseId} onChange={e => {
                                                    const enr = feeData.enrollments.find((en: any) => en.courseId?._id === e.target.value);
                                                    setInvoiceForm({ ...invoiceForm, courseId: e.target.value, totalAmount: enr?.courseId?.price || invoiceForm.totalAmount })
                                                }}
                                            >
                                                <option value="">-- Select Course (From Enrollments) --</option>
                                                {Array.from(new Set(feeData.enrollments.map(e => e.courseId))).filter(Boolean).map((c: any) =>
                                                    <option key={c._id} value={c._id}>{c.title} (₹{c.price})</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Amount</label>
                                            <Input required type="number" value={invoiceForm.totalAmount} onChange={e => setInvoiceForm({ ...invoiceForm, totalAmount: Number(e.target.value) })} className="h-12 border-slate-200 rounded-xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Final Due Date</label>
                                            <Input required type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="h-12 border-slate-200 rounded-xl font-bold" />
                                        </div>
                                    </div>

                                    <div className="pt-4 pb-2 border-b border-t mt-4 border-slate-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Payment Installments</label>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setInvoiceForm({ ...invoiceForm, installments: [...invoiceForm.installments, { amount: 0, dueDate: "" }] })} className="rounded-lg h-7 text-[10px]"><PlusCircle className="w-3 h-3 mr-1" /> Add Phase</Button>
                                        </div>
                                        {invoiceForm.installments.map((inst, i) => (
                                            <div key={i} className="flex items-center gap-3 mb-3">
                                                <div className="flex-1 space-y-1">
                                                    <Input required type="number" placeholder="Amt ₹" value={inst.amount} onChange={e => {
                                                        const newInsts = [...invoiceForm.installments];
                                                        newInsts[i].amount = Number(e.target.value);
                                                        setInvoiceForm({ ...invoiceForm, installments: newInsts });
                                                    }} className="h-10 text-xs font-bold" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <Input required type="date" value={inst.dueDate} onChange={e => {
                                                        const newInsts = [...invoiceForm.installments];
                                                        newInsts[i].dueDate = e.target.value;
                                                        setInvoiceForm({ ...invoiceForm, installments: newInsts });
                                                    }} className="h-10 text-xs font-bold" />
                                                </div>
                                                {invoiceForm.installments.length > 1 && (
                                                    <Button type="button" variant="ghost" onClick={() => {
                                                        const newInsts = invoiceForm.installments.filter((_, idx) => idx !== i);
                                                        setInvoiceForm({ ...invoiceForm, installments: newInsts });
                                                    }} className="h-10 text-red-400 hover:text-red-600">X</Button>
                                                )}
                                            </div>
                                        ))}
                                        <p className="text-[10px] text-right text-slate-400 font-bold uppercase mt-2">
                                            Remaining balance: ₹{(invoiceForm.totalAmount - invoiceForm.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0))}
                                        </p>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Invoice Terms / Notes</label>
                                        <Input value={invoiceForm.notes} placeholder="e.g. Late fee of Rs 500 applies past due date." onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} className="h-12 border-slate-200 rounded-xl" />
                                    </div>

                                    <Button type="submit" disabled={creatingInvoice} className="w-full h-14 mt-4 rounded-xl text-lg font-black bg-primary">
                                        {creatingInvoice ? "Creating Ledger..." : "Generate Invoice Structure"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button variant="outline" className="gap-2 h-12 rounded-xl text-xs font-bold">
                        Export CSV <ArrowUpRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
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

            {/* Premium Tab Selector */}
            <div className="flex gap-2 border-b pb-1 border-slate-100">
                {[
                    { id: "transactions", label: "Transactions Stream" },
                    { id: "balances", label: "Student Ledgers" },
                    { id: "invoices", label: "Invoices & Installments" }
                ].map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                            setActiveTab(t.id as ActiveTab);
                            setSearch("");
                        }}
                        className={cn(
                            "px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all duration-300",
                            activeTab === t.id
                                ? "border-primary text-slate-900"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Search filter panel */}
            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder={
                                activeTab === "transactions"
                                    ? "Find transaction by ID or name..."
                                    : activeTab === "balances"
                                    ? "Find student or course..."
                                    : "Find student or invoice number..."
                            }
                            className="w-full h-12 bg-white border rounded-xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11"><MoreVertical className="w-4 h-4" /></Button>
                </div>

                <div className="overflow-x-auto">
                    {/* TAB 1: TRANSACTIONS STREAM */}
                    {activeTab === "transactions" && (
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
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-slate-400 italic">No payments found.</td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((p) => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* TAB 2: STUDENT LEDGERS */}
                    {activeTab === "balances" && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Course</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Ledger</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Offline Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-600 font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading student balances...
                                        </td>
                                    </tr>
                                ) : filteredBalances.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-8 text-center text-slate-400 italic">No ledgers found.</td>
                                    </tr>
                                ) : (
                                    filteredBalances.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 capitalize">{r.studentName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.studentEmail}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm">
                                                <p className="font-bold">{r.courseName || "Unknown Course"}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">TOTAL: ₹{r.coursePrice.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <span className={cn(
                                                        "text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg",
                                                        r.status === "PAID" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                                    )}>
                                                        {r.status === "PAID" ? "Fully Paid" : "Pending Due"}
                                                    </span>
                                                    <div className="text-xs">
                                                        <span className="text-slate-400 font-bold">Paid: </span>
                                                        <span className="text-slate-800 font-black">₹{r.totalPaid.toLocaleString()}</span>
                                                        {r.balance > 0 && (
                                                            <span className="text-rose-500 font-black ml-2">(Due: ₹{r.balance.toLocaleString()})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {r.balance > 0 ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="relative w-28">
                                                            <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                            <input
                                                                type="number"
                                                                placeholder="Amount"
                                                                value={manualAmounts[r.studentId + "_" + r.courseId] || ""}
                                                                onChange={(e) => setManualAmounts({
                                                                    ...manualAmounts,
                                                                    [r.studentId + "_" + r.courseId]: Number(e.target.value)
                                                                })}
                                                                className="w-full h-8 bg-slate-50 border rounded-lg pl-7 pr-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleMarkPaid(r.studentId, r.courseId, manualAmounts[r.studentId + "_" + r.courseId] || 0)}
                                                            className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                                        >
                                                            Collect
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* TAB 3: INVOICES & INSTALLMENTS */}
                    {activeTab === "invoices" && (
                        <div className="p-8 space-y-6">
                            {loading ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading structured invoices...
                                </div>
                            ) : filteredInvoices.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 italic">
                                    No custom invoices set up. Click "Custom Invoice" to begin.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {(filteredInvoices || []).map((inv) => (
                                        <div key={inv._id} className="bg-slate-50/50 hover:bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-slate-900 text-lg capitalize">{inv.studentId?.name || "Deleted Student"}</h4>
                                                            <span className={cn(
                                                                "text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md",
                                                                inv.status === "PAID" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                                            )}>
                                                                {inv.status || "PENDING"}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase">{inv.invoiceNumber} · {inv.courseId?.title || "Deleted Course"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Amount</span>
                                                        <span className="text-lg font-black text-slate-800">₹{(inv.totalAmount || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Balance Due</span>
                                                        <span className="text-lg font-black text-rose-500">₹{(inv.balanceDue || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Installment Phases</label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {(inv.installments || []).map((inst: any, idx: number) => (
                                                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-sm flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400">Phase {idx + 1}</p>
                                                                <p className="text-base font-black text-slate-900 mt-1">₹{(inst.amount || 0).toLocaleString()}</p>
                                                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                                    <CalendarDays className="w-3 h-3" /> Due {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : "N/A"}
                                                                </span>
                                                            </div>
                                                            {inst.status === "PAID" ? (
                                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                                                                </span>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePayInstallment(inv._id, idx, inst.amount)}
                                                                    className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                                                >
                                                                    Mark Paid
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT/MANAGE TRANSACTION DIALOG */}
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
