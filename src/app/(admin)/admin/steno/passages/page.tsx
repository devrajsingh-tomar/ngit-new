"use client";

import { useEffect, useState } from "react";
import {
  getStenoPassagesAction,
  createStenoPassageAction,
  updateStenoPassageAction,
  deleteStenoPassageAction,
  bulkDeleteStenoPassagesAction,
  bulkRemoveStenoPassagesFromSeriesAction,
  getStenoSeriesListAction,
  getStenoExamsAction,
  bulkAssignStenoPassagesAction,
  getStenoBatchesAction,
  createStenoSeriesAction,
  createStenoBatchAction,
} from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Headphones,
  Plus,
  ArrowLeft,
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
  FolderPlus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoPassagesPage() {
  const [passages, setPassages] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [targetBatches, setTargetBatches] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPassage, setEditingPassage] = useState<any | null>(null);

  // Quick Series Topic Creation Modal State
  const [isQuickSeriesDialogOpen, setIsQuickSeriesDialogOpen] = useState(false);
  const [quickSeriesTitle, setQuickSeriesTitle] = useState("");
  const [quickSeriesBatch, setQuickSeriesBatch] = useState("");
  const [isCreatingQuickSeries, setIsCreatingQuickSeries] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSeriesIds, setBulkSeriesIds] = useState<string[]>([]);
  const [isBulkSeriesDropdownOpen, setIsBulkSeriesDropdownOpen] = useState(false);
  const [bulkSeriesSearch, setBulkSeriesSearch] = useState("");
  const [bulkExamPresetId, setBulkExamPresetId] = useState("");
  const [bulkExamType, setBulkExamType] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Filters State
  const [filterMode, setFilterMode] = useState("all");
  const [filterSeries, setFilterSeries] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Series Multi-Select State
  const [modalSeriesSearch, setModalSeriesSearch] = useState("");
  const [isModalSeriesDropdownOpen, setIsModalSeriesDropdownOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    language: "Hindi",
    typingMode: "unicode_hindi",
    category: "General Dictation",
    seriesId: "",
    seriesIds: [] as string[],
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
    loadBatches();
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

  const loadBatches = async () => {
    try {
      const res = await getStenoBatchesAction({ isPublished: undefined });
      if (res && res.success && Array.isArray(res.batches) && res.batches.length > 0) {
        setTargetBatches(res.batches);
        if (!quickSeriesBatch) {
          setQuickSeriesBatch(res.batches[0].name);
        }
        return;
      }
    } catch (e) {
      console.error("Action error, trying /api/steno/batches:", e);
    }
    try {
      const apiRes = await fetch("/api/steno/batches", { cache: "no-store" });
      const apiData = await apiRes.json();
      if (apiData.success && Array.isArray(apiData.batches)) {
        setTargetBatches(apiData.batches);
        if (apiData.batches.length > 0 && !quickSeriesBatch) {
          setQuickSeriesBatch(apiData.batches[0].name);
        }
      }
    } catch (apiErr) {
      console.error("API fallback failed:", apiErr);
    }
  };

  const loadExams = async () => {
    const res = await getStenoExamsAction();
    if (res.success && res.exams) {
      setExams(res.exams);
    }
  };

  const handleCreateQuickSeries = async () => {
    if (!quickSeriesTitle.trim() || !quickSeriesBatch.trim()) {
      toast.error("Series Title and Target Batch are required!");
      return;
    }

    setIsCreatingQuickSeries(true);
    const res = await createStenoSeriesAction({
      title: quickSeriesTitle.trim(),
      batch: quickSeriesBatch.trim(),
      description: `${quickSeriesBatch.trim()} - ${quickSeriesTitle.trim()}`,
      category: "General Series",
      language: "Hindi",
      isPublished: true,
    });
    setIsCreatingQuickSeries(false);

    if (res.success && res.series) {
      toast.success(`Series Topic "${res.series.title}" created for ${quickSeriesBatch}`);
      setQuickSeriesTitle("");
      setIsQuickSeriesDialogOpen(false);
      await loadSeries();
      const newId = String(res.series._id);
      setFormData((prev) => ({
        ...prev,
        seriesId: prev.seriesId || newId,
        seriesIds: prev.seriesIds.includes(newId) ? prev.seriesIds : [...prev.seriesIds, newId],
      }));
    } else {
      toast.error(res.error || "Failed to create series topic");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPassage(null);
    setModalSeriesSearch("");
    setIsModalSeriesDropdownOpen(false);
    setFormData({
      title: "",
      language: "Hindi",
      typingMode: "unicode_hindi",
      category: "General Dictation",
      seriesId: "",
      seriesIds: [],
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
    setModalSeriesSearch("");
    setIsModalSeriesDropdownOpen(false);

    const extractedSeriesIds: string[] = [];
    if (Array.isArray(p.seriesIds) && p.seriesIds.length > 0) {
      p.seriesIds.forEach((s: any) => {
        const idStr = s?._id ? String(s._id) : s ? String(s) : "";
        if (idStr && !extractedSeriesIds.includes(idStr)) {
          extractedSeriesIds.push(idStr);
        }
      });
    } else if (p.seriesId) {
      const idStr = p.seriesId?._id ? String(p.seriesId._id) : String(p.seriesId);
      if (idStr) extractedSeriesIds.push(idStr);
    }

    setFormData({
      title: p.title || "",
      language: p.language || "Hindi",
      typingMode: p.typingMode || (p.language === "English" ? "english" : "unicode_hindi"),
      category: p.category || "General Dictation",
      seriesId: extractedSeriesIds[0] || "",
      seriesIds: extractedSeriesIds,
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

  const toggleFormDataSeries = (seriesId: string) => {
    setFormData((prev) => {
      const exists = prev.seriesIds.includes(seriesId);
      const updated = exists
        ? prev.seriesIds.filter((id) => id !== seriesId)
        : [...prev.seriesIds, seriesId];
      return {
        ...prev,
        seriesIds: updated,
        seriesId: updated[0] || "",
      };
    });
  };

  const toggleBulkSeries = (seriesId: string) => {
    setBulkSeriesIds((prev) =>
      prev.includes(seriesId)
        ? prev.filter((id) => id !== seriesId)
        : [...prev, seriesId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAudio = Boolean(formData.audioUrl.trim() && formData.audioUrl.trim() !== "0" && formData.audioUrl.trim() !== "#");
    const hasVideo = Boolean(formData.videoUrl.trim() && formData.videoUrl.trim() !== "0" && formData.videoUrl.trim() !== "#");

    if (!formData.title.trim() || (!hasAudio && !hasVideo) || !formData.transcriptText.trim()) {
      toast.error("Title, Audio URL या Video URL, और Transcript Text आवश्यक हैं!");
      return;
    }

    const durationMins = Number(formData.durationMinutes) || 35;
    const cleanAudio = formData.audioUrl.trim();
    const cleanVideo = formData.videoUrl.trim();
    const resolvedAudio = (cleanAudio && cleanAudio !== "0" && cleanAudio !== "#")
      ? cleanAudio
      : (cleanVideo && cleanVideo !== "0" && cleanVideo !== "#" ? cleanVideo : "#");
    const resolvedVideo = (cleanVideo && cleanVideo !== "0" && cleanVideo !== "#")
      ? cleanVideo
      : undefined;

    const payload = {
      title: formData.title.trim(),
      language: formData.language as any,
      typingMode: formData.typingMode as any,
      category: formData.category.trim(),
      seriesId: formData.seriesIds[0] || undefined,
      seriesIds: formData.seriesIds,
      examPresetId: formData.examPresetId || undefined,
      examType: formData.examType.trim(),
      transcriptText: formData.transcriptText.trim(),
      wordCount: Number(formData.wordCount),
      durationMinutes: durationMins,
      durationSeconds: durationMins * 60,
      audioUrl: resolvedAudio,
      videoUrl: resolvedVideo,
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
      const allAssignedIds: string[] = [];
      if (Array.isArray(p.seriesIds)) {
        p.seriesIds.forEach((s: any) => {
          const idStr = s?._id ? String(s._id) : s ? String(s) : "";
          if (idStr) allAssignedIds.push(idStr);
        });
      }
      const primaryId = p.seriesId?._id ? String(p.seriesId._id) : p.seriesId ? String(p.seriesId) : "";
      if (primaryId && !allAssignedIds.includes(primaryId)) {
        allAssignedIds.push(primaryId);
      }
      if (!allAssignedIds.includes(filterSeries)) return false;
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

  const isAllDatabaseSelected =
    passages.length > 0 &&
    passages.every((p) => selectedIds.includes(p._id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPassages.map((p) => p._id));
    }
  };

  const handleSelectAllEntireDatabase = () => {
    if (isAllDatabaseSelected) {
      setSelectedIds([]);
      toast.info("Cleared all dictation selections.");
    } else {
      const allIds = passages.map((p) => p._id);
      setSelectedIds(allIds);
      toast.success(`Selected ALL ${allIds.length} dictation passages across ALL series!`);
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
    if (bulkSeriesIds.length === 0 && !bulkExamPresetId && !bulkExamType && !bulkCategory) {
      toast.error("Please select at least one Series Topic, Exam Rules Preset, or Exam Tag to assign");
      return;
    }

    setIsBulkAssigning(true);
    const toastId = toast.loading(`Assigning ${selectedIds.length} dictation passages...`);

    const res = await bulkAssignStenoPassagesAction({
      passageIds: selectedIds,
      seriesIds: bulkSeriesIds,
      seriesId: bulkSeriesIds[0] || undefined,
      examPresetId: bulkExamPresetId || undefined,
      examType: bulkExamType || undefined,
      category: bulkCategory || undefined,
    });

    toast.dismiss(toastId);
    setIsBulkAssigning(false);

    if (res.success) {
      const seriesMsg = bulkSeriesIds.length > 0 ? ` and added to ${bulkSeriesIds.length} series topic(s)` : "";
      toast.success(`Successfully assigned ${res.count} dictation passages${seriesMsg}!`);
      setSelectedIds([]);
      setBulkSeriesIds([]);
      setBulkSeriesSearch("");
      setIsBulkSeriesDropdownOpen(false);
      setBulkExamPresetId("");
      setBulkExamType("");
      setBulkCategory("");
      loadPassages();
    } else {
      toast.error(res.error || "Failed to bulk assign dictation passages");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one dictation passage to delete");
      return;
    }

    const confirmMsg = `Are you sure you want to permanently delete all ${selectedIds.length} selected dictation passage(s)? This action cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    setIsBulkAssigning(true);
    const toastId = toast.loading(`Deleting ${selectedIds.length} dictation passages...`);
    const res = await bulkDeleteStenoPassagesAction(selectedIds);
    toast.dismiss(toastId);
    setIsBulkAssigning(false);

    if (res.success) {
      toast.success(`Successfully deleted ${res.count} dictation passage(s)!`);
      setSelectedIds([]);
      loadPassages();
    } else {
      toast.error(res.error || "Failed to delete selected passages");
    }
  };

  const handleBulkRemoveFromSeries = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one dictation passage");
      return;
    }
    if (bulkSeriesIds.length === 0) {
      toast.error("Please select the Series Topic(s) above that you want to remove from the selected dictations");
      return;
    }

    setIsBulkAssigning(true);
    const toastId = toast.loading(`Removing ${selectedIds.length} passages from ${bulkSeriesIds.length} series topic(s)...`);
    const res = await bulkRemoveStenoPassagesFromSeriesAction({
      passageIds: selectedIds,
      seriesIds: bulkSeriesIds,
    });
    toast.dismiss(toastId);
    setIsBulkAssigning(false);

    if (res.success) {
      toast.success(`Removed ${selectedIds.length} dictation(s) from ${bulkSeriesIds.length} series topic(s)!`);
      setBulkSeriesIds([]);
      setIsBulkSeriesDropdownOpen(false);
      loadPassages();
    } else {
      toast.error(res.error || "Failed to remove from series");
    }
  };

  const handleBulkClearAllSeries = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one dictation passage");
      return;
    }

    const confirmMsg = `Are you sure you want to remove ALL series topics from ${selectedIds.length} selected dictation passage(s) (make them Standalone)?`;
    if (!confirm(confirmMsg)) return;

    setIsBulkAssigning(true);
    const toastId = toast.loading(`Clearing all series assignments for ${selectedIds.length} passages...`);
    const res = await bulkRemoveStenoPassagesFromSeriesAction({
      passageIds: selectedIds,
      clearAll: true,
    });
    toast.dismiss(toastId);
    setIsBulkAssigning(false);

    if (res.success) {
      toast.success(`Cleared all series assignments for ${selectedIds.length} dictation passage(s)!`);
      setBulkSeriesIds([]);
      setIsBulkSeriesDropdownOpen(false);
      loadPassages();
    } else {
      toast.error(res.error || "Failed to clear series assignments");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Step 4 of 4 • Dictations
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
          <Link href="/admin/steno/series">
            <Button
              variant="outline"
              className="rounded-2xl h-11 px-4 text-xs font-bold gap-2 border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" /> Series Topics (Step 3)
            </Button>
          </Link>
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
                Assign or remove selected dictations from Government Exam Rules or Series Topics:
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
              {/* Bulk Delete Passages Button */}
              <button
                type="button"
                onClick={handleBulkDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border border-rose-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length} डिक्टेशन हटाएं)</span>
              </button>

              {/* Clear Selection Button */}
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                Clear Selection (सिलेक्शन हटाएं)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-indigo-800/60">
            {/* Assign Series Topic Multi-Select */}
            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-indigo-200 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-300" /> Series Topic(s) (Step 3)
                </span>
                {bulkSeriesIds.length > 0 && (
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded">
                    {bulkSeriesIds.length} selected
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={() => setIsBulkSeriesDropdownOpen(!isBulkSeriesDropdownOpen)}
                className="w-full bg-slate-800 border border-indigo-700 text-white rounded-xl p-2.5 text-xs font-semibold flex items-center justify-between hover:border-amber-400 transition-all text-left h-9 cursor-pointer"
              >
                <span className="truncate">
                  {bulkSeriesIds.length === 0
                    ? "-- Select Series Topic(s) --"
                    : `${bulkSeriesIds.length} Series Topic(s) Selected`}
                </span>
                {isBulkSeriesDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-300 shrink-0 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-300 shrink-0 ml-1" />
                )}
              </button>

              {isBulkSeriesDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900 border border-indigo-600 rounded-2xl shadow-2xl p-3 space-y-2 z-50 text-white animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                      <Input
                        value={bulkSeriesSearch}
                        onChange={(e) => setBulkSeriesSearch(e.target.value)}
                        placeholder="Search series..."
                        className="h-7 pl-7 text-[11px] rounded-lg bg-slate-800 border-indigo-700 text-white"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (bulkSeriesIds.length === seriesList.length) {
                          setBulkSeriesIds([]);
                        } else {
                          setBulkSeriesIds(seriesList.map((s) => s._id));
                        }
                      }}
                      className="text-[10px] font-bold text-amber-400 hover:underline shrink-0 cursor-pointer"
                    >
                      {bulkSeriesIds.length === seriesList.length ? "Deselect" : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {seriesList
                      .filter((s) => {
                        if (!bulkSeriesSearch.trim()) return true;
                        const q = bulkSeriesSearch.toLowerCase();
                        return (
                          (s.title || "").toLowerCase().includes(q) ||
                          (s.batch || "").toLowerCase().includes(q) ||
                          (s.exam || "").toLowerCase().includes(q)
                        );
                      })
                      .map((s) => {
                        const isChecked = bulkSeriesIds.includes(s._id);
                        return (
                          <label
                            key={s._id}
                            onClick={() => toggleBulkSeries(s._id)}
                            className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-indigo-600/70 text-white font-bold"
                                : "hover:bg-slate-800 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded text-amber-400"
                              />
                              <span className="truncate">
                                {s.batch ? `${s.batch} • ` : ""}
                                {s.title}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    {seriesList.length === 0 && (
                      <p className="text-xs text-slate-400 py-2 text-center">No series topics found</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBulkSeriesIds([])}
                      className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsBulkSeriesDropdownOpen(false)}
                      className="h-6 text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg px-2.5"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
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

            {/* Action Buttons: Add, Remove Selected Series, Clear All Series */}
            <div className="flex flex-col gap-1.5 justify-end">
              <Button
                onClick={handleApplyBulkAssign}
                disabled={isBulkAssigning}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black h-9 text-xs rounded-xl gap-1.5 shadow-md cursor-pointer"
              >
                {isBulkAssigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                + APPLY BULK ASSIGNMENT
              </Button>

              <div className="flex gap-1.5">
                <Button
                  type="button"
                  onClick={handleBulkRemoveFromSeries}
                  disabled={isBulkAssigning || bulkSeriesIds.length === 0}
                  variant="outline"
                  className="flex-1 bg-slate-800 hover:bg-rose-950 hover:border-rose-500 hover:text-rose-200 text-slate-300 border-indigo-700 font-bold h-7 text-[10px] rounded-lg gap-1 cursor-pointer disabled:opacity-40"
                  title="Remove selected dictations from the chosen series topics above"
                >
                  <X className="w-3 h-3 text-rose-400" /> सीरीज़ से हटाएं
                </Button>

                <Button
                  type="button"
                  onClick={handleBulkClearAllSeries}
                  disabled={isBulkAssigning}
                  variant="outline"
                  className="flex-1 bg-slate-800 hover:bg-amber-950 hover:border-amber-500 hover:text-amber-200 text-slate-300 border-indigo-700 font-bold h-7 text-[10px] rounded-lg gap-1 cursor-pointer"
                  title="Clear all series assignments for selected dictations (make them Standalone)"
                >
                  <Trash2 className="w-3 h-3 text-amber-400" /> सभी सीरीज़ हटाएं
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter & Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Select All Checkbox Options */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Select All in Entire Database */}
          <button
            type="button"
            onClick={handleSelectAllEntireDatabase}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              isAllDatabaseSelected
                ? "bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>
              {isAllDatabaseSelected
                ? `Unselect All (${passages.length} Dictations)`
                : `SELECT ALL IN ALL SERIES (सभी ${passages.length} डिक्टेशन चुनें)`}
            </span>
          </button>

          {/* Select Filtered Only */}
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600 fill-indigo-100" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isAllSelected ? "Unselect Filtered" : `Select Filtered (${filteredPassages.length})`}</span>
          </button>
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
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-slate-400 font-bold text-[11px] shrink-0 mt-0.5">Series Topic(s):</span>
                      <div className="text-right max-w-[190px]">
                        {(() => {
                          const passageSeries: any[] = [];
                          if (Array.isArray(p.seriesIds) && p.seriesIds.length > 0) {
                            p.seriesIds.forEach((s: any) => {
                              if (s && typeof s === "object" && s.title) passageSeries.push(s);
                              else if (s) {
                                const matched = seriesList.find((sl) => sl._id === (s._id || s));
                                if (matched) passageSeries.push(matched);
                              }
                            });
                          }
                          if (passageSeries.length === 0 && p.seriesId) {
                            if (typeof p.seriesId === "object" && p.seriesId.title) passageSeries.push(p.seriesId);
                            else {
                              const matched = seriesList.find((sl) => sl._id === p.seriesId);
                              if (matched) passageSeries.push(matched);
                            }
                          }

                          if (passageSeries.length === 0) {
                            return <span className="font-bold text-slate-400 text-[11px]">Standalone / Unassigned</span>;
                          }

                          if (passageSeries.length === 1) {
                            return (
                              <strong className="font-bold text-slate-800 text-[11px] truncate block" title={passageSeries[0].title}>
                                {passageSeries[0].title}
                              </strong>
                            );
                          }

                          return (
                            <div className="flex flex-wrap justify-end gap-1">
                              <span className="font-bold text-slate-800 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px] border border-indigo-100 truncate max-w-[120px]" title={passageSeries[0].title}>
                                {passageSeries[0].title}
                              </span>
                              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md" title={passageSeries.slice(1).map((s) => s.title).join(", ")}>
                                +{passageSeries.length - 1} more
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Assign Series Topic(s) (Step 3)</label>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {formData.seriesIds.length === 0
                          ? "Standalone"
                          : `${formData.seriesIds.length} Series Selected`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuickSeriesDialogOpen(true)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" /> + New Series Topic
                    </button>
                  </div>

                  {/* Selected Series Chips */}
                  {formData.seriesIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-indigo-200 max-h-24 overflow-y-auto">
                      {formData.seriesIds.map((sId) => {
                        const found = seriesList.find((s) => s._id === sId);
                        return (
                          <span
                            key={sId}
                            className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-lg text-xs font-bold shadow-2xs"
                          >
                            <span className="truncate max-w-[200px]">
                              {found?.batch ? `${found.batch} • ` : ""}
                              {found?.title || sId}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleFormDataSeries(sId)}
                              className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi-Select Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsModalSeriesDropdownOpen(!isModalSeriesDropdownOpen)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold flex items-center justify-between hover:border-indigo-400 transition-all text-left cursor-pointer"
                    >
                      <span className="text-slate-700 truncate">
                        {formData.seriesIds.length === 0
                          ? "No Series (Standalone Dictation) — Click to assign series"
                          : `✓ ${formData.seriesIds.length} Series Topic(s) Selected — Click to modify`}
                      </span>
                      {isModalSeriesDropdownOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {isModalSeriesDropdownOpen && (
                      <div className="mt-2 bg-white rounded-2xl border border-indigo-200 shadow-xl p-3 space-y-2 z-20">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                            <Input
                              value={modalSeriesSearch}
                              onChange={(e) => setModalSeriesSearch(e.target.value)}
                              placeholder="Search series by title or batch..."
                              className="h-8 pl-8 text-xs rounded-lg"
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.seriesIds.length === seriesList.length) {
                                setFormData((prev) => ({ ...prev, seriesIds: [], seriesId: "" }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  seriesIds: seriesList.map((s) => s._id),
                                  seriesId: seriesList[0]?._id || "",
                                }));
                              }
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 shrink-0 px-2 py-1 bg-indigo-50 rounded-lg cursor-pointer"
                          >
                            {formData.seriesIds.length === seriesList.length ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 pr-1">
                          {seriesList
                            .filter((s) => {
                              if (!modalSeriesSearch.trim()) return true;
                              const q = modalSeriesSearch.toLowerCase();
                              return (
                                (s.title || "").toLowerCase().includes(q) ||
                                (s.batch || "").toLowerCase().includes(q) ||
                                (s.exam || "").toLowerCase().includes(q)
                              );
                            })
                            .map((s) => {
                              const isChecked = formData.seriesIds.includes(s._id);
                              return (
                                <label
                                  key={s._id}
                                  onClick={() => toggleFormDataSeries(s._id)}
                                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                                    isChecked
                                      ? "bg-indigo-50/80 text-indigo-950 font-bold"
                                      : "hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="w-4 h-4 rounded text-indigo-600"
                                    />
                                    <div className="truncate">
                                      <span className="font-bold">{s.title}</span>
                                      {s.batch && (
                                        <span className="text-[10px] text-slate-400 ml-1.5">
                                          • {s.batch}
                                        </span>
                                      )}
                                      {s.exam && (
                                        <span className="text-[10px] text-amber-600 ml-1">
                                          [{s.exam}]
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                    {s.passages?.length || 0} tracks
                                  </span>
                                </label>
                              );
                            })}
                          {seriesList.length === 0 && (
                            <p className="text-xs text-slate-400 py-3 text-center">No series topics found</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, seriesIds: [], seriesId: "" }))}
                            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            Clear All (Standalone)
                          </button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsModalSeriesDropdownOpen(false)}
                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 cursor-pointer"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                <label className="text-xs font-bold text-slate-700">
                  Audio URL {formData.videoUrl?.trim() ? "(वैकल्पिक - वीडियो दिया गया है)" : "*"}
                </label>
                <Input
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  placeholder="https://domain.com/audio/dictation-1.mp3 (या वीडियो URL होने पर खाली छोड़ें)"
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Video URL (YouTube URL / Direct Video)
                </label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtu.be/... (यूट्यूब डिक्टेशन वीडियो लिंक)"
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

      {/* Quick Series Topic Creation Modal */}
      <Dialog open={isQuickSeriesDialogOpen} onOpenChange={setIsQuickSeriesDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" /> Create Series Topic for Batch
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Steno Batch *</label>
              <select
                value={quickSeriesBatch}
                onChange={(e) => setQuickSeriesBatch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              >
                {targetBatches.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name} {b.hindiName ? `(${b.hindiName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Series Topic Title *</label>
              <Input
                value={quickSeriesTitle}
                onChange={(e) => setQuickSeriesTitle(e.target.value)}
                placeholder="e.g. साहित्य, संपादकीय, विशेष अभ्यास 1"
                className="rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQuickSeriesDialogOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateQuickSeries}
                disabled={isCreatingQuickSeries}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold gap-1.5"
              >
                {isCreatingQuickSeries ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create & Select Series
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
