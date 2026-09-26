"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyResetTokenAction, resetPasswordWithTokenAction } from "@/app/actions/auth-reset";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userName, setUserName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Form inputs
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setVerifying(false);
            setErrorMsg("Invalid password reset link. Please check your email link or request a new reset link.");
            return;
        }
        verifyToken();
    }, [token, email]);

    const verifyToken = async () => {
        setVerifying(true);
        const res = await verifyResetTokenAction({ email, token });
        setVerifying(false);
        if (res.success && res.data?.valid) {
            setTokenValid(true);
            setUserName(res.data.userName || "Student");
        } else {
            setTokenValid(false);
            setErrorMsg(res.success === false ? res.error : (res.data as any)?.error || "Invalid or expired reset link.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSubmitting(true);
        const res = await resetPasswordWithTokenAction({
            email,
            token,
            newPassword,
        });
        setSubmitting(false);

        if (res.success) {
            setIsSuccess(true);
            toast.success("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/student/login");
            }, 2500);
        } else {
            toast.error(res.error || "Failed to reset password");
        }
    };

    if (verifying) {
        return (
            <Card className="p-12 max-w-md mx-auto text-center rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Verifying Password Reset Link...</h3>
                <p className="text-xs text-slate-500 font-medium">Please wait while we validate your security token.</p>
            </Card>
        );
    }

    if (!tokenValid && !isSuccess) {
        return (
            <Card className="p-8 max-w-md mx-auto text-center rounded-3xl bg-white border border-rose-100 shadow-xl space-y-5">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Link Invalid or Expired</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {errorMsg || "This password reset link has expired or has already been used."}
                    </p>
                </div>
                <div className="pt-2 space-y-2">
                    <Link href="/student/login">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 rounded-xl text-xs gap-2">
                            Request New Reset Link <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <p className="text-[11px] text-slate-400 font-bold">
                        Need immediate help? Call Admin at +91 80049 58441
                    </p>
                </div>
            </Card>
        );
    }

    if (isSuccess) {
        return (
            <Card className="p-8 max-w-md mx-auto text-center rounded-3xl bg-white border border-emerald-100 shadow-xl space-y-5">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Password Reset Complete!</h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Your password has been updated successfully. You will be redirected to the login page shortly.
                    </p>
                </div>
                <Link href="/student/login">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-11 rounded-xl text-xs gap-2">
                        Proceed to Login <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </Card>
        );
    }

    return (
        <Card className="p-8 max-w-md mx-auto rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6">
            <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Set New Password</h2>
                <p className="text-xs text-slate-500 font-medium">
                    Hello <strong className="text-indigo-600">{userName}</strong> ({email}), enter your new account password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">New Password</label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="rounded-xl pr-10 text-xs font-semibold"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="rounded-xl text-xs font-semibold"
                        required
                    />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Password Security Guidelines
                    </span>
                    <ul className="text-[11px] text-slate-500 font-medium list-disc pl-4 space-y-0.5">
                        <li>Minimum 6 characters long</li>
                        <li>Include numbers or special characters for stronger security</li>
                    </ul>
                </div>

                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 rounded-xl text-xs shadow-md gap-2"
                >
                    {submitting ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Saving Password...
                        </>
                    ) : (
                        "Update Password & Save"
                    )}
                </Button>
            </form>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />}>
                <ResetPasswordFormContent />
            </Suspense>
        </div>
    );
}
