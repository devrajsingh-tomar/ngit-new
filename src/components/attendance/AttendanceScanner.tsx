"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { markSingleStudentAttendance } from "@/app/actions/attendance";
import { AttendanceStatus } from "@/types/attendance";
import { toast } from "sonner";
import { Loader2, UserCheck, UserX, Camera, RefreshCw } from "lucide-react";

interface AttendanceScannerProps {
    batchId: string;
    onSuccess?: () => void;
}

export default function AttendanceScanner({ batchId, onSuccess }: AttendanceScannerProps) {
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    const [lastScanned, setLastScanned] = useState<{name: string, ok: boolean} | null>(null);
    
    // Camera selection states
    const [cameras, setCameras] = useState<any[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>("");
    
    const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

    const startScanner = async () => {
        if (!batchId) {
            toast.error("Please select a batch first!");
            return;
        }

        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameras(devices);
                // Prefer back camera on mobile if available
                const backCam = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
                const initialCameraId = backCam ? backCam.id : devices[0].id;
                setSelectedCameraId(initialCameraId);
                
                // Start chosen camera
                await startCamera(initialCameraId);
            } else {
                toast.error("No camera devices found.");
            }
        } catch (err) {
            toast.error("Failed to access camera. Please allow camera permissions.");
            console.error("Camera access error:", err);
        }
    };

    const startCamera = async (cameraId: string) => {
        setProcessing(true);
        // Clear any old reader element content
        const readerEl = document.getElementById("attendance-reader");
        if (readerEl) readerEl.innerHTML = "";

        const html5Qrcode = new Html5Qrcode("attendance-reader");
        try {
            await html5Qrcode.start(
                cameraId,
                { 
                    fps: 10, 
                    qrbox: { width: 220, height: 220 },
                    aspectRatio: 1.0
                },
                onScanSuccess,
                onScanFailure
            );
            html5QrcodeRef.current = html5Qrcode;
            setScannerActive(true);
        } catch (err) {
            toast.error("Failed to start the selected camera.");
            console.error("html5qrcode start error:", err);
        } finally {
            setProcessing(false);
        }
    };

    const switchCamera = async (cameraId: string) => {
        setSelectedCameraId(cameraId);
        if (html5QrcodeRef.current) {
            try {
                await html5QrcodeRef.current.stop();
            } catch (err) {
                console.error("Failed to stop previous camera", err);
            }
            html5QrcodeRef.current = null;
        }
        await startCamera(cameraId);
    };

    const stopScanner = async () => {
        if (html5QrcodeRef.current) {
            try {
                await html5QrcodeRef.current.stop();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
            html5QrcodeRef.current = null;
        }
        setScannerActive(false);
        setCameras([]);
    };

    async function onScanSuccess(decodedText: string) {
        if (processing) return;
        
        // Accept either NGIT-XXXX or 24-character MongoDB raw User IDs
        if (!decodedText.startsWith("NGIT-") && decodedText.length !== 24) {
             toast.error("Invalid QR code format.");
             return;
        }

        setProcessing(true);
        setScannedResult(decodedText);
        
        try {
            const res = await markSingleStudentAttendance(decodedText, AttendanceStatus.PRESENT, batchId);
            if (res.success) {
                toast.success(`Attendance marked for student ${decodedText}`);
                setLastScanned({ name: decodedText, ok: true });
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "Failed to mark attendance.");
                setLastScanned({ name: decodedText, ok: false });
            }
        } catch (err) {
            toast.error("An error occurred during scanning.");
        } finally {
            setProcessing(false);
            // Wait 2.5 seconds before allowing next scan to avoid duplicates
            setTimeout(() => {
                setScannedResult(null);
            }, 2500);
        }
    }

    function onScanFailure(error: any) {
        // quiet fail for continuous scanning
    }

    useEffect(() => {
        return () => {
            if (html5QrcodeRef.current) {
                html5QrcodeRef.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            {!scannerActive ? (
                <div 
                    onClick={startScanner}
                    className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <Camera className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Teacher QR Scanner</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2 text-sm">
                        Click to activate camera and scan student identity cards for instant entry.
                    </p>
                </div>
            ) : (
                <div className="bg-slate-950 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-slate-800">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                         <div className="flex items-center gap-3">
                             <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                             <span className="text-white font-black uppercase tracking-widest text-xs">Live Scanner Active</span>
                         </div>
                         <button 
                            onClick={stopScanner}
                            className="text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
                         >
                            Stop Session
                         </button>
                    </div>

                    {/* Camera Selector Dropdown */}
                    {cameras.length > 1 && (
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Select Camera Device</label>
                            <select
                                value={selectedCameraId}
                                onChange={(e) => switchCamera(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-slate-900 border-2 border-slate-800 text-white font-bold text-xs outline-none cursor-pointer"
                            >
                                {cameras.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.label || `Camera ${c.id.substring(0, 5)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="relative">
                        <div id="attendance-reader" className="w-full overflow-hidden rounded-3xl bg-slate-900 aspect-square" />
                        
                        {/* Custom QR Target Frame Overlay */}
                        <div className="absolute inset-0 border-4 border-transparent flex items-center justify-center pointer-events-none">
                            <div className="w-[220px] h-[220px] border-4 border-indigo-500 border-dashed rounded-2xl relative opacity-40">
                                <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-indigo-400" />
                                <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-indigo-400" />
                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-indigo-400" />
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-indigo-400" />
                            </div>
                        </div>
                    </div>

                    {processing && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-[2.5rem]">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-white font-black tracking-tight text-lg">Processing Attendance...</p>
                        </div>
                    )}

                    {lastScanned && !processing && (
                        <div className={`mt-6 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2 ${lastScanned.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lastScanned.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                 {lastScanned.ok ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                             </div>
                             <div className="overflow-hidden">
                                 <p className="font-black text-sm">{lastScanned.ok ? "Success!" : "Scan Failed"}</p>
                                 <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest truncate">{lastScanned.name}</p>
                             </div>
                             <button onClick={() => setLastScanned(null)} className="ml-auto text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100">Dismiss</button>
                        </div>
                    )}

                    <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-6">
                        Place Student QR within frame
                    </p>
                </div>
            )}
        </div>
    );
}
