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
import { Award, Plus, RefreshCw, Trash2, Edit, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    language: "Hindi",
    dictationDurationMinutes: 5,
    transcriptionDurationMinutes: 45,
    targetWpm: 80,
    backspaceMode: "full",
    spellingErrorWeight: 1.0,
    matraErrorWeight: 0.5,
    punctuationErrorWeight: 0.5,
    addedWordWeight: 1.0,
    skippedWordWeight: 1.0,
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
      name: "",
      language: "Hindi",
      dictationDurationMinutes: 5,
      transcriptionDurationMinutes: 45,
      targetWpm: 80,
      backspaceMode: "full",
      spellingErrorWeight: 1.0,
      matraErrorWeight: 0.5,
      punctuationErrorWeight: 0.5,
      addedWordWeight: 1.0,
      skippedWordWeight: 1.0,
      allowedFonts: "Kruti Dev 010, Mangal",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name || "",
      language: exam.language || "Hindi",
      dictationDurationMinutes: exam.dictationDurationMinutes || 5,
      transcriptionDurationMinutes: exam.transcriptionDurationMinutes || 45,
      targetWpm: exam.targetWpm || 80,
      backspaceMode: exam.backspaceMode || "full",
      spellingErrorWeight: exam.spellingErrorWeight ?? 1.0,
      matraErrorWeight: exam.matraErrorWeight ?? 0.5,
      punctuationErrorWeight: exam.punctuationErrorWeight ?? 0.5,
      addedWordWeight: exam.addedWordWeight ?? 1.0,
      skippedWordWeight: exam.skippedWordWeight ?? 1.0,
      allowedFonts: Array.isArray(exam.allowedFonts) ? exam.allowedFonts.join(", ") : "Kruti Dev 010, Mangal",
      isActive: exam.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Exam name is required!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      language: formData.language as any,
      dictationDurationMinutes: Number(formData.dictationDurationMinutes),
      transcriptionDurationMinutes: Number(formData.transcriptionDurationMinutes),
      targetWpm: Number(formData.targetWpm),
      backspaceMode: formData.backspaceMode as any,
      spellingErrorWeight: Number(formData.spellingErrorWeight),
      matraErrorWeight: Number(formData.matraErrorWeight),
      punctuationErrorWeight: Number(formData.punctuationErrorWeight),
      addedWordWeight: Number(formData.addedWordWeight),
      skippedWordWeight: Number(formData.skippedWordWeight),
      allowedFonts: formData.allowedFonts.split(",").map((f) => f.trim()).filter(Boolean),
      isActive: Boolean(formData.isActive),
    };

    if (editingExam) {
      const res = await updateStenoExamAction(editingExam._id, payload);
      if (res.success) {
        toast.success("Exam preset updated successfully!");
        setIsDialogOpen(false);
        loadExams();
      } else {
        toast.error(res.error || "Failed to update preset");
      }
    } else {
      const res = await createStenoExamAction(payload);
      if (res.success) {
        toast.success("New Steno Exam preset created successfully!");
        setIsDialogOpen(false);
        loadExams();
      } else {
        toast.error(res.error || "Failed to create preset");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam preset?")) return;
    const res = await deleteStenoExamAction(id);
    if (res.success) {
      toast.success("Exam preset deleted");
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" /> Admin Steno Exam Presets
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure exam rules, backspace policies, error weights, and font permissions for government steno tests.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-4 text-xs rounded-xl gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Exam Preset
        </Button>
      </div>

      {/* Presets Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" /> Loading exam presets...
        </div>
      ) : exams.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No Steno Exam Presets found in database. Click "Create Exam Preset" to add one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 relative">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-100">
                  {exam.language} • {exam.targetWpm} WPM
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    exam.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {exam.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{exam.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dictation: {exam.dictationDurationMinutes}m | Transcription: {exam.transcriptionDurationMinutes}m
                </p>
              </div>

              {/* Rules Specs Box */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-600 font-medium">
                <p className="flex justify-between">
                  <span>Backspace Mode:</span> <strong className="uppercase font-bold text-slate-900">{exam.backspaceMode}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Spelling Weight:</span> <strong className="font-bold text-rose-600">{exam.spellingErrorWeight}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Matra Error Weight:</span> <strong className="font-bold text-amber-600">{exam.matraErrorWeight}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Punctuation Weight:</span> <strong className="font-bold text-slate-700">{exam.punctuationErrorWeight}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Allowed Fonts:</span> <strong className="font-bold text-indigo-600">{Array.isArray(exam.allowedFonts) ? exam.allowedFonts.join(", ") : "Kruti Dev, Mangal"}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleOpenEditModal(exam)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs font-bold rounded-xl gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Preset
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
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Form Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingExam ? "Edit Steno Exam Preset" : "Create Steno Exam Preset"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Exam Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. UPSSSC STENO or SSC STENO"
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
                <label className="text-xs font-bold text-slate-700">Target Speed (WPM)</label>
                <Input
                  type="number"
                  value={formData.targetWpm}
                  onChange={(e) => setFormData({ ...formData, targetWpm: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Dictation Duration (Mins)</label>
                <Input
                  type="number"
                  value={formData.dictationDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, dictationDurationMinutes: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Transcription Duration (Mins)</label>
                <Input
                  type="number"
                  value={formData.transcriptionDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, transcriptionDurationMinutes: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Backspace Status</label>
              <select
                value={formData.backspaceMode}
                onChange={(e) => setFormData({ ...formData, backspaceMode: e.target.value as any })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="full">Full Backspace Allowed</option>
                <option value="word">Same Word Backspace Only</option>
                <option value="disabled">Backspace Disabled</option>
                <option value="upssssc">UPSSSC Custom Backspace Rule</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Spelling Error Weight</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.spellingErrorWeight}
                  onChange={(e) => setFormData({ ...formData, spellingErrorWeight: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Matra Error Weight</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.matraErrorWeight}
                  onChange={(e) => setFormData({ ...formData, matraErrorWeight: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Punctuation Error Weight</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.punctuationErrorWeight}
                  onChange={(e) => setFormData({ ...formData, punctuationErrorWeight: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Added Word Weight</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.addedWordWeight}
                  onChange={(e) => setFormData({ ...formData, addedWordWeight: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Allowed Fonts (Comma separated)</label>
              <Input
                value={formData.allowedFonts}
                onChange={(e) => setFormData({ ...formData, allowedFonts: e.target.value })}
                placeholder="Kruti Dev 010, Mangal, Arial"
                className="rounded-xl text-xs font-semibold"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold">
                {editingExam ? "Save Changes" : "Create Preset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
