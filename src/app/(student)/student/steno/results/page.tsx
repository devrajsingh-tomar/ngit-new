"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mic, Eye, Download, AlertCircle, Award, Keyboard, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function StudentStenoResultsHistoryPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentResults();
  }, []);

  const loadStudentResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/steno/results");
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      toast.error("Failed to load your Steno results history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            Steno <span className="text-indigo-600">Result History</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-600" /> Review your past dictation attempts, speed metrics, accuracy & PDF reports
          </p>
        </div>
      </div>

      <Card className="rounded-[3rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 pl-8">Test Name</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6">Exam Preset</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6">Date & Time</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Net WPM</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Accuracy</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Mistakes</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Score</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6">Status</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={9} className="h-20 bg-slate-50/50" />
                  </TableRow>
                ))
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Steno results recorded yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((res) => (
                  <TableRow key={res._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-6 pl-8 font-black text-slate-900">
                      {res.passageTitle || res.passageId?.title || "Steno Practice Test"}
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">
                        {res.examTitle || "Standard"} ({res.language || "Hindi"})
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-xs text-slate-500">
                      {new Date(res.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-indigo-600 text-lg">
                      {res.netWpm || res.speedWpm || 0}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-emerald-600 text-lg">
                      {res.accuracy || 0}%
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-rose-600 text-lg">
                      {res.totalMistakes || res.totalErrors || 0}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-slate-900 text-lg">
                      {res.score || 0}
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge className={res.status === "Passed" ? "bg-emerald-50 text-emerald-600 font-bold" : "bg-rose-50 text-rose-600 font-bold"}>
                        {res.status === "Passed" ? "QUALIFIED" : "DISQUALIFIED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/steno/result/${res._id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2 text-xs">
                            <Eye className="w-4 h-4" /> View Result
                          </Button>
                        </Link>
                        <a href={`/api/steno/result/${res._id}/pdf`} download>
                          <Button size="sm" className="rounded-xl font-bold gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Download className="w-4 h-4" /> PDF
                          </Button>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
