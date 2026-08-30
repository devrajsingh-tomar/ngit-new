"use client";

import { useEffect, useState } from "react";
import {
  getStenoExamsAction,
  createStenoExamAction,
  updateStenoExamAction,
  deleteStenoExamAction,
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
import { Award, Plus, RefreshCw, Trash2, Edit, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "UPSSSC STENO 1224/333 — Official Exam Rules",
    authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
    dictationDurationMinutes: 5,
    transcriptionDurationMinutes: 40,
    targetWpm: 80,
    totalWords: 420,
    backspaceMode: "full",
    spellingErrorWeight: 1.0,
    matraErrorWeight: 0.5,
    punctuationErrorWeight: 0.5,
    addedWordWeight: 1.0,
    skippedWordWeight: 1.0,
    spacingTranspositionWeight: 0.5,
    mistakeExemptionCount: 20,
    ignoreChandrabindu: true,
    maxErrorPercentAllowed: 5.0,
    allowedFonts: "Kruti Dev 010, Mangal",
    isActive: true,
  });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams);
    } else {
      toast.error(res.error || "Failed to load exam presets");
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormData({
      name: "UPSSSC STENO 1224/333 — Official Exam Rules",
      authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
      dictationDurationMinutes: 5,
      transcriptionDurationMinutes: 40,
      targetWpm: 80,
      totalWords: 420,
      backspaceMode: "full",
      spellingErrorWeight: 1.0,
      matraErrorWeight: 0.5,
      punctuationErrorWeight: 0.5,
      addedWordWeight: 1.0,
      skippedWordWeight: 1.0,
      spacingTranspositionWeight: 0.5,
      mistakeExemptionCount: 20,
      ignoreChandrabindu: true,
      maxErrorPercentAllowed: 5.0,
      allowedFonts: "Kruti Dev 010, Mangal",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name || "",
      authorityName: exam.authorityName || "उ०प्र० अधीनस्थ सेवा चयन आयोग",
      dictationDurationMinutes: exam.dictationDurationMinutes || 5,
      transcriptionDurationMinutes: exam.transcriptionDurationMinutes || 40,
      targetWpm: exam.targetWpm || 80,
      totalWords: exam.totalWords || 420,
      backspaceMode: exam.backspaceMode || "full",
      spellingErrorWeight: exam.spellingErrorWeight ?? 1.0,
      matraErrorWeight: exam.matraErrorWeight ?? 0.5,
      punctuationErrorWeight: exam.punctuationErrorWeight ?? 0.5,
      addedWordWeight: exam.addedWordWeight ?? 1.0,
      skippedWordWeight: exam.skippedWordWeight ?? 1.0,
      spacingTranspositionWeight: exam.spacingTranspositionWeight ?? 0.5,
      mistakeExemptionCount: exam.mistakeExemptionCount ?? 20,
      ignoreChandrabindu: exam.ignoreChandrabindu ?? true,
      maxErrorPercentAllowed: exam.maxErrorPercentAllowed ?? 5.0,
      allowedFonts: Array.isArray(exam.allowedFonts) ? exam.allowedFonts.join(", ") : "Kruti Dev 010, Mangal",
      isActive: exam.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Exam preset name is required!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      authorityName: formData.authorityName.trim(),
      dictationDurationMinutes: Number(formData.dictationDurationMinutes),
      transcriptionDurationMinutes: Number(formData.transcriptionDurationMinutes),
      targetWpm: Number(formData.targetWpm),
      totalWords: Number(formData.totalWords),
      backspaceMode: formData.backspaceMode as any,
      spellingErrorWeight: Number(formData.spellingErrorWeight),
      matraErrorWeight: Number(formData.matraErrorWeight),
      punctuationErrorWeight: Number(formData.punctuationErrorWeight),
      addedWordWeight: Number(formData.addedWordWeight),
      skippedWordWeight: Number(formData.skippedWordWeight),
      spacingTranspositionWeight: Number(formData.spacingTranspositionWeight),
      mistakeExemptionCount: Number(formData.mistakeExemptionCount),
      ignoreChandrabindu: Boolean(formData.ignoreChandrabindu),
      maxErrorPercentAllowed: Number(formData.maxErrorPercentAllowed),
      allowedFonts: formData.allowedFonts.split(",").map((f) => f.trim()).filter(Boolean),
      isActive: Boolean(formData.isActive),
    };

    if (editingExam) {
      const res = await updateStenoExamAction(editingExam._id, payload);
      if (res.success) {
        toast.success("Exam preset rules updated successfully!");
        setIsDialogOpen(false);
        loadExams();
      } else {
        toast.error(res.error || "Failed to update preset");
      }
    } else {
      const res = await createStenoExamAction(payload);
      if (res.success) {
        toast.success("New Steno Exam preset rules created!");
        setIsDialogOpen(false);
        loadExams();
      } else {
        toast.error(res.error || "Failed to create preset");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam preset rule?")) return;
    const res = await deleteStenoExamAction(id);
    if (res.success) {
      toast.success("Exam preset rule deleted");
      loadExams();
    } else {
      toast.error(res.error || "Failed to delete preset");
    }
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200">
              Official Government Exam Rules
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Award className="w-6 h-6 text-amber-600" /> Admin Steno Exam Presets & Rules
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure official government steno exam rules (UPSSSC, High Court, SSC, UP SI) including error weights, mistake exemption, Chandrabindu rules, backspace status, and qualifying speed.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 px-5 text-xs rounded-2xl shadow-md gap-2"
        >
          <Plus className="w-4 h-4" /> Create Exam Preset Rules
        </Button>
      </div>

      {/* Presets List / Official Exam Rule Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading exam presets...
        </div>
      ) : exams.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No Steno Exam Presets found in database. Click "Create Exam Preset Rules" to add one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <Card
              key={exam._id}
              className="p-6 rounded-[2rem] border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 shadow-md hover:shadow-xl transition-all space-y-4 relative border"
            >
              {/* Card Header matching Screenshot 2 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <h3 className="text-base sm:text-lg font-black text-indigo-950 tracking-tight">
                    {exam.name}
                  </h3>
                </div>
                {exam.authorityName && (
                  <span className="bg-indigo-600 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-xs">
                    {exam.authorityName}
                  </span>
                )}
              </div>

              {/* Official Exam Rules Grid (Matching Screenshot 2 layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Backspace:</span>
                  <strong className="text-indigo-700 font-extrabold uppercase">
                    {exam.backspaceMode === "full" ? "Enabled (सुधार मान्य)" : exam.backspaceMode}
                  </strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Transcription Duration:</span>
                  <strong className="text-indigo-700 font-extrabold">{exam.transcriptionDurationMinutes || 40} Mins</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Total Words:</span>
                  <strong className="text-indigo-700 font-extrabold">{exam.totalWords || 420} Words</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Dictation Duration:</span>
                  <strong className="text-indigo-700 font-extrabold">{exam.dictationDurationMinutes || 5} Mins</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Spelling Error (वर्तनी):</span>
                  <strong className="text-slate-900 font-extrabold">Full ({exam.spellingErrorWeight ?? 1.0})</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Maatra / Vachan (मात्रा/वचन):</span>
                  <strong className="text-slate-900 font-extrabold">Half ({exam.matraErrorWeight ?? 0.5})</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Added Words (अतिरिक्त शब्द):</span>
                  <strong className="text-slate-900 font-extrabold">Full ({exam.addedWordWeight ?? 1.0})</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Skipped Words (छूटे शब्द):</span>
                  <strong className="text-slate-900 font-extrabold">Full ({exam.skippedWordWeight ?? 1.0})</strong>
                </div>

                <div className="flex items-center justify-between bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
                  <span className="text-emerald-900 font-bold">• Mistake Exemption (छूट):</span>
                  <strong className="text-emerald-700 font-black">{exam.mistakeExemptionCount ?? 20} अशुद्धियों की छूट</strong>
                </div>

                <div className="flex items-center justify-between bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200/80">
                  <span className="text-indigo-900 font-bold">• Qualifying Speed (अर्हता):</span>
                  <strong className="text-indigo-700 font-black">{exam.targetWpm || 80} WPM (अनिवार्य)</strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Chandrabindu (ँ / ं):</span>
                  <strong className="text-emerald-700 font-extrabold">
                    {exam.ignoreChandrabindu !== false ? "मान्य (No Mistake)" : "Mistake Counted"}
                  </strong>
                </div>

                <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span>• Spacing / Transposition:</span>
                  <strong className="text-slate-900 font-extrabold">Half Mistake ({exam.spacingTranspositionWeight ?? 0.5})</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  <span>Allowed Fonts: <strong className="text-indigo-600 font-extrabold">{Array.isArray(exam.allowedFonts) ? exam.allowedFonts.join(", ") : "Kruti Dev 010, Mangal"}</strong></span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenEditModal(exam)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Rules
                  </Button>
                  <Button
                    onClick={() => handleDelete(exam._id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Form Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingExam ? "Edit Official Steno Exam Rules Preset" : "Create Official Steno Exam Rules Preset"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Form */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Preset Title (Rule Name) *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. UPSSSC STENO 1224/333 — Official Exam Rules"
                  className="rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Authority Badge / Tag (Hindi/English)</label>
                <Input
                  value={formData.authorityName}
                  onChange={(e) => setFormData({ ...formData, authorityName: e.target.value })}
                  placeholder="e.g. उ०प्र० अधीनस्थ सेवा चयन आयोग"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Qualifying Speed (WPM)</label>
                  <Input
                    type="number"
                    value={formData.targetWpm}
                    onChange={(e) => setFormData({ ...formData, targetWpm: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Passage Words</label>
                  <Input
                    type="number"
                    value={formData.totalWords}
                    onChange={(e) => setFormData({ ...formData, totalWords: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dictation Mins</label>
                  <Input
                    type="number"
                    value={formData.dictationDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, dictationDurationMinutes: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transcription Mins</label>
                  <Input
                    type="number"
                    value={formData.transcriptionDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, transcriptionDurationMinutes: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Backspace Policy</label>
                <select
                  value={formData.backspaceMode}
                  onChange={(e) => setFormData({ ...formData, backspaceMode: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="full">Enabled (40 मिनट में सुधार मान्य)</option>
                  <option value="word">Same Word Backspace Only</option>
                  <option value="disabled">Backspace Disabled completely</option>
                </select>
              </div>

              {/* Error Weights Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">Official Error Evaluation Weights</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Spelling Error (वर्तनी) Weight</label>
                    <select
                      value={formData.spellingErrorWeight}
                      onChange={(e) => setFormData({ ...formData, spellingErrorWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="0">Zero Penalty (0.0)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Maatra / Vachan (मात्रा/वचन) Weight</label>
                    <select
                      value={formData.matraErrorWeight}
                      onChange={(e) => setFormData({ ...formData, matraErrorWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0">Zero Penalty (0.0)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Added Words (अतिरिक्त शब्द) Weight</label>
                    <select
                      value={formData.addedWordWeight}
                      onChange={(e) => setFormData({ ...formData, addedWordWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0.5">Half Mistake (0.5)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Skipped Words (छूटे शब्द) Weight</label>
                    <select
                      value={formData.skippedWordWeight}
                      onChange={(e) => setFormData({ ...formData, skippedWordWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0.5">Half Mistake (0.5)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Spacing / Transposition Weight</label>
                    <select
                      value={formData.spacingTranspositionWeight}
                      onChange={(e) => setFormData({ ...formData, spacingTranspositionWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="1">Full Mistake (1.0)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Punctuation Error Weight</label>
                    <select
                      value={formData.punctuationErrorWeight}
                      onChange={(e) => setFormData({ ...formData, punctuationErrorWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0">Zero Penalty (0.0)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Exemptions & Rules Grid */}
              <div className="grid grid-cols-2 gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-950">Mistake Exemption Count (अशुद्धियों की छूट)</label>
                  <Input
                    type="number"
                    value={formData.mistakeExemptionCount}
                    onChange={(e) => setFormData({ ...formData, mistakeExemptionCount: Number(e.target.value) })}
                    placeholder="e.g. 20"
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-950">Max Error Allowed (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.maxErrorPercentAllowed}
                    onChange={(e) => setFormData({ ...formData, maxErrorPercentAllowed: Number(e.target.value) })}
                    placeholder="e.g. 5.0"
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>

                <div className="col-span-2 pt-1">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-emerald-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ignoreChandrabindu}
                      onChange={(e) => setFormData({ ...formData, ignoreChandrabindu: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                    Chandrabindu (ँ / ं) Exemption Allowed: मान्य (No Mistake)
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Allowed Fonts (Comma separated)</label>
                <Input
                  value={formData.allowedFonts}
                  onChange={(e) => setFormData({ ...formData, allowedFonts: e.target.value })}
                  placeholder="Kruti Dev 010, Mangal"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <DialogFooter className="p-4 px-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-6">
                {editingExam ? "Save Preset Rules" : "Create Preset Rules"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
