"use client";

import { useEffect, useState } from "react";
import {
  getStenoBatchesAction,
  createStenoBatchAction,
  updateStenoBatchAction,
  deleteStenoBatchAction,
  getStenoExamsAction,
} from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Layers, Plus, RefreshCw, Trash2, Edit, Image as ImageIcon, FolderPlus, ArrowRight, Award } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import Link from "next/link";

export default function AdminStenoBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    hindiName: "",
    description: "",
    thumbnailUrl: "",
    examPresetId: "",
    isPublished: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadBatches();
    loadExams();
  }, []);

  const loadExams = async () => {
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams);
    }
  };

  const loadBatches = async () => {
    setLoading(true);
    const res = await getStenoBatchesAction({ isPublished: undefined });
    if (res.success && res.batches) {
      setBatches(res.batches);
    } else {
      toast.error(res.error || "Failed to load target steno batches");
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingBatch(null);
    setFormData({
      name: "",
      hindiName: "",
      description: "",
      thumbnailUrl: "",
      examPresetId: "",
      isPublished: true,
      sortOrder: batches.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (b: any) => {
    setEditingBatch(b);
    setFormData({
      name: b.name || "",
      hindiName: b.hindiName || "",
      description: b.description || "",
      thumbnailUrl: b.thumbnailUrl || "",
      examPresetId: b.examPresetId?._id || b.examPresetId || "",
      isPublished: b.isPublished ?? true,
      sortOrder: b.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Target Batch Name is required");
      return;
    }

    if (editingBatch) {
      const res = await updateStenoBatchAction(editingBatch._id, formData);
      if (res.success) {
        toast.success("Target Steno Batch updated successfully");
        setIsDialogOpen(false);
        loadBatches();
      } else {
        toast.error(res.error || "Failed to update batch");
      }
    } else {
      const res = await createStenoBatchAction(formData);
      if (res.success) {
        toast.success("New Target Steno Batch created successfully");
        setIsDialogOpen(false);
        loadBatches();
      } else {
        toast.error(res.error || "Failed to create batch");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this target batch?")) return;
    const res = await deleteStenoBatchAction(id);
    if (res.success) {
      toast.success("Target batch deleted");
      loadBatches();
    } else {
      toast.error(res.error || "Failed to delete batch");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Step 1: Batch Setup
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Target Steno Batches (Step 1 Batch)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage target steno exam categories (e.g. UPSSSC Steno, High Court Steno, SSC Steno, Ramdhari Series).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 h-11 rounded-2xl shadow-md text-xs gap-2"
          >
            <Plus className="w-4 h-4" /> Create Target Batch (Step 1)
          </Button>
          <Link href="/admin/steno/series">
            <Button variant="outline" className="font-bold h-11 px-4 rounded-2xl text-xs gap-1.5">
              Go to Step 2: Series Topics <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading target batches...
        </div>
      ) : batches.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No target batches created yet. Click "Create Target Batch" above to get started.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((b) => (
            <Card key={b._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                {/* Thumbnail / Header */}
                <div className="h-32 rounded-2xl overflow-hidden bg-slate-900 relative flex items-center justify-center p-2">
                  {b.thumbnailUrl ? (
                    <>
                      <img
                        src={b.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 pointer-events-none"
                      />
                      <img
                        src={b.thumbnailUrl}
                        alt={b.name}
                        className="relative z-10 w-full h-full object-contain rounded-xl"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 text-white/60 p-4 text-center">
                      <FolderPlus className="w-8 h-8 mb-1 opacity-60" />
                      <span className="text-[10px] font-bold">Target Exam Category</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                        b.isPublished ? "bg-emerald-500 text-white font-bold" : "bg-slate-700 text-white"
                      }`}
                    >
                      {b.isPublished ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{b.name}</h3>
                  {b.hindiName && (
                    <p className="text-xs font-bold text-indigo-600 mt-0.5">{b.hindiName}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.description || "Steno Exam Batch Category"}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Sort Order:</span>
                  <strong className="text-indigo-600 font-bold">#{b.sortOrder || 0}</strong>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenEditModal(b)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs font-bold rounded-xl gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Batch
                  </Button>
                  <Button
                    onClick={() => handleDelete(b._id)}
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-900">
              {editingBatch ? "Edit Target Steno Batch (Step 1)" : "Create Target Steno Batch (Step 1)"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Batch Name (Step 1) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. UPSSSC Steno, High Court Steno, SSC Steno"
                className="rounded-xl text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Hindi Batch Name (Optional)</label>
              <Input
                value={formData.hindiName}
                onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
                placeholder="e.g. यूपीएसएसएससी स्टेनो बैच"
                className="rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" /> Assign Government Exam Rules Preset
              </label>
              <select
                value={formData.examPresetId}
                onChange={(e) => setFormData({ ...formData, examPresetId: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="">-- Select Exam Rules Preset --</option>
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name} ({ex.targetWpm} WPM • {ex.authorityName || "Official Rules"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this target batch..."
                rows={2}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" /> Batch Thumbnail Image
              </label>
              <ImageUpload
                value={formData.thumbnailUrl}
                onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                onRemove={() => setFormData({ ...formData, thumbnailUrl: "" })}
                label="Upload Batch Thumbnail"
              />
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={formData.isPublished ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === "true" })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="true font-bold">Active / Published</option>
                  <option value="false">Disabled / Draft</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 font-bold rounded-2xl h-11 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl h-11 text-xs"
              >
                {editingBatch ? "Save Changes" : "Create Batch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
