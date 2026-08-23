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
  RefreshCw,
  Award,
  Plus,
  Trash2,
  Play,
  Search,
  Keyboard,
  FileText,
  Zap,
  Sparkles,
  Layers,
  CheckCircle2,
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
      {/* NGIT Custom Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30">
              Personalized Practice Workspace
            </span>
            <span className="text-xs font-bold text-slate-300">• Shorthand Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-400" /> My Custom Tests & History
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Build custom practice tests with custom font styles, speed goals, and duration parameters, or review past performance reports.
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 px-6 text-xs rounded-2xl shadow-lg gap-2 shrink-0 z-10"
        >
          <Plus className="w-4 h-4" /> Create Custom Steno Test
        </Button>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Search Navigation Bar */}
      <Card className="p-4 rounded-3xl border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === "all"
                ? "bg-indigo-600 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Tests ({customTests.length})
          </button>
          <button
            onClick={() => setFilterTab("hindi")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === "hindi"
                ? "bg-indigo-600 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hindi Steno
          </button>
          <button
            onClick={() => setFilterTab("english")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === "english"
                ? "bg-indigo-600 text-white shadow-sm font-black"
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
            placeholder="Search custom tests by title..."
            className="pl-10 rounded-2xl bg-slate-50 border-slate-200 text-xs font-semibold h-10"
          />
        </div>
      </Card>

      {/* Custom Practice Tests Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> Active Custom Test Sets ({filteredCustomTests.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading custom tests...
          </div>
        ) : filteredCustomTests.length === 0 ? (
          <Card className="p-10 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
            <Keyboard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">No custom practice tests created yet.</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs rounded-xl gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Your First Test
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomTests.map((t) => (
              <Card
                key={t._id}
                className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header Tags & Actions */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {t.language}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
                      {t.hindiFont || "Kruti Dev 010"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteCustomTest(t._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Category: {t.category || "Custom Practice"}</p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Words</span>
                    <p className="font-extrabold text-slate-800 mt-0.5">{t.passageId?.wordCount || 1}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Duration</span>
                    <p className="font-extrabold text-indigo-600 mt-0.5">{t.durationMinutes} Mins</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Target</span>
                    <p className="font-extrabold text-emerald-600 mt-0.5">{t.targetWpm} WPM</p>
                  </div>
                </div>

                {/* Primary Button */}
                <Link href={`/student/steno/custom-practice/${t._id}`} className="block pt-1">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 text-xs rounded-xl shadow-md gap-2">
                    <Play className="w-4 h-4 fill-white" /> Launch Practice Test
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Attempt History Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" /> Evaluation Attempt History ({results.length})
        </h2>

        {results.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
            No completed dictation evaluation attempts yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <Card
                key={r._id}
                className="p-5 rounded-2xl border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-200 transition-all shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        r.status === "Passed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{r.passageId?.title || "Steno Dictation Attempt"}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Speed: <strong className="text-indigo-600 font-bold">{r.speedWpm} WPM</strong> • Accuracy:{" "}
                    <strong className="text-emerald-600 font-bold">{r.accuracy}%</strong> • Total Errors: {r.totalErrors}
                  </p>
                </div>

                <Link href={`/student/steno/result/${r._id}`}>
                  <Button size="sm" variant="outline" className="h-9 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Evaluation Report
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog: Create Custom Test */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
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
                placeholder="e.g. My Remington GAIL Speed Test"
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
                  <option value="Kruti Dev 010">Kruti Dev 010 (Remington)</option>
                  <option value="Mangal Remington GAIL">Mangal Remington GAIL</option>
                  <option value="Mangal Inscript">Mangal Inscript</option>
                  <option value="Mangal">Mangal Unicode</option>
                  <option value="Arial">Arial (English)</option>
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
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                Create Test
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
