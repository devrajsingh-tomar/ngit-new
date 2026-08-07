
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Keyboard, Clock, Trash2, FileText, Newspaper, Search, BarChart3, Users, LayoutGrid, List, Table as TableIcon, Edit2, Play, Eye, CheckCircle2, X, Settings2, Globe, AlertCircle, Award, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { mapKeyToHindi } from "@/modules/typing/utils/hindiMapping";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminTypingDashboard() {
  const [passages, setPassages] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wordSets, setWordSets] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [govExams, setGovExams] = useState<any[]>([]);
  const [rulePresets, setRulePresets] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [govCategories, setGovCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  // UI States
  const [showGovCategoryModal, setShowGovCategoryModal] = useState(false);
  const [editingGovCategory, setEditingGovCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("list");
  
  // Modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [showWordSetModal, setShowWordSetModal] = useState(false);
  const [showGovExamModal, setShowGovExamModal] = useState(false);
  const [showRulePresetModal, setShowRulePresetModal] = useState(false);
  const [propagateTarget, setPropagateTarget] = useState<any>(null); // { _id, title } of gov exam to propagate
  const [activeTab, setActiveTab] = useState("exams");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSpecialTestModal, setShowSpecialTestModal] = useState(false);
  const [modalSection, setModalSection] = useState("Government");
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [modalLogo, setModalLogo] = useState("");
  
  // Edits
  const [editingPassage, setEditingPassage] = useState<any>(null);
  const [editingGovExam, setEditingGovExam] = useState<any>(null);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [editingRulePreset, setEditingRulePreset] = useState<any>(null);
  
  // Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardGovExamId, setWizardGovExamId] = useState("");
  const [wizardPatternId, setWizardPatternId] = useState("");
  const [wizardPassageId, setWizardPassageId] = useState("");
  const [wizardTitle, setWizardTitle] = useState("");
  const [wizardDuration, setWizardDuration] = useState(10);
  const [wizardTargetSpeed, setWizardTargetSpeed] = useState(30);
  const [wizardExamMode, setWizardExamMode] = useState("General");
  const [wizardLanguage, setWizardLanguage] = useState("English");
  const [wizardCategory, setWizardCategory] = useState("");

  const [adminLanguage, setAdminLanguage] = useState("English");
  const [adminLayout, setAdminLayout] = useState("Inscript");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Exam creation helper states
  const [examCategory, setExamCategory] = useState("");
  const [examPresetId, setExamPresetId] = useState("");
  const [examDuration, setExamDuration] = useState(10);
  const [customOverrides, setCustomOverrides] = useState(false);
  const [selectedGovExamId, setSelectedGovExamId] = useState("");
  const [selectedGovExamCategoryId, setSelectedGovExamCategoryId] = useState("");

  useEffect(() => {
    if (editingExam) {
      setSelectedGovExamId(editingExam.govExamId?._id || editingExam.govExamId || "");
      setSelectedGovExamCategoryId(editingExam.govExamCategoryId?._id || editingExam.govExamCategoryId || "");
    } else {
      setSelectedGovExamId("");
      setSelectedGovExamCategoryId("");
    }
  }, [editingExam]);
  const [wizardPricingType, setWizardPricingType] = useState("FREE");
  const [wizardPricingAmount, setWizardPricingAmount] = useState(0);
  const [editPricingType, setEditPricingType] = useState("FREE");

  useEffect(() => {
    if (showExamModal) {
      if (editingExam) {
        const gid = editingExam.govExamId?._id || editingExam.govExamId || "";
        setSelectedGovExamId(gid);
        setExamCategory(editingExam.category || "");
        setExamPresetId(editingExam.rulePresetId?._id || editingExam.rulePresetId || "");
        setExamDuration(editingExam.duration || 10);
        setEditPricingType(editingExam.pricing?.type || "FREE");
        
        const hasCustomRules = editingExam.backspaceMode !== "full" || 
                              editingExam.highlightMode !== "word" || 
                              editingExam.wordLimit > 0 || 
                              editingExam.typingEngineType !== "classic";
        setCustomOverrides(hasCustomRules);
      } else {
        setSelectedGovExamId("");
        setExamCategory("");
        setExamPresetId("");
        setExamDuration(10);
        setCustomOverrides(false);
        setWizardPricingType("FREE");
        setWizardPricingAmount(0);
        setEditPricingType("FREE");
      }
    }
  }, [showExamModal, editingExam]);

  // Pagination
  const [examPage, setExamPage] = useState(1);
  const [passagePage, setPassagePage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/typing/dashboard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fetch failed");
      setPassages(data.passages || []);
      setExams(data.exams || []);
      setCategories(data.categories || []);
      setWordSets(data.wordSets || []);
      setResults(data.results || []);
      setBooks(data.books || []);
      setGovExams(data.govExams || []);
      setRulePresets(data.rulePresets || []);
      setLanguages(data.languages || []);
      setDifficulties(data.difficulties || []);
      setTopics(data.topics || []);
      setSettings(data.settings || []);
      setGovCategories(data.govCategories || []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to refresh data");
      setLoading(false);
    }
  };

  const handleDeletePassage = async (id: string) => {
    if (!confirm("Delete passage?")) return;
    try {
      const res = await fetch(`/api/admin/typing/passages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Passage deleted");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  const handleUpdatePassage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPassage) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.govExamIds = formData.getAll('govExamIds');
    try {
      const res = await fetch(`/api/admin/typing/passages/${editingPassage._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Updated!");
      setEditingPassage(null);
      setShowPassageModal(false);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update: " + err.message);
    } finally { setSubmitting(false); }
  };

  const handleAddPassage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: any = Object.fromEntries(formData.entries());
    data.govExamIds = formData.getAll('govExamIds');
    try {
      const res = await fetch("/api/admin/typing/passages", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Added!");
      form.reset();
      setShowPassageModal(false);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to add: " + err.message);
    } finally { setSubmitting(false); }
  };

  const handlePublishWizardTest = async () => {
    setSubmitting(true);
    try {
      const selectedPassage = passages.find(p => String(p._id) === String(wizardPassageId));
      const data = {
        title: wizardTitle,
        category: wizardCategory || "General Practice",
        passageId: wizardPassageId,
        govExamId: wizardGovExamId || null,
        rulePresetId: wizardPatternId || null,
        duration: wizardDuration,
        examMode: wizardExamMode,
        language: selectedPassage ? selectedPassage.language : "English",
        difficulty: selectedPassage ? selectedPassage.difficulty : "Medium",
        status: "Active",
        pricing: {
          type: wizardPricingType,
          amount: wizardPricingType === "PAID" ? Number(wizardPricingAmount) || 0 : 0,
          currency: "INR"
        }
      };

      const res = await fetch("/api/admin/typing/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(await res.text());
      
      toast.success("Exam Published successfully!");
      setShowExamModal(false);
      // Reset Wizard state
      setWizardStep(1);
      setWizardGovExamId("");
      setWizardPatternId("");
      setWizardPassageId("");
      setWizardTitle("");
      setWizardDuration(10);
      setWizardCategory("");
      setWizardPricingType("FREE");
      setWizardPricingAmount(0);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to publish exam: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data: any = Object.fromEntries(new FormData(form).entries());
    data.autoScroll = (form.elements.namedItem('autoScroll') as HTMLInputElement)?.checked;
    data.showScrollbar = (form.elements.namedItem('showScrollbar') as HTMLInputElement)?.checked;

    data.pricing = {
      type: data.pricingType || "FREE",
      amount: data.pricingType === "PAID" ? Number(data.pricingAmount) || 0 : 0,
      currency: "INR"
    };
    delete data.pricingType;
    delete data.pricingAmount;

    // Auto-inherit language and difficulty from passage to avoid "overwrite" issues
    const selectedPassage = passages.find(p => String(p._id) === String(data.passageId));
    if (selectedPassage) {
      data.language = selectedPassage.language;
      data.difficulty = selectedPassage.difficulty;
    }

    try {
      if (editingExam) {
        const res = await fetch(`/api/admin/typing/exams/${editingExam._id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (res.ok) {
          toast.success("Exam Updated!");
          setShowExamModal(false);
          setEditingExam(null);
          fetchData();
        } else {
          const errData = await res.json().catch(() => ({ error: "Server error (Non-JSON response)" }));
          toast.error(errData.error || "Failed to update exam");
        }
      } else {
        const res = await fetch("/api/admin/typing/exams", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (res.ok) {
          toast.success("Exam Created!");
          setShowExamModal(false);
          fetchData();
        } else {
          const errData = await res.json().catch(() => ({ error: "Server error (Non-JSON response)" }));
          toast.error(errData.error || "Failed to create exam");
        }
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
    }
    setSubmitting(false);
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Delete exam?")) return;
    await fetch(`/api/admin/typing/exams/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddGovExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(fd.entries());
    data.active = fd.get('active') === 'on';
    data.logo = modalLogo; // Ensure the uploaded logo URL is used

    try {
      if (editingGovExam) {
        const res = await fetch(`/api/admin/typing/gov-exams/${editingGovExam._id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Update failed" }));
          throw new Error(err.error || "Update failed");
        }
        toast.success("Updated Gov Exam!");
      } else {
        const res = await fetch("/api/admin/typing/gov-exams", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Creation failed" }));
          throw new Error(err.error || "Creation failed");
        }
        toast.success("Added Gov Exam!");
      }
      
      setShowGovExamModal(false);
      setEditingGovExam(null);
      setModalLogo("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGovExam = async (id: string) => {
    if (!confirm("Delete Government Exam? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/typing/gov-exams/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Government Exam deleted.");
        fetchData();
      } else {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        toast.error(err.error || "Failed to delete exam.");
      }
    } catch {
      toast.error("Network error. Could not delete exam.");
    }
  };

  const handleAddGovCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(fd.entries());
    data.active = fd.get('active') === 'on';
    data.allowHalfMistakes = fd.get('allowHalfMistakes') === 'on';

    try {
      if (editingGovCategory) {
        const res = await fetch(`/api/admin/typing/gov-exam-categories/${editingGovCategory._id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Updated Sub-Category!");
      } else {
        const res = await fetch("/api/admin/typing/gov-exam-categories", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Added Sub-Category!");
      }
      setShowGovCategoryModal(false);
      setEditingGovCategory(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGovCategory = async (id: string) => {
    if (!confirm("Delete Sub-Category? This will unlink existing tests.")) return;
    try {
      const res = await fetch(`/api/admin/typing/gov-exam-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sub-Category deleted.");
        fetchData();
      } else {
        toast.error("Failed to delete category.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleToggleGovExamActive = async (exam: any) => {
    try {
      const res = await fetch(`/api/admin/typing/gov-exams/${exam._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !exam.active })
      });
      if (res.ok) {
        toast.success(`${exam.title} is now ${!exam.active ? "Active" : "Inactive"}`);
        fetchData();
      } else {
        toast.error("Failed to toggle status");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleToggleGovCategoryActive = async (cat: any) => {
    try {
      const res = await fetch(`/api/admin/typing/gov-exam-categories/${cat._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active })
      });
      if (res.ok) {
        toast.success(`${cat.name} is now ${!cat.active ? "Active" : "Inactive"}`);
        fetchData();
      } else {
        toast.error("Failed to toggle status");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handlePropagateExamMode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!propagateTarget) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const examMode = fd.get("examMode") as string;
    const duration = fd.get("duration") as string;
    try {
      const res = await fetch(`/api/admin/typing/gov-exams/${propagateTarget._id}/propagate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examMode, duration: duration ? Number(duration) : undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ ${data.modifiedCount} exams updated to ${examMode} mode (${propagateTarget.title})`);
        setPropagateTarget(null);
      } else {
        toast.error(data.error || "Propagation failed");
      }
    } catch {
      toast.error("Network error during propagation.");
    }
    setSubmitting(false);
  };

  const handleAddLanguage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch("/api/admin/typing/languages", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    toast.success("Added!");
    setShowLanguageModal(false);
    fetchData();
    setSubmitting(false);
  };

  const handleAddDifficulty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch("/api/admin/typing/difficulties", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    toast.success("Added!");
    setShowDifficultyModal(false);
    fetchData();
    setSubmitting(false);
  };

  const handleAddTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch("/api/admin/typing/topics", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    toast.success("Added!");
    setShowTopicModal(false);
    fetchData();
    setSubmitting(false);
  };

  const handleAddRulePreset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    
    // Explicitly parse disableCopyPaste checkbox
    data.disableCopyPaste = (e.currentTarget.elements.namedItem("disableCopyPaste") as HTMLInputElement)?.checked;

    try {
      if (editingRulePreset) {
        const res = await fetch(`/api/admin/typing/rule-presets/${editingRulePreset._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Updated!");
      } else {
        const res = await fetch("/api/admin/typing/rule-presets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Added!");
      }
      setShowRulePresetModal(false);
      setEditingRulePreset(null);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to save preset: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };


  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch("/api/admin/typing/books", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    toast.success("Added!");
    setShowBookModal(false);
    fetchData();
    setSubmitting(false);
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Delete book?")) return;
    await fetch(`/api/admin/typing/books/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    await fetch("/api/admin/typing/categories", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    setShowCategoryModal(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/typing/categories/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddWordSet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
        name: fd.get('name'), category: fd.get('category'), value: fd.get('value'), language: fd.get('language'),
        words: (fd.get('words') as string).split(',').map(w => w.trim()).filter(w => w.length > 0)
    };
    await fetch("/api/admin/typing/words", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    setShowWordSetModal(false);
    fetchData();
  };

  const handleDeleteWordSet = async (id: string) => {
    await fetch(`/api/admin/typing/words/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleDeleteRulePreset = async (id: string) => {
    if (!confirm("Delete Rule Preset?")) return;
    await fetch(`/api/admin/typing/rule-presets/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleDeleteLanguage = async (id: string) => {
    if (!confirm("Delete Language?")) return;
    await fetch(`/api/admin/typing/languages/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleDeleteDifficulty = async (id: string) => {
    if (!confirm("Delete Difficulty?")) return;
    await fetch(`/api/admin/typing/difficulties/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Delete Topic?")) return;
    await fetch(`/api/admin/typing/topics/${id}`, { method: "DELETE" });
    fetchData();
  };


  const fetchResults = async (examId: string) => {
    const res = await fetch(`/api/admin/typing/results?examId=${examId}`);
    setResults(await res.json());
  };

  const handleManageResults = (exam: any) => {
    setSelectedExam(exam);
    fetchResults(exam._id);
  };

  // Filter components
  const filteredExams = exams.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeExamsSorted = [...exams]
    .filter(e => e.status === "Active")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const freeExamIds = new Set(activeExamsSorted.slice(0, 3).map(e => String(e._id)));

  const paginatedExams = filteredExams.slice((examPage - 1) * itemsPerPage, examPage * itemsPerPage);
  const totalExamPages = Math.ceil(filteredExams.length / itemsPerPage);

  const filteredPassages = passages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.bookId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedPassages = filteredPassages.slice((passagePage - 1) * itemsPerPage, passagePage * itemsPerPage);
  const totalPassagePages = Math.ceil(filteredPassages.length / itemsPerPage);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50/50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <h1 className="text-3xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent">Typing Exam Management</h1>
           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Manage typing tests, passages, and track student performance.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
              <input 
                placeholder="Search resources..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm focus:shadow-md transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
             <Button 
               onClick={() => {
                 setEditingExam(null);
                 setWizardStep(1);
                 setWizardGovExamId("");
                 setWizardPatternId("");
                 setWizardPassageId("");
                 setWizardTitle("");
                 setWizardDuration(10);
                 setWizardCategory("");
                 setShowExamModal(true);
               }} 
               className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl flex items-center gap-2 px-5 py-2.5 text-sm shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200/50 transition-all duration-200 active:scale-[0.98] border-none"
             >
               <Plus className="w-4 h-4 stroke-[3px]" /> Publish Test
             </Button>
         </div>
      </div>

      {/* STATS ROW */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
         <div className="bg-gradient-to-br from-white to-slate-50/50 p-5 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100/50 flex items-center gap-4 group hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50 group-hover:scale-110 transition-transform shadow-inner"><FileText className="w-5.5 h-5.5"/></div>
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Published Tests</p>
              <h3 className="text-2xl font-black text-slate-950 leading-none mt-1.5">{exams.length}</h3>
            </div>
         </div>
         <div className="bg-gradient-to-br from-white to-slate-50/50 p-5 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100/50 flex items-center gap-4 group hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 group-hover:scale-110 transition-transform shadow-inner"><CheckCircle2 className="w-5.5 h-5.5"/></div>
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Active Exams</p>
              <h3 className="text-2xl font-black text-slate-950 leading-none mt-1.5">{exams.filter(e => e.status==='Active').length}</h3>
            </div>
         </div>
         <div className="bg-gradient-to-br from-white to-slate-50/50 p-5 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100/50 flex items-center gap-4 group hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform shadow-inner"><Users className="w-5.5 h-5.5"/></div>
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Passages Library</p>
              <h3 className="text-2xl font-black text-slate-950 leading-none mt-1.5">{passages.length}</h3>
            </div>
         </div>
         <div className="bg-gradient-to-br from-white to-slate-50/50 p-5 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-100/50 flex items-center gap-4 group hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 group-hover:scale-110 transition-transform shadow-inner"><BookOpen className="w-5.5 h-5.5"/></div>
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Exam Books</p>
              <h3 className="text-2xl font-black text-slate-950 leading-none mt-1.5">{books.length}</h3>
            </div>
         </div>
      </div>

      {/* TABS & CONTENT */}
      <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200/80 pb-4 overflow-x-auto">
              <TabsList className="flex w-max bg-transparent p-0 gap-1 rounded-none border-0 h-auto overflow-x-auto scrollbar-none">
                <TabsTrigger value="exams" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Published Tests</TabsTrigger>
                <TabsTrigger value="gov-exams" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Exam Library</TabsTrigger>
                <TabsTrigger value="gov-categories" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Sub-Categories</TabsTrigger>
                <TabsTrigger value="rule-presets" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Exam Patterns</TabsTrigger>
                <TabsTrigger value="passages" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Passages</TabsTrigger>
                <TabsTrigger value="books" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Books</TabsTrigger>
                <TabsTrigger value="special-topics" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Special Topics</TabsTrigger>
                <TabsTrigger value="words" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Word Lists</TabsTrigger>
                <TabsTrigger value="results" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Results Logs</TabsTrigger>
                <TabsTrigger value="config" className="rounded-xl font-bold text-xs px-4 py-2.5 text-slate-500 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-violet-500/10 hover:text-slate-900 transition-all duration-200 border border-transparent">Master Settings</TabsTrigger>
              </TabsList>

              <div className="hidden md:flex items-center bg-white border border-slate-200/80 rounded-xl p-1 shadow-sm shrink-0">
                 <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}><LayoutGrid className="w-4 h-4"/></button>
                 <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}><List className="w-4 h-4"/></button>
                 <button onClick={() => setViewMode("table")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "table" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}><TableIcon className="w-4 h-4"/></button>
              </div>
            </div>

          <TabsContent value="exams" className="mt-0">
             <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200/80">
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center w-12">#</th>
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Exam / Gov Pattern</th>
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Category / Passage</th>
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Lang / Dur</th>
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Pricing</th>
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExams.map((exam, index) => {
                          const linkedGovExam = govExams.find(g => g._id.toString() === exam.govExamId?.toString());
                          const linkedPassage = passages.find(p => p._id.toString() === exam.passageId?.toString());
                          const linkedPreset = rulePresets.find(r => r._id.toString() === exam.rulePresetId?.toString());

                          return (
                            <tr key={exam._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                              <td className="px-6 py-4.5 text-center text-slate-400 font-mono text-xs">{(examPage - 1) * itemsPerPage + index + 1}</td>
                              <td className="px-6 py-4.5">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 text-sm leading-snug">{exam.title}</span>
                                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">{linkedGovExam ? linkedGovExam.title : 'General'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex flex-col">
                                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider w-max mb-1.5">{exam.category}</span>
                                  <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{linkedPassage ? linkedPassage.title : 'No Passage'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex flex-col">
                                   <span className="text-slate-700 font-bold text-sm">{exam.language}</span>
                                   <span className="text-xs text-slate-400 font-medium mt-0.5">{exam.duration}m • {linkedPreset ? linkedPreset.name : 'Custom Rules'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                 {freeExamIds.has(String(exam._id)) ? (
                                   <span className="px-2.5 py-1 bg-indigo-50 text-indigo-750 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-wider w-max font-bold">
                                     Free
                                   </span>
                                 ) : (
                                   <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-wider w-max font-bold">
                                     Subscription
                                   </span>
                                 )}
                              </td>
                              <td className="px-6 py-4.5">
                                 <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex w-max items-center gap-1.5 border", exam.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                                    {exam.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>}
                                    {exam.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <Button onClick={() => handleManageResults(exam)} variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all duration-200">Results</Button>
                                    <button onClick={() => { setEditingExam(exam); setShowExamModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"><Edit2 className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteExam(exam._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredExams.length === 0 && (
                      <div className="p-12 text-center text-slate-400 font-medium text-sm">No exams found matching your search.</div>
                    )}
                </div>

                {/* Exams Pagination */}
                {totalExamPages > 1 && (
                  <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Page {examPage} of {totalExamPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExamPage(Math.max(1, examPage - 1))} 
                        disabled={examPage === 1}
                        className="h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all duration-200"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExamPage(Math.min(totalExamPages, examPage + 1))} 
                        disabled={examPage === totalExamPages}
                        className="h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all duration-200"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
             </div>
          </TabsContent>

            <TabsContent value="gov-exams" className="mt-0">
               <div className="mb-4 flex justify-end">
                  <Button onClick={() => { setEditingGovExam(null); setModalLogo(""); setShowGovExamModal(true); }} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-4 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Gov Exam</Button>
               </div>
               <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200/80">
                            <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center w-16">Logo</th>
                            <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Exam Title</th>
                            <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Slug</th>
                            <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {govExams.map(exam => (
                            <tr key={exam._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                                  {exam.logo ? (
                                    <img src={exam.logo} alt="" className="w-full h-full object-contain p-1.5" />
                                  ) : (
                                    <Award className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-900 text-sm leading-snug">{exam.title}</td>

                              <td className="px-6 py-4 text-slate-500 font-mono text-xs font-semibold">{exam.slug}</td>
                              <td className="px-6 py-4">
                                 <button 
                                   onClick={() => handleToggleGovExamActive(exam)}
                                   className={cn(
                                     "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex w-max items-center gap-1.5 border hover:scale-105 transition-all cursor-pointer",
                                     exam.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                   )}
                                 >
                                    {exam.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>}
                                    {exam.active ? "Active" : "Inactive"}
                                 </button>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button title="Set Exam Mode for all tests" onClick={() => setPropagateTarget(exam)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50/60 rounded-xl transition-all"><Zap className="w-4 h-4"/></button>
                                    <button onClick={() => { setEditingGovExam(exam); setModalLogo(exam.logo || ""); setShowGovExamModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"><Edit2 className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteGovExam(exam._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {govExams.length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-medium text-sm">No gov exams found.</div>
                      )}
                  </div>
               </div>
            </TabsContent>
            <TabsContent value="rule-presets" className="mt-0">
                <div className="mb-6 flex justify-between items-center bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-5 rounded-2xl shadow-sm shadow-slate-100/30">
                   <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Exam Patterns &amp; Presets</h2>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Define exam rules and tie them to Gov Exams</p>
                   </div>
                   <Button onClick={() => setShowRulePresetModal(true)} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-4 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Preset</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   {rulePresets.map(preset => {
                     const gov = govExams.find(g => {
                       const gid = preset.govExamId?._id || preset.govExamId;
                       return gid?.toString() === g._id?.toString();
                     });

                     return (
                       <div key={preset._id} className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-md shadow-slate-100/50 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                               <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/50 shadow-inner"><Settings2 className="w-4.5 h-4.5"/></div>
                               <div className="flex items-center gap-1">
                                 <button 
                                   onClick={() => {
                                     setEditingRulePreset(preset);
                                     setShowRulePresetModal(true);
                                   }} 
                                   className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all p-2 rounded-xl"
                                 >
                                   <Edit2 className="w-3.5 h-3.5"/>
                                  </button>
                                 <button onClick={() => handleDeleteRulePreset(preset._id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 transition-all p-2 rounded-xl"><Trash2 className="w-3.5 h-3.5"/></button>
                               </div>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{preset.name}</h4>
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Exam Mode: {preset.examMode || "General"}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-4">
                               <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase">BKSP: {preset.backspaceMode}</span>
                               <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase">HL: {preset.highlightMode}</span>
                               <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase">Limit: {preset.wordLimit || "None"}</span>
                               {preset.disableCopyPaste && <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono">No Copy</span>}
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                             <span className="uppercase tracking-wider">Linked Exam:</span>
                             {gov ? (
                               <span className="text-indigo-600 uppercase flex items-center gap-1.5 font-extrabold tracking-wider">
                                 {gov.logo && <img src={gov.logo} alt="" className="w-4 h-4 object-contain p-0.5 bg-slate-50 border rounded-md" />}
                                 {gov.title}
                               </span>
                             ) : (
                               <span className="text-slate-400 italic font-semibold">None (General)</span>
                             )}
                          </div>
                       </div>
                     );
                   })}
                </div>
                {rulePresets.length === 0 && (
                  <div className="p-12 text-center text-slate-400 bg-white border border-slate-200/80 rounded-2xl font-medium text-sm">No Exam Patterns configured.</div>
                )}
            </TabsContent>

          {/* ... Add Passages Tab Content ... */}          <TabsContent value="passages" className="mt-0">
             <div className="mb-4 flex justify-end">
                <Button onClick={() => { setEditingPassage(null); setModalSection("Government"); setShowPassageModal(true); }} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-4 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Passage</Button>
             </div>
             <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200/80">
                      <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Title</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Language</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Difficulty</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Words</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Section</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPassages.map(p => (
                      <tr key={p._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                         <td className="px-6 py-4.5 font-bold text-slate-900 text-sm leading-snug">{p.title}</td>
                         <td className="px-6 py-4.5 text-slate-650 font-semibold">{p.language}</td>
                         <td className="px-6 py-4.5 text-slate-600"><span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border", p.difficulty==='Easy'?'bg-emerald-50 text-emerald-700 border-emerald-100':p.difficulty==='Medium'?'bg-amber-50 text-amber-700 border-amber-100':'bg-rose-50 text-rose-700 border-rose-100')}>{p.difficulty}</span></td>
                         <td className="px-6 py-4.5 text-slate-700 font-bold">{p.wordCount}</td>
                          <td className="px-6 py-4.5">
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border",
                               p.section === 'Special' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                               p.section === 'Book' || (p.bookId) ? 'bg-amber-50 text-amber-700 border-amber-100' :
                               'bg-slate-50 text-slate-600 border-slate-100'
                             )}>
                               {p.section === 'Book' || p.bookId ? 'Book' : p.section === 'Special' ? 'Special' : 'Official'}
                             </span>
                          </td>
                         <td className="px-6 py-4.5 text-right">
                           <div className="flex items-center justify-end gap-1">
                             <button onClick={() => { setEditingPassage(p); setModalSection(p.section || (p.bookId ? 'Book' : 'Government')); setShowPassageModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"><Edit2 className="w-4 h-4"/></button>
                             <button onClick={() => handleDeletePassage(p._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Passages Pagination */}
                {totalPassagePages > 1 && (
                  <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Page {passagePage} of {totalPassagePages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPassagePage(Math.max(1, passagePage - 1))} 
                        disabled={passagePage === 1}
                        className="h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all duration-200"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPassagePage(Math.min(totalPassagePages, passagePage + 1))} 
                        disabled={passagePage === totalPassagePages}
                        className="h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all duration-200"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="books" className="mt-0">
             <div className="mb-4 flex justify-end">
                <Button onClick={() => setShowBookModal(true)} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-4 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Book</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {books.map(book => {
                   const chapters = passages.filter(p => {
                     const pBookId = typeof p.bookId === 'object' ? p.bookId?._id : p.bookId;
                     return pBookId && pBookId.toString() === book._id.toString();
                   });
                   return (
                     <div key={book._id} className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-6 rounded-2xl shadow-md shadow-slate-100/50 hover:shadow-lg hover:border-amber-300 transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100/50 shadow-inner"><BookOpen className="w-5 h-5"/></div>
                           <button onClick={() => handleDeleteBook(book._id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 p-2 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{book.name}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-4">{chapters.length} Chapters Assigned</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all duration-200"
                          onClick={() => {
                             setActiveTab("passages");
                             setSearchQuery(book.name);
                          }}
                        >
                          View Chapters
                        </Button>
                     </div>
                   );
                })}
             </div>
           </TabsContent>
           <TabsContent value="special-topics" className="mt-0 space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-black text-slate-950 bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent">Special Topics &amp; Current Affairs</h2>
                 <Button onClick={() => setShowSpecialTestModal(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl h-10 px-5 shadow-md shadow-indigo-100 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Special Test</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Special Exams List */}
                 <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 overflow-hidden">
                    <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-slate-900 text-sm">Active Special Tests</h3>
                       <Badge variant="outline" className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-lg">{exams.filter(e => e.category === 'SPECIAL').length} Tests</Badge>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs min-w-[600px]">
                          <thead>
                             <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-3.5">Title</th>
                                <th className="px-6 py-3.5">Lang</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody>
                             {exams.filter(e => e.category === 'SPECIAL').map(e => (
                                <tr key={e._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                                   <td className="px-6 py-4 font-bold text-slate-900 text-sm leading-snug">{e.title}</td>
                                   <td className="px-6 py-4 text-slate-655 font-semibold text-xs">{e.language}</td>
                                   <td className="px-6 py-4">
                                      <span className={cn("px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-wider border", e.status==='Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200')}>
                                         {e.status}
                                      </span>
                                   </td>
                                   <td className="px-6 py-4 text-right flex justify-end gap-1">
                                      <button onClick={() => { setSelectedExam(e); fetchResults(e._id); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"><Eye className="w-4 h-4"/></button>
                                      <button onClick={async () => { if(confirm("Delete?")) { await fetch(`/api/admin/typing/exams/${e._id}`, {method: "DELETE"}); fetchData(); } }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                                   </td>
                                </tr>
                             ))}
                             {exams.filter(e => e.category === 'SPECIAL').length === 0 && (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium text-sm italic">No special tests found. Use 'Create Test' and select 'SPECIAL' category.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Topics Management (Metadata) */}
                 <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                       <div>
                         <h3 className="font-bold text-slate-900 text-sm">Topic Categories</h3>
                         <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Used for organizing tests</p>
                       </div>
                       <Button onClick={() => setShowTopicModal(true)} variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl"><Plus className="w-3.5 h-3.5 mr-1"/> Add</Button>
                    </div>
                    <div className="space-y-2.5 flex-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                       {topics.length > 0 ? topics.map(t => (
                          <div key={t._id} className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl group hover:border-indigo-200/80 hover:bg-white hover:shadow-sm transition-all duration-200">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Newspaper className="w-4 h-4"/></div>
                                <span className="text-xs font-bold text-slate-700">{t.name}</span>
                             </div>
                             <button onClick={() => handleDeleteTopic(t._id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                       )) : <div className="flex flex-col items-center justify-center py-12 text-slate-400"><AlertCircle className="w-8 h-8 mb-2 opacity-20"/><p className="text-[10px] font-bold uppercase tracking-widest">No topics found</p></div>}
                    </div>
                 </div>
              </div>
           </TabsContent>
            <TabsContent value="results" className="mt-0">
               <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Candidate Results Logs</h2>
                     <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Showing last 100 entries</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                       <thead>
                         <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <th className="px-6 py-4">Candidate</th>
                           <th className="px-6 py-4">Speed (Net WPM)</th>
                           <th className="px-6 py-4">Accuracy</th>
                           <th className="px-6 py-4">Mistakes</th>
                           <th className="px-6 py-4 text-right">Submission Date</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100/85">
                         {results.map((r: any) => (
                           <tr key={r._id} className="hover:bg-slate-50/40 transition-colors">
                             <td className="px-6 py-4.5">
                               <p className="font-bold text-slate-900 text-sm leading-snug">{r.userId?.name || "Unknown Candidate"}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">{r.userId?.email || "No Email"}</p>
                             </td>
                             <td className="px-6 py-4.5">
                               <span className="font-black text-indigo-600 text-sm">{r.wpm} WPM</span>
                             </td>
                             <td className="px-6 py-4.5">
                               <span className="font-extrabold text-emerald-600 text-sm">{r.accuracy}%</span>
                             </td>
                             <td className="px-6 py-4.5">
                               <span className="font-semibold text-rose-600 text-sm">{r.errorCount} errors</span>
                             </td>
                             <td className="px-6 py-4.5 text-right text-slate-450 text-xs font-semibold uppercase tracking-wider">
                               {new Date(r.createdAt).toLocaleDateString()}
                             </td>
                           </tr>
                         ))}
                         {results.length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-12 text-center text-slate-450 font-medium text-sm">No student typing test submissions logged yet.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                  </div>
               </div>
            </TabsContent>

           <TabsContent value="config" className="mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Languages Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 p-6 flex flex-col h-full">
                   <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-slate-900 text-sm">Languages</h3>
                      <Button onClick={() => setShowLanguageModal(true)} variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-xl"><Plus className="w-3 h-3 mr-1"/> Add</Button>
                   </div>
                   <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                      {languages.length > 0 ? languages.map(l => (
                         <div key={l._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
                            <span className="text-xs font-bold text-slate-700">{l.name}</span>
                            <button onClick={() => handleDeleteLanguage(l._id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                         </div>
                      )) : <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-center py-6">No languages.</p>}
                   </div>
                </div>

                {/* Difficulties Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 p-6 flex flex-col h-full">
                   <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-slate-900 text-sm">Difficulties</h3>
                      <Button onClick={() => setShowDifficultyModal(true)} variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-xl"><Plus className="w-3 h-3 mr-1"/> Add</Button>
                   </div>
                   <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                      {difficulties.length > 0 ? difficulties.map(d => (
                         <div key={d._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
                            <span className="text-xs font-bold text-slate-700">{d.name}</span>
                            <button onClick={() => handleDeleteDifficulty(d._id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                         </div>
                      )) : <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-center py-6">No difficulties.</p>}
                   </div>
                </div>

                {/* Categories Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 p-6 flex flex-col h-full">
                   <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-slate-900 text-sm">Categories</h3>
                      <Button onClick={() => setShowCategoryModal(true)} variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-xl"><Plus className="w-3 h-3 mr-1"/> Add</Button>
                   </div>
                   <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                       {categories.length > 0 ? categories.map(c => {
                          const parent = categories.find(p => p._id === c.parentCategoryId?._id || p._id === c.parentCategoryId);
                          const displayName = parent ? `${parent.name} ➔ ${c.name}` : c.name;
                          return (
                             <div key={c._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
                                <span className="text-xs font-bold text-slate-700">{displayName}</span>
                                <button onClick={() => handleDeleteCategory(c._id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                             </div>
                          );
                       }) : <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-center py-6">No categories.</p>}
                     </div>
                </div>
             </div>
           </TabsContent>

          <TabsContent value="words" className="mt-0">
             <div className="mb-4 flex justify-end">
                <Button onClick={() => setShowWordSetModal(true)} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-4 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Word Set</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {wordSets.map(set => (
                   <div key={set._id} className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-6 rounded-2xl shadow-md shadow-slate-100/50 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group">
                      <div className="flex justify-between items-start mb-4">
                         <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase border border-indigo-100/50 shadow-inner">{set.value}</span>
                         <button onClick={() => handleDeleteWordSet(set._id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{set.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{set.category} • {set.language} • {set.words?.length || 0} Words</p>
                   </div>
                ))}
             </div>
          </TabsContent>

           <TabsContent value="gov-categories" className="mt-0">
              <div className="mb-4 flex justify-end">
                 <Button onClick={() => { setEditingGovCategory(null); setShowGovCategoryModal(true); }} className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-4 rounded-xl text-sm shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"><Plus className="w-4 h-4 mr-1 stroke-[3px]"/> Add Sub-Category</Button>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-100/50 overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                       <thead>
                         <tr className="bg-slate-50/50 border-b border-slate-200/80">
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Gov Exam</th>
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Category Name</th>
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Exam Mode</th>
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Duration</th>
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Requirements</th>
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                           <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {govCategories.map(cat => (
                           <tr key={cat._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                             <td className="px-6 py-4 font-bold text-slate-600">{cat.govExamId?.title || "N/A"}</td>
                             <td className="px-6 py-4 font-black text-slate-900">{cat.name}</td>
                             <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{cat.examMode}</td>
                             <td className="px-6 py-4 text-slate-700 font-bold">{cat.duration} Min</td>
                             <td className="px-6 py-4 text-xs text-slate-600">
                               {cat.examMode === "AHC" ? (
                                 <span>Marks: {cat.totalMarks} (Pass: {cat.qualifyingMarks}) • WPM: ≥{cat.minWpm}</span>
                               ) : (
                                 <span>WPM: ≥{cat.minWpm} • Acc: ≥{cat.minAccuracy}%</span>
                               )}
                             </td>
                             <td className="px-6 py-4">
                                <button 
                                  onClick={() => handleToggleGovCategoryActive(cat)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex w-max items-center gap-1.5 border hover:scale-105 transition-all cursor-pointer",
                                    cat.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                  )}
                                >
                                  {cat.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>}
                                  {cat.active ? "Active" : "Inactive"}
                                </button>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => { setEditingGovCategory(cat); setShowGovCategoryModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"><Edit2 className="w-4 h-4"/></button>
                                   <button onClick={() => handleDeleteGovCategory(cat._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                                </div>
                             </td>
                           </tr>
                         ))}
                         {govCategories.length === 0 && (
                           <tr>
                             <td colSpan={7} className="p-12 text-center text-slate-400 font-medium text-sm">No sub-categories defined. Add a sub-category under your Gov Exams.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                 </div>
              </div>
           </TabsContent>
         </Tabs>
      </div>

      {/* GORGEOUS GUIDED WIZARD MODAL FOR PUBLISHING TESTS */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200/85 flex flex-col animate-in zoom-in-95 duration-200">
             
             {/* Header */}
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 shrink-0">
                <div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">
                     {editingExam ? "Edit Test Settings" : "Publish New Typing Test"}
                   </h2>
                   {!editingExam && (
                     <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest mt-1">
                       Step {wizardStep} of 5 • {
                         wizardStep === 1 ? "Select Target Exam" :
                         wizardStep === 2 ? "Verify Exam Pattern" :
                         wizardStep === 3 ? "Select Practice Passage" :
                         wizardStep === 4 ? "Configure Duration & Title" :
                         "Final Review & Publish"
                       }
                     </p>
                   )}
                </div>
                <button onClick={() => { setShowExamModal(false); setEditingExam(null); setWizardStep(1); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>

             {/* Wizard Progress Bar */}
             {!editingExam && (
               <div className="px-8 pt-6 pb-3 border-b border-slate-100 bg-slate-50/20 shrink-0">
                 <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
                   <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
                   <div 
                     className="absolute left-0 top-1/2 h-0.5 bg-indigo-650 -translate-y-1/2 transition-all duration-300 -z-10" 
                     style={{ width: `${((wizardStep - 1) / 4) * 100}%` }}
                   />
                   {[1, 2, 3, 4, 5].map((step) => (
                     <button
                       key={step}
                       onClick={() => {
                         if (step < wizardStep) setWizardStep(step);
                       }}
                       disabled={step > wizardStep}
                       className={cn(
                         "w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-black transition-all border-2",
                         step === wizardStep 
                           ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-110" 
                           : step < wizardStep
                             ? "bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50/50"
                             : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                       )}
                     >
                       {step}
                     </button>
                   ))}
                 </div>
                 <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3.5 max-w-2xl mx-auto px-1">
                   <span className={wizardStep === 1 ? "text-indigo-650" : ""}>Target Exam</span>
                   <span className={wizardStep === 2 ? "text-indigo-650" : ""}>Pattern</span>
                   <span className={wizardStep === 3 ? "text-indigo-650" : ""}>Passage</span>
                   <span className={wizardStep === 4 ? "text-indigo-650" : ""}>Parameters</span>
                   <span className={wizardStep === 5 ? "text-indigo-650" : ""}>Publish</span>
                 </div>
               </div>
             )}

             {/* Content Block */}
             <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-[350px]">
               {editingExam ? (
                 <form onSubmit={handleAddExam} className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Exam Library Target</label>
                            <select 
                              name="govExamId" 
                              value={selectedGovExamId}
                              onChange={(e) => {
                                setSelectedGovExamId(e.target.value);
                                setSelectedGovExamCategoryId("");
                              }}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white"
                            >
                              <option value="">General Practice (Unassigned)</option>
                              {govExams.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                            </select>
                          </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Sub-Category Target</label>
                            <select 
                              name="govExamCategoryId" 
                              value={selectedGovExamCategoryId}
                              onChange={(e) => setSelectedGovExamCategoryId(e.target.value)}
                              disabled={!selectedGovExamId}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 disabled:opacity-50 bg-white"
                            >
                              <option value="">No Sub-Category (Inherit Parent Rules)</option>
                              {govCategories
                                .filter(c => (c.govExamId?._id || c.govExamId) === selectedGovExamId)
                                .map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                          </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Test Title</label>
                            <input name="title" defaultValue={editingExam?.title} required placeholder="e.g. Test 1" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                          </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Exam Mode Formula</label>
                           <select name="examMode" defaultValue={editingExam?.examMode || "General"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                             <option value="General">General Practice</option>
                             <option value="SSC">SSC</option>
                             <option value="CPCT">CPCT</option>
                             <option value="Court">Court</option>
                             <option value="Steno">Steno</option>
                             <option value="UPSSSC">UPSSSC</option>
                             <option value="AHC">AHC</option>
                             <option value="UP_POLICE">UP Police</option>
                           </select>
                         </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Exam Category Tag</label>
                            <select 
                              name="category" 
                              defaultValue={editingExam?.category || ""}
                              required 
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                            >
                              <option value="">Select Category...</option>
                              {govExams.map(g => <option key={g._id} value={g.title}>{g.title}</option>)}
                              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Active Exam Pattern Preset</label>
                            <select 
                              name="rulePresetId" 
                              defaultValue={editingExam?.rulePresetId?._id || editingExam?.rulePresetId || ""}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                            >
                              <option value="">No Preset (Use custom/default rules)</option>
                              {rulePresets.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                            </select>
                          </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Practice Passage</label>
                            <select name="passageId" defaultValue={editingExam?.passageId?._id || editingExam?.passageId} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white">
                              <option value="">Select Passage...</option>
                              {passages.map(p => <option key={p._id} value={p._id}>{p.title} ({p.language})</option>)}
                            </select>
                          </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Duration (Min)</label>
                           {selectedGovExamCategoryId || selectedGovExamId ? (
                             <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 select-none flex items-center justify-between">
                               <span>
                                 {selectedGovExamCategoryId
                                   ? `${govCategories.find(c => c._id === selectedGovExamCategoryId)?.duration || 10} Mins (Inherited)`
                                   : `${govExams.find(g => g._id === selectedGovExamId)?.defaultDuration || 10} Mins (Inherited)`}
                               </span>
                               <span className="text-[9px] uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">From Library</span>
                             </div>
                           ) : (
                             <input 
                               type="number" 
                               name="duration" 
                               defaultValue={editingExam?.duration || 10}
                               required 
                               className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" 
                             />
                           )}
                         </div>
                         <div className="space-y-1.5 col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Publishing Status</label>
                           <select name="status" defaultValue={editingExam?.status || "Active"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                              <option value="Active">Active (Visible)</option>
                              <option value="Draft">Draft (Hidden)</option>
                              <option value="Expired">Expired</option>
                           </select>
                         </div>
                         <input type="hidden" name="pricingType" value="FREE" />
                         <input type="hidden" name="pricingAmount" value="0" />
                      </div>
                      <div className="pt-5 flex justify-end gap-3 border-t border-slate-100/80">
                         <Button type="button" variant="outline" onClick={() => { setShowExamModal(false); setEditingExam(null); }} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                         <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Save Changes</Button>
                      </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Step 1: Select Target Exam */}
                    {wizardStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center max-w-md mx-auto space-y-1">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Which exam is this test designed for?</h3>
                          <p className="text-xs text-slate-400 font-semibold uppercase">Choosing an exam library template pre-loads its official rules.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
                          {govExams.map(gov => {
                            const preset = rulePresets.find(r => r._id === gov.rulePresetId?._id || r._id === gov.rulePresetId);
                            return (
                              <button
                                key={gov._id}
                                type="button"
                                onClick={() => {
                                  setWizardGovExamId(gov._id);
                                  setWizardExamMode(preset?.examMode || "General");
                                  setWizardDuration(gov.defaultDuration || 10);
                                  setWizardCategory(gov.title);
                                  setWizardPatternId(preset?._id || "");
                                  setWizardStep(2);
                                }}
                                className={cn(
                                  "p-6 rounded-2xl border text-left hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between h-36 bg-white",
                                  wizardGovExamId === gov._id ? "border-indigo-600 ring-4 ring-indigo-50 bg-indigo-50/10" : "border-slate-200/80"
                                )}
                              >
                                <div className="flex justify-between items-start w-full">
                                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                                    {gov.logo ? <img src={gov.logo} alt="" className="w-full h-full object-contain p-1.5" /> : <Award className="w-5.5 h-5.5 text-slate-300" />}
                                  </div>
                                  <span className="opacity-0 group-hover:opacity-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider transition-opacity">Select ➔</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{gov.title}</h4>
                                  <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1.5 tracking-wider">
                                    {preset ? `${preset.name} (${gov.defaultDuration || 10}m)` : `Standard (${gov.defaultDuration || 10}m)`}
                                  </p>
                                </div>
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => {
                              setWizardGovExamId("");
                              setWizardExamMode("General");
                              setWizardDuration(10);
                              setWizardCategory("General Practice");
                              setWizardPatternId("");
                              setWizardStep(2);
                            }}
                            className={cn(
                              "p-6 rounded-2xl border text-left hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between h-36 bg-white",
                              wizardGovExamId === "" ? "border-indigo-600 ring-4 ring-indigo-50 bg-indigo-50/10" : "border-slate-200/80"
                            )}
                          >
                            <div className="flex justify-between items-start w-full">
                              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                                <Keyboard className="w-5.5 h-5.5" />
                              </div>
                              <span className="opacity-0 group-hover:opacity-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider transition-opacity">Select ➔</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">General / Custom</h4>
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1.5 tracking-wider">Standard Practice Mode</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Select Exam Pattern */}
                    {wizardStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center max-w-md mx-auto space-y-1">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Review Typing Exam Pattern</h3>
                          <p className="text-xs text-slate-400 font-semibold uppercase">The system automatically loaded these settings based on the selected exam template.</p>
                        </div>
                        
                        <div className="space-y-5 max-w-xl mx-auto bg-slate-50/60 p-6 rounded-2xl border border-slate-200/85 shadow-inner">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Active Exam Pattern (Rule Preset)</label>
                            <select 
                              value={wizardPatternId}
                              onChange={(e) => {
                                const pid = e.target.value;
                                setWizardPatternId(pid);
                                const preset = rulePresets.find(r => r._id === pid);
                                if (preset) {
                                  setWizardExamMode(preset.examMode || "General");
                                }
                              }}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                            >
                              <option value="">No Preset (Custom / General Rules)</option>
                              {rulePresets.map(preset => <option key={preset._id} value={preset._id}>{preset.name}</option>)}
                            </select>
                          </div>

                          {wizardPatternId ? (
                            (() => {
                              const preset = rulePresets.find(r => r._id === wizardPatternId);
                              if (!preset) return null;
                              return (
                                <div className="pt-5 border-t border-slate-200/80 space-y-3">
                                  <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Evaluation Rules Breakdown</h4>
                                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                    <div><span className="text-slate-400 font-medium">Method:</span> <span className="font-bold text-slate-800">{preset.examMode} Standard</span></div>
                                    <div><span className="text-slate-400 font-medium">Backspace:</span> <span className="font-bold text-slate-800 uppercase">{preset.backspaceMode}</span></div>
                                    <div><span className="text-slate-400 font-medium">Highlight:</span> <span className="font-bold text-slate-800 uppercase">{preset.highlightMode}</span></div>
                                    <div><span className="text-slate-400 font-medium">Auto-Scroll:</span> <span className="font-bold text-slate-800">{preset.autoScroll ? "Enforced" : "Off"}</span></div>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-medium leading-relaxed">
                              Using General Practice mode: Candidates will have full backspace access, simple active word highlighting, and auto-scroll enabled.
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-3 max-w-xl mx-auto pt-5 border-t border-slate-100">
                          <Button variant="outline" onClick={() => setWizardStep(1)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Back</Button>
                          <Button onClick={() => setWizardStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Proceed to Passage</Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Select Practice Passage */}
                    {wizardStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center max-w-md mx-auto space-y-1">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Select typing test passage</h3>
                          <p className="text-xs text-slate-400 font-semibold uppercase">Choose a passage for candidates to type. Language is locked to the passage settings.</p>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-4">
                          <div className="flex gap-4">
                            <input 
                              type="text" 
                              placeholder="Search passages..." 
                              className="flex-1 px-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select 
                              value={wizardLanguage} 
                              onChange={(e) => setWizardLanguage(e.target.value)}
                              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                            >
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                            </select>
                          </div>

                          <div className="max-h-64 overflow-y-auto border border-slate-200/80 rounded-2xl divide-y divide-slate-100/80 shadow-inner bg-slate-50/20">
                            {passages
                              .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                              .filter(p => wizardLanguage === "Hindi" ? p.language.toLowerCase().includes("hindi") : p.language.toLowerCase() === "english")
                              .map(p => (
                                 <button
                                   key={p._id}
                                   type="button"
                                   onClick={() => {
                                     setWizardPassageId(p._id);
                                     if (!wizardTitle || wizardTitle.startsWith("Mock Test: ")) {
                                       setWizardTitle(`Mock Test: ${p.title}`);
                                     }
                                   }}
                                   className={cn(
                                     "w-full text-left p-4.5 flex justify-between items-center transition-all duration-200",
                                     wizardPassageId === p._id ? "bg-indigo-50/60 hover:bg-indigo-50 text-indigo-950 font-bold" : "bg-white hover:bg-slate-50/70 text-slate-700"
                                   )}
                                 >
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm leading-snug">{p.title}</p>
                                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">{p.language} • {p.difficulty || "Medium"}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold shrink-0">{p.content.split(/\s+/).length} Words</span>
                                      {wizardPassageId === p._id && <CheckCircle2 className="w-5 h-5 text-indigo-600 stroke-[2.5px]" />}
                                    </div>
                                 </button>
                              ))}
                            {passages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).filter(p => wizardLanguage === "Hindi" ? p.language.toLowerCase().includes("hindi") : p.language.toLowerCase() === "english").length === 0 && (
                              <div className="p-8 text-center text-slate-400 font-medium text-sm">No passages found for this search filter.</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 max-w-2xl mx-auto pt-5 border-t border-slate-100">
                          <Button variant="outline" onClick={() => setWizardStep(2)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Back</Button>
                          <Button 
                            disabled={!wizardPassageId}
                            onClick={() => setWizardStep(4)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]"
                          >
                            Configure Parameters
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Configure Duration & Details */}
                    {wizardStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center max-w-md mx-auto space-y-1">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Configure test parameters</h3>
                          <p className="text-xs text-slate-400 font-semibold uppercase">Review exam name, target speed limits, and set duration.</p>
                        </div>

                        <div className="space-y-5 max-w-xl mx-auto bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80">
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 uppercase">Test Title / Label</label>
                             <input 
                               type="text" 
                               value={wizardTitle} 
                               onChange={(e) => setWizardTitle(e.target.value)} 
                               required 
                               placeholder="e.g. Mock Test #1" 
                               className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" 
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase">Duration (Minutes)</label>
                               <input 
                                 type="number" 
                                 value={wizardDuration} 
                                 onChange={(e) => setWizardDuration(Number(e.target.value))} 
                                 required 
                                 className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" 
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase">Target Pass Speed (WPM)</label>
                               <input 
                                 type="number" 
                                 value={wizardTargetSpeed} 
                                 onChange={(e) => setWizardTargetSpeed(Number(e.target.value))} 
                                 required 
                                 className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" 
                               />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 uppercase">Publish Tag / Category Name</label>
                             <select 
                               value={wizardCategory} 
                               onChange={(e) => setWizardCategory(e.target.value)}
                               required
                               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                             >
                               <option value="">Select Tag...</option>
                               {govExams.map(g => <option key={g._id} value={g.title}>{g.title}</option>)}
                               {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                             </select>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 max-w-xl mx-auto pt-5 border-t border-slate-100">
                          <Button variant="outline" onClick={() => setWizardStep(3)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Back</Button>
                          <Button 
                            disabled={!wizardTitle.trim() || wizardDuration <= 0}
                            onClick={() => setWizardStep(5)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]"
                          >
                            Final Review
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Review & Publish */}
                    {wizardStep === 5 && (
                      <div className="space-y-6">
                        <div className="text-center max-w-md mx-auto space-y-1">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Review &amp; publish typing test</h3>
                          <p className="text-xs text-slate-400 font-semibold uppercase">Verify the details before publishing to students.</p>
                        </div>

                        <div className="max-w-xl mx-auto bg-indigo-50/15 border border-indigo-100/80 p-6 rounded-2xl space-y-4">
                          <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 stroke-[2.5px]" /> Confirm Exam Settings
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-1">
                             <div><span className="text-slate-400 font-medium">Target Library:</span> <span className="font-bold text-slate-800">{govExams.find(g => g._id === wizardGovExamId)?.title || "General / Custom Practice"}</span></div>
                             <div><span className="text-slate-400 font-medium">Test Title:</span> <span className="font-bold text-slate-800">{wizardTitle}</span></div>
                             <div><span className="text-slate-400 font-medium">Passage Selected:</span> <span className="font-bold text-slate-800">{passages.find(p => p._id === wizardPassageId)?.title || ""}</span></div>
                             <div><span className="text-slate-400 font-medium">Evaluation Mode:</span> <span className="font-bold text-slate-800">{wizardExamMode} Official Formula</span></div>
                             <div><span className="text-slate-400 font-medium">Duration:</span> <span className="font-bold text-slate-800">{wizardDuration} Minutes</span></div>
                             <div><span className="text-slate-400 font-medium">Min Pass Speed:</span> <span className="font-bold text-slate-800">{wizardTargetSpeed} WPM</span></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 max-w-xl mx-auto pt-5 border-t border-slate-100">
                          <Button variant="outline" onClick={() => setWizardStep(4)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Back</Button>
                          <Button 
                            disabled={submitting}
                            onClick={handlePublishWizardTest} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98] border-none"
                          >
                            {submitting ? "Publishing..." : "Publish to Library"}
                          </Button>
                        </div>
                      </div>
                    )}
                 </div>
               )}
             </div>

          </div>
        </div>
      )}

      {showGovExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95 shrink-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingGovExam ? "Edit Government Exam" : "Add Government Exam"}</h2>
                <button onClick={() => { setShowGovExamModal(false); setEditingGovExam(null); setModalLogo(""); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingGovExam?._id || 'new-gov-exam'}
               onSubmit={handleAddGovExam} 
               className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin"
             >
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Exam Title</label>
                    <input name="title" defaultValue={editingGovExam?.title} required placeholder="e.g. SSC CGL" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase">Default Rule Preset</label>
                       <select name="rulePresetId" defaultValue={editingGovExam?.rulePresetId?._id || editingGovExam?.rulePresetId} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                          <option value="">No Preset (Standard Rules)</option>
                          {rulePresets.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase">Default Duration (Min)</label>
                       <input type="number" name="defaultDuration" defaultValue={editingGovExam?.defaultDuration || 10} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                    <textarea 
                      name="description" 
                      defaultValue={editingGovExam?.description} 
                      placeholder="Short description for students..." 
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 min-h-[90px]"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Exam Logo</label>
                    <div className="grid grid-cols-1 gap-3">
                      <ImageUpload 
                         value={modalLogo}
                         onChange={(url) => setModalLogo(url)}
                         label="Upload Logo"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={modalLogo} 
                          onChange={(e) => setModalLogo(e.target.value)} 
                          placeholder="Or paste direct image URL here..." 
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                        />
                        {modalLogo && (
                          <button 
                            type="button" 
                            onClick={() => setModalLogo("")} 
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {/* Logo Gallery of already uploaded logos */}
                      {govExams.filter(g => g.logo).length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Select from Uploaded Logos:</span>
                          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                            {Array.from(new Set(govExams.map(g => g.logo).filter(Boolean))).map((logoUrl: any, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setModalLogo(logoUrl)}
                                className={cn(
                                  "w-10 h-10 rounded-lg p-1 bg-white border flex items-center justify-center hover:border-indigo-500 hover:scale-105 transition-all shadow-sm",
                                  modalLogo === logoUrl ? "border-indigo-600 ring-2 ring-indigo-500/10" : "border-slate-200"
                                )}
                              >
                                <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input type="hidden" name="logo" value={modalLogo} />
                 </div>
                 <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100">
                     <input type="checkbox" name="active" id="gov-active" defaultChecked={editingGovExam ? editingGovExam.active : true} className="w-4 h-4 text-indigo-650 rounded-lg border-slate-350 focus:ring-indigo-500" />
                     <label htmlFor="gov-active" className="text-sm font-bold text-slate-700 cursor-pointer">Active / Visible to Students</label>
                 </div>
                 <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => { setShowGovExamModal(false); setEditingGovExam(null); setModalLogo(""); }} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                    <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Save Changes</Button>
                 </div>
              </form>
          </div>
        </div>
      )}
      {/* PROPAGATE EXAM MODE MODAL */}
      {propagateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-100/80 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100/80 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/> Propagate Exam Mode</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Apply settings to ALL tests under <span className="text-indigo-600 font-bold">{propagateTarget.title}</span></p>
              </div>
              <button onClick={() => setPropagateTarget(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handlePropagateExamMode} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Exam Mode</label>
                <select name="examMode" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                  <option value="AHC">AHC (Allahabad High Court RO/ARO)</option>
                  <option value="General">General</option>
                  <option value="UPSSSC">UPSSSC / Junior Assistant</option>
                  <option value="UP_POLICE">UP Police ASI/CO</option>
                  <option value="CPCT">CPCT</option>
                  <option value="SSC">SSC</option>
                  <option value="Court">Court Typing</option>
                  <option value="Steno">Steno</option>
                </select>
                <p className="text-[10px] text-slate-400 font-semibold">This sets the scoring/result calculation method for all tests under this exam.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Duration (Minutes) — leave blank to keep existing</label>
                <input type="number" name="duration" min="1" max="120" placeholder="e.g. 20 for AHC RO/ARO" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-xs font-bold text-amber-700">⚠️ This will update examMode on ALL typing tests under <strong>{propagateTarget.title}</strong>. This action cannot be undone.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setPropagateTarget(null)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-amber-100 hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"><Zap className="w-4 h-4"/> Apply to All Tests</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESULTS MODAL */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white">
                <div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">Results: {selectedExam.title}</h2>
                   <p className="text-xs text-slate-400 font-extrabold uppercase mt-1 tracking-wider">{selectedExam.category} • {selectedExam.language} • {results.length} attempts</p>
                </div>
                <button onClick={() => setSelectedExam(null)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
                <table className="w-full text-left border-collapse text-sm bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md shadow-slate-100/50 min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200/85 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">WPM</th>
                      <th className="px-6 py-4">Accuracy</th>
                      <th className="px-6 py-4">Errors</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/85">
                    {results.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4.5">
                          <p className="font-bold text-slate-900 text-sm leading-snug">{r.userId?.name || "Unknown"}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wide">{r.userId?.email}</p>
                        </td>
                        <td className="px-6 py-4.5 font-black text-indigo-600">{r.wpm}</td>
                        <td className="px-6 py-4.5 font-extrabold text-emerald-600">{r.accuracy}%</td>
                        <td className="px-6 py-4.5 font-semibold text-rose-600">{r.errorCount}</td>
                        <td className="px-6 py-4.5 text-right text-slate-500 text-xs font-semibold uppercase tracking-wider">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {results.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium text-sm">No results found for this exam.</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}
      {/* PASSAGE MODAL */}
      {showPassageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/80 flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center sticky top-0 bg-white/95 z-10 shrink-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingPassage ? "Edit Passage" : "Add Passage"}</h2>
                <button onClick={() => setShowPassageModal(false)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingPassage?._id || 'new-passage'}
               onSubmit={editingPassage ? handleUpdatePassage : handleAddPassage} 
               className="p-6 space-y-5"
             >
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                    <input name="title" defaultValue={editingPassage?.title} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                      <select name="language" defaultValue={editingPassage?.language || "Unicode Hindi"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                         <option value="English">English</option>
                         <option value="Unicode Hindi">Hindi (Unicode / Mangal)</option>
                         <option value="Krutidev Hindi">Hindi (Krutidev / Legacy)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Difficulty</label>
                      <select name="difficulty" defaultValue={editingPassage?.difficulty || "Medium"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                         <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Target Section</label>
                      <select 
                        name="section" 
                        defaultValue={modalSection} 
                        onChange={(e) => setModalSection(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                      >
                         <option value="Government">Government Exam</option>
                         <option value="Special">Special Topic / Current</option>
                         <option value="Book">Book Chapter</option>
                      </select>
                   </div>
                   {modalSection === 'Book' && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-slate-500 uppercase">Assign to Book</label>
                        <select name="bookId" defaultValue={editingPassage?.bookId || ""} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                           <option value="">Select Book...</option>
                           {books.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                      </div>
                    )}
                    {modalSection === 'Government' && (
                      <div className="col-span-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-slate-500 uppercase block">Assign to Government Exams</label>
                        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto shadow-inner">
                          {govExams.map(gov => {
                            const isChecked = editingPassage 
                              ? exams.some(ex => {
                                  const pid = ex.passageId?._id || ex.passageId;
                                  const gid = ex.govExamId?._id || ex.govExamId;
                                  return pid === editingPassage._id && gid?.toString() === gov._id?.toString();
                                })
                              : false;
                            
                            return (
                              <label key={gov._id} className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer hover:text-indigo-650 transition-colors">
                                <input 
                                  type="checkbox" 
                                  name="govExamIds" 
                                  value={gov._id} 
                                  defaultChecked={isChecked}
                                  className="w-4 h-4 text-indigo-650 rounded border-slate-350 focus:ring-indigo-500 cursor-pointer" 
                                />
                                {gov.title}
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Selected exams will automatically get a test created for this passage, using their specific rule presets.</p>
                      </div>
                    )}
                 </div>
                 <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Passage Content (Paste Unicode Hindi here)</label>
                     <textarea 
                       name="content" 
                       defaultValue={editingPassage?.content} 
                       required 
                       className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 h-40 resize-none"
                       style={{ fontFamily: "'Mangal', 'Arial Unicode MS', sans-serif" }}
                     />
                 </div>
                 <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => setShowPassageModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                    <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Save</Button>
                 </div>
              </form>
           </div>
         </div>
       )}

      {/* BOOK MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Book</h2>
                <button onClick={() => setShowBookModal(false)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddBook} className="p-6 space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Book Name</label>
                   <input name="name" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Description (Optional)</label>
                   <textarea name="description" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 h-24 resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowBookModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Create Book</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Category</h2>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddCategory} className="p-6 space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Category Name</label>
                   <input name="name" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Parent Category (Optional)</label>
                   <select name="parentCategoryId" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white">
                      <option value="">None (Top-level Category)</option>
                      {categories.filter(c => !c.parentCategoryId).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Create Category</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* WORD SET MODAL */}
      {showWordSetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100/80 flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center sticky top-0 bg-white/95 z-10 shrink-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Word Set</h2>
                <button onClick={() => setShowWordSetModal(false)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddWordSet} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Set Name</label>
                     <input name="name" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                     <select name="category" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                        <option value="A-Z">A to Z</option>
                        <option value="Length">Word Length</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Value</label>
                     <input name="value" required placeholder="e.g. A or 5" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                     <select name="language" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (Mangal)</option>
                     </select>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Words (Comma separated)</label>
                   <textarea name="words" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 h-32 resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowWordSetModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Save Set</Button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* LANGUAGE MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Language</h2>
                <button onClick={() => setShowLanguageModal(false)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddLanguage} className="p-6 space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Language Name</label>
                   <input name="name" required placeholder="e.g. Punjabi, Bengali" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowLanguageModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Create Language</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* DIFFICULTY MODAL */}
      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Difficulty</h2>
                <button onClick={() => setShowDifficultyModal(false)} className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddDifficulty} className="p-6 space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Difficulty Name</label>
                   <input name="name" required placeholder="e.g. Ultra Hard, Beginner" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowDifficultyModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Create Difficulty</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Special Topic</h2>
                <button onClick={() => setShowTopicModal(false)} className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddTopic} className="p-6 space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Topic Name</label>
                   <input name="name" required placeholder="e.g. Constitution, Legal, Sports" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowTopicModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Create Topic</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* GOV EXAM CATEGORY MODAL */}
      {showGovCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95 shrink-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingGovCategory ? "Edit Sub-Category" : "Add Sub-Category"}</h2>
                <button onClick={() => { setShowGovCategoryModal(false); setEditingGovCategory(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingGovCategory?._id || 'new-gov-category'}
               onSubmit={handleAddGovCategory} 
               className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin"
             >
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Parent Gov Exam</label>
                    <select name="govExamId" defaultValue={editingGovCategory?.govExamId?._id || editingGovCategory?.govExamId || ""} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white">
                       <option value="">Select Parent Exam...</option>
                       {govExams.map(gov => <option key={gov._id} value={gov._id}>{gov.title}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sub-Category Name</label>
                    <input name="name" defaultValue={editingGovCategory?.name} required placeholder="e.g. RO/ARO, Clerk, Typist" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase">Exam Mode / Rules</label>
                       <select name="examMode" defaultValue={editingGovCategory?.examMode || "General"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                          <option value="General">General</option>
                          <option value="AHC">AHC (Allahabad High Court)</option>
                          <option value="UPSSSC">UPSSSC</option>
                          <option value="UP_POLICE">UP Police</option>
                          <option value="CPCT">CPCT</option>
                          <option value="SSC">SSC</option>
                          <option value="Court">Court Typing</option>
                          <option value="Steno">Steno</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
<label className="text-xs font-bold text-slate-500 uppercase">Duration (Minutes)</label>
                       <input type="number" name="duration" defaultValue={editingGovCategory?.duration || 10} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                    </div>
                 </div>

                 <div className="hidden">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 border-slate-200">Scoring &amp; Passing Parameters</h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Total Marks</label>
                          <input type="number" name="totalMarks" defaultValue={editingGovCategory?.totalMarks || 0} placeholder="e.g. 50" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none bg-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Passing Marks</label>
                          <input type="number" name="qualifyingMarks" defaultValue={editingGovCategory?.qualifyingMarks || 0} placeholder="e.g. 25" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none bg-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Penalty/Error</label>
                          <input type="number" step="0.01" name="errorPenalty" defaultValue={editingGovCategory?.errorPenalty || 0} placeholder="e.g. 0.1" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none bg-white" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Minimum WPM</label>
                          <input type="number" name="minWpm" defaultValue={editingGovCategory?.minWpm || 30} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none bg-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Min Accuracy (%)</label>
                          <input type="number" name="minAccuracy" defaultValue={editingGovCategory?.minAccuracy || 85} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none bg-white" />
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="allowHalfMistakes" id="allowHalfMistakes" defaultChecked={editingGovCategory ? editingGovCategory.allowHalfMistakes : true} className="w-4 h-4 text-indigo-650 rounded-lg border-slate-350" />
                        <label htmlFor="allowHalfMistakes" className="text-xs font-bold text-slate-700 cursor-pointer">Allow Half-Mistakes (capitalization/punctuation counts as 0.5 error)</label>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                    <textarea 
                      name="description" 
                      defaultValue={editingGovCategory?.description} 
                      placeholder="Category description..." 
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 min-h-[60px]"
                    />
                 </div>
                 
                 <div className="flex items-center gap-3">
                     <input type="checkbox" name="active" id="cat-active" defaultChecked={editingGovCategory ? editingGovCategory.active : true} className="w-4 h-4 text-indigo-650 rounded-lg border-slate-350" />
                     <label htmlFor="cat-active" className="text-sm font-bold text-slate-700 cursor-pointer">Active</label>
                 </div>
                 <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => { setShowGovCategoryModal(false); setEditingGovCategory(null); }} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                    <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Save Changes</Button>
                 </div>
              </form>
          </div>
        </div>
      )}

      {/* RULE PRESET MODAL */}
      {showRulePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white/95 shrink-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingRulePreset ? "Edit Rule Preset" : "Add Rule Preset"}</h2>
                <button onClick={() => { setShowRulePresetModal(false); setEditingRulePreset(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingRulePreset?._id || 'new-preset'}
               onSubmit={handleAddRulePreset} 
               className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin"
             >
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Preset Name</label>
                      <input name="name" defaultValue={editingRulePreset?.name} required placeholder="e.g. SSC Pattern, High Court Pattern" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                   </div>
                   <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Associated Gov Exam (Optional)</label>
                      <select name="govExamId" defaultValue={editingRulePreset?.govExamId?._id || editingRulePreset?.govExamId || ""} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white">
                         <option value="">General / Global Preset (Unassigned)</option>
                         {govExams.map(gov => <option key={gov._id} value={gov._id}>{gov.title}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Backspace Mode</label>
                     <select name="backspaceMode" defaultValue={editingRulePreset?.backspaceMode || "full"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                         <option value="full">Full Access</option>
                         <option value="word">Word Only</option>
                         <option value="upssssc">UPSSSC Pattern (Current + 1 Prev Word)</option>
                         <option value="disabled">Disabled</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Highlighting Mode</label>
                     <select name="highlightMode" defaultValue={editingRulePreset?.highlightMode || "word"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                         <option value="word">Active Word</option>
                         <option value="word_error">Word with Error Tracking</option>
                         <option value="letter">Character by Character</option>
                         <option value="none">None (Blind Typing)</option>
                      </select>
                   </div>
                   <div className="space-y-1.5 col-span-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Exam Calculation Mode</label>
                     <select name="examMode" defaultValue={editingRulePreset?.examMode || "General"} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                         <option value="General">General Practice (Words)</option>
                         <option value="SSC">SSC Standard (Keys/5)</option>
                         <option value="UPSSSC">UPSSSC / Junior Assistant (Official Formula)</option>
                         <option value="AHC">AHC / Allahabad High Court (Official Formula)</option>
                         <option value="UP_POLICE">UP Police (ASI / Computer Operator - 1 Word = 1 Word)</option>
                         <option value="CPCT">CPCT Standard</option>
                         <option value="Court">High Court Standard</option>
                      </select>
                   </div>
                </div>
                <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100">
                    <input type="checkbox" name="disableCopyPaste" id="disableCopyPaste" defaultChecked={editingRulePreset ? editingRulePreset.disableCopyPaste : true} className="w-4 h-4 text-indigo-650 rounded-lg border-slate-350 focus:ring-indigo-500" />
                    <label htmlFor="disableCopyPaste" className="text-sm font-bold text-slate-700 cursor-pointer">Disable Copy / Paste / Right Click</label>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => { setShowRulePresetModal(false); setEditingRulePreset(null); }} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">{editingRulePreset ? "Save Changes" : "Create Preset"}</Button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* SPECIAL TEST MODAL */}
      {showSpecialTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/80 flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100/80 flex justify-between items-center sticky top-0 bg-white/95 z-10 shrink-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Special Topic Test</h2>
                <button onClick={() => setShowSpecialTestModal(false)} className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                const fd = new FormData(e.currentTarget);
                const data = Object.fromEntries(fd.entries());
                // Force SPECIAL category and General mode
                const finalData: any = { 
                    ...data, 
                    category: 'SPECIAL', 
                    examMode: 'General',
                    status: 'Active',
                    typingEngineType: 'classic',
                    startTime: new Date("2020-01-01"),
                    endTime: new Date("2030-01-01")
                };

                // Auto-inherit language and difficulty from passage
                const selectedPassage = passages.find(p => String(p._id) === String(data.passageId));
                if (selectedPassage) {
                    finalData.language = selectedPassage.language;
                    finalData.difficulty = selectedPassage.difficulty;
                }

                try {
                    const res = await fetch("/api/admin/typing/exams", {
                        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalData)
                    });
                    if (res.ok) {
                        toast.success("Special Test Added!");
                        setShowSpecialTestModal(false);
                        fetchData();
                    } else {
                        const errData = await res.json().catch(() => ({ error: "Server error" }));
                        toast.error(errData.error || "Failed to add special test");
                    }
                } catch (err) {
                    toast.error("Network error");
                }
                setSubmitting(false);
             }} className="p-6 space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Test Title</label>
                   <input name="title" required placeholder="e.g. Current Affairs - May 2026" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-500 uppercase">Topic Category</label>
                     <select name="topic" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                        <option value="General">General</option>
                        {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Select Passage</label>
                      <select name="passageId" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200">
                        <option value="">Select Passage...</option>
                        {passages.filter(p => p.section === 'Special').map(p => <option key={p._id} value={p._id}>{p.title} ({p.language})</option>)}
                      </select>
                   </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Duration (Min)</label>
                      <input type="number" name="duration" defaultValue={10} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200" />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <Button type="button" variant="outline" onClick={() => setShowSpecialTestModal(false)} className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-5 py-2.5 transition-all">Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-[0.98]">Save Special Test</Button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}
