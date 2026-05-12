"use client";

import { useEffect, useState } from "react";
import { getMockTestResultsAdmin, deleteMockTestResult, publishMockTestResults, unpublishMockTestResults } from "@/app/actions/mockTestResults";
import { getAdminQuizzes } from "@/app/actions/admin-quizzes";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, Filter, Download, Trash2, 
    CheckCircle2, XCircle, Clock, Eye, MoreVertical,
    Send, Settings as SettingsIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BulkDeleteModal from "@/components/admin/BulkDeleteModal";

export default function MockTestResultsAdminPage() {
    const [results, setResults] = useState<any[]>([]);
    const [mockTests, setMockTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterExamCode, setFilterExamCode] = useState("ALL");
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState("");
    const [publishSettings, setPublishSettings] = useState({
        publishToStudentPanel: true,
        publishToPublicWebsite: false,
        customHeading: ""
    });

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        const [res, mockRes] = await Promise.all([
            getMockTestResultsAdmin(),
            getAdminQuizzes()
        ]);
        
        if (res.success) {
            setResults(res.results);
        } else {
            toast.error(res.error || "Failed to load results");
        }

        if (mockRes.success) {
            setMockTests(mockRes.quizzes);
        }
        
        setLoading(false);
    };

    const handleExportCSV = () => {
        if (results.length === 0) return;
        const headers = ["Student Name", "Email", "Mock Test", "Course", "Batch", "Score", "Total Marks", "Rank", "Percentile", "Attempt Date"];
        const rows = results.map(r => [
            r.studentId?.name || "N/A",
            r.studentId?.email || "N/A",
            r.mockTestId?.title || "N/A",
            r.course || "N/A",
            r.batch || "Regular",
            r.score,
            r.totalMarks,
            r.rank || "-",
            r.percentile || "-",
            new Date(r.attemptDate).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `mock_test_results_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this result?")) return;
        const res = await deleteMockTestResult(id);
        if (res.success) {
            toast.success("Result deleted");
            loadResults();
        } else {
            toast.error(res.error);
        }
    };

    const handlePublish = async () => {
        if (!selectedQuizId) return toast.error("Please select a quiz to publish");
        const res = await publishMockTestResults(selectedQuizId, publishSettings);
        if (res.success) {
            toast.success(res.message);
            setIsPublishDialogOpen(false);
            loadResults();
        } else {
            toast.error(res.error);
        }
    };

    const handleUnpublish = async (quizId: string) => {
        if (!confirm("Are you sure you want to unpublish results for this test? Results will be hidden from students and public website.")) return;
        const res = await unpublishMockTestResults(quizId);
        if (res.success) {
            toast.success(res.message);
            loadResults();
        } else {
            toast.error(res.error);
        }
    };

    const filteredResults = results.filter(res => {
        const matchesSearch = res.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || res.mockTestId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesExamCode = filterExamCode === "ALL" || res.mockTestId?.examCode === filterExamCode;
        return matchesSearch && matchesExamCode;
    });

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mock Test Results</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and publish student performance rankings</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl h-14 font-black gap-2 px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                <Send className="w-5 h-5" />
                                Publish New Results
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] p-10 max-w-lg border-none shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black mb-6">Result Release Panel</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 text-sm uppercase tracking-widest">Select Mock Test</Label>
                                    <select 
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                        value={selectedQuizId}
                                        onChange={(e) => setSelectedQuizId(e.target.value)}
                                    >
                                        <option value="">Choose an Assessment</option>
                                        {mockTests.map((test: any) => (
                                            <option key={test._id} value={test._id}>{test.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 text-sm uppercase tracking-widest">Global Heading</Label>
                                    <Input 
                                        placeholder="e.g. JEE Mock Test - March 2026"
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
                                        value={publishSettings.customHeading}
                                        onChange={(e) => setPublishSettings({...publishSettings, customHeading: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="student-panel" className="font-bold cursor-pointer">Student Panel</Label>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Visible to candidates</p>
                                        </div>
                                        <Switch 
                                            id="student-panel" 
                                            checked={publishSettings.publishToStudentPanel}
                                            onCheckedChange={(val: boolean) => setPublishSettings({...publishSettings, publishToStudentPanel: !!val})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between bg-white p-5 rounded-2xl border-2 border-primary/10 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="public-web" className="font-bold cursor-pointer text-primary">Public Rankings</Label>
                                            <p className="text-[10px] text-primary/60 font-bold uppercase">Visible on public Website</p>
                                        </div>
                                        <Switch 
                                            id="public-web" 
                                            className="data-[state=checked]:bg-primary"
                                            checked={publishSettings.publishToPublicWebsite}
                                            onCheckedChange={(val: boolean) => setPublishSettings({...publishSettings, publishToPublicWebsite: !!val})}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full h-16 rounded-[1.5rem] font-black text-lg gap-3 mt-4" onClick={handlePublish}>
                                    <CheckCircle2 className="w-6 h-6" />
                                    Launch Results Now
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <div className="flex bg-white border border-slate-100 p-1 rounded-2xl">
                        <Button variant="ghost" className="rounded-xl h-10 px-4 font-bold text-xs gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-600" onClick={() => setIsBulkDeleteOpen(true)}>
                            <Trash2 className="w-4 h-4" /> Bulk Delete
                        </Button>
                    </div>
                </div>
            </div>

            <BulkDeleteModal 
                isOpen={isBulkDeleteOpen} 
                onClose={() => setIsBulkDeleteOpen(false)} 
            />

            {/* Filters bar */}
            <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Filter by student name, email or mock test..." 
                        className="pl-14 h-14 rounded-2xl border-none bg-slate-50 font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    <select 
                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[160px]"
                        value={filterExamCode}
                        onChange={(e) => setFilterExamCode(e.target.value)}
                    >
                        <option value="ALL">All Exam Codes</option>
                        <option value="M1-R5">M1-R5</option>
                        <option value="M2-R5">M2-R5</option>
                        <option value="M3-R5">M3-R5</option>
                        <option value="M4-R5">M4-R5</option>
                    </select>
                    <Button variant="outline" className="rounded-2xl h-14 font-black gap-2 bg-slate-50 border-none px-6">
                        <Filter className="w-4 h-4" /> Course
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-14 font-black gap-2 bg-slate-50 border-none px-6">
                        <Filter className="w-4 h-4" /> Batch
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 pl-10">Candidate</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Assessment / Course</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Batch</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">Score Portfolio</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-center">A.I. Rank</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8">Release Status</TableHead>
                            <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-8 text-right pr-10">Control</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={7} className="h-24 bg-slate-50/20" />
                                </TableRow>
                            ))
                        ) : filteredResults.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-32 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                                            <Clock className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No analytics records found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResults.map((res) => (
                                <TableRow key={res._id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="py-8 pl-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100 text-slate-600 flex items-center justify-center font-black text-base shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                {res.studentId?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 uppercase tracking-tight">{res.studentId?.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{res.studentId?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-slate-800">{res.mockTestId?.title}</p>
                                            {res.mockTestId?.examCode && (
                                                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">
                                                    {res.mockTestId.examCode}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{res.course || "General Course"}</p>
                                    </TableCell>
                                    <TableCell className="py-8 text-center">
                                        <Badge variant="outline" className="rounded-lg bg-white border-slate-200 text-slate-600 font-black text-[10px] uppercase px-2 py-0.5">
                                            {res.batch || "Regular"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <p className="font-black text-xl text-slate-900 leading-none">{res.score}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Total {res.totalMarks}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-blue-600">#{res.rank || "-"}</span>
                                            <span className="text-[10px] font-black text-blue-300 uppercase mt-1">{res.percentile}%ile</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        {res.publishStatus === "PUBLISHED" ? (
                                            <div className="flex flex-col gap-1.5">
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest w-fit">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Live
                                                </Badge>
                                                {res.publicVisibility && (
                                                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] uppercase tracking-widest w-fit">
                                                        <Eye className="w-3 h-3 mr-1" /> Publicly Visible
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px] uppercase tracking-widest">
                                                <Clock className="w-3 h-3 mr-1" /> Draft Mode
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-8 text-right pr-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-slate-100 transition-colors">
                                                    <MoreVertical className="h-6 w-6 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-[1.5rem] p-3 border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-56">
                                                <DropdownMenuItem 
                                                    className="rounded-xl font-bold py-3 cursor-pointer gap-3 mb-1"
                                                    onClick={() => setIsPublishDialogOpen(true)}
                                                >
                                                    <SettingsIcon className="w-4 h-4 text-slate-400" /> Re-publish Settings
                                                </DropdownMenuItem>
                                                {res.publishStatus === "PUBLISHED" ? (
                                                    <DropdownMenuItem 
                                                        className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-amber-600 focus:bg-amber-50 focus:text-amber-600 mb-1"
                                                        onClick={() => handleUnpublish(res.mockTestId?._id)}
                                                    >
                                                        <XCircle className="w-4 h-4" /> Unpublish Results
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 mb-1"
                                                        onClick={() => {
                                                            setSelectedQuizId(res.mockTestId?._id);
                                                            setIsPublishDialogOpen(true);
                                                        }}
                                                    >
                                                        <Send className="w-4 h-4" /> Publish Now
                                                    </DropdownMenuItem>
                                                )}
                                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                                <DropdownMenuItem 
                                                    className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                                    onClick={() => handleDelete(res._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete Permanently
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
