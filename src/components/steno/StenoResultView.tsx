"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Award,
  Keyboard,
  Mic,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { toast } from "sonner";

interface StenoResultViewProps {
  result: any;
}

export default function StenoResultView({ result }: StenoResultViewProps) {
  const [logPage, setLogPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const pageSize = 20;

  const dateStr = result.createdAt ? new Date(result.createdAt).toLocaleString() : new Date().toLocaleString();
  const minutes = Math.floor((result.timeSpentSeconds || 0) / 60);
  const seconds = (result.timeSpentSeconds || 0) % 60;
  const timeTakenStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const errorLog = result.errorLog || [];
  const breakdown = result.mistakeBreakdown || { spelling: 0, missing: 0, added: 0, matra: 0, punctuation: 0 };
  const weights = result.frozenWeights || {
    spellingWeight: "full",
    matraWeight: "half",
    punctuationWeight: "half",
    addedWordWeight: "full",
    missingWordWeight: "full",
  };
  const wordTokens = result.wordBreakdown || [];

  const totalLogPages = Math.max(1, Math.ceil(errorLog.length / pageSize));
  const paginatedErrorLog = errorLog.slice((logPage - 1) * pageSize, logPage * pageSize);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      toast.loading("Generating Steno Result PDF...", { id: "pdf-download" });

      const response = await fetch(`/api/steno/result/${result._id}/pdf`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to generate result PDF. Please try again.");
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf" && !blob.type.includes("pdf")) {
        throw new Error("Server did not return a valid PDF report.");
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `NGIT_Steno_Result_${(result.passageTitle || "Test").replace(/\s+/g, "_")}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Result PDF downloaded successfully!", { id: "pdf-download" });
    } catch (err: any) {
      console.error("PDF Download Error:", err);
      toast.error(err.message || "Failed to download result PDF.", { id: "pdf-download" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-indigo-200">
              <Mic className="w-4 h-4 text-indigo-400" /> STENO TEST RESULT REPORT
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{result.passageTitle || "Steno Dictation Test"}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300 pt-1">
              <span>Candidate: <strong className="text-white font-bold">{result.userId?.name || "Student"}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-white font-bold">{dateStr}</strong></span>
              <span>•</span>
              <span>Font Layout: <strong className="text-indigo-300 font-bold">{result.fontUsed || "Mangal"}</strong></span>
              <span>•</span>
              <span>Exam Preset: <strong className="text-purple-300 font-bold">{result.examTitle || "Standard"} ({result.language || "Hindi"})</strong></span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black text-sm text-white shadow-xl shadow-indigo-600/30 gap-3 transition-transform hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" />
              {downloading ? "Preparing PDF..." : "Download Result PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Prominent Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{result.accuracy || 0}%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Overall Precision</div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross WPM</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">{result.grossWpm || 0}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Speed</div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net WPM</div>
          <div className="text-3xl font-black text-purple-600 mt-2">{result.netWpm || 0}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">After Penalties</div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Mistakes</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{result.totalMistakes || 0}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Penalty: {result.totalPenalty || 0}</div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Taken</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{timeTakenStr}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">MM:SS</div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Speed</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{result.targetWpm || 80}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">WPM Benchmark</div>
        </Card>

        <Card className="p-5 rounded-3xl border-slate-100 bg-white shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Status</div>
          <div className="mt-2">
            <Badge className={result.status === "Passed" ? "bg-emerald-50 text-emerald-600 text-sm font-black px-3 py-1" : "bg-rose-50 text-rose-600 text-sm font-black px-3 py-1"}>
              {result.status === "Passed" ? "QUALIFIED" : "DISQUALIFIED"}
            </Badge>
          </div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Score: {result.score || 0}</div>
        </Card>
      </div>

      {/* Visual Mistake Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] px-1">
          Mistake Category Breakdown & Error Weights
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-5 rounded-3xl border-rose-100 bg-rose-50/30 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-rose-900">Spelling Errors</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{breakdown.spelling}</p>
            </div>
            <Badge className="bg-rose-100 text-rose-700 font-bold text-[9px] uppercase">{weights.spellingWeight}</Badge>
          </Card>

          <Card className="p-5 rounded-3xl border-amber-100 bg-amber-50/30 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-amber-900">Missing Words</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{breakdown.missing}</p>
            </div>
            <Badge className="bg-amber-100 text-amber-700 font-bold text-[9px] uppercase">{weights.missingWordWeight}</Badge>
          </Card>

          <Card className="p-5 rounded-3xl border-blue-100 bg-blue-50/30 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-blue-900">Added Words</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{breakdown.added}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 font-bold text-[9px] uppercase">{weights.addedWordWeight}</Badge>
          </Card>

          <Card className="p-5 rounded-3xl border-purple-100 bg-purple-50/30 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-purple-900">Matra Errors</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{breakdown.matra}</p>
            </div>
            <Badge className="bg-purple-100 text-purple-700 font-bold text-[9px] uppercase">{weights.matraWeight}</Badge>
          </Card>

          <Card className="p-5 rounded-3xl border-emerald-100 bg-emerald-50/30 flex justify-between items-center col-span-2 md:col-span-1">
            <div>
              <p className="text-xs font-black text-emerald-900">Punctuation</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{breakdown.punctuation}</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-bold text-[9px] uppercase">{weights.punctuationWeight}</Badge>
          </Card>
        </div>
      </div>

      {/* Word-by-Word Interactive Evaluation */}
      <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-100 bg-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Word-by-Word Evaluation</h3>
            <p className="text-xs text-slate-400 font-medium">Visual side-by-side alignment of student transcription vs original dictation</p>
          </div>

          {/* Highlighting Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">Correct</span>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">Spelling Error</span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">Missing Word</span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">Added Word</span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">Matra Error</span>
            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">Punctuation</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm leading-relaxed p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[160px] max-h-[350px] overflow-y-auto">
          {wordTokens.map((token: any, idx: number) => {
            let colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
            if (token.type === "spelling") colorClasses = "bg-rose-100 text-rose-900 border-rose-300 font-bold";
            if (token.type === "missing") colorClasses = "bg-amber-100 text-amber-900 border-amber-300 line-through";
            if (token.type === "added") colorClasses = "bg-blue-100 text-blue-900 border-blue-300 underline";
            if (token.type === "matra") colorClasses = "bg-purple-100 text-purple-900 border-purple-300 font-bold";
            if (token.type === "punctuation") colorClasses = "bg-teal-100 text-teal-900 border-teal-300";

            return (
              <span
                key={idx}
                className={`px-2 py-1 rounded-xl border text-sm inline-block transition-transform hover:scale-105 ${colorClasses}`}
                title={`Typed: "${token.typed}" | Original: "${token.original}"`}
              >
                {token.typed !== "—" ? token.typed : token.original}
              </span>
            );
          })}
        </div>
      </Card>

      {/* Detailed Mistake Log Table */}
      <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-100 bg-white shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Detailed Mistake Log ({errorLog.length})</h3>
            <p className="text-xs text-slate-400 font-medium">Itemized list of every mistake, category, error weight, and calculated penalty</p>
          </div>
        </div>

        <div className="border border-slate-100 rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4 pl-6">#</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4">Error Type</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4">Student Typed</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4">Original Dictation</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4">Category</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4 text-center">Weight</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-4 text-right pr-6">Penalty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedErrorLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    Clean transcript! Zero mistakes recorded for this attempt.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedErrorLog.map((err: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-400 pl-6">{err.index || (logPage - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="font-bold text-slate-900">{err.errorType}</TableCell>
                    <TableCell className="font-bold text-rose-600">{err.typedWord || "—"}</TableCell>
                    <TableCell className="font-bold text-slate-700">{err.originalWord || "—"}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">{err.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-600">{err.weight}</TableCell>
                    <TableCell className="text-right pr-6 font-black text-rose-600">-{err.penalty}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalLogPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {paginatedErrorLog.length} of {errorLog.length} errors
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logPage <= 1}
                  onClick={() => setLogPage(p => p - 1)}
                  className="h-8 rounded-xl px-3 text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-xs font-bold text-slate-600 px-2">Page {logPage} of {totalLogPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logPage >= totalLogPages}
                  onClick={() => setLogPage(p => p + 1)}
                  className="h-8 rounded-xl px-3 text-xs font-bold"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Complete Transcripts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Dictation Passage */}
        <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-100 bg-white shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-indigo-600">
            <Mic className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Original Dictation Transcript</h3>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm leading-relaxed font-medium text-slate-800 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {result.originalText || "Original passage text unavailable."}
          </div>
        </Card>

        {/* Student Typed Submission */}
        <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-100 bg-white shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-purple-600">
            <Keyboard className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Typed Student Transcript</h3>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm leading-relaxed font-medium text-slate-800 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {result.typedTranscription || "Typed transcription text unavailable."}
          </div>
        </Card>
      </div>
    </div>
  );
}
