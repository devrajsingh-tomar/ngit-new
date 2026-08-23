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
import { Clock, Eye, RefreshCw, Award, Plus, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

export default function StudentStenoMyTestsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [customTests, setCustomTests] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    language: "Hindi",
    hindiFont: "Kruti Dev 010",
    category: "Custom Practice",
    durationMinutes: 10,
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

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" /> My Custom Tests & History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create custom practice tests or review official evaluation attempt history.
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-4 text-xs rounded-xl gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Custom Steno Test
        </Button>
      </div>

      {/* Section 1: Custom Tests */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
          My Custom Practice Tests ({customTests.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" /> Loading custom tests...
          </div>
        ) : customTests.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
            No custom practice tests created yet. Click "Create Custom Steno Test" above to build one!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTests.map((t) => (
              <Card key={t._id} className="p-5 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-100">
                    {t.language} • {t.targetWpm} WPM
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{t.durationMinutes} Mins</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Font: <strong className="text-indigo-600 font-bold">{t.hindiFont}</strong> | Category: {t.category}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/student/steno/passage/${t.passageId?._id || t.passageId}`} className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-8 text-xs rounded-xl gap-1">
                      <Play className="w-3.5 h-3.5" /> Start
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDeleteCustomTest(t._id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Attempt History */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Official Attempt History ({results.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" /> Loading attempt history...
          </div>
        ) : results.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
            No completed attempts yet.
          </Card>
        ) : (
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

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6">
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
                placeholder="e.g. My 80 WPM Remington Speed Test"
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
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category / Exam</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Custom Practice"
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
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold">
                Create Test
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
