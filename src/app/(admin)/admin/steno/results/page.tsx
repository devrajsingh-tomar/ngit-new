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

      <Card className="rounded-[3rem] border-slate-100 shadow-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 pl-8">Student</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6">Exam Preset</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6">Test Title</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6">Date</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Gross WPM</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Net WPM</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Accuracy</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Errors</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-center">Score</TableHead>
                <TableHead className="font-black text-white text-[10px] uppercase tracking-widest py-6 text-right pr-8">Actions</TableHead>
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
                  <TableRow key={r._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-6 pl-8">
                      <div>
                        <p className="font-black text-slate-900">{r.userId?.name || "Candidate User"}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{r.userId?.email || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">
                        {r.examTitle || "Standard"} ({r.language || "Hindi"})
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-slate-800">
                      {r.passageTitle || r.passageId?.title || "Steno Dictation"}
                    </TableCell>
                    <TableCell className="py-6 font-bold text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-indigo-600 text-base">
                      {r.grossWpm || 0}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-purple-600 text-base">
                      {r.netWpm || r.speedWpm || 0}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-emerald-600 text-base">
                      {r.accuracy || 0}%
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-rose-600 text-base">
                      {r.totalMistakes || r.totalErrors || 0}
                    </TableCell>
                    <TableCell className="py-6 text-center font-black text-slate-900 text-base">
                      {r.score || 0}
                    </TableCell>
                    <TableCell className="py-6 text-right pr-8">
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
