"use client";

import { useEffect, useState } from "react";
import {
  getStenoPassagesAction,
  createStenoPassageAction,
  updateStenoPassageAction,
  deleteStenoPassageAction,
  getStenoSeriesListAction,
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
import { Headphones, Plus, RefreshCw, Trash2, Edit, Video, Image as ImageIcon, Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoPassagesPage() {
  const [passages, setPassages] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassage, setEditingPassage] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    language: "Hindi",
    category: "General Dictation",
    seriesId: "",
    examType: "SSC Steno",
    transcriptText: "",
    wordCount: 400,
    durationSeconds: 300,
    audioUrl: "",
    videoUrl: "",
    thumbnailUrl: "",
    availableSpeeds: "40, 50, 60, 70, 80, 90, 100, 110, 120",
    targetWpm: 80,
    isPublished: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadPassages();
    loadSeries();
  }, []);

  const loadPassages = async () => {
    setLoading(true);
    const res = await getStenoPassagesAction({ isPublished: undefined });
    if (res.success && res.passages) {
      setPassages(res.passages);
    } else {
      toast.error(res.error || "Failed to load passages");
    }
    setLoading(false);
  };

  const loadSeries = async () => {
    const res = await getStenoSeriesListAction();
    if (res.success && res.series) {
      setSeriesList(res.series);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPassage(null);
    setFormData({
      title: "",
      language: "Hindi",
      category: "General Dictation",
      seriesId: "",
      examType: "SSC Steno",
      transcriptText: "",
      wordCount: 400,
      durationSeconds: 300,
      audioUrl: "",
      videoUrl: "",
      thumbnailUrl: "",
      availableSpeeds: "40, 50, 60, 70, 80, 90, 100, 110, 120",
      targetWpm: 80,
      isPublished: true,
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingPassage(p);
    setFormData({
      title: p.title || "",
      language: p.language || "Hindi",
      category: p.category || "General Dictation",
      seriesId: p.seriesId?._id || p.seriesId || "",
      examType: p.examType || "SSC Steno",
      transcriptText: p.transcriptText || "",
      wordCount: p.wordCount || 400,
      durationSeconds: p.durationSeconds || 300,
      audioUrl: p.audioUrl || "",
      videoUrl: p.videoUrl || "",
      thumbnailUrl: p.thumbnailUrl || "",
      availableSpeeds: Array.isArray(p.availableSpeeds)
        ? p.availableSpeeds.join(", ")
        : "40, 50, 60, 70, 80, 90, 100, 110, 120",
      targetWpm: p.targetWpm || 80,
      isPublished: p.isPublished ?? true,
      sortOrder: p.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.audioUrl.trim() || !formData.transcriptText.trim()) {
      toast.error("Title, Audio URL, and Transcript Text are required!");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      language: formData.language as any,
      category: formData.category.trim(),
      seriesId: formData.seriesId || undefined,
      examType: formData.examType.trim(),
      transcriptText: formData.transcriptText.trim(),
      wordCount: Number(formData.wordCount),
      durationSeconds: Number(formData.durationSeconds),
      audioUrl: formData.audioUrl.trim(),
      videoUrl: formData.videoUrl.trim() || undefined,
      thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
      availableSpeeds: formData.availableSpeeds
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0),
      targetWpm: Number(formData.targetWpm),
      isPublished: Boolean(formData.isPublished),
      sortOrder: Number(formData.sortOrder),
    };

    if (editingPassage) {
      const res = await updateStenoPassageAction(editingPassage._id, payload);
      if (res.success) {
        toast.success("Passage updated successfully!");
        setIsDialogOpen(false);
        loadPassages();
      } else {
        toast.error(res.error || "Failed to update passage");
      }
    } else {
      const res = await createStenoPassageAction(payload);
      if (res.success) {
        toast.success("New Dictation Passage created!");
        setIsDialogOpen(false);
        loadPassages();
      } else {
        toast.error(res.error || "Failed to create passage");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this passage?")) return;
    const res = await deleteStenoPassageAction(id);
    if (res.success) {
      toast.success("Passage deleted");
      loadPassages();
    } else {
      toast.error(res.error || "Failed to delete passage");
    }
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="w-6 h-6 text-indigo-600" /> CMS Dictation Passages
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage audio/video dictation passages, available speeds, transcripts, and series assignments.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 text-xs rounded-xl gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Dictation Passage
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading dictation passages...
        </div>
      ) : passages.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No dictation passages uploaded yet. Click "Add Dictation Passage" above to create one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passages.map((p) => (
            <Card key={p._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 relative">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                  {p.language} • {p.targetWpm} WPM
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Category: {p.category} | Series: {p.seriesId?.title || "None"}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-600 font-medium">
                <p className="flex justify-between">
                  <span>Words / Duration:</span> <strong className="font-bold text-slate-900">{p.wordCount} words ({Math.round(p.durationSeconds / 60)}m)</strong>
                </p>
                <p className="flex justify-between">
                  <span>Available Speeds:</span> <strong className="font-bold text-indigo-600">{Array.isArray(p.availableSpeeds) ? p.availableSpeeds.join(", ") : "80"} WPM</strong>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleOpenEditModal(p)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs font-bold rounded-xl gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Passage
                </Button>
                <Button
                  onClick={() => handleDelete(p._id)}
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

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingPassage ? "Edit Dictation Passage" : "Add Dictation Passage"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Passage Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 80 WPM Hindi Legal Dictation - Practice 1"
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
                <label className="text-xs font-bold text-slate-700">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Legal, Editorial, PYQ"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Assign Series</label>
                <select
                  value={formData.seriesId}
                  onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="">No Series (Standalone)</option>
                  {seriesList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Type</label>
                <Input
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  placeholder="e.g. SSC Steno, UPSSSC, High Court"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Word Count</label>
                <Input
                  type="number"
                  value={formData.wordCount}
                  onChange={(e) => setFormData({ ...formData, wordCount: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Duration (Seconds)</label>
                <Input
                  type="number"
                  value={formData.durationSeconds}
                  onChange={(e) => setFormData({ ...formData, durationSeconds: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Audio URL *</label>
              <Input
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                placeholder="https://domain.com/audio/dictation-1.mp3"
                className="rounded-xl text-xs font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Video URL (Optional)</label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Thumbnail URL (Optional)</label>
                <Input
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://domain.com/thumb.jpg"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Available Speeds (Comma Separated)</label>
              <Input
                value={formData.availableSpeeds}
                onChange={(e) => setFormData({ ...formData, availableSpeeds: e.target.value })}
                placeholder="40, 50, 60, 70, 80, 90, 100, 110, 120"
                className="rounded-xl text-xs font-semibold"
              />
              <p className="text-[10px] text-slate-400">Admin configurable WPM speeds for this passage.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Passage Reference Text *</label>
              <textarea
                value={formData.transcriptText}
                onChange={(e) => setFormData({ ...formData, transcriptText: e.target.value })}
                placeholder="Paste the official transcript text here for auto-evaluation..."
                rows={6}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                Published Status
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                {editingPassage ? "Save Changes" : "Create Passage"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
