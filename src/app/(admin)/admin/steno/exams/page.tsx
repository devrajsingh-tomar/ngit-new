"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getStenoExamsAction,
  createStenoExamAction,
  updateStenoExamAction,
  deleteStenoExamAction,
  getStenoBatchesAction,
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
import {
  Award,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  FileText,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Sliders,
  Clock,
  Zap,
  Layers,
  Filter,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { MediaLibraryModal } from "@/components/admin/cms/MediaLibraryModal";
import Link from "next/link";

function AdminStenoExamsContent() {
  const searchParams = useSearchParams();
  const initialBatchParam = searchParams.get("batch") || "all";

  const [exams, setExams] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [filterBatch, setFilterBatch] = useState<string>(initialBatchParam);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Form State - Clean initial values (No dummy links or fallback data)
  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    authorityName: "",
    thumbnailUrl: "",
    description: "",
    targetWpm: 80,
    totalWords: 400,
    dictationDurationMinutes: 5,
    transcriptionDurationMinutes: 40,
    isActive: true,
  });

  useEffect(() => {
    loadBatches();
    loadExams();
  }, []);

  useEffect(() => {
    if (initialBatchParam && initialBatchParam !== "all") {
      setFilterBatch(initialBatchParam);
    }
  }, [initialBatchParam]);

  const loadBatches = async () => {
    try {
      const res = await getStenoBatchesAction();
      if (res && res.success && Array.isArray(res.batches) && res.batches.length > 0) {
        setBatches(res.batches);
        return;
      }
    } catch (e) {
      console.error("Action error, trying /api/steno/batches:", e);
    }
    try {
      const apiRes = await fetch("/api/steno/batches", { cache: "no-store" });
      const apiData = await apiRes.json();
      if (apiData.success && Array.isArray(apiData.batches)) {
        setBatches(apiData.batches);
      }
    } catch (apiErr) {
      console.error("API fallback failed:", apiErr);
    }
  };

  const loadExams = async () => {
    setLoading(true);
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams);
    } else {
      toast.error(res.error || "Failed to load government exams");
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    const defaultBatch = filterBatch !== "all" ? filterBatch : (batches[0]?.name || "");
    setFormData({
      name: "",
      batch: defaultBatch,
      authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
      thumbnailUrl: "",
      description: "",
      targetWpm: 80,
      totalWords: 400,
      dictationDurationMinutes: 5,
      transcriptionDurationMinutes: 40,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name || "",
      batch: exam.batch || (batches[0]?.name || ""),
      authorityName: exam.authorityName || "उ०प्र० अधीनस्थ सेवा चयन आयोग",
      thumbnailUrl: exam.thumbnailUrl || "",
      description: exam.description || "",
      targetWpm: exam.targetWpm || 80,
      totalWords: exam.totalWords || 400,
      dictationDurationMinutes: exam.dictationDurationMinutes || 5,
      transcriptionDurationMinutes: exam.transcriptionDurationMinutes || 40,
      isActive: exam.isActive !== false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Government Exam name is required!");
      return;
    }
    if (!formData.batch.trim()) {
      toast.error("Target Steno Batch (Step 1) is required!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      batch: formData.batch.trim(),
      authorityName: formData.authorityName.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim(),
      description: formData.description.trim(),
      targetWpm: Number(formData.targetWpm),
      totalWords: Number(formData.totalWords),
      dictationDurationMinutes: Number(formData.dictationDurationMinutes),
      transcriptionDurationMinutes: Number(formData.transcriptionDurationMinutes),
      isActive: Boolean(formData.isActive),
    };

    if (editingExam) {
      const res = await updateStenoExamAction(editingExam._id, payload);
      if (res.success) {
        toast.success("Government Exam updated successfully!");
        setIsDialogOpen(false);
        loadExams();
      } else {
        toast.error(res.error || "Failed to update exam");
      }
    } else {
      const res = await createStenoExamAction(payload);
      if (res.success) {
        toast.success("New Government Exam created successfully!");
        setIsDialogOpen(false);
        loadExams();
      } else {
        toast.error(res.error || "Failed to create exam");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this government exam?")) return;
    const res = await deleteStenoExamAction(id);
    if (res.success) {
      toast.success("Government exam deleted");
      loadExams();
    } else {
      toast.error(res.error || "Failed to delete exam");
    }
  };

  const filteredExams = exams.filter((exam) => {
    if (filterBatch === "all") return true;
    return (exam.batch || "").toLowerCase() === filterBatch.toLowerCase();
  });

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" /> Step 2 of 4 • Target Government Exams with Poster
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            Government Steno Exams with Poster (Step 2)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure government exam names, board authority badges, and official poster thumbnails individual to each Batch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/steno/batches">
            <Button variant="outline" className="font-bold h-11 px-4 rounded-2xl text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Step 1: Batches
            </Button>
          </Link>
          <Link href="/admin/steno/error-rules">
            <Button variant="outline" className="font-bold h-11 px-4 rounded-2xl text-xs gap-1.5 border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-100">
              <Sliders className="w-3.5 h-3.5 text-orange-600" /> Exam Rules (अलग से नियम) →
            </Button>
          </Link>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-11 px-5 text-xs rounded-2xl shadow-md gap-2"
          >
            <Plus className="w-4 h-4" /> Create Govt Exam (Step 2)
          </Button>
          <Link href="/admin/steno/series">
            <Button variant="outline" className="font-bold h-11 px-4 rounded-2xl text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <FileText className="w-4 h-4" /> Go to Step 3: Series Topics <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Batch Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
            Filter by Target Batch (Step 1):
          </span>
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Batches ({exams.length} Exams)</option>
            {batches.map((b) => (
              <option key={b._id || b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{filteredExams.length}</strong> exam{filteredExams.length === 1 ? "" : "s"}
          {filterBatch !== "all" && <span> for batch: <strong className="text-indigo-600">{filterBatch}</strong></span>}
        </div>
      </div>

      {/* Government Exam Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Government Exams...
        </div>
      ) : filteredExams.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-black text-slate-600">
            {filterBatch !== "all"
              ? `No Government Exams found for "${filterBatch}".`
              : "No Government Exams found."}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click below to create a Government Exam assigned to this batch.
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Govt Exam (Step 2)
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card
              key={exam._id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group overflow-hidden"
            >
              <div className="space-y-3.5">
                {/* Exam Card Poster Thumbnail */}
                <div className="w-full h-44 bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 shadow-xs relative">
                  {exam.thumbnailUrl && exam.thumbnailUrl.trim() !== "" ? (
                    <img
                      src={exam.thumbnailUrl}
                      alt={exam.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-4 text-center">
                      <Award className="w-10 h-10 text-amber-400 mb-2" />
                      <span className="text-white text-xs font-black">{exam.name}</span>
                      {exam.batch && (
                        <span className="text-indigo-300 text-[10px] font-bold mt-1">{exam.batch}</span>
                      )}
                    </div>
                  )}
                  {exam.authorityName && (
                    <span className="absolute top-2.5 right-2.5 bg-indigo-600/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                      {exam.authorityName}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" /> {exam.batch || "No Batch Assigned"}
                  </span>
                </div>

                {/* Exam Title & Description */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {exam.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      Step 2 Exam
                    </span>
                  </div>
                  {exam.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                      {exam.description}
                    </p>
                  )}
                </div>

                {/* Exam Metadata Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Speed: <strong className="text-slate-900 font-black">{exam.targetWpm || 80} WPM</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Duration: <strong className="text-slate-900 font-black">{exam.transcriptionDurationMinutes || 40} Mins</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/admin/steno/series?batch=${encodeURIComponent(exam.batch || "")}&exam=${encodeURIComponent(exam.name)}`}
                  className="block"
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-9 text-xs rounded-xl gap-1.5 shadow-sm">
                    <FileText className="w-3.5 h-3.5" /> Assign Series Topics (Step 3) <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleOpenEditModal(exam)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs font-bold rounded-xl gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Poster & Details
                  </Button>
                  <Button
                    onClick={() => handleDelete(exam._id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 border-rose-200 px-3"
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
        <DialogContent 
          onPointerDownOutside={(e) => {
            if (isMediaModalOpen) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isMediaModalOpen) e.preventDefault();
          }}
          className="max-w-xl max-h-[88vh] flex flex-col p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        >
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0 bg-white">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              {editingExam ? "Edit Government Exam & Poster" : "Create Government Exam with Poster"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Target Batch Assignment */}
              <div className="space-y-1 bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
                <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" /> Target Steno Batch (Step 1 Batch) *
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select Target Batch --</option>
                  {batches.map((b) => (
                    <option key={b._id || b.name} value={b.name}>
                      {b.name} {b.hindiName ? `(${b.hindiName})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-indigo-700 font-medium">
                  यह परीक्षा केवल चुने गए बैच के अंदर ही Step 2 में दिखाई देगी।
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Title / Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा: UPSSSC Steno, UPSI Steno, SSC Steno Grade C & D, Allahabad High Court Steno"
                  className="rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Authority Badge / Tag (Hindi/English)</label>
                <Input
                  value={formData.authorityName}
                  onChange={(e) => setFormData({ ...formData, authorityName: e.target.value })}
                  placeholder="उदा: उ०प्र० अधीनस्थ सेवा चयन आयोग"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Poster Image Upload & Live Preview */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" /> Government Exam Card Poster (Step 2 Thumbnail)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="text-xs font-extrabold h-7 px-2.5 rounded-lg border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 flex items-center gap-1.5 shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-600" /> Select from Gallery Manager
                  </Button>
                </div>
                <ImageUpload
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  onRemove={() => setFormData({ ...formData, thumbnailUrl: "" })}
                  label="Upload Exam Poster Image"
                />
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="Or paste poster image URL (https://...)"
                    className="rounded-xl text-xs font-medium bg-white"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-3.5 rounded-xl text-xs gap-1.5 shrink-0 shadow-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Quick Select
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  यह पोस्टर इमेज छात्र पोर्टल पर Step 2 में परीक्षा चयन कार्ड पर दिखाई देगी। खाली रखने पर डिफ़ॉल्ट कार्ड स्टाइल दिखेगा।
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Overview</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="उदा: संपादकीय, निबन्ध, साहित्य, कहानी, संसदीय, लीगल, रामधारी खण्ड 1 व 2, कुरुक्षेत्र पत्रिका संग्रह"
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Speed (WPM)</label>
                  <Input
                    type="number"
                    value={formData.targetWpm}
                    onChange={(e) => setFormData({ ...formData, targetWpm: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Words</label>
                  <Input
                    type="number"
                    value={formData.totalWords}
                    onChange={(e) => setFormData({ ...formData, totalWords: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dictation Mins</label>
                  <Input
                    type="number"
                    value={formData.dictationDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, dictationDurationMinutes: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transcription Mins</label>
                  <Input
                    type="number"
                    value={formData.transcriptionDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, transcriptionDurationMinutes: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              {/* Notice linking to separate evaluation rules */}
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <strong className="font-bold flex items-center gap-1.5 text-orange-900">
                    <Sliders className="w-3.5 h-3.5 text-orange-600" /> मूल्यांकन नियम अलग से प्रबंधित हैं
                  </strong>
                  <p className="text-[11px] text-orange-700">
                    वर्तनी, मात्रा, 20 अशुद्धियों की छूट व बैकस्पेस नीतियाँ अलग मेनू में सेट की जाती हैं।
                  </p>
                </div>
                <Link href="/admin/steno/error-rules" target="_blank">
                  <Button type="button" variant="outline" size="sm" className="bg-white border-orange-300 text-orange-800 text-[11px] font-bold h-7 shrink-0">
                    नियम खोलें →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md">
                {editingExam ? "Save Changes" : "Create Exam"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
          setIsMediaModalOpen(false);
          toast.success("Exam poster selected from Gallery Manager!");
        }}
      />
    </div>
  );
}

export default function AdminStenoExamsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Loading Government Exams...</div>}>
      <AdminStenoExamsContent />
    </Suspense>
  );
}
