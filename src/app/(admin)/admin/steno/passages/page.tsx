"use client";

import { useEffect, useState } from "react";
import {
  getStenoPassagesAction,
  createStenoPassageAction,
  updateStenoPassageAction,
  deleteStenoPassageAction,
  getStenoSeriesListAction,
  getStenoExamsAction,
  bulkAssignStenoPassagesAction,
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
  Headphones,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Search,
  Filter,
  Layers,
  Type,
  CheckSquare,
  Square,
  Award,
  BookOpen,
  Zap,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoPassagesPage() {
  const [passages, setPassages] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassage, setEditingPassage] = useState<any | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSeriesId, setBulkSeriesId] = useState("");
  const [bulkExamPresetId, setBulkExamPresetId] = useState("");
  const [bulkExamType, setBulkExamType] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Filters State
  const [filterMode, setFilterMode] = useState("all");
  const [filterSeries, setFilterSeries] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    language: "Hindi",
    typingMode: "unicode_hindi",
    category: "General Dictation",
    seriesId: "",
    examPresetId: "",
    examType: "SSC Steno",
    transcriptText: "",
    wordCount: 400,
    durationMinutes: 35,
    audioUrl: "",
    videoUrl: "",
    availableSpeeds: "40, 50, 60, 70, 80, 90, 100, 110, 120",
    targetWpm: 80,
    isPublished: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadPassages();
    loadSeries();
    loadExams();
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

  const loadExams = async () => {
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPassage(null);
    setFormData({
      title: "",
      language: "Hindi",
      typingMode: "unicode_hindi",
      category: "General Dictation",
      seriesId: "",
      examPresetId: "",
      examType: "SSC Steno",
      transcriptText: "",
      wordCount: 400,
      durationMinutes: 35,
      audioUrl: "",
      videoUrl: "",
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
      typingMode: p.typingMode || (p.language === "English" ? "english" : "unicode_hindi"),
      category: p.category || "General Dictation",
      seriesId: p.seriesId?._id || p.seriesId || "",
      examPresetId: p.examPresetId?._id || p.examPresetId || "",
      examType: p.examType || "SSC Steno",
      transcriptText: p.transcriptText || "",
      wordCount: p.wordCount || 400,
      durationMinutes: p.durationMinutes || (p.durationSeconds ? Math.round(p.durationSeconds / 60) : 35),
      audioUrl: p.audioUrl || "",
      videoUrl: p.videoUrl || "",
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

    const durationMins = Number(formData.durationMinutes) || 35;
    const payload = {
      title: formData.title.trim(),
      language: formData.language as any,
      typingMode: formData.typingMode as any,
      category: formData.category.trim(),
      seriesId: formData.seriesId || undefined,
      examPresetId: formData.examPresetId || undefined,
      examType: formData.examType.trim(),
      transcriptText: formData.transcriptText.trim(),
      wordCount: Number(formData.wordCount),
      durationMinutes: durationMins,
      durationSeconds: durationMins * 60,
      audioUrl: formData.audioUrl.trim(),
      videoUrl: formData.videoUrl.trim() || undefined,
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

  // Filter Passages
  const filteredPassages = passages.filter((p) => {
    if (filterMode === "unicode_hindi") {
      if (p.language !== "Hindi" && p.typingMode !== "unicode_hindi") return false;
      if (p.typingMode === "krutidev_010") return false;
    } else if (filterMode === "krutidev_010") {
      if (p.typingMode !== "krutidev_010") return false;
    } else if (filterMode === "english") {
      if (p.language !== "English" && p.typingMode !== "english") return false;
    }

    if (filterSeries !== "all") {
      const sId = p.seriesId?._id || p.seriesId;
      if (sId !== filterSeries) return false;
    }

    if (searchQuery.trim()) {
      return (p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Bulk Selection Helpers
  const isAllSelected =
    filteredPassages.length > 0 &&
    filteredPassages.every((p) => selectedIds.includes(p._id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPassages.map((p) => p._id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApplyBulkAssign = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one dictation passage");
      return;
    }
    if (!bulkSeriesId && !bulkExamPresetId && !bulkExamType && !bulkCategory) {
      toast.error("Please select a Series Topic, Exam Rules Preset, or Exam Name to assign");
      return;
    }

    setIsBulkAssigning(true);
    const toastId = toast.loading(`Assigning ${selectedIds.length} dictation passages...`);

    const res = await bulkAssignStenoPassagesAction({
      passageIds: selectedIds,
      seriesId: bulkSeriesId || undefined,
      examPresetId: bulkExamPresetId || undefined,
      examType: bulkExamType || undefined,
      category: bulkCategory || undefined,
    });

    toast.dismiss(toastId);
    setIsBulkAssigning(false);

    if (res.success) {
      toast.success(`Successfully assigned ${res.count} dictations to government exam rules!`);
      setSelectedIds([]);
      setBulkSeriesId("");
      setBulkExamPresetId("");
      setBulkExamType("");
      setBulkCategory("");
      loadPassages();
    } else {
      toast.error(res.error || "Failed to bulk assign dictation passages");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Step 3 of 3 • Dictations
            </span>
            <span className="text-xs font-bold text-slate-400">• Passages Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Headphones className="w-6 h-6 text-indigo-600" /> Dictation Passages (डिक्टेशन)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage audio dictations & assign them to Government Steno Exam Rules or Series Topics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl h-11 px-5 text-xs shadow-md gap-2"
          >
            <Plus className="w-4 h-4" /> Add Dictation Passage
          </Button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Assignment Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-4 sm:p-5 rounded-3xl border-2 border-indigo-500 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Zap className="w-4 h-4 fill-slate-950" /> {selectedIds.length} Dictation(s) Selected
              </span>
              <p className="text-xs text-indigo-200 font-semibold hidden sm:block">
                Assign selected dictations to Government Exam Rules or Series Topics:
              </p>
            </div>

            <Button
              onClick={() => setSelectedIds([])}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10 text-xs font-bold rounded-xl shrink-0 self-end lg:self-auto"
            >
              Clear Selection
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-indigo-800/60">
            {/* Assign Series Topic */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-indigo-200 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-300" /> Series Topic (Step 2)
              </label>
              <select
                value={bulkSeriesId}
                onChange={(e) => setBulkSeriesId(e.target.value)}
                className="w-full bg-slate-800 border border-indigo-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">-- Assign Series Topic --</option>
                {seriesList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.batch ? `${s.batch} • ` : ""}{s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign Government Exam Preset Rules */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-indigo-200 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Govt Exam Rules Preset
              </label>
              <select
                value={bulkExamPresetId}
                onChange={(e) => setBulkExamPresetId(e.target.value)}
                className="w-full bg-slate-800 border border-indigo-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">-- Assign Exam Rules Preset --</option>
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name} ({ex.targetWpm} WPM • {ex.authorityName || "Official"})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Exam Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-indigo-200">Exam Tag / Authority</label>
              <Input
                value={bulkExamType}
                onChange={(e) => setBulkExamType(e.target.value)}
                placeholder="e.g. UPSSSC, High Court, SSC"
                className="bg-slate-800 border-indigo-700 text-white placeholder:text-slate-400 rounded-xl text-xs font-semibold h-9"
              />
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <Button
                onClick={handleApplyBulkAssign}
                disabled={isBulkAssigning}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black h-9 text-xs rounded-xl gap-2 shadow-md"
              >
                {isBulkAssigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                APPLY BULK ASSIGNMENT
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filter & Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600 fill-indigo-100" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isAllSelected ? "Unselect All (सभी हटाएं)" : "Select All Passages (सभी डिक्टेशन चुनें)"}</span>
          </button>
          <span className="text-xs text-slate-400 font-bold">
            ({filteredPassages.length} Dictations)
          </span>
        </div>

        {/* Filter Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Mode Filter */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700"
          >
            <option value="all">All Font Standards (सारे फॉन्ट)</option>
            <option value="unicode_hindi">Unicode Hindi (मंगत)</option>
            <option value="krutidev_010">Kruti Dev 010 (कृतिदेव)</option>
            <option value="english">English Steno</option>
          </select>

          {/* Series Filter */}
          <select
            value={filterSeries}
            onChange={(e) => setFilterSeries(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 max-w-[200px] truncate"
          >
            <option value="all">All Series Topics (सारे टॉपिक्स)</option>
            {seriesList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search passage title..."
              className="pl-9 h-9 rounded-xl text-xs font-semibold bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Passages List Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" /> Loading Dictation Passages...
        </div>
      ) : filteredPassages.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          <Headphones className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Dictation Passages Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create your first dictation passage or adjust your search filters above.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPassages.map((p) => {
            const isSelected = selectedIds.includes(p._id);

            return (
              <Card
                key={p._id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? "border-2 border-indigo-600 bg-indigo-50/40 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar with Select Checkbox & Status */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectOne(p._id)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                      )}
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {p.targetWpm || 80} WPM
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Font Badge */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-700 mt-1 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5" />
                      {p.typingMode === "krutidev_010"
                        ? "Kruti Dev 010 (कृतिदेव)"
                        : p.typingMode === "english"
                        ? "English Steno"
                        : "Unicode Hindi (मंगल)"}
                    </p>
                  </div>

                  {/* Assignments Tags */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600 font-medium">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[11px]">Series Topic:</span>
                      <strong className="font-bold text-slate-800 truncate max-w-[170px]">
                        {p.seriesId?.title || "Standalone / Unassigned"}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[11px]">Govt Exam Rules:</span>
                      <strong className="font-bold text-indigo-700 truncate max-w-[170px]">
                        {p.examPresetId?.name || p.examType || "Default Rules"}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[11px]">Words / Duration:</span>
                      <strong className="font-bold text-slate-700">
                        {p.wordCount || 400} words ({p.durationMinutes || 35} Mins)
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => handleOpenEditModal(p)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Passage
                  </Button>
                  <Button
                    onClick={() => handleDelete(p._id)}
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Add / Edit Single Dictation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] sm:max-h-[88vh] flex flex-col p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0 bg-white z-10">
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingPassage ? "Edit Dictation Passage" : "Add Dictation Passage"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
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

              {/* Assignment Selectors */}
              <div className="space-y-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" /> Dictation Government Exam & Series Assignment
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Assign Series Topic (Step 2)</label>
                    <select
                      value={formData.seriesId}
                      onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="">No Series (Standalone Dictation)</option>
                      {seriesList.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.batch ? `${s.batch} • ` : ""}{s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Government Exam Rules Preset</label>
                    <select
                      value={formData.examPresetId}
                      onChange={(e) => setFormData({ ...formData, examPresetId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="">Default Exam Rules</option>
                      {exams.map((ex) => (
                        <option key={ex._id} value={ex._id}>
                          {ex.name} ({ex.targetWpm} WPM • {ex.authorityName || "Official Rules"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Exam Tag / Authority Name</label>
                  <Input
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    placeholder="e.g. UPSSSC Steno, High Court Steno, SSC Grade C&D"
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Typing Mode & Font Standard *</label>
                  <select
                    value={formData.typingMode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        typingMode: val,
                        language: val === "english" ? "English" : "Hindi",
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="unicode_hindi">Unicode Hindi / Mangal Font</option>
                    <option value="krutidev_010">Kruti Dev 010 / Legacy Hindi Font</option>
                    <option value="english">English Steno</option>
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
                  <label className="text-xs font-bold text-slate-700">Word Count</label>
                  <Input
                    type="number"
                    value={formData.wordCount}
                    onChange={(e) => setFormData({ ...formData, wordCount: Number(e.target.value) })}
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes) *</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    placeholder="e.g. 35, 45, 50"
                    className="rounded-xl text-xs font-semibold"
                    required
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
                <label className="text-xs font-bold text-slate-700">Available Speeds (Comma Separated)</label>
                <Input
                  value={formData.availableSpeeds}
                  onChange={(e) => setFormData({ ...formData, availableSpeeds: e.target.value })}
                  placeholder="40, 50, 60, 70, 80, 90, 100, 110, 120"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Passage Reference Text * ({formData.typingMode === "krutidev_010" ? "Kruti Dev 010 Format" : "Unicode Hindi / English Format"})
                </label>
                <textarea
                  value={formData.transcriptText}
                  onChange={(e) => setFormData({ ...formData, transcriptText: e.target.value })}
                  placeholder="Paste the official transcript text here for auto-evaluation..."
                  rows={5}
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
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3 z-10">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                {editingPassage ? "Save Changes" : "Create Passage"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
