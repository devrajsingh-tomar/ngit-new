"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getStudentStenoProfileDataAction,
  deleteStenoResultAction,
} from "@/app/actions/steno";
import { updateUserPassword } from "@/app/actions/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCircle,
  ShieldCheck,
  KeyRound,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function StudentStenoMyProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProfileAndAttempts(currentPage);
  }, [currentPage]);

  const loadProfileAndAttempts = async (page: number) => {
    setLoading(true);
    const res = await getStudentStenoProfileDataAction(page, pageSize);
    if (res.success) {
      setProfileData(res);
    } else {
      toast.error(res.error || "Failed to load profile data");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await updateUserPassword({
        current: currentPassword,
        new: newPassword,
      });

      if (res?.success) {
        toast.success("Password updated successfully!");
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Failed to update password. Verify your current password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDownloadPdf = async (id: string, title: string) => {
    try {
      toast.loading("Preparing Steno Result PDF...", { id: `pdf-${id}` });
      const response = await fetch(`/api/steno/result/${id}/pdf`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      if (!blob.type.includes("pdf")) throw new Error("Invalid PDF response");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NGIT_Steno_Result_${(title || "Test").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Result PDF downloaded successfully!", { id: `pdf-${id}` });
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF", { id: `pdf-${id}` });
    }
  };

  const handleDeleteAttempt = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteStenoResultAction(deletingId);
    if (res.success) {
      toast.success("Test attempt removed");
      setDeletingId(null);
      loadProfileAndAttempts(currentPage);
    } else {
      toast.error(res.error || "Failed to delete attempt");
    }
    setIsDeleting(false);
  };

  const activePlan = profileData?.activePlan;
  const attempts = profileData?.attempts || [];
  const pagination = profileData?.pagination || { totalAttempts: 0, totalPages: 1, page: 1 };
  const user = profileData?.user || session?.user;

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30">
            Student Steno Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name || "Student"}'s Profile & Test History
          </h1>
          <p className="text-xs text-slate-300">
            Manage your active subscription plan, update credentials, and review all previous transcription tests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Button
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-5 text-xs rounded-xl shadow-md gap-1.5"
          >
            <KeyRound className="w-4 h-4" /> Change Password
          </Button>
          <Button
            onClick={() => loadProfileAndAttempts(currentPage)}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white font-bold h-10 px-4 text-xs rounded-xl border border-white/20 shadow-xs gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* 1. ACTIVE ACCESS PLAN & 2. ACCOUNT SECURITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Access Plan Card */}
        <Card className="p-6 rounded-3xl border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-white shadow-xs space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Active Access Plan
              </span>
              <Badge className="bg-emerald-100 text-emerald-800 border-none font-black text-xs px-3 py-1">
                ACTIVE
              </Badge>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">{activePlan?.name || "Pro Shorthand & Steno Access Plan"}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Plan Validity: <strong className="text-indigo-600 font-bold">{activePlan?.validTill || "Lifetime Active"}</strong> • {activePlan?.type || "Full Portal Access"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {(activePlan?.features || [
                "Unlimited Audio Dictations & Video lessons",
                "SSC Grade C/D & High Court Exam Rules",
                "Real-time Needleman-Wunsch Evaluation",
                "Detailed PDF Scorecards with Analysis",
              ]).map((feat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Linked Email: <strong className="text-slate-800 font-bold">{user?.email || "Registered Student"}</strong></span>
            <Link href="/student/steno/series" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              Explore Batches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Account Security & Password Status Card */}
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Account & Security
              </h3>
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Protected
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Student Name</p>
                <p className="font-black text-slate-900">{user?.name || "Student"}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Registered Email</p>
                <p className="font-bold text-slate-700 truncate">{user?.email || "—"}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Password Status</p>
                <p className="font-bold text-emerald-600 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Secure Password Configured
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 text-xs rounded-xl gap-2 shadow-xs"
          >
            <KeyRound className="w-4 h-4" /> Update Account Password
          </Button>
        </Card>
      </div>

      {/* 3. ATTEMPTED TESTS TABLE (10 per page, View/PDF/Delete) */}
      <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Attempted Steno Tests
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Detailed performance metrics, gross accuracy, error counts, and official PDF downloads (10 tests per page).
            </p>
          </div>

          <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Completed Tests: {pagination.totalAttempts}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-xs font-bold">Loading your test records...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No attempted tests found.</p>
            <p className="text-[11px] text-slate-400 mt-1">Explore our Steno Batches to start your first transcription exam.</p>
            <Link href="/student/steno/series" className="inline-block mt-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs rounded-xl">
                Explore Steno Batches
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-4 rounded-l-xl">Test Name</th>
                    <th className="p-3.5 text-center">Attempt #</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-center">Speed</th>
                    <th className="p-3.5 text-center">Rank</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-center">Accuracy</th>
                    <th className="p-3.5 text-center">Gross Acc.</th>
                    <th className="p-3.5 text-center">Mistakes</th>
                    <th className="p-3.5 text-center">Strokes</th>
                    <th className="p-3.5 pr-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-4 font-black text-slate-900 max-w-[180px] truncate" title={item.testName}>
                        {item.testName}
                      </td>
                      <td className="p-3.5 text-center font-bold text-indigo-600">
                        #{item.attemptNumber}
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 text-center font-black text-indigo-600 text-sm">
                        {item.speedWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                      </td>
                      <td className="p-3.5 text-center font-black text-amber-600">
                        {item.rank}
                      </td>
                      <td className="p-3.5">
                        <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold border-slate-200">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center font-black text-emerald-600 text-sm">
                        {item.accuracy}%
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-600">
                        {item.grossAccuracy}%
                      </td>
                      <td className="p-3.5 text-center font-black text-rose-600">
                        {item.mistakes}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                        {item.strokes}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View Result */}
                          <Link href={`/student/steno/result/${item._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 rounded-lg text-[11px] font-bold gap-1 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                              title="View Full Result"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </Button>
                          </Link>

                          {/* 2. Download PDF */}
                          <Button
                            onClick={() => handleDownloadPdf(item._id, item.testName)}
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-[11px] font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                            title="Download PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </Button>

                          {/* 3. Delete Button */}
                          <Button
                            onClick={() => setDeletingId(item._id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                            title="Delete Attempt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (10 tests per page with refresh) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                Showing {attempts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, pagination.totalAttempts)} of {pagination.totalAttempts} tests
              </span>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 h-8"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev 10
                </Button>

                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage >= pagination.totalPages || loading}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1 h-8"
                >
                  Next 10 <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-200">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" /> Change Account Password
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Enter your current password and set a new secure password.
            </p>
          </DialogHeader>

          <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Password</label>
              <Input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters with 1 capital & 1 number"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Attempt Confirmation Modal */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-6 bg-white border border-slate-200">
          <DialogHeader className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-900">
              Delete Test Attempt?
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to permanently delete this test attempt from your history? This action cannot be undone.
            </p>
          </DialogHeader>

          <DialogFooter className="pt-4 flex gap-2 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
              className="rounded-xl text-xs flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteAttempt}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex-1"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
