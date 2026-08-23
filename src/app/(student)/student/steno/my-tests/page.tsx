"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getStenoUserHistoryAction,
  getUserStenoCustomTestsAction,
  createStenoCustomTestAction,
  deleteStenoCustomTestAction,
  getStenoPassagesAction,
} from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  Eye,
  RefreshCw,
  Award,
  Plus,
  Trash2,
  Play,
  Edit3,
  Search,
  Keyboard,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoMyTestsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [customTests, setCustomTests] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [filterTab, setFilterTab] = useState<"all" | "hindi" | "english">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    language: "Hindi",
    hindiFont: "Kruti Dev 010",
    category: "Custom Practice",
    durationMinutes: 15,
    targetWpm: 80,
    passageId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [historyRes, customRes, passagesRes] = await Promise.all([
      getStenoUserHistoryAction(),
      getUserStenoCustomTestsAction(),
      getStenoPassagesAction(),
    ]);

    if (historyRes.success && historyRes.results) setResults(historyRes.results);
    if (customRes.success && customRes.customTests) setCustomTests(customRes.customTests);
    if (passagesRes.success && passagesRes.passages) {
      setPassages(passagesRes.passages);
      if (passagesRes.passages.length > 0) {
        setFormData((prev) => ({ ...prev, passageId: passagesRes.passages[0]._id }));
      }
    }
    setLoading(false);
  };

  const handleCreateCustomTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.passageId) {
      toast.error("Test Title and Original Dictation Passage are required!");
      return;
    }

    const res = await createStenoCustomTestAction({
      title: formData.title.trim(),
      language: formData.language as any,
      hindiFont: formData.hindiFont,
      category: formData.category,
      durationMinutes: Number(formData.durationMinutes),
      targetWpm: Number(formData.targetWpm),
      passageId: formData.passageId,
    });

    if (res.success) {
      toast.success("Custom Steno Test created successfully!");
      setIsDialogOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to create custom test");
    }
  };

  const handleDeleteCustomTest = async (id: string) => {
    if (!confirm("Delete this custom practice test?")) return;
    const res = await deleteStenoCustomTestAction(id);
    if (res.success) {
      toast.success("Custom test deleted");
      loadData();
    } else {
      toast.error(res.error || "Failed to delete test");
    }
  };

  // Filtered Custom Tests list
  const filteredCustomTests = customTests.filter((t) => {
    const matchesLang =
      filterTab === "all"
        ? true
        : filterTab === "hindi"
        ? t.language === "Hindi"
        : t.language === "English";
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Top Banner (Image 1) */}
      <div className="bg-gradient-to-r from-[#0a1128] via-[#1c2541] to-[#0a1128] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#f59e0b] text-slate-900 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-md">
              SELF PRACTICE MODE
            </span>
            <span className="text-xs font-bold text-slate-300">Hindi & English Steno</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Edit3 className="w-7 h-7 text-[#f59e0b]" /> My Steno Tests
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Create your own custom dictation passages in Hindi or English, type your transcript, and evaluate your speed & accuracy instantly!
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black h-11 px-5 text-xs rounded-2xl shadow-lg gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Custom Test
        </Button>
      </div>

      {/* Filter Tabs & Search Bar (Image 1) */}
      <Card className="p-4 rounded-3xl border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === "all"
                ? "bg-[#0a1128] text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Tests ({customTests.length})
          </button>
          <button
            onClick={() => setFilterTab("hindi")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === "hindi"
                ? "bg-[#0a1128] text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hindi Steno
          </button>
          <button
            onClick={() => setFilterTab("english")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === "english"
                ? "bg-[#0a1128] text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            English Steno
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my tests..."
            className="pl-10 rounded-2xl bg-slate-50 border-slate-200 text-xs font-semibold h-10"
          />
        </div>
      </Card>

      {/* Section 1: Custom Tests Cards Grid (Image 1) */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading custom tests...
          </div>
        ) : filteredCustomTests.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
            No custom practice tests found. Click "+ Create Custom Test" above to build one!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomTests.map((t) => (
              <Card key={t._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-slate-300 transition-all">
                {/* Badge & Actions Header */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-md border border-[#fde68a]">
                    {t.language === "Hindi" ? `HINDI (${t.hindiFont?.toUpperCase() || "MANGAL"})` : "ENGLISH"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteCustomTest(t._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{t.title}</h3>
                </div>

                {/* Details Bar */}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">📄 {t.passageId?.wordCount || 1} Words</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-indigo-600">⏰ {t.durationMinutes} Mins</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600">⚡ {t.targetWpm} WPM</span>
                </div>

                {/* Primary Button (Image 1) */}
                <Link href={`/student/steno/custom-practice/${t._id}`} className="block pt-2">
                  <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold h-11 text-xs rounded-xl shadow-md gap-2">
                    <Keyboard className="w-4 h-4" /> Start Practice Test
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Completed Attempt History */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Official Evaluation History ({results.length})
        </h2>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r) => (
              <Card key={r._id} className="p-5 rounded-2xl border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-300 transition-all">
                <div className="space-y-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    r.status === "Passed" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {r.status}
                  </span>
                  <h4 className="text-base font-black text-slate-900">{r.passageId?.title || "Steno Dictation Attempt"}</h4>
                  <p className="text-xs text-slate-400">
                    Attempted: {new Date(r.createdAt).toLocaleDateString("en-IN")} • Speed: {r.speedWpm} WPM • Accuracy: {r.accuracy}%
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/student/steno/result/${r._id}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs font-bold rounded-xl gap-1">
                      <Award className="w-3.5 h-3.5" /> Report
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog: Create Custom Test */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Create Custom Practice Steno Test
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCustomTest} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Test Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. sdfasd"
                className="rounded-xl text-xs font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hindi Font</label>
                <select
                  value={formData.hindiFont}
                  onChange={(e) => setFormData({ ...formData, hindiFont: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="Mangal">Mangal</option>
                  <option value="Kruti Dev 010">Kruti Dev 010 (Remington)</option>
                  <option value="Mangal Remington GAIL">Mangal Remington GAIL</option>
                  <option value="Mangal Inscript">Mangal Inscript</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Speed (WPM)</label>
                <Input
                  type="number"
                  value={formData.targetWpm}
                  onChange={(e) => setFormData({ ...formData, targetWpm: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                <Input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Original Dictation Passage *</label>
              <select
                value={formData.passageId}
                onChange={(e) => setFormData({ ...formData, passageId: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                required
              >
                {passages.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.language} • {p.targetWpm} WPM)
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold">
                Create Test
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
