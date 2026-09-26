"use client";

import { useEffect, useState } from "react";
import {
  getStenoSeriesListAction,
  createStenoSeriesAction,
  updateStenoSeriesAction,
  deleteStenoSeriesAction,
  getStenoPassagesAction,
  getStenoBatchesAction,
  createStenoBatchAction,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Layers, Plus, RefreshCw, Trash2, Edit, Image as ImageIcon, CheckCircle2, FolderPlus, ArrowRight, ArrowLeft, Headphones, FileText, Award, Search } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import Link from "next/link";

export default function AdminStenoSeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [targetBatches, setTargetBatches] = useState<any[]>([]);
  const [targetExams, setTargetExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any | null>(null);

  // Filters State
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterExam, setFilterExam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inline Create Batch State
  const [isNewBatchDialogOpen, setIsNewBatchDialogOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchHindiName, setNewBatchHindiName] = useState("");
  const [creatingBatch, setCreatingBatch] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    batch: "UPSSSC Steno",
    exam: "UPSSSC Steno",
    category: "General Series",
    language: "Hindi",
    selectedPassages: [] as string[],
    isPublished: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadSeries();
    loadPassages();
    loadBatches();
    loadExams();
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

  const loadBatches = async () => {
    const res = await getStenoBatchesAction({ isPublished: undefined });
    if (res.success && res.batches) {
      setTargetBatches(res.batches);
    }
  };

  const loadExams = async () => {
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setTargetExams(res.exams);
    }
  };

  const handleCreateInlineBatch = async () => {
    if (!newBatchName.trim()) {
      toast.error("Target Batch Name is required");
      return;
    }
    setCreatingBatch(true);
    const res = await createStenoBatchAction({
      name: newBatchName.trim(),
      hindiName: newBatchHindiName.trim(),
    });
    setCreatingBatch(false);
    if (res.success && res.batch) {
      toast.success(`Target Batch "${res.batch.name}" created`);
      setFormData((prev) => ({ ...prev, batch: res.batch.name }));
      setNewBatchName("");
      setNewBatchHindiName("");
      setIsNewBatchDialogOpen(false);
      loadBatches();
    } else {
      toast.error(res.error || "Failed to create target batch");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSeries(null);
    setFormData({
      title: "",
      description: "",
      thumbnailUrl: "",
      batch: targetBatches[0]?.name || "UPSSSC Steno",
      exam: targetExams[0]?.name || "UPSSSC Steno",
      category: "General Series",
      language: "Hindi",
      selectedPassages: [],
      isPublished: true,
      sortOrder: seriesList.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (s: any) => {
    setEditingSeries(s);
    setFormData({
      title: s.title || "",
      description: s.description || "",
      thumbnailUrl: s.thumbnailUrl || "",
      batch: s.batch || targetBatches[0]?.name || "UPSSSC Steno",
      exam: s.exam || s.category || targetExams[0]?.name || "UPSSSC Steno",
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
      batch: formData.batch,
      exam: formData.exam,
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

  const filteredSeriesList = seriesList.filter((s) => {
    if (filterBatch !== "all") {
      const match = (s.batch || "").toLowerCase().includes(filterBatch.toLowerCase());
      if (!match) return false;
    }
    if (filterExam !== "all") {
      const examVal = filterExam.toLowerCase();
      const sExam = (s.exam || s.category || "").toLowerCase();
      if (!sExam.includes(examVal)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (s.title || "").toLowerCase().includes(q);
      const descMatch = (s.description || "").toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

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
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> Step 3 of 4 • Series Topics & Assignment
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            Series Topics & Assignment (Step 3)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create series topics (e.g. संपादकीय एवं निबन्ध, संसदीय, लीगल, रामधारी खण्ड 1) and assign them to Target Steno Batch (Step 1) and Target Government Exam (Step 2).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/steno/exams">
            <Button variant="outline" className="font-bold h-11 px-4 rounded-2xl text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Step 2: Govt Exams
            </Button>
          </Link>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-11 px-5 text-xs rounded-2xl shadow-md gap-2"
          >
            <Plus className="w-4 h-4" /> Create Series Topic (Step 3)
          </Button>
          <Link href="/admin/steno/passages">
            <Button variant="outline" className="font-bold h-11 px-4 rounded-2xl text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Headphones className="w-4 h-4" /> Go to Step 4: Dictation Passages <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search series topics..."
              className="pl-9 text-xs rounded-xl"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Step 1 Batch:</span>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
            >
              <option value="all">All Batches (सभी बैच)</option>
              {targetBatches.map((tb) => (
                <option key={tb._id || tb.name} value={tb.name}>
                  {tb.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Step 2 Exam:</span>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
            >
              <option value="all">All Govt Exams (सभी परीक्षाएं)</option>
              {targetExams.map((te) => (
                <option key={te._id || te.name} value={te.name}>
                  {te.name}
                </option>
              ))}
              <option value="UPSSSC Steno">UPSSSC Steno</option>
              <option value="UPSI Steno">UPSI Steno</option>
              <option value="SSC Steno Grade C & D">SSC Steno Grade C & D</option>
              <option value="Allahabad High Court Steno">Allahabad High Court Steno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" /> Loading series topics...
        </div>
      ) : filteredSeriesList.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No series topics match the filter criteria. Click "Create Series Topic" above to create one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeriesList.map((s) => (
            <Card key={s._id} className="p-6 rounded-3xl border-slate-200 bg-white shadow-xs space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                {/* Image Preview / Banner */}
                <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 relative flex items-center justify-center p-1">
                  {s.thumbnailUrl ? (
                    <>
                      <img
                        src={s.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 pointer-events-none"
                      />
                      <img
                        src={s.thumbnailUrl}
                        alt={s.title}
                        className="relative z-10 w-full h-full object-contain rounded-xl"
                      />
                    </>
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
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description || "Steno Course Series Topic"}</p>
                </div>

                {/* Assignment Info Badges (Step 1 & Step 2) */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" /> Step 1 Batch:
                    </span>
                    <strong className="text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 text-[11px] truncate max-w-[160px]">
                      {s.batch || "UPSSSC Steno"}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" /> Step 2 Exam:
                    </span>
                    <strong className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px] truncate max-w-[160px]">
                      {s.exam || s.category || "All Exams"}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5 text-emerald-600" /> Step 4 Dictations:
                    </span>
                    <strong className="text-slate-900 font-black">
                      {s.passages?.length || 0} Tracks
                    </strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link href="/admin/steno/passages" className="block">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                  >
                    <Headphones className="w-3.5 h-3.5" /> Manage Dictation Tracks (Step 4)
                  </Button>
                </Link>
                <div className="flex gap-2">
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] sm:max-h-[88vh] flex flex-col p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0 bg-white z-10">
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingSeries ? "Edit Steno Series Topic" : "Create New Steno Series Topic (Step 3)"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Step 1 Batch Assignment */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" /> Target Steno Batch (Step 1 Batch) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewBatchDialogOpen(true)}
                    className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                  >
                    + Create New Target Batch
                  </button>
                </div>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  {targetBatches.map((tb) => (
                    <option key={tb._id || tb.name} value={tb.name}>
                      {tb.name} {tb.hindiName ? `(${tb.hindiName})` : ""}
                    </option>
                  ))}
                  {/* Fallback if list is loading */}
                  {targetBatches.length === 0 && (
                    <>
                      <option value="हिंदी स्टेनो स्पेशल बैच (ठाकुरद्वारा)">हिंदी स्टेनो स्पेशल बैच (ठाकुरद्वारा)</option>
                      <option value="UPSSSC Steno">UPSSSC Steno (यूपीएसएसएससी स्टेनो)</option>
                      <option value="UPSI Steno">UPSI Steno (यूपीएसआई स्टेनो)</option>
                      <option value="SSC Steno Grade C & D">SSC Steno Grade C & D (एसएससी स्टेनो)</option>
                      <option value="Allahabad High Court Steno">Allahabad High Court Steno (इलाहाबाद हाईकोर्ट स्टेनो)</option>
                      <option value="रामधारी खण्ड 1">रामधारी खण्ड 1 (Ramdhari Part 1)</option>
                      <option value="रामधारी खण्ड 2">रामधारी खण्ड 2 (Ramdhari Part 2)</option>
                      <option value="General Batch">General Steno Batch</option>
                    </>
                  )}
                </select>
              </div>

              {/* Step 2 Government Exam Assignment */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" /> Target Government Exam (Step 2 Exam) *
                  </label>
                  <Link
                    href="/admin/steno/exams"
                    className="text-[11px] font-black text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-1"
                  >
                    Manage Step 2 Exams →
                  </Link>
                </div>
                <select
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  {targetExams.map((te) => (
                    <option key={te._id || te.name} value={te.name}>
                      {te.name} {te.authorityName ? `(${te.authorityName})` : ""}
                    </option>
                  ))}
                  <option value="UPSSSC Steno">UPSSSC Steno (उ०प्र० अधीनस्थ सेवा चयन आयोग)</option>
                  <option value="UPSI Steno">UPSI Steno (उ०प्र० पुलिस सब-इंस्पेक्टर)</option>
                  <option value="SSC Steno Grade C & D">SSC Steno Grade C & D (Staff Selection Commission)</option>
                  <option value="Allahabad High Court Steno">Allahabad High Court Steno (इलाहाबाद हाईकोर्ट)</option>
                  <option value="All Exams">All Exams / General</option>
                </select>
              </div>

              {/* Step 3 Series Topic Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" /> Series Topic / Title (Step 3 Topic Name) *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="उदा: संपादकीय एवं निबन्ध, साहित्य, कहानी, संसदीय, लीगल, रामधारी खण्ड 1, कुरुक्षेत्र पत्रिका"
                  className="rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category / Genre</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Editorial, Legal, General Series"
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course series description..."
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Series Topic / Step 3 Poster Thumbnail
                  </label>
                  <a
                    href="/admin/gallery"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-600 hover:underline font-bold"
                  >
                    Browse Gallery ↗
                  </a>
                </div>
                <ImageUpload
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  onRemove={() => setFormData({ ...formData, thumbnailUrl: "" })}
                  label="Upload Series Poster"
                />
                <Input
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="Or paste direct image URL (https://...)"
                  className="text-xs rounded-xl bg-white"
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
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pb-2">
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
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Assign Dictation Passages to Series</label>
                  {passages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.selectedPassages.length === passages.length) {
                          setFormData({ ...formData, selectedPassages: [] });
                        } else {
                          setFormData({ ...formData, selectedPassages: passages.map((p) => p._id) });
                        }
                      }}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {formData.selectedPassages.length === passages.length
                        ? "Deselect All (सभी हटाएं)"
                        : `Select All Dictations (सभी ${passages.length} चुनें)`}
                    </button>
                  )}
                </div>
                <div className="max-h-36 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
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
            </div>

            {/* Sticky Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs px-5 font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs px-6 font-bold shadow-md">
                {editingSeries ? "Save Changes" : "Create Series"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline Create Target Batch Modal */}
      <Dialog open={isNewBatchDialogOpen} onOpenChange={setIsNewBatchDialogOpen}>
        <DialogContent className="max-w-md p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" /> Create Target Steno Batch (Step 1)
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Batch Name (Step 1) *</label>
              <Input
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                placeholder="e.g. UPSSSC Steno, High Court Steno, Rajasthan Steno"
                className="rounded-xl text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Hindi Batch Name (Optional)</label>
              <Input
                value={newBatchHindiName}
                onChange={(e) => setNewBatchHindiName(e.target.value)}
                placeholder="e.g. यूपीएसएसएससी स्टेनो बैच"
                className="rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewBatchDialogOpen(false)}
                className="flex-1 font-bold rounded-2xl h-10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateInlineBatch}
                disabled={creatingBatch}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl h-10 text-xs gap-1.5"
              >
                {creatingBatch ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Target Batch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
