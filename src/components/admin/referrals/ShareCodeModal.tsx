"use client";

import React, { useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { X, Copy, Check, Download, QrCode, Link as LinkIcon, Building2, Tag, Calendar, Users } from "lucide-react";

interface ShareCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    codeData: {
        code: string;
        instituteName: string;
        instituteCode?: string;
        discountPercent?: number;
        discountAmount?: number;
        expiresAt?: string;
        usageLimit?: number;
        usageCount?: number;
    } | null;
}

export default function ShareCodeModal({ isOpen, onClose, codeData }: ShareCodeModalProps) {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [origin, setOrigin] = useState("");
    const qrCanvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    if (!isOpen || !codeData) return null;

    const registrationUrl = `${origin}/register?ref=${codeData.code}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(registrationUrl);
        setCopiedLink(true);
        toast.success("Shareable referral URL copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(codeData.code);
        setCopiedCode(true);
        toast.success(`Referral code "${codeData.code}" copied!`);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleDownloadQR = () => {
        const canvas = qrCanvasRef.current?.querySelector("canvas");
        if (!canvas) {
            toast.error("Could not generate QR image");
            return;
        }

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `NGIT_Referral_${codeData.code}_QR.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("QR Code image downloaded");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Share Referral Code</h3>
                        <p className="text-xs font-semibold text-slate-400">Share with prospective students</p>
                    </div>
                </div>

                {/* Institute & Code Summary Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" /> Partner Institute
                        </span>
                        <span className="text-xs font-black text-slate-800 truncate max-w-[200px]">
                            {codeData.instituteName}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-500" /> Referral Code
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black font-mono tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                {codeData.code}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-200 transition-all"
                                title="Copy code"
                            >
                                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    {(codeData.discountPercent || codeData.discountAmount) && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Promotion</span>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {codeData.discountPercent ? `${codeData.discountPercent}% Off` : `₹${codeData.discountAmount} Off`}
                            </span>
                        </div>
                    )}
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center py-2 mb-6">
                    <div
                        ref={qrCanvasRef}
                        className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-lg shadow-slate-100"
                    >
                        <QRCodeCanvas
                            value={registrationUrl}
                            size={180}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                    <button
                        onClick={handleDownloadQR}
                        className="mt-3 text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-indigo-50 transition-all"
                    >
                        <Download className="w-3.5 h-3.5" /> Download QR Image (.png)
                    </button>
                </div>

                {/* Direct Registration Link Box */}
                <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5" /> Direct Referral URL
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={registrationUrl}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] rounded-xl px-3 py-2.5 outline-none select-all font-semibold"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="bg-slate-900 text-white hover:bg-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-slate-900/10 shrink-0"
                        >
                            {copiedLink ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" /> Copy Link
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer notes */}
                <p className="text-[10px] text-center text-slate-400 font-medium">
                    When students register via this link or scan this QR code, they are automatically attributed to {codeData.instituteName}.
                </p>
            </div>
        </div>
    );
}
