"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, Eye, RefreshCw, Mic, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminStenoResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    loadResults(1);
  }, []);

  const loadResults = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/steno/results?page=${page}&limit=25`);
      const data = await res.json();
      if (data.results || data.data) {
        setResults(data.results || data.data);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      toast.error("Failed to load Steno results");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) =>
    (r.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.passageTitle || r.passageId?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            Steno <span className="text-indigo-600">Results Management</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-600" /> Complete candidate evaluation reports, mistakes log & PDF downloads
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search candidate name or dictation test..."
            className="pl-14 h-14 rounded-2xl border-none bg-slate-50 font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <div className="max-h-[calc(100vh-280px)] min-h-[450px] overflow-auto relative">
          <Table className="min-w-[1100px] border-separate border-spacing-0">
            <TableHeader className="bg-slate-900 sticky top-0 z-30 shadow-md">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 pl-8 whitespace-nowrap bg-slate-900 sticky top-0 z-30">Student</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 whitespace-nowrap bg-slate-900 sticky top-0 z-30">Exam Preset</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 whitespace-nowrap bg-slate-900 sticky top-0 z-30">Test Title</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 whitespace-nowrap bg-slate-900 sticky top-0 z-30">Date</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 text-center whitespace-nowrap bg-slate-900 sticky top-0 z-30">Gross WPM</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 text-center whitespace-nowrap bg-slate-900 sticky top-0 z-30">Net WPM</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 text-center whitespace-nowrap bg-slate-900 sticky top-0 z-30">Accuracy</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 text-center whitespace-nowrap bg-slate-900 sticky top-0 z-30">Errors</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 text-center whitespace-nowrap bg-slate-900 sticky top-0 z-30">Score</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-5 text-right pr-8 whitespace-nowrap bg-slate-900 sticky top-0 right-0 z-40 shadow-[-4px_0_12px_rgba(0,0,0,0.2)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={10} className="h-20 bg-slate-50/50" />
                  </TableRow>
                ))
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-24 text-center">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Steno results found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="py-5 pl-8 whitespace-nowrap border-b border-slate-100">
                      <div>
                        <p className="font-black text-slate-900">{r.userId?.name || "Candidate User"}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{r.userId?.email || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 whitespace-nowrap border-b border-slate-100">
                      <Badge className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">
                        {r.examTitle || "Standard"} ({r.language || "Hindi"})
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 font-bold text-slate-800 whitespace-nowrap border-b border-slate-100">
                      {r.passageTitle || r.passageId?.title || "Steno Dictation"}
                    </TableCell>
                    <TableCell className="py-5 font-bold text-xs text-slate-500 whitespace-nowrap border-b border-slate-100">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-5 text-center font-black text-indigo-600 text-base whitespace-nowrap border-b border-slate-100">
                      {r.grossWpm || 0}
                    </TableCell>
                    <TableCell className="py-5 text-center font-black text-purple-600 text-base whitespace-nowrap border-b border-slate-100">
                      {r.netWpm || r.speedWpm || 0}
                    </TableCell>
                    <TableCell className="py-5 text-center font-black text-emerald-600 text-base whitespace-nowrap border-b border-slate-100">
                      {r.accuracy || 0}%
                    </TableCell>
                    <TableCell className="py-5 text-center font-black text-rose-600 text-base whitespace-nowrap border-b border-slate-100">
                      {r.totalMistakes || r.totalErrors || 0}
                    </TableCell>
                    <TableCell className="py-5 text-center font-black text-slate-900 text-base whitespace-nowrap border-b border-slate-100">
                      {r.score || 0}
                    </TableCell>
                    <TableCell className="py-5 text-right pr-8 whitespace-nowrap border-b border-slate-100 sticky right-0 bg-white group-hover:bg-slate-50 z-20 shadow-[-4px_0_12px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/steno/result/${r._id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2 text-xs">
                            <Eye className="w-4 h-4" /> View
                          </Button>
                        </Link>
                        <a href={`/api/steno/result/${r._id}/pdf`} download>
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
