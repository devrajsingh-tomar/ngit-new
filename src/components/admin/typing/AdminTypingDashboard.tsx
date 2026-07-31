
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Keyboard, Clock, Trash2, FileText, Newspaper, Search, BarChart3, Users, LayoutGrid, List, Table as TableIcon, Edit2, Play, Eye, CheckCircle2, X, Settings2, Globe, AlertCircle, Award, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  
  // UI States
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
  const [selectedGovExamId, setSelectedGovExamId] = useState("");
  const [customOverrides, setCustomOverrides] = useState(false);

  useEffect(() => {
    if (showExamModal) {
      if (editingExam) {
        const gid = editingExam.govExamId?._id || editingExam.govExamId || "";
        setSelectedGovExamId(gid);
        setExamCategory(editingExam.category || "");
        setExamPresetId(editingExam.rulePresetId?._id || editingExam.rulePresetId || "");
        setExamDuration(editingExam.duration || 10);
        
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
        status: "Active"
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
    if (!confirm("Delete Government Exam?")) return;
    await fetch(`/api/admin/typing/gov-exams/${id}`, { method: "DELETE" });
    fetchData();
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
  const paginatedExams = filteredExams.slice((examPage - 1) * itemsPerPage, examPage * itemsPerPage);
  const totalExamPages = Math.ceil(filteredExams.length / itemsPerPage);

  const filteredPassages = passages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.bookId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedPassages = filteredPassages.slice((passagePage - 1) * itemsPerPage, passagePage * itemsPerPage);
  const totalPassagePages = Math.ceil(filteredPassages.length / itemsPerPage);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f7fb]">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900">Typing Exam Management</h1>
           <p className="text-sm text-slate-500 font-medium">Manage typing tests, passages, and track student performance.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Search resources..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
               className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-lg flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
             >
               <Plus className="w-4 h-4" /> Publish Test
             </Button>
         </div>
      </div>

      {/* STATS ROW */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Published Tests</p><h3 className="text-xl font-black text-slate-900 leading-none mt-1">{exams.length}</h3></div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle2 className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Exams</p><h3 className="text-xl font-black text-slate-900 leading-none mt-1">{exams.filter(e => e.status==='Active').length}</h3></div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Users className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Passages Library</p><h3 className="text-xl font-black text-slate-900 leading-none mt-1">{passages.length}</h3></div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Exam Books</p><h3 className="text-xl font-black text-slate-900 leading-none mt-1">{books.length}</h3></div>
         </div>
      </div>

      {/* TABS & CONTENT */}
      <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
              <TabsList className="flex w-max h-10 bg-slate-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="exams" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Published Tests</TabsTrigger>
                <TabsTrigger value="gov-exams" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Exam Library</TabsTrigger>
                <TabsTrigger value="rule-presets" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Exam Patterns</TabsTrigger>
                <TabsTrigger value="passages" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Passages</TabsTrigger>
                <TabsTrigger value="books" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Books</TabsTrigger>
                <TabsTrigger value="special-topics" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Special Topics</TabsTrigger>
                <TabsTrigger value="words" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Word Lists</TabsTrigger>
                <TabsTrigger value="results" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 text-emerald-600">Results Logs</TabsTrigger>
                <TabsTrigger value="config" className="rounded-md font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 text-indigo-600">Master Settings</TabsTrigger>
              </TabsList>

              <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-lg p-1">
                 <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md", viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}><LayoutGrid className="w-4 h-4"/></button>
                 <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md", viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}><List className="w-4 h-4"/></button>
                 <button onClick={() => setViewMode("table")} className={cn("p-1.5 rounded-md", viewMode === "table" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}><TableIcon className="w-4 h-4"/></button>
              </div>
          </div>

          <TabsContent value="exams" className="mt-0">
             <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase text-center w-12">#</th>
                          <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Exam / Gov Pattern</th>
                          <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Category / Passage</th>
                          <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Lang / Dur</th>
                          <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Status</th>
                          <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExams.map((exam, index) => {
                          const linkedGovExam = govExams.find(g => g._id.toString() === exam.govExamId?.toString());
                          const linkedPassage = passages.find(p => p._id.toString() === exam.passageId?.toString());
                          const linkedPreset = rulePresets.find(r => r._id.toString() === exam.rulePresetId?.toString());

                          return (
                            <tr key={exam._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">{(examPage - 1) * itemsPerPage + index + 1}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900">{exam.title}</span>
                                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{linkedGovExam ? linkedGovExam.title : 'General'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 w-max mb-1">{exam.category}</span>
                                  <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{linkedPassage ? linkedPassage.title : 'No Passage'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                   <span className="text-slate-600 font-bold">{exam.language}</span>
                                   <span className="text-xs text-slate-400 font-medium">{exam.duration}m • {linkedPreset ? linkedPreset.name : 'Custom Rules'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold flex w-max items-center gap-1", exam.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                                    {exam.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>}
                                    {exam.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <Button onClick={() => handleManageResults(exam)} variant="ghost" size="sm" className="h-8 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100">Results</Button>
                                    <button onClick={() => { setEditingExam(exam); setShowExamModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteExam(exam._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredExams.length === 0 && (
                      <div className="p-12 text-center text-slate-400">No exams found matching your search.</div>
                    )}
                </div>

                {/* Exams Pagination */}
                {totalExamPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Page {examPage} of {totalExamPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExamPage(Math.max(1, examPage - 1))} 
                        disabled={examPage === 1}
                        className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setExamPage(Math.min(totalExamPages, examPage + 1))} 
                        disabled={examPage === totalExamPages}
                        className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest"
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
                 <Button onClick={() => { setModalLogo(""); setShowGovExamModal(true); }} className="bg-slate-900 hover:bg-black text-white h-9 px-4 rounded-lg text-sm font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Gov Exam</Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse text-sm">
                       <thead>
                         <tr className="bg-slate-50 border-b border-slate-200">
                           <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase text-center w-16">Logo</th>
                           <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Exam Title</th>
                           <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Slug</th>
                           <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Status</th>
                           <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {govExams.map(exam => (
                           <tr key={exam._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                           <td className="px-6 py-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                  {exam.logo ? (
                                    <img src={exam.logo} alt="" className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <Award className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-900">{exam.title}</td>

                             <td className="px-6 py-4 text-slate-600 font-medium">{exam.slug}</td>
                             <td className="px-6 py-4">
                                <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold flex w-max items-center gap-1", exam.active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                                   {exam.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>}
                                   {exam.active ? "Active" : "Inactive"}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => { setEditingGovExam(exam); setModalLogo(exam.logo || ""); setShowGovExamModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                                   <button onClick={() => handleDeleteGovExam(exam._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     {govExams.length === 0 && (
                       <div className="p-12 text-center text-slate-400">No gov exams found.</div>
                     )}
                 </div>
              </div>
           </TabsContent>
            <TabsContent value="rule-presets" className="mt-0">
                <div className="mb-6 flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                   <div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Exam Patterns &amp; Presets</h2>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Define exam rules and tie them to Gov Exams</p>
                   </div>
                   <Button onClick={() => setShowRulePresetModal(true)} className="bg-slate-900 hover:bg-black text-white h-9 px-4 rounded-lg text-sm font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Rule Preset</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   {rulePresets.map(preset => {
                     const gov = govExams.find(g => {
                       const gid = preset.govExamId?._id || preset.govExamId;
                       return gid?.toString() === g._id?.toString();
                     });

                     return (
                       <div key={preset._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors group flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                               <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Settings2 className="w-4 h-4"/></div>
                               <div className="flex items-center gap-1.5">
                                 <button 
                                   onClick={() => {
                                     setEditingRulePreset(preset);
                                     setShowRulePresetModal(true);
                                   }} 
                                   className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                 >
                                   <Edit2 className="w-3.5 h-3.5"/>
                                 </button>
                                 <button onClick={() => handleDeleteRulePreset(preset._id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                               </div>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{preset.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Exam Mode: {preset.examMode || "General"}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-3">
                               <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">BKSP: {preset.backspaceMode}</span>
                               <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">HL: {preset.highlightMode}</span>
                               <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">Word Limit: {preset.wordLimit || "None"}</span>
                               {preset.disableCopyPaste && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-bold uppercase font-mono">No Copy</span>}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                             <span>Linked Exam:</span>
                             {gov ? (
                               <span className="text-indigo-600 uppercase flex items-center gap-1">
                                 {gov.logo && <img src={gov.logo} alt="" className="w-3.5 h-3.5 object-contain" />}
                                 {gov.title}
                               </span>
                             ) : (
                               <span className="text-slate-400 italic">None (General)</span>
                             )}
                          </div>
                       </div>
                     );
                   })}
                </div>
                {rulePresets.length === 0 && (
                  <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">No Exam Patterns configured.</div>
                )}
            </TabsContent>

          {/* ... Add Passages Tab Content ... */}
          <TabsContent value="passages" className="mt-0">
             <div className="mb-4 flex justify-end">
                <Button onClick={() => { setEditingPassage(null); setModalSection("Government"); setShowPassageModal(true); }} className="bg-slate-900 hover:bg-black text-white h-9 px-4 rounded-lg text-sm font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Passage</Button>
             </div>
             <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Title</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Language</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Difficulty</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Words</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Section</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPassages.map(p => (
                      <tr key={p._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                         <td className="px-6 py-3 font-semibold text-slate-900">{p.title}</td>
                         <td className="px-6 py-3 text-slate-600">{p.language}</td>
                         <td className="px-6 py-3 text-slate-600"><span className={cn("text-[11px] font-bold px-2 py-0.5 rounded", p.difficulty==='Easy'?'bg-emerald-50 text-emerald-700':p.difficulty==='Medium'?'bg-amber-50 text-amber-700':'bg-rose-50 text-rose-700')}>{p.difficulty}</span></td>
                         <td className="px-6 py-3 text-slate-600 font-medium">{p.wordCount}</td>
                          <td className="px-6 py-3">
                             <span className={cn(
                               "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                               p.section === 'Special' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                               p.section === 'Book' || (p.bookId) ? 'bg-amber-50 text-amber-700 border-amber-100' :
                               'bg-slate-50 text-slate-600 border-slate-100'
                             )}>
                               {p.section === 'Book' || p.bookId ? 'Book' : p.section === 'Special' ? 'Special' : 'Official'}
                             </span>
                          </td>
                         <td className="px-6 py-3 text-right">
                           <div className="flex items-center justify-end gap-1">
                             <button onClick={() => { setEditingPassage(p); setModalSection(p.section || (p.bookId ? 'Book' : 'Government')); setShowPassageModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Edit2 className="w-4 h-4"/></button>
                             <button onClick={() => handleDeletePassage(p._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 className="w-4 h-4"/></button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Passages Pagination */}
                {totalPassagePages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Page {passagePage} of {totalPassagePages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPassagePage(Math.max(1, passagePage - 1))} 
                        disabled={passagePage === 1}
                        className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPassagePage(Math.min(totalPassagePages, passagePage + 1))} 
                        disabled={passagePage === totalPassagePages}
                        className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
             </div>
          </TabsContent>

          {/* ADD OTHER TABS SIMILARLY */}
          <TabsContent value="books" className="mt-0">
             <div className="mb-4 flex justify-end">
                <Button onClick={() => setShowBookModal(true)} className="bg-slate-900 hover:bg-black text-white h-9 px-4 rounded-lg text-sm font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Book</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {books.map(book => {
                   const chapters = passages.filter(p => {
  const pBookId = typeof p.bookId === 'object' ? p.bookId?._id : p.bookId;
  return pBookId && pBookId.toString() === book._id.toString();
});
                   return (
                     <div key={book._id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                           <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5"/></div>
                           <button onClick={() => handleDeleteBook(book._id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{book.name}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-4">{chapters.length} Chapters Assigned</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-[10px] font-black uppercase tracking-widest h-8"
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
           </TabsContent>           <TabsContent value="special-topics" className="mt-0 space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold text-slate-900">Special Topics & Current Affairs</h2>
                 <Button onClick={() => setShowSpecialTestModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 rounded-lg text-sm font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Special Test</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Special Exams List */}
                 <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-slate-900 text-sm">Active Special Tests</h3>
                       <Badge variant="outline" className="text-[10px] uppercase font-black">{exams.filter(e => e.category === 'SPECIAL').length} Tests</Badge>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs">
                          <thead>
                             <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-3 font-bold text-slate-500 uppercase">Title</th>
                                <th className="px-6 py-3 font-bold text-slate-500 uppercase">Lang</th>
                                <th className="px-6 py-3 font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 font-bold text-slate-500 uppercase text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody>
                             {exams.filter(e => e.category === 'SPECIAL').map(e => (
                                <tr key={e._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                   <td className="px-6 py-3 font-bold text-slate-900">{e.title}</td>
                                   <td className="px-6 py-3 text-slate-500">{e.language}</td>
                                   <td className="px-6 py-3">
                                      <span className={cn("px-2 py-0.5 rounded-full font-bold text-[10px] uppercase", e.status==='Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                                         {e.status}
                                      </span>
                                   </td>
                                   <td className="px-6 py-3 text-right flex justify-end gap-1">
                                      <button onClick={() => { setSelectedExam(e); fetchResults(e._id); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"><Eye className="w-3.5 h-3.5"/></button>
                                      <button onClick={async () => { if(confirm("Delete?")) { await fetch(`/api/admin/typing/exams/${e._id}`, {method: "DELETE"}); fetchData(); } }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 className="w-3.5 h-3.5"/></button>
                                   </td>
                                </tr>
                             ))}
                             {exams.filter(e => e.category === 'SPECIAL').length === 0 && (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No special tests found. Use 'Create Test' and select 'SPECIAL' category.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Topics Management (Metadata) */}
                 <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                       <div>
                         <h3 className="font-bold text-slate-900 text-sm">Topic Categories</h3>
                         <p className="text-[10px] text-slate-500 font-medium">Used for organizing current affairs and special tests</p>
                       </div>
                       <Button onClick={() => setShowTopicModal(true)} variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest"><Plus className="w-3.5 h-3.5 mr-1"/> Add</Button>
                    </div>
                    <div className="space-y-2 flex-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                       {topics.length > 0 ? topics.map(t => (
                          <div key={t._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-indigo-200 transition-all">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm"><Newspaper className="w-4 h-4"/></div>
                                <span className="text-xs font-bold text-slate-700">{t.name}</span>
                             </div>
                             <button onClick={() => handleDeleteTopic(t._id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-white rounded-md transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                       )) : <div className="flex flex-col items-center justify-center py-12 text-slate-400"><AlertCircle className="w-8 h-8 mb-2 opacity-20"/><p className="text-[10px] font-bold uppercase tracking-widest">No topics found</p></div>}
                    </div>
                 </div>
              </div>
           </TabsContent>

            <TabsContent value="results" className="mt-0">
               <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Candidate Results Logs</h2>
                     <span className="text-[10px] text-slate-400 font-bold uppercase">Showing last 100 entries</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse text-sm">
                       <thead>
                         <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           <th className="px-6 py-3.5">Candidate</th>
                           <th className="px-6 py-3.5">Speed (Net WPM)</th>
                           <th className="px-6 py-3.5">Accuracy</th>
                           <th className="px-6 py-3.5">Mistakes</th>
                           <th className="px-6 py-3.5 text-right">Submission Date</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {results.map((r: any) => (
                           <tr key={r._id} className="hover:bg-slate-50/30 transition-colors">
                             <td className="px-6 py-4">
                               <p className="font-bold text-slate-900 leading-snug">{r.userId?.name || "Unknown Candidate"}</p>
                               <p className="text-[10px] font-semibold text-slate-400 uppercase">{r.userId?.email || "No Email"}</p>
                             </td>
                             <td className="px-6 py-4">
                               <span className="font-extrabold text-indigo-600 text-sm">{r.wpm} WPM</span>
                             </td>
                             <td className="px-6 py-4">
                               <span className="font-bold text-emerald-600 text-sm">{r.accuracy}%</span>
                             </td>
                             <td className="px-6 py-4">
                               <span className="font-medium text-rose-600 text-sm">{r.errorCount} errors</span>
                             </td>
                             <td className="px-6 py-4 text-right text-slate-400 text-xs font-semibold uppercase tracking-wider">
                               {new Date(r.createdAt).toLocaleDateString()}
                             </td>
                           </tr>
                         ))}
                         {results.length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-12 text-center text-slate-400">No student typing test submissions logged yet.</td>
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
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-sm">Languages</h3>
                      <Button onClick={() => setShowLanguageModal(true)} variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1"/> Add</Button>
                   </div>
                   <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                      {languages.length > 0 ? languages.map(l => (
                         <div key={l._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                            <span className="text-xs font-semibold text-slate-700">{l.name}</span>
                            <button onClick={() => handleDeleteLanguage(l._id)} className="text-slate-300 group-hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                         </div>
                      )) : <p className="text-[10px] text-slate-400 italic">No languages.</p>}
                   </div>
                </div>

                {/* Difficulties Section */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-sm">Difficulties</h3>
                      <Button onClick={() => setShowDifficultyModal(true)} variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1"/> Add</Button>
                   </div>
                   <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                      {difficulties.length > 0 ? difficulties.map(d => (
                         <div key={d._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                            <span className="text-xs font-semibold text-slate-700">{d.name}</span>
                            <button onClick={() => handleDeleteDifficulty(d._id)} className="text-slate-300 group-hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                         </div>
                      )) : <p className="text-[10px] text-slate-400 italic">No difficulties.</p>}
                   </div>
                </div>

                {/* Categories Section */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-sm">Categories</h3>
                      <Button onClick={() => setShowCategoryModal(true)} variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1"/> Add</Button>
                   </div>
                   <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                       {categories.length > 0 ? categories.map(c => {
                          const parent = categories.find(p => p._id === c.parentCategoryId?._id || p._id === c.parentCategoryId);
                          const displayName = parent ? `${parent.name} ➔ ${c.name}` : c.name;
                          return (
                             <div key={c._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                                <span className="text-xs font-semibold text-slate-700">{displayName}</span>
                                <button onClick={() => handleDeleteCategory(c._id)} className="text-slate-300 group-hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                             </div>
                          );
                       }) : <p className="text-[10px] text-slate-400 italic">No categories.</p>}
                    </div>
                </div>
             </div>
           </TabsContent>

          <TabsContent value="words" className="mt-0">
             <div className="mb-4 flex justify-end">
                <Button onClick={() => setShowWordSetModal(true)} className="bg-slate-900 hover:bg-black text-white h-9 px-4 rounded-lg text-sm font-semibold shadow-sm"><Plus className="w-4 h-4 mr-2"/> Add Word Set</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wordSets.map(set => (
                   <div key={set._id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between group">
                      <div className="flex justify-between items-start mb-3">
                         <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">{set.value}</span>
                         <button onClick={() => handleDeleteWordSet(set._id)} className="text-slate-300 group-hover:text-rose-500"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{set.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{set.category} • {set.language} • {set.words?.length || 0} Words</p>
                   </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* GORGEOUS GUIDED WIZARD MODAL FOR PUBLISHING TESTS */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
             
             {/* Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 shrink-0">
                <div>
                   <h2 className="text-lg font-black text-slate-900">
                     {editingExam ? "Edit Test Settings" : "Publish New Typing Test"}
                   </h2>
                   {!editingExam && (
                     <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
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
                <button onClick={() => { setShowExamModal(false); setEditingExam(null); setWizardStep(1); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>

             {/* Wizard Progress Bar */}
             {!editingExam && (
               <div className="px-8 pt-6 pb-2 border-b border-slate-50 shrink-0 bg-slate-50/30">
                 <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
                   <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
                   <div 
                     className="absolute left-0 top-1/2 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-300 -z-10" 
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
                         "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all border-2",
                         step === wizardStep 
                           ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-105" 
                           : step < wizardStep
                             ? "bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50/50"
                             : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                       )}
                     >
                       {step}
                     </button>
                   ))}
                 </div>
                 <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-2xl mx-auto px-1">
                   <span className={wizardStep === 1 ? "text-indigo-600" : ""}>Target Exam</span>
                   <span className={wizardStep === 2 ? "text-indigo-600" : ""}>Pattern</span>
                   <span className={wizardStep === 3 ? "text-indigo-600" : ""}>Passage</span>
                   <span className={wizardStep === 4 ? "text-indigo-600" : ""}>Parameters</span>
                   <span className={wizardStep === 5 ? "text-indigo-600" : ""}>Publish</span>
                 </div>
               </div>
             )}

             {/* Content Block */}
             <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-[350px]">
               {editingExam ? (
                 <form onSubmit={handleAddExam} className="space-y-5">
                   <div className="grid grid-cols-2 gap-5">
                       <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-slate-600 uppercase">Exam Library Target</label>
                          <select 
                            name="govExamId" 
                            defaultValue={editingExam?.govExamId?._id || editingExam?.govExamId || ""}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none bg-white"
                          >
                            <option value="">General Practice (Unassigned)</option>
                            {govExams.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                          </select>
                        </div>
                       <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-slate-600 uppercase">Test Title</label>
                          <input name="title" defaultValue={editingExam?.title} required placeholder="e.g. Test 1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                        </div>
                       <div className="space-y-1.5 col-span-2 sm:col-span-1">
                         <label className="text-xs font-bold text-slate-600 uppercase">Exam Mode Formula</label>
                         <select name="examMode" defaultValue={editingExam?.examMode || "General"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
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
                          <label className="text-xs font-bold text-slate-600 uppercase">Exam Category Tag</label>
                          <select 
                            name="category" 
                            defaultValue={editingExam?.category || ""}
                            required 
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                          >
                             <option value="">Select...</option>
                             {govExams.map(g => <option key={g._id} value={g.title}>{g.title}</option>)}
                             {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-slate-600 uppercase">Active Exam Pattern Preset</label>
                          <select 
                            name="rulePresetId" 
                            defaultValue={editingExam?.rulePresetId?._id || editingExam?.rulePresetId || ""}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                          >
                             <option value="">No Preset (Use custom/default rules)</option>
                             {rulePresets.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                          </select>
                        </div>
                       <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-slate-600 uppercase">Practice Passage</label>
                          <select name="passageId" defaultValue={editingExam?.passageId?._id || editingExam?.passageId} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                            <option value="">Select Passage...</option>
                            {passages.map(p => <option key={p._id} value={p._id}>{p.title} ({p.language})</option>)}
                          </select>
                        </div>
                       <div className="space-y-1.5 col-span-2 sm:col-span-1">
                         <label className="text-xs font-bold text-slate-600 uppercase">Duration (Min)</label>
                         <input 
                           type="number" 
                           name="duration" 
                           defaultValue={editingExam?.duration || 10}
                           required 
                           className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" 
                         />
                       </div>
                       <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-slate-600 uppercase">Publishing Status</label>
                          <select name="status" defaultValue={editingExam?.status || "Active"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                             <option value="Active">Active (Visible)</option>
                             <option value="Draft">Draft (Hidden)</option>
                             <option value="Expired">Expired</option>
                          </select>
                        </div>
                     </div>
                     <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => { setShowExamModal(false); setEditingExam(null); }}>Cancel</Button>
                        <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">Save Changes</Button>
                     </div>
                 </form>
               ) : (
                 <div className="space-y-6">
                   {/* Step 1: Select Target Exam */}
                   {wizardStep === 1 && (
                     <div className="space-y-5">
                       <div className="text-center max-w-md mx-auto space-y-1">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Which exam is this test designed for?</h3>
                         <p className="text-xs text-slate-400 font-semibold uppercase">Choosing an exam library template pre-loads its official rules.</p>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                         {govExams.map(gov => {
                           const preset = rulePresets.find(r => r._id === gov.rulePresetId?._id || r._id === gov.rulePresetId);
                           return (
                             <button
                               key={gov._id}
                               onClick={() => {
                                 setWizardGovExamId(gov._id);
                                 setWizardExamMode(preset?.examMode || "General");
                                 setWizardDuration(gov.defaultDuration || 10);
                                 setWizardCategory(gov.title);
                                 setWizardPatternId(preset?._id || "");
                                 setWizardStep(2);
                               }}
                               className={cn(
                                 "p-5 rounded-2xl border text-left hover:border-indigo-600 hover:shadow-lg transition-all group flex flex-col justify-between h-36 bg-white",
                                 wizardGovExamId === gov._id ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-200"
                               )}
                             >
                               <div className="flex justify-between items-start w-full">
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                   {gov.logo ? <img src={gov.logo} alt="" className="w-full h-full object-contain p-1" /> : <Award className="w-5 h-5 text-slate-300" />}
                                 </div>
                                 <span className="opacity-0 group-hover:opacity-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider transition-opacity">Select ➔</span>
                               </div>
                               <div>
                                 <h4 className="font-bold text-slate-900 text-sm leading-tight">{gov.title}</h4>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                                   {preset ? `${preset.name} (${gov.defaultDuration || 10}m)` : `Standard (${gov.defaultDuration || 10}m)`}
                                 </p>
                               </div>
                             </button>
                           );
                         })}

                         <button
                           onClick={() => {
                             setWizardGovExamId("");
                             setWizardExamMode("General");
                             setWizardDuration(10);
                             setWizardCategory("General Practice");
                             setWizardPatternId("");
                             setWizardStep(2);
                           }}
                           className={cn(
                             "p-5 rounded-2xl border text-left hover:border-indigo-600 hover:shadow-lg transition-all group flex flex-col justify-between h-36 bg-white",
                             wizardGovExamId === "" ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-200"
                           )}
                         >
                           <div className="flex justify-between items-start w-full">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                               <Keyboard className="w-5 h-5" />
                             </div>
                             <span className="opacity-0 group-hover:opacity-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider transition-opacity">Select ➔</span>
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-900 text-sm leading-tight">General / Custom</h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Standard Practice Mode</p>
                           </div>
                         </button>
                       </div>
                     </div>
                   )}

                   {/* Step 2: Select Exam Pattern */}
                   {wizardStep === 2 && (
                     <div className="space-y-5">
                       <div className="text-center max-w-md mx-auto space-y-1">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Review Typing Exam Pattern</h3>
                         <p className="text-xs text-slate-400 font-semibold uppercase">The system automatically loaded these settings based on the selected exam template.</p>
                       </div>
                       
                       <div className="space-y-4 max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                         <div className="space-y-1.5">
                           <label className="text-xs font-bold text-slate-600 uppercase">Active Exam Pattern (Rule Preset)</label>
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
                             className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none"
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
                               <div className="pt-4 border-t border-slate-200 space-y-3">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Evaluation Rules Breakdown</h4>
                                 <div className="grid grid-cols-2 gap-3 text-xs">
                                   <div><span className="text-slate-400">Calculation Method:</span> <span className="font-bold text-slate-800">{preset.examMode} Standard</span></div>
                                   <div><span className="text-slate-400">Backspace Restriction:</span> <span className="font-bold text-slate-800 uppercase">{preset.backspaceMode}</span></div>
                                   <div><span className="text-slate-400">Word Highlighting:</span> <span className="font-bold text-slate-800 uppercase">{preset.highlightMode}</span></div>
                                   <div><span className="text-slate-400">Auto-Scroll Text:</span> <span className="font-bold text-slate-800">{preset.autoScroll ? "Enforced" : "Off"}</span></div>
                                 </div>
                               </div>
                             );
                           })()
                         ) : (
                           <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl text-amber-800 text-xs">
                             Using General Practice mode: Candidates will have full backspace access, simple active word highlighting, and auto-scroll enabled.
                           </div>
                         )}
                       </div>
                       
                       <div className="flex justify-end gap-3 max-w-xl mx-auto pt-4 border-t border-slate-100">
                         <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
                         <Button onClick={() => setWizardStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Proceed to Passage</Button>
                       </div>
                     </div>
                   )}

                   {/* Step 3: Select Practice Passage */}
                   {wizardStep === 3 && (
                     <div className="space-y-5">
                       <div className="text-center max-w-md mx-auto space-y-1">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Select typing test passage</h3>
                         <p className="text-xs text-slate-400 font-semibold uppercase">Choose a passage for candidates to type. Language is locked to the passage settings.</p>
                       </div>

                       <div className="max-w-2xl mx-auto space-y-4">
                         <div className="flex gap-4">
                           <input 
                             type="text" 
                             placeholder="Search passages..." 
                             className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50/50 focus:bg-white focus:border-indigo-500 transition-all"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                           />
                           <select 
                             value={wizardLanguage} 
                             onChange={(e) => setWizardLanguage(e.target.value)}
                             className="p-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-semibold text-slate-700"
                           >
                             <option value="English">English</option>
                             <option value="Hindi">Hindi</option>
                           </select>
                         </div>

                         <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-inner bg-white">
                           {passages
                             .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                             .filter(p => wizardLanguage === "Hindi" ? p.language.toLowerCase().includes("hindi") : p.language.toLowerCase() === "english")
                             .map(p => (
                                <button
                                  key={p._id}
                                  onClick={() => {
                                    setWizardPassageId(p._id);
                                    if (!wizardTitle || wizardTitle.startsWith("Mock Test: ")) {
                                      setWizardTitle(`Mock Test: ${p.title}`);
                                    }
                                  }}
                                  className={cn(
                                    "w-full text-left p-4 flex justify-between items-center transition-all",
                                    wizardPassageId === p._id ? "bg-indigo-50/50 hover:bg-indigo-50" : "hover:bg-slate-50/50"
                                  )}
                                >
                                   <div>
                                     <p className="font-bold text-slate-900 text-sm leading-snug">{p.title}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{p.language} • {p.difficulty || "Medium"}</p>
                                   </div>
                                   <div className="flex items-center gap-3">
                                     <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold shrink-0">{p.content.split(/\s+/).length} Words</span>
                                     {wizardPassageId === p._id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                                   </div>
                                </button>
                             ))}
                           {passages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).filter(p => wizardLanguage === "Hindi" ? p.language.toLowerCase().includes("hindi") : p.language.toLowerCase() === "english").length === 0 && (
                             <div className="p-8 text-center text-slate-400 text-sm">No passages found for this search filter.</div>
                           )}
                         </div>
                       </div>
                       
                       <div className="flex justify-end gap-3 max-w-2xl mx-auto pt-4 border-t border-slate-100">
                         <Button variant="outline" onClick={() => setWizardStep(2)}>Back</Button>
                         <Button 
                           disabled={!wizardPassageId}
                           onClick={() => setWizardStep(4)} 
                           className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                         >
                           Configure Parameters
                         </Button>
                       </div>
                     </div>
                   )}

                   {/* Step 4: Configure Duration & Details */}
                   {wizardStep === 4 && (
                     <div className="space-y-5">
                       <div className="text-center max-w-md mx-auto space-y-1">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Configure test parameters</h3>
                         <p className="text-xs text-slate-400 font-semibold uppercase">Review exam name, target speed limits, and set duration.</p>
                       </div>

                       <div className="space-y-4 max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                         <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase">Test Title / Label</label>
                            <input 
                              type="text" 
                              value={wizardTitle} 
                              onChange={(e) => setWizardTitle(e.target.value)} 
                              required 
                              placeholder="e.g. Mock Test #1" 
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" 
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-600 uppercase">Duration (Minutes)</label>
                              <input 
                                type="number" 
                                value={wizardDuration} 
                                onChange={(e) => setWizardDuration(Number(e.target.value))} 
                                required 
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-600 uppercase">Target Pass Speed (WPM)</label>
                              <input 
                                type="number" 
                                value={wizardTargetSpeed} 
                                onChange={(e) => setWizardTargetSpeed(Number(e.target.value))} 
                                required 
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" 
                              />
                           </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase">Publish Tag / Category Name</label>
                            <select 
                              value={wizardCategory} 
                              onChange={(e) => setWizardCategory(e.target.value)}
                              required
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none"
                            >
                              <option value="">Select Tag...</option>
                              {govExams.map(g => <option key={g._id} value={g.title}>{g.title}</option>)}
                              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                         </div>
                       </div>
                       
                       <div className="flex justify-end gap-3 max-w-xl mx-auto pt-4 border-t border-slate-100">
                         <Button variant="outline" onClick={() => setWizardStep(3)}>Back</Button>
                         <Button 
                           disabled={!wizardTitle.trim() || wizardDuration <= 0}
                           onClick={() => setWizardStep(5)} 
                           className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                         >
                           Final Review
                         </Button>
                       </div>
                     </div>
                   )}

                   {/* Step 5: Review & Publish */}
                   {wizardStep === 5 && (
                     <div className="space-y-5">
                       <div className="text-center max-w-md mx-auto space-y-1">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Review & publish typing test</h3>
                         <p className="text-xs text-slate-400 font-semibold uppercase">Verify the details before publishing to students.</p>
                       </div>

                       <div className="max-w-xl mx-auto bg-indigo-50/20 border border-indigo-100 p-6 rounded-2xl space-y-4">
                         <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                           <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Confirm Exam Settings
                         </h4>
                         
                         <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                            <div><span className="text-slate-400">Target Library:</span> <span className="font-bold text-slate-800">{govExams.find(g => g._id === wizardGovExamId)?.title || "General / Custom Practice"}</span></div>
                            <div><span className="text-slate-400">Test Title:</span> <span className="font-bold text-slate-800">{wizardTitle}</span></div>
                            <div><span className="text-slate-400">Passage Selected:</span> <span className="font-bold text-slate-800">{passages.find(p => p._id === wizardPassageId)?.title || ""}</span></div>
                            <div><span className="text-slate-400">Evaluation Mode:</span> <span className="font-bold text-slate-800">{wizardExamMode} Official Formula</span></div>
                            <div><span className="text-slate-400">Duration:</span> <span className="font-bold text-slate-800">{wizardDuration} Minutes</span></div>
                            <div><span className="text-slate-400">Min Pass Speed:</span> <span className="font-bold text-slate-800">{wizardTargetSpeed} WPM</span></div>
                         </div>
                       </div>
                       
                       <div className="flex justify-end gap-3 max-w-xl mx-auto pt-4 border-t border-slate-100">
                         <Button variant="outline" onClick={() => setWizardStep(4)}>Back</Button>
                         <Button 
                           disabled={submitting}
                           onClick={handlePublishWizardTest} 
                           className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-500/10"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">{editingGovExam ? "Edit Government Exam" : "Add Government Exam"}</h2>
                <button onClick={() => { setShowGovExamModal(false); setEditingGovExam(null); setModalLogo(""); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingGovExam?._id || 'new-gov-exam'}
               onSubmit={handleAddGovExam} 
               className="p-6 space-y-4"
             >
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Exam Title</label>
                   <input name="title" defaultValue={editingGovExam?.title} required placeholder="e.g. SSC CGL" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase">Default Rule Preset</label>
                      <select name="rulePresetId" defaultValue={editingGovExam?.rulePresetId?._id || editingGovExam?.rulePresetId} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                         <option value="">No Preset (Standard Rules)</option>
                         {rulePresets.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase">Default Duration (Min)</label>
                      <input type="number" name="defaultDuration" defaultValue={editingGovExam?.defaultDuration || 10} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Description</label>
                   <textarea 
                     name="description" 
                     defaultValue={editingGovExam?.description} 
                     placeholder="Short description for students..." 
                     className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none min-h-[80px]"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Exam Logo</label>
                   <ImageUpload 
                      value={modalLogo}
                      onChange={(url) => setModalLogo(url)}
                      label="Upload Logo"
                   />
                   <input type="hidden" name="logo" value={modalLogo} />
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <input type="checkbox" name="active" id="gov-active" defaultChecked={editingGovExam ? editingGovExam.active : true} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <label htmlFor="gov-active" className="text-sm font-semibold text-slate-700 cursor-pointer">Active / Visible to Students</label>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => { setShowGovExamModal(false); setEditingGovExam(null); setModalLogo(""); }}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* RESULTS MODAL */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Results: {selectedExam.title}</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">{selectedExam.category} • {selectedExam.language} • {results.length} attempts</p>
                </div>
                <button onClick={() => setSelectedExam(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <div className="flex-1 overflow-auto bg-slate-50/50 p-6">
                <table className="w-full text-left border-collapse text-sm bg-white border border-slate-200 rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Student</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">WPM</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Accuracy</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase">Errors</th>
                      <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{r.userId?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{r.userId?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{r.wpm}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{r.accuracy}%</td>
                        <td className="px-6 py-4 font-bold text-rose-600">{r.errorCount}</td>
                        <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {results.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No results found for this exam.</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}
      {/* PASSAGE MODAL */}
      {showPassageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">{editingPassage ? "Edit Passage" : "Add Passage"}</h2>
                <button onClick={() => setShowPassageModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingPassage?._id || 'new-passage'}
               onSubmit={editingPassage ? handleUpdatePassage : handleAddPassage} 
               className="p-6 space-y-4"
             >
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Title</label>
                   <input name="title" defaultValue={editingPassage?.title} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Language</label>
                     <select name="language" defaultValue={editingPassage?.language || "Unicode Hindi"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="English">English</option>
                        <option value="Unicode Hindi">Hindi (Unicode / Mangal)</option>
                        <option value="Krutidev Hindi">Hindi (Krutidev / Legacy)</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Difficulty</label>
                     <select name="difficulty" defaultValue={editingPassage?.difficulty || "Medium"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Target Section</label>
                     <select 
                       name="section" 
                       defaultValue={modalSection} 
                       onChange={(e) => setModalSection(e.target.value)}
                       className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                     >
                        <option value="Government">Government Exam</option>
                        <option value="Special">Special Topic / Current</option>
                        <option value="Book">Book Chapter</option>
                     </select>
                   </div>
                   {modalSection === 'Book' && (
                     <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                       <label className="text-xs font-bold text-slate-600 uppercase">Assign to Book</label>
                       <select name="bookId" defaultValue={editingPassage?.bookId || ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                          <option value="">Select Book...</option>
                          {books.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                       </select>
                     </div>
                   )}
                   {modalSection === 'Government' && (
                     <div className="col-span-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                       <label className="text-xs font-bold text-slate-600 uppercase block">Assign to Government Exams</label>
                       <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                         {govExams.map(gov => {
                           const isChecked = editingPassage 
                             ? exams.some(ex => {
                                 const pid = ex.passageId?._id || ex.passageId;
                                 const gid = ex.govExamId?._id || ex.govExamId;
                                 return pid === editingPassage._id && gid?.toString() === gov._id?.toString();
                               })
                             : false;
                           
                           return (
                             <label key={gov._id} className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer hover:text-indigo-600">
                               <input 
                                 type="checkbox" 
                                 name="govExamIds" 
                                 value={gov._id} 
                                 defaultChecked={isChecked}
                                 className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" 
                               />
                               {gov.title}
                             </label>
                           );
                         })}
                       </div>
                       <p className="text-[10px] font-semibold text-slate-400">Selected exams will automatically get a test created for this passage, using their specific rule presets.</p>
                     </div>
                   )}
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Passage Content (Paste Unicode Hindi here)</label>
                    <textarea 
                      name="content" 
                      defaultValue={editingPassage?.content} 
                      required 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none h-40 resize-none"
                      style={{ fontFamily: "'Mangal', 'Arial Unicode MS', sans-serif" }}
                    />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowPassageModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* BOOK MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Create Book</h2>
                <button onClick={() => setShowBookModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddBook} className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Book Name</label>
                   <input name="name" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Description (Optional)</label>
                   <textarea name="description" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none h-24 resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowBookModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Book</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Add Category</h2>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Category Name</label>
                   <input name="name" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Parent Category (Optional)</label>
                   <select name="parentCategoryId" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none bg-white">
                      <option value="">None (Top-level Category)</option>
                      {categories.filter(c => !c.parentCategoryId).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Category</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* WORD SET MODAL */}
      {showWordSetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">Add Word Set</h2>
                <button onClick={() => setShowWordSetModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddWordSet} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Set Name</label>
                     <input name="name" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Category</label>
                     <select name="category" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="A-Z">A to Z</option>
                        <option value="Length">Word Length</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Value</label>
                     <input name="value" required placeholder="e.g. A or 5" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Language</label>
                     <select name="language" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (Mangal)</option>
                     </select>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Words (Comma separated)</label>
                   <textarea name="words" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none h-32 resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowWordSetModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Set</Button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* LANGUAGE MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Add Language</h2>
                <button onClick={() => setShowLanguageModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddLanguage} className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Language Name</label>
                   <input name="name" required placeholder="e.g. Punjabi, Bengali" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowLanguageModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Language</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* DIFFICULTY MODAL */}
      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Add Difficulty</h2>
                <button onClick={() => setShowDifficultyModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddDifficulty} className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Difficulty Name</label>
                   <input name="name" required placeholder="e.g. Ultra Hard, Beginner" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowDifficultyModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Difficulty</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Add Special Topic</h2>
                <button onClick={() => setShowTopicModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddTopic} className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-600 uppercase">Topic Name</label>
                   <input name="name" required placeholder="e.g. Constitution, Legal, Sports" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowTopicModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Topic</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* RULE PRESET MODAL */}
      {showRulePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">{editingRulePreset ? "Edit Rule Preset" : "Add Rule Preset"}</h2>
                <button onClick={() => { setShowRulePresetModal(false); setEditingRulePreset(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>
             <form 
               key={editingRulePreset?._id || 'new-preset'}
               onSubmit={handleAddRulePreset} 
               className="p-6 space-y-5"
             >
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">Preset Name</label>
                      <input name="name" defaultValue={editingRulePreset?.name} required placeholder="e.g. SSC Pattern, High Court Pattern" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                   </div>
                   <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">Associated Gov Exam (Optional)</label>
                      <select name="govExamId" defaultValue={editingRulePreset?.govExamId?._id || editingRulePreset?.govExamId || ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none bg-white">
                         <option value="">General / Global Preset (Unassigned)</option>
                         {govExams.map(gov => <option key={gov._id} value={gov._id}>{gov.title}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Backspace Mode</label>
                     <select name="backspaceMode" defaultValue={editingRulePreset?.backspaceMode || "full"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="full">Full Access</option>
                        <option value="word">Word Only</option>
                        <option value="upssssc">UPSSSC Pattern (Current + 1 Prev Word)</option>
                        <option value="disabled">Disabled</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Highlighting Mode</label>
                     <select name="highlightMode" defaultValue={editingRulePreset?.highlightMode || "word"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="word">Active Word</option>
                        <option value="word_error">Word with Error Tracking</option>
                        <option value="letter">Character by Character</option>
                        <option value="none">None (Blind Typing)</option>
                     </select>
                   </div>
                   <div className="space-y-1.5 col-span-2">
                     <label className="text-xs font-bold text-slate-600 uppercase">Exam Calculation Mode</label>
                     <select name="examMode" defaultValue={editingRulePreset?.examMode || "General"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
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
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <input type="checkbox" name="disableCopyPaste" id="disableCopyPaste" defaultChecked={editingRulePreset ? editingRulePreset.disableCopyPaste : true} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <label htmlFor="disableCopyPaste" className="text-sm font-semibold text-slate-700 cursor-pointer">Disable Copy / Paste / Right Click</label>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => { setShowRulePresetModal(false); setEditingRulePreset(null); }}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">{editingRulePreset ? "Save Changes" : "Create Preset"}</Button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* SPECIAL TEST MODAL */}
      {showSpecialTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">Add Special Topic Test</h2>
                <button onClick={() => setShowSpecialTestModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
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
                   <label className="text-xs font-bold text-slate-600 uppercase">Test Title</label>
                   <input name="title" required placeholder="e.g. Current Affairs - May 2026" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase">Topic Category</label>
                     <select name="topic" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="General">General</option>
                        {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase">Select Passage</label>
                      <select name="passageId" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
                        <option value="">Select Passage...</option>
                        {passages.filter(p => p.section === 'Special').map(p => <option key={p._id} value={p._id}>{p.title} ({p.language})</option>)}
                      </select>
                   </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">Duration (Min)</label>
                      <input type="number" name="duration" defaultValue={10} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                   <Button type="button" variant="outline" onClick={() => setShowSpecialTestModal(false)}>Cancel</Button>
                   <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Special Test</Button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}
