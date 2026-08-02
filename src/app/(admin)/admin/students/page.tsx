"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Check, X, Search, Mail, Phone, UserCheck, UserX, CreditCard, 
  FileText, Eye, BookOpen, Calendar, MapPin, User, ChevronLeft, ChevronRight,
  Trash2, Send, Download, RefreshCw, UserPlus, Info, CheckCircle2, Clock, Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { getStudentRegistrations, approveStudent, rejectStudent } from "@/app/actions/registration";
import { 
  searchStudentsAdmin, 
  getStudentFullDetailsAdmin, 
  renewStudentEnrollmentAdmin, 
  toggleStudentEnrollmentActiveAdmin,
  deleteStudentPermanentlyAdmin,
  getStudentAffairsKPIs
} from "@/app/actions/student-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentProfile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  course: string;
  status: string;
  idNo: string;
  createdAt: string;
}

export default function AdminStudentsPage() {
  const [activeTab, setActiveTab] = useState("directory");
  const [loading, setLoading] = useState(true);

  // KPIs
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    activeUsersToday: 0,
    typingToday: 0,
    pendingRegistrations: 0
  });

  // Pending approvals state
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);

  // Directory search state
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryStudents, setDirectoryStudents] = useState<StudentProfile[]>([]);
  const [searching, setSearching] = useState(false);

  // Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Load KPIs and Initial Data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const kpiRes = await getStudentAffairsKPIs();
      if (kpiRes.success && kpiRes.kpis) {
        setKpis(kpiRes.kpis);
      }
      // Load pending applications
      const regRes = await getStudentRegistrations({ page: 1, limit: 10, status: "Pending" });
      if (regRes.success) {
        setPendingStudents(regRes.data.data);
        setPendingTotalPages(regRes.data.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Search trigger for Student Directory
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setDirectoryStudents([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchStudentsAdmin(searchQuery);
      if (res.success && res.students) {
        setDirectoryStudents(res.students);
        if (res.students.length === 0) {
          toast.info("No matching students found");
        }
      } else {
        toast.error("Search failed");
      }
    } catch {
      toast.error("An error occurred during search");
    } finally {
      setSearching(false);
    }
  };

  // View Student details modal
  const handleViewDetails = async (student: StudentProfile) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
    setDetailsLoading(true);
    setStudentDetails(null);
    try {
      const res = await getStudentFullDetailsAdmin(student.userId);
      if (res.success && res.student) {
        setStudentDetails(res.student);
      } else {
        toast.error(res.error || "Failed to load student details");
        setDetailModalOpen(false);
      }
    } catch (err: any) {
      toast.error("Error loading details");
      setDetailModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Approve Pending Registration
  const handleApprove = async (id: string) => {
    try {
      const res = await approveStudent({ profileId: id });
      if (res.success) {
        toast.success("Registration approved! Portal access activated.");
        loadInitialData();
      } else {
        toast.error(res.error || "Approval failed");
      }
    } catch (err) {
      toast.error("Failed to approve student");
    }
  };

  // Reject Pending Registration
  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject and remove this application?")) return;
    try {
      const res = await rejectStudent({ profileId: id });
      if (res.success) {
        toast.success("Application rejected and deleted");
        loadInitialData();
      } else {
        toast.error(res.error || "Rejection failed");
      }
    } catch (err) {
      toast.error("Failed to reject student");
    }
  };

  // Renew Course Enrollment (add 1 month)
  const handleRenewEnrollment = async (enrollmentId: string) => {
    try {
      const res = await renewStudentEnrollmentAdmin(enrollmentId);
      if (res.success) {
        toast.success("Enrollment renewed! Active duration extended by 30 days.");
        if (selectedStudent) handleViewDetails(selectedStudent);
        loadInitialData();
      } else {
        toast.error(res.error || "Renewal failed");
      }
    } catch (err) {
      toast.error("Failed to renew enrollment");
    }
  };

  // Toggle enrollment active state manually
  const handleToggleEnrollmentActive = async (enrollmentId: string, currentActive: boolean) => {
    try {
      const res = await toggleStudentEnrollmentActiveAdmin(enrollmentId, !currentActive);
      if (res.success) {
        toast.success(`Access ${!currentActive ? "activated" : "deactivated"} successfully`);
        if (selectedStudent) handleViewDetails(selectedStudent);
      } else {
        toast.error("Failed to toggle enrollment active state");
      }
    } catch (err) {
      toast.error("Error toggling active state");
    }
  };

  // Permanent Delete Student Profile & Auth Account
  const handleDeletePermanently = async () => {
    if (!selectedStudent) return;
    const confirmText = prompt(
      `CRITICAL ACTION: To permanently delete ${selectedStudent.name} and ALL their test attempts, billing logs, and course credentials, type DELETE below:`
    );
    if (confirmText !== "DELETE") {
      toast.error("Confirmation text did not match. Deletion aborted.");
      return;
    }

    try {
      const res = await deleteStudentPermanentlyAdmin(selectedStudent._id, selectedStudent.userId);
      if (res.success) {
        toast.success("Student profile and all records purged permanently");
        setDetailModalOpen(false);
        setDirectoryStudents(directoryStudents.filter(s => s._id !== selectedStudent._id));
        loadInitialData();
      } else {
        toast.error(res.error || "Purge failed");
      }
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  // Send Billing Info to Student via WhatsApp
  const handleSendWhatsAppFee = (invoice: any) => {
    if (!studentDetails?.profile) return;
    const profile = studentDetails.profile;
    const phone = profile.whatsappNo || profile.localPhone || "";
    if (!phone) {
      toast.error("Mobile or WhatsApp number not available for this student");
      return;
    }

    // Format clean phone number
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `Hello *${profile.name}*,\n\nThis is a friendly update regarding your fee payment invoice *#${invoice.invoiceNumber}* at *NGIT Institute*.\n\n*Fee Details*:\n- Course: ${invoice.courseId?.title || "Enrolled Course"}\n- Total Fees: Rs. ${invoice.totalAmount}/-\n- Amount Paid: Rs. ${invoice.amountPaid}/-\n- Balance Due: *Rs. ${invoice.balanceDue}/-*\n- Invoice Status: *${invoice.status}*\n\nPlease clear your dues as soon as possible. Thank you!`;

    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Download Student attempts history as CSV
  const handleDownloadAttemptsCSV = () => {
    if (!studentDetails || !selectedStudent) return;

    const headers = ["Test Title/Type", "Date", "Duration", "Speed / Score", "Accuracy / Errors", "Status"];
    const rows: string[][] = [];

    // Add Typing simulator attempts
    if (studentDetails.typingResults) {
      studentDetails.typingResults.forEach((r: any) => {
        rows.push([
          `Typing: ${r.examId?.title || "General Practice"}`,
          new Date(r.createdAt).toLocaleDateString(),
          `${r.duration || 10} Mins`,
          `${r.wpm} WPM`,
          `${r.accuracy}% Accuracy / ${r.errorCount} Errors`,
          "Completed"
        ]);
      });
    }

    // Add Mock Test attempts
    if (studentDetails.mockResults) {
      studentDetails.mockResults.forEach((r: any) => {
        rows.push([
          `Mock Test: ${r.mockTestId?.title || "Offline Mock"}`,
          new Date(r.attemptDate).toLocaleDateString(),
          "—",
          `${r.score}/${r.totalMarks} Marks`,
          `${r.analysis?.accuracy || 0}% Accuracy / Rank ${r.rank || "—"}`,
          r.publishStatus
        ]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(",")].concat(rows.map(e => e.map(val => `"${val}"`).join(","))).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedStudent.name.replace(/\s+/g, "_")}_attempts_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 bg-[#f8fafc] p-4 min-h-screen">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" /> Student Affairs Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage student registrations, inspect progress directories, view fee invoicing status, and renew course access.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/students/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-9 text-xs">
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Offline Admission
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Total Students</p>
            <h3 className="text-xl font-black text-slate-900 mt-1.5 leading-none">{kpis.totalStudents}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Daily Active Students</p>
            <h3 className="text-xl font-black text-slate-900 mt-1.5 leading-none">{kpis.activeUsersToday}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Typing Tests Today</p>
            <h3 className="text-xl font-black text-slate-900 mt-1.5 leading-none">{kpis.typingToday}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Pending Approvals</p>
            <h3 className="text-xl font-black text-slate-900 mt-1.5 leading-none">{kpis.pendingRegistrations}</h3>
          </div>
        </div>
      </div>

      {/* Main Tab Deck */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-slate-200/50 p-1 rounded-2xl h-10 w-full sm:w-max border border-slate-200/30">
          <TabsTrigger value="directory" className="rounded-xl text-xs font-bold px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Search className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Student Directory
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl text-xs font-bold px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Course Registrations ({kpis.pendingRegistrations})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: STUDENT DIRECTORY */}
        <TabsContent value="directory" className="mt-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter student email, mobile, ID, or name..."
                  className="pl-10 h-10 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold h-10 rounded-xl px-5 text-xs text-white">
                {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Search Directory"}
              </Button>
            </form>

            {/* Results Deck */}
            {searching ? (
              <div className="py-20 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Querying student files...
              </div>
            ) : directoryStudents.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-3xl text-center text-slate-500 flex flex-col items-center">
                <User className="w-10 h-10 opacity-15 mb-3" />
                <p className="font-bold text-slate-700">Student directory search is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Enter a search keyword above to fetch contact files, course statuses, attempts counts, and WhatsApp billing buttons.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-3.5">Student</th>
                        <th className="px-6 py-3.5">Roll No/ID</th>
                        <th className="px-6 py-3.5">Active Course</th>
                        <th className="px-6 py-3.5">Contact Link</th>
                        <th className="px-6 py-3.5">Account Status</th>
                        <th className="px-6 py-3.5 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {directoryStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-50/20 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {s.image ? (
                                <img 
                                  src={s.image} 
                                  alt="Student avatar" 
                                  className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                                  {s.name[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{s.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-slate-500">{s.idNo || "—"}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{s.course}</td>
                          <td className="px-6 py-4">
                            <span className="text-slate-500 flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> {s.phone}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              s.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              onClick={() => handleViewDetails(s)} 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] font-bold"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: COURSE REGISTRATIONS */}
        <TabsContent value="pending" className="mt-0 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Pending Approvals Queue</h3>
            {pendingStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No registrations currently pending review.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-6 py-3.5">Student Details</th>
                          <th className="px-6 py-3.5">Course Applied</th>
                          <th className="px-6 py-3.5">Mode</th>
                          <th className="px-6 py-3.5">Local Address</th>
                          <th className="px-6 py-3.5 text-right">Action Interface</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingStudents.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50/20">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{s.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{s.email}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Phone: {s.localPhone}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-bold">{s.course}</td>
                            <td className="px-6 py-4">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black uppercase text-slate-500">{s.mode || "Online"}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{s.localAddress}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  onClick={() => handleApprove(s._id)} 
                                  size="sm" 
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 text-[10px] px-3"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  onClick={() => handleReject(s._id)} 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-7 text-[10px] px-3 font-semibold"
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── STUDENT DETAILS DRAWER / MODAL ── */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
               <DialogHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {!detailsLoading && studentDetails?.user?.image ? (
                    <img 
                      src={studentDetails.user.image} 
                      alt="Student Avatar" 
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shrink-0">
                      {selectedStudent.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <DialogTitle className="text-base font-black text-slate-900">{selectedStudent.name}</DialogTitle>
                      {!detailsLoading && studentDetails?.user?.image && (
                        <a 
                          href={studentDetails.user.image} 
                          download={`${selectedStudent.name}_profile.jpg`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 transition-colors cursor-pointer select-none">
                            <Download className="w-2.5 h-2.5" /> Download Photo
                          </span>
                        </a>
                      )}
                    </div>
                    <DialogDescription className="text-xs text-slate-500">
                      Unified Student Profile &amp; Practice Records file
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {detailsLoading ? (
                <div className="py-20 text-center text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" /> Fetching records file...</div>
              ) : !studentDetails ? (
                <div className="py-10 text-center text-slate-400">Failed to load detailed profile database logs.</div>
              ) : (
                <div className="space-y-6 py-4 text-xs font-semibold">
                  
                  {/* Row 1: Personal & Enrollment Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal card */}
                    <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-3.5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Profile</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Father's Name</p>
                          <p className="text-slate-800 font-bold text-xs mt-0.5">{studentDetails.profile?.fatherName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Mother's Name</p>
                          <p className="text-slate-800 font-bold text-xs mt-0.5">{studentDetails.profile?.motherName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">DOB / Date of Birth</p>
                          <p className="text-slate-800 font-bold text-xs mt-0.5">{studentDetails.profile?.dateOfBirth || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Aadhar Card Number</p>
                          <p className="text-slate-800 font-bold text-xs mt-0.5">{studentDetails.profile?.aadharNo || "—"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Local Address</p>
                          <p className="text-slate-800 font-bold text-xs mt-0.5">{studentDetails.profile?.localAddress || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enrollment Card */}
                    <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-3.5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Admission Status</h4>
                      {studentDetails.enrollments?.length === 0 ? (
                        <div className="text-slate-400 py-6 text-center">No active course enrollments found.</div>
                      ) : (
                        <div className="space-y-4">
                          {studentDetails.enrollments.map((e: any) => (
                            <div key={e._id} className="border border-slate-200/60 bg-white p-4 rounded-2xl flex flex-col justify-between gap-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-slate-800 text-xs">{e.courseId?.title || "Enrolled Course"}</p>
                                  <p className="text-[9px] text-slate-400 uppercase font-black mt-1">
                                    Enrolled On: {new Date(e.enrolledAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  e.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                }`}>
                                  {e.isActive ? "Active Enrollment" : "Expired / Inactive"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-black uppercase">Duration Status</p>
                                  <p className="text-slate-700 font-bold text-xs mt-0.5">
                                    {e.daysEnrolled} days enrolled ({30 - e.daysEnrolled > 0 ? `${30 - e.daysEnrolled} days left` : "Expired"})
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleToggleEnrollmentActive(e._id, e.originalIsActive)} 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-[9px] font-bold"
                                  >
                                    {e.originalIsActive ? "Deactivate" : "Activate"}
                                  </Button>
                                  <Button 
                                    onClick={() => handleRenewEnrollment(e._id)} 
                                    size="sm" 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-7 text-[9px]"
                                  >
                                    Renew (1 Month)
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Billing & Invoices Log */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing &amp; Invoices Dues</h4>
                    {studentDetails.invoices?.length === 0 ? (
                      <div className="text-slate-400 text-center py-4">No billing history found.</div>
                    ) : (
                      <div className="overflow-hidden border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs font-semibold">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-4 py-2.5">Invoice #</th>
                              <th className="px-4 py-2.5">Course</th>
                              <th className="px-4 py-2.5">Total Fee</th>
                              <th className="px-4 py-2.5">Paid</th>
                              <th className="px-4 py-2.5">Balance Due</th>
                              <th className="px-4 py-2.5">Status</th>
                              <th className="px-4 py-2.5 text-right">WhatsApp Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {studentDetails.invoices.map((inv: any) => (
                              <tr key={inv._id}>
                                <td className="px-4 py-3 font-mono text-slate-500">{inv.invoiceNumber}</td>
                                <td className="px-4 py-3 text-slate-700">{inv.courseId?.title || "Course"}</td>
                                <td className="px-4 py-3 text-slate-800">Rs. {inv.totalAmount}/-</td>
                                <td className="px-4 py-3 text-emerald-600">Rs. {inv.amountPaid}/-</td>
                                <td className="px-4 py-3 text-rose-600 font-bold">Rs. {inv.balanceDue}/-</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                    inv.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                  }`}>{inv.status}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button 
                                    onClick={() => handleSendWhatsAppFee(inv)} 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 text-[9px] border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                  >
                                    <Send className="w-2.5 h-2.5 mr-1" /> Send WhatsApp
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Practice Attempt Logs */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Test Attempts Logs</h4>
                      <Button 
                        onClick={handleDownloadAttemptsCSV} 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[10px] font-bold"
                      >
                        <Download className="w-3 h-3 mr-1" /> Download CSV Record
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Typing simulation attempts */}
                      <div className="space-y-3">
                        <h5 className="text-[9px] font-black text-indigo-500 uppercase tracking-wider">Typing Simulator Records ({studentDetails.typingResults?.length || 0})</h5>
                        {studentDetails.typingResults?.length === 0 ? (
                          <div className="text-slate-400 text-center py-4 border border-dashed rounded-xl">No typing records found.</div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                            {studentDetails.typingResults.map((r: any) => (
                              <div key={r._id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-800 truncate max-w-[200px]">{r.examId?.title || "Practice Mode"}</p>
                                  <p className="text-[8px] text-slate-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-indigo-600">{r.wpm} WPM</p>
                                  <p className="text-[9px] text-emerald-600">{r.accuracy}% Acc</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mock test attempts */}
                      <div className="space-y-3">
                        <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Mock Test Paper Records ({studentDetails.mockResults?.length || 0})</h5>
                        {studentDetails.mockResults?.length === 0 ? (
                          <div className="text-slate-400 text-center py-4 border border-dashed rounded-xl">No mock test records found.</div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                            {studentDetails.mockResults.map((r: any) => (
                              <div key={r._id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-800 truncate max-w-[200px]">{r.mockTestId?.title || "Offline Mock"}</p>
                                  <p className="text-[8px] text-slate-400 mt-0.5">{new Date(r.attemptDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-amber-600">{r.score}/{r.totalMarks} Marks</p>
                                  <p className="text-[9px] text-slate-500">Rank: {r.rank || "—"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone: Permanent Profile Purge */}
                  <div className="border border-rose-100 rounded-3xl p-5 bg-rose-50/50 space-y-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Danger Zone</h4>
                      <p className="text-rose-500 text-[10px] mt-0.5 font-medium max-w-md leading-relaxed">
                        Permanently delete this student account. This deletes their Student Admission Profile, login credentials, billing details, and all completed typing/mock exam attempts. This cannot be undone.
                      </p>
                    </div>
                    <Button 
                      onClick={handleDeletePermanently} 
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 px-4 rounded-xl text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Student Profile
                    </Button>
                  </div>

                </div>
              )}

              <DialogFooter className="border-t border-slate-100 pt-4">
                <Button onClick={() => setDetailModalOpen(false)} variant="outline" className="h-9 text-xs font-semibold rounded-xl">
                  Close Profile File
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
