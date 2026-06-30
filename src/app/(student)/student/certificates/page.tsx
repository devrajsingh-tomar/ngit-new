
"use client";

import { useState, useEffect } from "react";
import { getStudentCertificates, getCertificatePDF } from "@/app/actions/certificate";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download, Loader2, Award } from "lucide-react";

export default function StudentCertificatesPage() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getStudentCertificates({});
                if (res.success) {
                    setCertificates(res.data as any[]);
                } else {
                    toast.error("Failed to load certificates");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    async function handleDownload(certId: string) {
        setDownloadingId(certId);
        try {
            const res = await getCertificatePDF(certId);
            if (res.success && res.pdfBase64) {
                const byteCharacters = atob(res.pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = res.filename || "certificate.pdf";
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Certificate downloaded");
            } else {
                toast.error(res.error || "Failed to download");
            }
        } catch (error) {
            toast.error("Error downloading PDF");
        } finally {
            setDownloadingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
                <p className="text-muted-foreground">View and download your earned certificates</p>
            </div>

            {certificates.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed">
                    <Award className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Certificates Yet</h3>
                    <p className="text-slate-500">Complete a course to earn your first certificate!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {certificates.map((cert) => (
                        <div key={cert._id} className="group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="h-3 bg-gradient-to-r from-blue-600 to-cyan-500" />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {cert.certificateNumber}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                    {cert.courseId?.title || cert.customCourseName}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Issued on {new Date(cert.issuedDate).toLocaleDateString()}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg">
                                    <div>
                                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Grade</span>
                                        <span className="font-bold text-slate-900">{cert.grade}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div>
                                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Score</span>
                                        <span className="font-bold text-slate-900">{cert.percentage}%</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => handleDownload(cert._id)}
                                    disabled={!!downloadingId}
                                >
                                    {downloadingId === cert._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
