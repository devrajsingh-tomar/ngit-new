"use client";

import { useEffect, useState } from "react";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    User, 
    CreditCard, 
    ExternalLink,
    AlertCircle,
    BadgeDollarSign,
    MoreVertical,
    Check,
    X,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPaidTestRequests, updateRequestStatus } from "@/app/actions/paidTestRequests";

export default function PaidRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const res = await getPaidTestRequests();
        if (res.success) {
            setRequests(res.requests);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
        const comment = status === "REJECTED" ? prompt("Reason for rejection?") : "";
        if (status === "REJECTED" && comment === null) return;

        const res = await updateRequestStatus(id, status as any, comment || "");
        if (res.success) {
            toast.success(`Request ${status.toLowerCase()} successfully`);
            loadRequests();
        } else {
            toast.error(res.error);
        }
    };

    const filtered = requests.filter(r => 
        r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.mockTestId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BadgeDollarSign className="w-10 h-10 text-emerald-500" />
                        Premium Test Access
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Verify payments and grant access to paid mock test series.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search by student name or test title..." 
                        className="pl-14 h-14 rounded-2xl border-none bg-slate-50 font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <Table className="min-w-[1000px]">
                    <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 pl-10">Student</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Mock Test</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Payment Info</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Status</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-right pr-10">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={5} className="h-24 bg-slate-50/20" />
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-32 text-center text-slate-300">
                                    <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="font-black uppercase tracking-widest text-xs">No payment requests found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((r) => (
                                <TableRow key={r._id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="py-8 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                {r.studentId?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 tracking-tight">{r.studentId?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.studentId?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <p className="font-black text-slate-800">{r.mockTestId?.title}</p>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400 mt-1">Requested: {new Date(r.createdAt).toLocaleDateString()}</Badge>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-emerald-600 text-lg">₹{r.amount}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CreditCard className="w-3 h-3 text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.paymentMethod}</span>
                                            </div>
                                            {r.transactionId && (
                                                <span className="text-[9px] font-black text-primary/60 mt-0.5">TXN: {r.transactionId}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8 text-center">
                                        <Badge className={`border-none font-black text-[10px] uppercase py-1 px-4 rounded-lg ${
                                            r.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                                            r.status === "REJECTED" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                        }`}>
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-8 text-right pr-10">
                                        {r.status === "PENDING" ? (
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    onClick={() => handleAction(r._id, "APPROVED")}
                                                    className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 font-black text-[11px] uppercase tracking-widest rounded-xl gap-2 shadow-lg shadow-emerald-200"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => handleAction(r._id, "REJECTED")}
                                                    className="h-10 px-4 border-2 border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 font-black text-[11px] uppercase tracking-widest rounded-xl gap-2"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-black text-slate-300 uppercase italic">Modified by Admin</p>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
