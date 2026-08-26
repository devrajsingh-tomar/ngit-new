"use client";

import { useEffect, useState } from "react";
import {
  getStenoSeriesListAction,
  createStenoSeriesAction,
  updateStenoSeriesAction,
  deleteStenoSeriesAction,
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
import { Layers, Plus, RefreshCw, Trash2, Edit, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoSeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    category: "General Series",
    language: "Hindi",
    selectedPassages: [] as string[],
    isPublished: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadSeries();
    loadPassages();
  }, []);

  const loadSeries = async () => {
    setLoading(true);
    const res = await getStenoSeriesListAction({ isPublished: undefined });
    if (res.success && res.series) {
      setSeriesList(res.series);
    } else {
      toast.error(res.error || "Failed to load series");
    }
    setLoading(false);
  };

  const loadPassages = async () => {
    const res = await getStenoPassagesAction({ isPublished: undefined });
    if (res.success && res.passages) {
      setPassages(res.passages);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSeries(null);
    setFormData({
      title: "",
      description: "",
      thumbnailUrl: "",
      category: "General Series",
      language: "Hindi",
      selectedPassages: [],
      isPublished: true,
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (s: any) => {
    setEditingSeries(s);
    setFormData({
      title: s.title || "",
      description: s.description || "",
      thumbnailUrl: s.thumbnailUrl || "",
      category: s.category || "General Series",
      language: s.language || "Hindi",
      selectedPassages: Array.isArray(s.passages) ? s.passages.map((p: any) => p._id || p) : [],
      isPublished: s.isPublished ?? true,
      sortOrder: s.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Series title is required!");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
      category: formData.category.trim(),
      language: formData.language as any,
      passages: formData.selectedPassages,
      isPublished: Boolean(formData.isPublished),
      sortOrder: Number(formData.sortOrder),
    };

    if (editingSeries) {
      const res = await updateStenoSeriesAction(editingSeries._id, payload);
      if (res.success) {
        toast.success("Series updated successfully!");
        setIsDialogOpen(false);
        loadSeries();
      } else {
        toast.error(res.error || "Failed to update series");
      }
    } else {
      const res = await createStenoSeriesAction(payload);
      if (res.success) {
        toast.success("New Dictation Series created!");
        setIsDialogOpen(false);
        loadSeries();
      } else {
        toast.error(res.error || "Failed to create series");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series?")) return;
    const res = await deleteStenoSeriesAction(id);
    if (res.success) {
      toast.success("Series deleted");
      loadSeries();
    } else {
      toast.error(res.error || "Failed to delete series");
    }
  };

  const togglePassageSelection = (passageId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedPassages.includes(passageId);
      return {
        ...prev,
        selectedPassages: exists
          ? prev.selectedPassages.filter((id) => id !== passageId)
          : [...prev.selectedPassages, passageId],
      };
    });
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" /> CMS Steno Series & Collections
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Organize dictation passages into series (UPSSSC PYQ, SSC PYQ, Court, Editorial, Essay, Literature, Stories, Magazine).
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 text-xs rounded-xl gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Series
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" /> Loading series...
        </div>
      ) : seriesList.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No series created yet. Click "Create Series" above to create one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((s) => (
            <Card key={s._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 relative">
              {/* Image Preview / Banner */}
              <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 relative">
                {s.thumbnailUrl ? (
                  <img
                    src={s.thumbnailUrl}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white/50 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] font-bold">No Image Uploaded</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md border border-white/20">
                    {s.language} Series
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                      s.isPublished ? "bg-emerald-500 text-white font-bold" : "bg-slate-700 text-white"
                    }`}
                  >
                    {s.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description || "Steno Course Series"}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-600 font-medium">
                <p className="flex justify-between">
                  <span>Assigned Passages:</span> <strong className="font-bold text-slate-900">{s.passages?.length || 0} Tracks</strong>
                </p>
                <p className="flex justify-between">
                  <span>Sort Order:</span> <strong className="font-bold text-emerald-600">#{s.sortOrder || 0}</strong>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleOpenEditModal(s)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs font-bold rounded-xl gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Series
                </Button>
                <Button
                  onClick={() => handleDelete(s._id)}
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
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingSeries ? "Edit Steno Series / Batch" : "Create New Steno Series / Batch"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Series Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. UPSSSC PYQ, High Court Steno, Editorial"
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
                  placeholder="e.g. PYQ, Legal, Editorial, Essay"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course series description..."
                rows={3}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Thumbnail URL</label>
                <a
                  href="/admin/gallery"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" /> Get URL from Gallery CMS →
                </a>
              </div>
              <Input
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="Paste image URL here (e.g. /uploads/image.jpg or https://...)"
                className="rounded-xl text-xs font-semibold"
              />
              {formData.thumbnailUrl && (
                <div className="h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  Published & Active
                </label>
              </div>
            </div>

            {/* Passages Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Assign Passages to Series</label>
              <div className="max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                {passages.length === 0 ? (
                  <p className="text-xs text-slate-400">No passages available to assign.</p>
                ) : (
                  passages.map((p) => {
                    const isChecked = formData.selectedPassages.includes(p._id);
                    return (
                      <label
                        key={p._id}
                        onClick={() => togglePassageSelection(p._id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isChecked ? "bg-emerald-100 text-emerald-900 font-bold" : "hover:bg-white text-slate-700"
                        }`}
                      >
                        <span>{p.title} ({p.language} • {p.targetWpm} WPM)</span>
                        <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-emerald-600" />
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                Published Status
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                {editingSeries ? "Save Changes" : "Create Series"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
