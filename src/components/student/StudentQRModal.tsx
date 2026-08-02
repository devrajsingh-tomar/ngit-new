"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getHeaderFooterData } from "@/app/actions/layoutContent";
import {
    X,
    Smartphone,
    ShieldCheck,
    Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string; // The generated Student ID (idNo like NGIT-1001)
    studentName: string;
    fatherName?: string;
    course?: string;
    mobile?: string;
    photoUrl?: string;
}

export default function StudentQRModal({ 
    isOpen, 
    onClose, 
    studentId, 
    studentName,
    fatherName = "—",
    course = "General Typing",
    mobile = "—",
    photoUrl = ""
}: StudentQRModalProps) {
    const [activeTab, setActiveTab] = useState<"qr" | "idcard">("qr");
    const [logoUrl, setLogoUrl] = useState<string>("");

    useEffect(() => {
        if (!isOpen) return;
        getHeaderFooterData().then(res => {
            if (res.success && res.header?.logoImage) {
                setLogoUrl(res.header.logoImage);
            }
        });
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePrint = () => {
        const printContent = document.getElementById("student-id-card-print-area");
        if (!printContent) return;
        
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        
        const printWindow = window.open(windowUrl, windowName, 'left=50,top=50,width=800,height=900');
        if (!printWindow) return;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Student ID Card - ${studentName}</title>
                    <style>
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            @page {
                                size: auto;
                                margin: 0;
                            }
                        }
                        body {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            background-color: #ffffff;
                            margin: 0;
                        }
                        .id-card-container {
                            width: 320px !important;
                            height: 500px !important;
                            box-sizing: border-box !important;
                            font-family: system-ui, -apple-system, sans-serif !important;
                            border: 1px solid #e2e8f0 !important;
                            background-color: #ffffff !important;
                            border-radius: 2.2rem !important;
                            overflow: hidden !important;
                            position: relative !important;
                            display: flex !important;
                            flex-direction: column !important;
                        }
                        .id-card-header {
                            background-color: #0f172a !important;
                            color: #ffffff !important;
                            padding: 24px !important;
                            padding-bottom: 16px !important;
                            text-align: center !important;
                            border-bottom: 4px solid #f59e0b !important;
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center !important;
                            justify-content: center !important;
                        }
                        .id-card-logo-img {
                            height: 36px !important;
                            width: auto !important;
                            object-fit: contain !important;
                            margin-bottom: 6px !important;
                        }
                        .id-card-logo-fallback {
                            width: 32px !important;
                            height: 32px !important;
                            background: linear-gradient(135deg, #6366f1, #10b981) !important;
                            border-radius: 8px !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            font-weight: 900 !important;
                            color: #ffffff !important;
                            font-size: 18px !important;
                            margin-bottom: 6px !important;
                        }
                        .id-card-title {
                            font-size: 14px !important;
                            font-weight: 900 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.1em !important;
                            line-height: 1.2 !important;
                            margin: 0 !important;
                        }
                        .id-card-subtitle {
                            font-size: 8px !important;
                            font-weight: bold !important;
                            letter-spacing: 0.25em !important;
                            color: #94a3b8 !important;
                            text-transform: uppercase !important;
                            margin-top: 4px !important;
                            margin-bottom: 0 !important;
                        }
                        .id-card-body {
                            flex: 1 !important;
                            padding: 24px !important;
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center !important;
                            justify-content: space-between !important;
                            gap: 16px !important;
                        }
                        .id-card-photo-container {
                            width: 96px !important;
                            height: 96px !important;
                            border-radius: 1rem !important;
                            background-color: #f8fafc !important;
                            border: 4px solid #ffffff !important;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                            overflow: hidden !important;
                            flex-shrink: 0 !important;
                            margin-top: 4px !important;
                        }
                        .id-card-photo {
                            width: 100% !important;
                            height: 100% !important;
                            object-fit: cover !important;
                        }
                        .id-card-photo-fallback {
                            width: 100% !important;
                            height: 100% !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            color: #cbd5e1 !important;
                            background-color: #f1f5f9 !important;
                            font-size: 30px !important;
                            font-weight: 900 !important;
                        }
                        .id-card-name-block {
                            text-align: center !important;
                        }
                        .id-card-name {
                            font-size: 14px !important;
                            font-weight: 900 !important;
                            color: #020617 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.05em !important;
                            margin: 0 !important;
                        }
                        .id-card-course {
                            font-size: 9px !important;
                            font-weight: 900 !important;
                            color: #4f46e5 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.1em !important;
                            margin-top: 4px !important;
                            margin-bottom: 0 !important;
                        }
                        .id-card-details-table {
                            width: 100% !important;
                            background-color: rgba(248, 250, 252, 0.8) !important;
                            border-radius: 1rem !important;
                            padding: 16px !important;
                            border: 1px solid #f1f5f9 !important;
                            box-sizing: border-box !important;
                        }
                        .id-card-detail-row {
                            display: flex !important;
                            justify-content: space-between !important;
                            font-size: 10px !important;
                            font-weight: bold !important;
                            color: #475569 !important;
                            margin: 0 !important;
                        }
                        .id-card-detail-row-border {
                            border-bottom: 1px solid rgba(226, 232, 240, 0.5) !important;
                            padding-bottom: 6px !important;
                            margin-bottom: 6px !important;
                        }
                        .id-card-detail-label {
                            font-size: 8px !important;
                            font-weight: 900 !important;
                            color: #94a3b8 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.05em !important;
                        }
                        .id-card-detail-value {
                            color: #0f172a !important;
                        }
                        .id-card-detail-value-mono {
                            font-family: monospace !important;
                            font-weight: 900 !important;
                        }
                        .id-card-bottom-row {
                            width: 100% !important;
                            display: flex !important;
                            justify-content: space-between !important;
                            align-items: center !important;
                        }
                        .id-card-issue-label {
                            font-size: 8px !important;
                            font-weight: 900 !important;
                            color: #94a3b8 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.05em !important;
                            margin: 0 !important;
                        }
                        .id-card-issue-val {
                            font-size: 9px !important;
                            font-weight: 900 !important;
                            color: #0f172a !important;
                            margin-top: 4px !important;
                            margin-bottom: 0 !important;
                        }
                        .id-card-qr-wrap {
                            background-color: #ffffff !important;
                            padding: 4px !important;
                            border-radius: 8px !important;
                            border: 1px solid #f1f5f9 !important;
                        }
                        .id-card-footer {
                            background-color: #f8fafc !important;
                            border-top: 1px solid #f1f5f9 !important;
                            padding: 14px 24px !important;
                            display: flex !important;
                            justify-content: space-between !important;
                            align-items: center !important;
                            box-sizing: border-box !important;
                        }
                        .id-card-footer-cert {
                            font-size: 7px !important;
                            font-weight: 900 !important;
                            color: #94a3b8 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.1em !important;
                        }
                        .id-card-signature-block {
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center !important;
                        }
                        .id-card-signature-line {
                            width: 64px !important;
                            height: 1px !important;
                            border-bottom: 1px solid #cbd5e1 !important;
                        }
                        .id-card-signature-label {
                            font-size: 6px !important;
                            font-weight: 900 !important;
                            color: #94a3b8 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.05em !important;
                            margin-top: 4px !important;
                        }
                    </style>
                </head>
                <body>
                    <div class="id-card-container">
                        <div class="id-card-header">
                            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="id-card-logo-img" />` : `<div class="id-card-logo-fallback">N</div>`}
                            <h3 class="id-card-title">NGIT INSTITUTE</h3>
                            <p class="id-card-subtitle">Student ID Card</p>
                        </div>
                        <div class="id-card-body">
                            <div class="id-card-photo-container">
                                ${photoUrl ? `<img src="${photoUrl}" alt="${studentName}" class="id-card-photo" />` : `<div class="id-card-photo-fallback"><span>${studentName[0]?.toUpperCase()}</span></div>`}
                            </div>
                            <div class="id-card-name-block">
                                <h4 class="id-card-name">${studentName}</h4>
                                <p class="id-card-course">${course}</p>
                            </div>
                            <div class="id-card-details-table">
                                <div class="id-card-detail-row id-card-detail-row-border">
                                    <span class="id-card-detail-label">Student ID</span>
                                    <span class="id-card-detail-value id-card-detail-value-mono">${studentId}</span>
                                </div>
                                <div class="id-card-detail-row id-card-detail-row-border">
                                    <span class="id-card-detail-label">Father's Name</span>
                                    <span class="id-card-detail-value" style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fatherName}</span>
                                </div>
                                <div class="id-card-detail-row">
                                    <span class="id-card-detail-label">Mobile No</span>
                                    <span class="id-card-detail-value">${mobile}</span>
                                </div>
                            </div>
                            <div class="id-card-bottom-row">
                                <div style="text-align: left;">
                                    <p class="id-card-issue-label">Issue Date</p>
                                    <p class="id-card-issue-val">${new Date().toLocaleDateString()}</p>
                                </div>
                                <div class="id-card-qr-wrap">
                                    <svg width="48" height="48" viewBox="0 0 100 100" style="display: block;">
                                        <!-- Keep original HTML print node QR target SVG -->
                                        ${printContent.querySelector('.id-card-qr-wrap svg')?.innerHTML || ''}
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="id-card-footer">
                            <span class="id-card-footer-cert">ISO 9001:2015 CERTIFIED</span>
                            <div class="id-card-signature-block">
                                <div class="id-card-signature-line"></div>
                                <span class="id-card-signature-label">Authorized Signatory</span>
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 500);
                            }, 300);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <style>{`
                .id-card-container {
                    width: 320px !important;
                    height: 500px !important;
                    box-sizing: border-box !important;
                    font-family: system-ui, -apple-system, sans-serif !important;
                    border: 1px solid #e2e8f0 !important;
                    background-color: #ffffff !important;
                    border-radius: 2.2rem !important;
                    overflow: hidden !important;
                    position: relative !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                .id-card-header {
                    background-color: #0f172a !important;
                    color: #ffffff !important;
                    padding: 24px !important;
                    padding-bottom: 16px !important;
                    text-align: center !important;
                    border-bottom: 4px solid #f59e0b !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                .id-card-logo-img {
                    height: 36px !important;
                    width: auto !important;
                    object-fit: contain !important;
                    margin-bottom: 6px !important;
                }
                .id-card-logo-fallback {
                    width: 32px !important;
                    height: 32px !important;
                    background: linear-gradient(135deg, #6366f1, #10b981) !important;
                    border-radius: 8px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-weight: 900 !important;
                    color: #ffffff !important;
                    font-size: 18px !important;
                    margin-bottom: 6px !important;
                }
                .id-card-title {
                    font-size: 14px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    line-height: 1.2 !important;
                    margin: 0 !important;
                }
                .id-card-subtitle {
                    font-size: 8px !important;
                    font-weight: bold !important;
                    letter-spacing: 0.25em !important;
                    color: #94a3b8 !important;
                    text-transform: uppercase !important;
                    margin-top: 4px !important;
                    margin-bottom: 0 !important;
                }
                .id-card-body {
                    flex: 1 !important;
                    padding: 24px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    gap: 16px !important;
                }
                .id-card-photo-container {
                    width: 96px !important;
                    height: 96px !important;
                    border-radius: 1rem !important;
                    background-color: #f8fafc !important;
                    border: 4px solid #ffffff !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                    overflow: hidden !important;
                    flex-shrink: 0 !important;
                    margin-top: 4px !important;
                }
                .id-card-photo {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
                .id-card-photo-fallback {
                    width: 100% !important;
                    height: 100% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #cbd5e1 !important;
                    background-color: #f1f5f9 !important;
                    font-size: 30px !important;
                    font-weight: 900 !important;
                }
                .id-card-name-block {
                    text-align: center !important;
                }
                .id-card-name {
                    font-size: 14px !important;
                    font-weight: 900 !important;
                    color: #020617 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    margin: 0 !important;
                }
                .id-card-course {
                    font-size: 9px !important;
                    font-weight: 900 !important;
                    color: #4f46e5 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    margin-top: 4px !important;
                    margin-bottom: 0 !important;
                }
                .id-card-details-table {
                    width: 100% !important;
                    background-color: rgba(248, 250, 252, 0.8) !important;
                    border-radius: 1rem !important;
                    padding: 16px !important;
                    border: 1px solid #f1f5f9 !important;
                    box-sizing: border-box !important;
                }
                .id-card-detail-row {
                    display: flex !important;
                    justify-content: space-between !important;
                    font-size: 10px !important;
                    font-weight: bold !important;
                    color: #475569 !important;
                    margin: 0 !important;
                }
                .id-card-detail-row-border {
                    border-bottom: 1px solid rgba(226, 232, 240, 0.5) !important;
                    padding-bottom: 6px !important;
                    margin-bottom: 6px !important;
                }
                .id-card-detail-label {
                    font-size: 8px !important;
                    font-weight: 900 !important;
                    color: #94a3b8 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                .id-card-detail-value {
                    color: #0f172a !important;
                }
                .id-card-detail-value-mono {
                    font-family: monospace !important;
                    font-weight: 900 !important;
                }
                .id-card-bottom-row {
                    width: 100% !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                }
                .id-card-issue-label {
                    font-size: 8px !important;
                    font-weight: 900 !important;
                    color: #94a3b8 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    margin: 0 !important;
                }
                .id-card-issue-val {
                    font-size: 9px !important;
                    font-weight: 900 !important;
                    color: #0f172a !important;
                    margin-top: 4px !important;
                    margin-bottom: 0 !important;
                }
                .id-card-qr-wrap {
                    background-color: #ffffff !important;
                    padding: 4px !important;
                    border-radius: 8px !important;
                    border: 1px solid #f1f5f9 !important;
                }
                .id-card-footer {
                    background-color: #f8fafc !important;
                    border-top: 1px solid #f1f5f9 !important;
                    padding: 14px 24px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    box-sizing: border-box !important;
                }
                .id-card-footer-cert {
                    font-size: 7px !important;
                    font-weight: 900 !important;
                    color: #94a3b8 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                }
                .id-card-signature-block {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }
                .id-card-signature-line {
                    width: 64px !important;
                    height: 1px !important;
                    border-bottom: 1px solid #cbd5e1 !important;
                }
                .id-card-signature-label {
                    font-size: 6px !important;
                    font-weight: 900 !important;
                    color: #94a3b8 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    margin-top: 4px !important;
                }
            `}</style>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                <header className="p-8 pb-0 flex justify-between items-start">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab("qr")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                activeTab === "qr" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Attendance QR
                        </button>
                        <button
                            onClick={() => setActiveTab("idcard")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                activeTab === "idcard" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Student ID Card
                        </button>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>
                        <X className="w-6 h-6 text-slate-400" />
                    </Button>
                </header>

                <div className="p-8 pt-6 space-y-6">
                    {/* TAB 1: ATTENDANCE QR CODE */}
                    {activeTab === "qr" && (
                        <div className="space-y-6 text-center animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Identity QR</h2>
                                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-wider">Show this at the reception for instant attendance</p>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-white mb-4">
                                    <QRCodeSVG
                                        value={studentId}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="font-black text-slate-900 tracking-tight text-base uppercase">{studentName}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5">NGIT ID: {studentId}</p>
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-left">
                                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase tracking-wider">
                                    This QR is unique to you. Do not share it with others for proxy attendance.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PRINTABLE STUDENT ID CARD */}
                    {activeTab === "idcard" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student ID Card</h2>
                                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-wider">Download or print your official ID card</p>
                            </div>

                            {/* ID CARD LAYOUT CONTAINER FOR PRINTING */}
                            <div className="flex justify-center">
                                <div 
                                    id="student-id-card-print-area"
                                    className="id-card-container shadow-2xl"
                                >
                                    {/* Card Header Background */}
                                    <div className="id-card-header">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="id-card-logo-img" />
                                        ) : (
                                            <div className="id-card-logo-fallback font-black">
                                                N
                                            </div>
                                        )}
                                        <h3 className="id-card-title">NGIT INSTITUTE</h3>
                                        <p className="id-card-subtitle">Student ID Card</p>
                                    </div>

                                    {/* Card Body */}
                                    <div className="id-card-body">
                                        {/* Profile Photo */}
                                        <div className="id-card-photo-container">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={studentName} className="id-card-photo" />
                                            ) : (
                                                <div className="id-card-photo-fallback">
                                                    <span>{studentName[0]?.toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Student Name */}
                                        <div className="id-card-name-block">
                                            <h4 className="id-card-name">{studentName}</h4>
                                            <p className="id-card-course">{course}</p>
                                        </div>

                                        {/* Profile Details Block */}
                                        <div className="id-card-details-table">
                                            <div className="id-card-detail-row id-card-detail-row-border">
                                                <span className="id-card-detail-label">Student ID</span>
                                                <span className="id-card-detail-value id-card-detail-value-mono">{studentId}</span>
                                            </div>
                                            <div className="id-card-detail-row id-card-detail-row-border">
                                                <span className="id-card-detail-label">Father's Name</span>
                                                <span className="id-card-detail-value" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fatherName}</span>
                                            </div>
                                            <div className="id-card-detail-row">
                                                <span className="id-card-detail-label">Mobile No</span>
                                                <span className="id-card-detail-value">{mobile}</span>
                                            </div>
                                        </div>

                                        {/* Bottom QR & Details Row */}
                                        <div className="id-card-bottom-row">
                                            <div style={{ textAlign: "left" }}>
                                                <p className="id-card-issue-label">Issue Date</p>
                                                <p className="id-card-issue-val">{new Date().toLocaleDateString()}</p>
                                            </div>

                                            <div className="id-card-qr-wrap">
                                                <QRCodeSVG value={studentId} size={48} level="L" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="id-card-footer">
                                        <span className="id-card-footer-cert">ISO 9001:2015 CERTIFIED</span>
                                        <div className="id-card-signature-block">
                                            <div className="id-card-signature-line"></div>
                                            <span className="id-card-signature-label">Authorized Signatory</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button 
                                    onClick={handlePrint}
                                    className="flex-1 h-12 rounded-xl font-black bg-slate-950 text-white gap-2 shadow-xl shadow-slate-900/20 text-xs uppercase tracking-widest hover:bg-slate-900"
                                >
                                    <Printer className="w-4 h-4 text-emerald-400" /> Print / Save PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
