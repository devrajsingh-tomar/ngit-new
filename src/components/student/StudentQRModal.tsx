"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
    X,
    Download,
    Share2,
    Smartphone,
    ShieldCheck,
    Contact,
    Printer,
    CheckCircle,
    UserCheck
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
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body class="flex items-center justify-center min-h-screen bg-white">
                    <div class="border border-slate-200 rounded-[2.2rem] overflow-hidden shadow-none p-0 relative" style="width: 320px; height: 500px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
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
                                    className="w-[320px] h-[500px] bg-white border border-slate-200 rounded-[2.2rem] overflow-hidden shadow-2xl relative flex flex-col text-slate-800"
                                    style={{ contentVisibility: "auto" }}
                                >
                                    {/* Card Header Background */}
                                    <div className="bg-slate-950 text-white p-6 pb-4 text-center border-b-4 border-amber-500 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center font-black text-white text-lg shadow-md mb-1.5">
                                            N
                                        </div>
                                        <h3 className="text-sm font-black tracking-widest uppercase leading-none">NGIT INSTITUTE</h3>
                                        <p className="text-[8px] font-bold tracking-[0.25em] text-slate-400 uppercase mt-1">Student ID Card</p>
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex-1 p-6 flex flex-col items-center justify-between gap-4">
                                        {/* Profile Photo */}
                                        <div className="w-24 h-24 rounded-2xl bg-slate-50 border-4 border-white shadow-md overflow-hidden shrink-0 relative mt-1">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={studentName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                                                    <span className="text-3xl font-black">{studentName[0]?.toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Student Name */}
                                        <div className="text-center">
                                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-wide leading-none">{studentName}</h4>
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">{course}</p>
                                        </div>

                                        {/* Profile Details Block */}
                                        <div className="w-full bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-[10px] font-bold text-slate-600 space-y-2">
                                            <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Student ID</span>
                                                <span className="font-mono text-slate-950 font-black">{studentId}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Father's Name</span>
                                                <span className="text-slate-950 truncate max-w-[120px] text-right">{fatherName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Mobile No</span>
                                                <span className="text-slate-950">{mobile}</span>
                                            </div>
                                        </div>

                                        {/* Bottom QR & Details Row */}
                                        <div className="w-full flex items-center justify-between mt-1">
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">Issue Date</p>
                                                <p className="text-[9px] font-black text-slate-950 mt-1">{new Date().toLocaleDateString()}</p>
                                            </div>

                                            <div className="bg-white p-1 rounded-lg border border-slate-100 shrink-0">
                                                <QRCodeSVG value={studentId} size={48} level="L" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 text-center flex justify-between items-center">
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">ISO 9001:2015 CERTIFIED</span>
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-3.5 border-b border-slate-300"></div>
                                            <span className="text-[6px] font-black text-slate-400 uppercase tracking-wider mt-1">Authorized Signatory</span>
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
