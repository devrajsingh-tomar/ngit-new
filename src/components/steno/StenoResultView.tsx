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
import { generateStenoResultImagePdf } from "@/utils/generateStenoResultImagePdf";

interface StenoResultViewProps {

  result: any;
}

export default function StenoResultView({ result }: StenoResultViewProps) {
  const [logPage, setLogPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
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

  const isTokenMatchingFilter = (token: any, filterKey: string) => {
    if (filterKey === "all") return true;
    const t = (token.type || "").toLowerCase();

    if (filterKey === "spelling") return t.includes("spelling");
    if (filterKey === "missing") return t.includes("missing") || t.includes("skipped");
    if (filterKey === "added") return t.includes("added");
    if (filterKey === "matra") return t.includes("matra");
    if (filterKey === "punctuation") return t.includes("punctuation");
    if (filterKey === "correct") return t.includes("correct") || t === "" || t === "none";
    return true;
  };

  const filteredTokens = wordTokens.filter((token: any) => isTokenMatchingFilter(token, selectedCategoryFilter));
  const correctCount = wordTokens.filter((t: any) => !t.type || t.type === "correct" || t.type === "none").length;

  const filteredErrorLog = errorLog.filter((err: any) => {
    if (selectedCategoryFilter === "all" || selectedCategoryFilter === "correct") return true;
    const cat = (err.category || err.errorType || "").toLowerCase();
    if (selectedCategoryFilter === "spelling") return cat.includes("spelling");
    if (selectedCategoryFilter === "missing") return cat.includes("missing") || cat.includes("skipped");
    if (selectedCategoryFilter === "added") return cat.includes("added");
    if (selectedCategoryFilter === "matra") return cat.includes("matra");
    if (selectedCategoryFilter === "punctuation") return cat.includes("punctuation");
    return true;
  });

  const totalLogPages = Math.max(1, Math.ceil(filteredErrorLog.length / pageSize));
  const paginatedErrorLog = filteredErrorLog.slice((logPage - 1) * pageSize, logPage * pageSize);
  const displayedErrorLog = isExportingPdf ? filteredErrorLog : paginatedErrorLog;

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      setIsExportingPdf(true);
      toast.loading("Generating High-Resolution Steno Result PDF...", { id: "pdf-download" });

      // Give browser React state cycle time to render expanded DOM
      await new Promise((resolve) => setTimeout(resolve, 300));

      await generateStenoResultImagePdf({
        elementId: "steno-result-printable-area",
        candidateName: result.userId?.name || "Student",
        testTitle: result.passageTitle || "Steno_Result",
      });

      toast.success("Result PDF downloaded successfully!", { id: "pdf-download" });
    } catch (err: any) {
      console.error("PDF Download Error:", err);
      toast.error(err.message || "Failed to download result PDF.", { id: "pdf-download" });
    } finally {
      setIsExportingPdf(false);
      setDownloading(false);
    }
  };

  return (
    <div id="steno-result-printable-area" className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 bg-[#f8fafc]">
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

          <div className="shrink-0 flex items-center gap-3" data-html2canvas-ignore="true">
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
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            Mistake Category Breakdown & Error Weights
          </h3>
          {selectedCategoryFilter !== "all" && (
            <button
              onClick={() => {
                setSelectedCategoryFilter("all");
                setLogPage(1);
              }}
              className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer"
            >
              Reset Filter (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Spelling Errors Card */}
          <Card
            onClick={() => {
              setSelectedCategoryFilter(selectedCategoryFilter === "spelling" ? "all" : "spelling");
              setLogPage(1);
            }}
            className={`p-5 rounded-3xl border cursor-pointer transition-all flex justify-between items-center ${
              selectedCategoryFilter === "spelling"
                ? "border-rose-400 bg-rose-100/90 shadow-md ring-2 ring-rose-400 scale-[1.02]"
                : "border-rose-100 bg-rose-50/30 hover:bg-rose-50/70 hover:scale-[1.01]"
            }`}
          >
            <div>
              <p className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                Spelling Errors
                {selectedCategoryFilter === "spelling" && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
              </p>
              <p className="text-2xl font-black text-rose-600 mt-1">{breakdown.spelling}</p>
            </div>
            <Badge className="bg-rose-100 text-rose-700 font-bold text-[9px] uppercase">{weights.spellingWeight}</Badge>
          </Card>

          {/* Missing Words Card */}
          <Card
            onClick={() => {
              setSelectedCategoryFilter(selectedCategoryFilter === "missing" ? "all" : "missing");
              setLogPage(1);
            }}
            className={`p-5 rounded-3xl border cursor-pointer transition-all flex justify-between items-center ${
              selectedCategoryFilter === "missing"
                ? "border-amber-400 bg-amber-100/90 shadow-md ring-2 ring-amber-400 scale-[1.02]"
                : "border-amber-100 bg-amber-50/30 hover:bg-amber-50/70 hover:scale-[1.01]"
            }`}
          >
            <div>
              <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                Missing Words
                {selectedCategoryFilter === "missing" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </p>
              <p className="text-2xl font-black text-amber-600 mt-1">{breakdown.missing}</p>
            </div>
            <Badge className="bg-amber-100 text-amber-700 font-bold text-[9px] uppercase">{weights.missingWordWeight}</Badge>
          </Card>

          {/* Added Words Card */}
          <Card
            onClick={() => {
              setSelectedCategoryFilter(selectedCategoryFilter === "added" ? "all" : "added");
              setLogPage(1);
            }}
            className={`p-5 rounded-3xl border cursor-pointer transition-all flex justify-between items-center ${
              selectedCategoryFilter === "added"
                ? "border-blue-400 bg-blue-100/90 shadow-md ring-2 ring-blue-400 scale-[1.02]"
                : "border-blue-100 bg-blue-50/30 hover:bg-blue-50/70 hover:scale-[1.01]"
            }`}
          >
            <div>
              <p className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                Added Words
                {selectedCategoryFilter === "added" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </p>
              <p className="text-2xl font-black text-blue-600 mt-1">{breakdown.added}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 font-bold text-[9px] uppercase">{weights.addedWordWeight}</Badge>
          </Card>

          {/* Matra Errors Card */}
          <Card
            onClick={() => {
              setSelectedCategoryFilter(selectedCategoryFilter === "matra" ? "all" : "matra");
              setLogPage(1);
            }}
            className={`p-5 rounded-3xl border cursor-pointer transition-all flex justify-between items-center ${
              selectedCategoryFilter === "matra"
                ? "border-purple-400 bg-purple-100/90 shadow-md ring-2 ring-purple-400 scale-[1.02]"
                : "border-purple-100 bg-purple-50/30 hover:bg-purple-50/70 hover:scale-[1.01]"
            }`}
          >
            <div>
              <p className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                Matra Errors
                {selectedCategoryFilter === "matra" && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
              </p>
              <p className="text-2xl font-black text-purple-600 mt-1">{breakdown.matra}</p>
            </div>
            <Badge className="bg-purple-100 text-purple-700 font-bold text-[9px] uppercase">{weights.matraWeight}</Badge>
          </Card>

          {/* Punctuation Card */}
          <Card
            onClick={() => {
              setSelectedCategoryFilter(selectedCategoryFilter === "punctuation" ? "all" : "punctuation");
              setLogPage(1);
            }}
            className={`p-5 rounded-3xl border cursor-pointer transition-all flex justify-between items-center col-span-2 md:col-span-1 ${
              selectedCategoryFilter === "punctuation"
                ? "border-emerald-400 bg-emerald-100/90 shadow-md ring-2 ring-emerald-400 scale-[1.02]"
                : "border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/70 hover:scale-[1.01]"
            }`}
          >
            <div>
              <p className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                Punctuation
                {selectedCategoryFilter === "punctuation" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </p>
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
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Word-by-Word Evaluation</h3>
              {selectedCategoryFilter !== "all" && (
                <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-0.5 border border-indigo-200">
                  Filtered: {selectedCategoryFilter} ({filteredTokens.length} words)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {selectedCategoryFilter === "all"
                ? "Visual side-by-side alignment of student transcription vs original dictation"
                : `Showing only ${selectedCategoryFilter.toUpperCase()} items below. Click any card/badge to change filter.`}
            </p>
          </div>

          {/* Interactive Highlighting Legend Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <button
              onClick={() => { setSelectedCategoryFilter("all"); setLogPage(1); }}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 font-black shadow-xs"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              All Words ({wordTokens.length})
            </button>
            <button
              onClick={() => { setSelectedCategoryFilter(selectedCategoryFilter === "correct" ? "all" : "correct"); setLogPage(1); }}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "correct"
                  ? "bg-emerald-600 text-white border-emerald-600 font-black shadow-xs ring-2 ring-emerald-300"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => { setSelectedCategoryFilter(selectedCategoryFilter === "spelling" ? "all" : "spelling"); setLogPage(1); }}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "spelling"
                  ? "bg-rose-600 text-white border-rose-600 font-black shadow-xs ring-2 ring-rose-300"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              Spelling Error ({breakdown.spelling})
            </button>
            <button
              onClick={() => { setSelectedCategoryFilter(selectedCategoryFilter === "missing" ? "all" : "missing"); setLogPage(1); }}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "missing"
                  ? "bg-amber-600 text-white border-amber-600 font-black shadow-xs ring-2 ring-amber-300"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              Missing Word ({breakdown.missing})
            </button>
            <button
              onClick={() => { setSelectedCategoryFilter(selectedCategoryFilter === "added" ? "all" : "added"); setLogPage(1); }}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "added"
                  ? "bg-blue-600 text-white border-blue-600 font-black shadow-xs ring-2 ring-blue-300"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              }`}
            >
              Added Word ({breakdown.added})
            </button>
            <button
              onClick={() => { setSelectedCategoryFilter(selectedCategoryFilter === "matra" ? "all" : "matra"); setLogPage(1); }}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "matra"
                  ? "bg-purple-600 text-white border-purple-600 font-black shadow-xs ring-2 ring-purple-300"
                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              }`}
            >
              Matra Error ({breakdown.matra})
            </button>
            <button
              onClick={() => { setSelectedCategoryFilter(selectedCategoryFilter === "punctuation" ? "all" : "punctuation"); setLogPage(1); }}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCategoryFilter === "punctuation"
                  ? "bg-teal-600 text-white border-teal-600 font-black shadow-xs ring-2 ring-teal-300"
                  : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
              }`}
            >
              Punctuation ({breakdown.punctuation})
            </button>
          </div>
        </div>

        <div className={`flex flex-wrap gap-2 text-sm leading-relaxed p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[160px] ${isExportingPdf ? "max-h-none overflow-visible" : "max-h-[350px] overflow-y-auto"}`}>
          {filteredTokens.length === 0 ? (
            <div className="w-full py-10 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-black text-slate-700 uppercase">
                No {selectedCategoryFilter} Instances Found
              </p>
              <p className="text-xs text-slate-400 font-medium">
                There are 0 word tokens matching the "{selectedCategoryFilter}" category in this test transcript.
              </p>
              <Button
                onClick={() => setSelectedCategoryFilter("all")}
                variant="outline"
                size="sm"
                className="mt-2 rounded-xl text-xs font-bold"
              >
                Show All Words
              </Button>
            </div>
          ) : (
            filteredTokens.map((token: any, idx: number) => {
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
            })
          )}
        </div>
      </Card>

      {/* Detailed Mistake Log Table */}
      <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-100 bg-white shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Detailed Mistake Log ({filteredErrorLog.length})
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Itemized list of every mistake, category, error weight, and calculated penalty
              {selectedCategoryFilter !== "all" && ` (Filtered: ${selectedCategoryFilter.toUpperCase()})`}
            </p>
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
              {displayedErrorLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    Clean transcript! Zero mistakes recorded for this attempt.
                  </TableCell>
                </TableRow>
              ) : (
                displayedErrorLog.map((err: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-400 pl-6">{err.index || (isExportingPdf ? idx + 1 : (logPage - 1) * pageSize + idx + 1)}</TableCell>
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

          {!isExportingPdf && totalLogPages > 1 && (
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
          <div className={`p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm leading-relaxed font-medium text-slate-800 whitespace-pre-wrap ${isExportingPdf ? "max-h-none overflow-visible" : "max-h-[300px] overflow-y-auto"}`}>
            {result.originalText || result.passageId?.transcriptText || result.passageId?.text || "Original passage text unavailable."}
          </div>
        </Card>

        {/* Student Typed Submission */}
        <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-100 bg-white shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-purple-600">
            <Keyboard className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Typed Student Transcript</h3>
          </div>
          <div className={`p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm leading-relaxed font-medium text-slate-800 whitespace-pre-wrap ${isExportingPdf ? "max-h-none overflow-visible" : "max-h-[300px] overflow-y-auto"}`}>
            {result.typedTranscription || "Typed transcription text unavailable."}
          </div>
        </Card>
      </div>
    </div>
  );
}
