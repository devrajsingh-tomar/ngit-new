"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sliders, Plus, Trash2, Edit2, Check, X, Megaphone, Link as LinkIcon,
  ExternalLink, Sparkles, Layers, Bell, Layout, ArrowRight, Eye, RefreshCw,
  PlusCircle, AlertCircle, Info, ChevronRight
} from "lucide-react";
import { getNotices, createNotice, updateNotice, deleteNotice } from "@/app/actions/notice";
import { 
  getDynamicPageData, 
  createCmsPage, 
  createCmsSection, 
  createCmsContentBlock, 
  updateCmsContentBlock, 
  deleteCmsContentBlock 
} from "@/app/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function CMSDashboard() {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);

  // Data states
  const [slides, setSlides] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [quickSectionId, setQuickSectionId] = useState<string>("");
  const [homePageId, setHomePageId] = useState<string>("");

  // Modals state
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);

  // Form states - Hero Slide
  const [slideForm, setSlideForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    cta1Text: "Learn More",
    cta1Link: "/",
    cta2Text: "Contact Us",
    cta2Link: "/contact",
    bgColor: "from-slate-900 via-indigo-950 to-slate-900",
    imageUrl: "",
    isActive: true,
    order: 0
  });

  // Form states - Notice
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    description: "",
    link: "",
    isActive: true,
    showInScroller: true
  });

  // Form states - Quick Link Card
  const [cardForm, setCardForm] = useState({
    title: "",
    image: "",
    button_link: ""
  });

  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlide(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSlideForm(prev => ({ ...prev, imageUrl: data.url }));
        toast.success("Banner image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (err) {
      toast.error("An error occurred during file upload.");
    } finally {
      setUploadingSlide(false);
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCard(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCardForm(prev => ({ ...prev, image: data.url }));
        toast.success("Card image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (err) {
      toast.error("An error occurred during file upload.");
    } finally {
      setUploadingCard(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Hero Slides from API
      const slidesRes = await fetch("/api/admin/hero-slides");
      if (slidesRes.ok) {
        const slidesData = await slidesRes.json();
        setSlides(slidesData);
      }

      // 2. Fetch Notices using Server Action
      const noticesRes = await getNotices(true);
      if (noticesRes.success) {
        setNotices(noticesRes.notices || []);
      }

      // 3. Fetch Page Data for Quick Links
      const dynamicRes = await getDynamicPageData("home");
      if (dynamicRes.success) {
        setHomePageId(dynamicRes.page?._id || "");
        const sections = dynamicRes.sections || [];
        const quickSection = sections.find((s: any) => s.section_type === "QuickActionsGrid");
        if (quickSection) {
          setQuickSectionId(quickSection._id);
          setCards(quickSection.blocks || []);
        }
      } else if (dynamicRes.error === "Page not found") {
        console.log("Home page not initialized yet.");
      }
    } catch (err: any) {
      toast.error("Failed to load homepage settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Home Page & Quick Links section
  const handleInitializeQuickSection = async () => {
    setLoading(true);
    try {
      // Create home page entry
      const pageRes = await createCmsPage({
        page_name: "home",
        title: "Home Page",
        path: "/"
      });

      if (!pageRes.success) throw new Error(pageRes.error);

      // Create quick links section
      const sectionRes = await createCmsSection({
        page_id: pageRes.page._id,
        section_name: "Quick Navigation",
        section_type: "QuickActionsGrid",
        is_active: true,
        sort_order: 1
      });

      if (!sectionRes.success) throw new Error(sectionRes.error);

      toast.success("Quick Links Section Initialized!");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize section");
    } finally {
      setLoading(false);
    }
  };

  // ─── Hero Slides Actions ────────────────────────────────────────────────────
  const handleOpenSlideModal = (slide: any = null) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        description: slide.description || "",
        cta1Text: slide.cta1Text || "",
        cta1Link: slide.cta1Link || "",
        cta2Text: slide.cta2Text || "",
        cta2Link: slide.cta2Link || "",
        bgColor: slide.bgColor || "from-slate-900 via-indigo-950 to-slate-900",
        imageUrl: slide.imageUrl || "",
        isActive: slide.isActive !== false,
        order: slide.order || 0
      });
    } else {
      setEditingSlide(null);
      setSlideForm({
        title: "",
        subtitle: "",
        description: "",
        cta1Text: "",
        cta1Link: "",
        cta2Text: "",
        cta2Link: "",
        bgColor: "from-slate-900 via-indigo-950 to-slate-900",
        imageUrl: "",
        isActive: true,
        order: slides.length
      });
    }
    setSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSlide ? `/api/admin/hero-slides/${editingSlide._id}` : "/api/admin/hero-slides";
      const method = editingSlide ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slideForm)
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(editingSlide ? "Slide updated successfully" : "Slide added successfully");
      setSlideModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error("Failed to save slide settings");
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Slide deleted");
      loadAllData();
    } catch {
      toast.error("Failed to delete slide");
    }
  };

  const handleToggleSlideActive = async (slide: any) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive })
      });
      if (!res.ok) throw new Error();
      toast.success(`Slide ${!slide.isActive ? "activated" : "deactivated"}`);
      loadAllData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  // ─── Notices/Announcements Actions ──────────────────────────────────────────
  const handleOpenNoticeModal = (notice: any = null) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeForm({
        title: notice.title || "",
        description: notice.description || "",
        link: notice.link || "",
        isActive: notice.isActive !== false,
        showInScroller: notice.showInScroller !== false
      });
    } else {
      setEditingNotice(null);
      setNoticeForm({
        title: "",
        description: "",
        link: "",
        isActive: true,
        showInScroller: true
      });
    }
    setNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingNotice) {
        res = await updateNotice(editingNotice._id, noticeForm);
      } else {
        res = await createNotice(noticeForm);
      }

      if (!res.success) throw new Error(res.error);

      toast.success(editingNotice ? "Announcement updated" : "Announcement published");
      setNoticeModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save announcement");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await deleteNotice(id);
      if (!res.success) throw new Error(res.error);
      toast.success("Announcement deleted");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete notice");
    }
  };

  const handleToggleNoticeActive = async (notice: any) => {
    try {
      const res = await updateNotice(notice._id, { isActive: !notice.isActive });
      if (!res.success) throw new Error(res.error);
      toast.success(`Announcement ${!notice.isActive ? "activated" : "deactivated"}`);
      loadAllData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ─── Quick Navigation Cards Actions ─────────────────────────────────────────
  const handleOpenCardModal = (card: any = null) => {
    if (card) {
      setEditingCard(card);
      setCardForm({
        title: card.title || "",
        image: card.image || "",
        button_link: card.button_link || ""
      });
    } else {
      setEditingCard(null);
      setCardForm({
        title: "",
        image: "",
        button_link: ""
      });
    }
    setCardModalOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSectionId) {
      toast.error("Quick actions section not initialized properly");
      return;
    }

    try {
      let res;
      if (editingCard) {
        res = await updateCmsContentBlock(editingCard._id, cardForm);
      } else {
        res = await createCmsContentBlock({
          section_id: quickSectionId,
          ...cardForm,
          is_active: true,
          sort_order: cards.length
        });
      }

      if (!res.success) throw new Error(res.error);

      toast.success(editingCard ? "Navigation card updated" : "Navigation card created");
      setCardModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save card");
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to remove this navigation card?")) return;
    try {
      const res = await deleteCmsContentBlock(id);
      if (!res.success) throw new Error(res.error);
      toast.success("Navigation card removed");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove card");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Top Title Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" /> Homepage Editor
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage dynamic sections of your minimal single page website: hero slider, notification ticker, and workspace cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadAllData} variant="outline" size="sm" className="h-8 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reload
          </Button>
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Site
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-slate-200/60 p-1 rounded-xl h-10 w-full sm:w-max">
            <TabsTrigger value="hero" className="rounded-lg text-xs font-bold px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Hero Banners
            </TabsTrigger>
            <TabsTrigger value="notice" className="rounded-lg text-xs font-bold px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bell className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Notifications Feed
            </TabsTrigger>
            <TabsTrigger value="cards" className="rounded-lg text-xs font-bold px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Quick Link Cards
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: HERO BANNERS */}
          <TabsContent value="hero" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Banners</h3>
              <Button onClick={() => handleOpenSlideModal()} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Slide
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : slides.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                <Sliders className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-bold text-slate-700">No Hero Banners added</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Create slideshow banners containing background graphics, titles, and redirect CTAs to guide incoming students.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map((s, idx) => (
                  <div key={s._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    {/* Slide Header mockup preview */}
                    <div className={`p-6 bg-gradient-to-r ${s.bgColor} text-white min-h-[140px] flex flex-col justify-between relative`}>
                      {s.imageUrl && (
                        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${s.imageUrl})` }} />
                      )}
                      <div className="relative z-10 space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">{s.subtitle || "Featured Slide"}</span>
                        <h4 className="text-lg font-black tracking-tight leading-tight">{s.title || "Untitled Slide"}</h4>
                        <p className="text-xs font-semibold opacity-70 line-clamp-2 mt-2">{s.description}</p>
                      </div>
                      <div className="relative z-10 flex gap-2 mt-4">
                        {s.cta1Text && <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{s.cta1Text}</span>}
                        {s.cta2Text && <span className="bg-white/10 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{s.cta2Text}</span>}
                      </div>
                    </div>
                    {/* Slide Settings actions */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">Order: {s.order}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span className="text-[10px] font-black uppercase text-slate-500">{s.isActive ? "Active" : "Disabled"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          onClick={() => handleToggleSlideActive(s)} 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 text-slate-500 hover:text-slate-800"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          onClick={() => handleOpenSlideModal(s)} 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 text-slate-500 hover:text-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteSlide(s._id)} 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: NOTIFICATIONS FEED */}
          <TabsContent value="notice" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ticker Feed</h3>
              <Button onClick={() => handleOpenNoticeModal()} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Post Announcement
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : notices.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                <Bell className="w-10 h-10 mb-3 opacity-20 text-amber-500" />
                <p className="font-bold text-slate-700">No Announcements found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Publish real-time notification alerts, time-table updates, and official notice boards to show in the scrolling marquee ticker.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-6 py-3.5">Title</th>
                        <th className="px-6 py-3.5">Details</th>
                        <th className="px-6 py-3.5">Target Link</th>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notices.map((n) => (
                        <tr key={n._id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 leading-snug">{n.title}</span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            <span className="text-slate-500">{n.description}</span>
                          </td>
                          <td className="px-6 py-4">
                            {n.link ? (
                              <a href={n.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-bold">
                                {n.link.substring(0, 30)}... <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(n.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              n.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                            }`}>
                              {n.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button 
                                onClick={() => handleToggleNoticeActive(n)} 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 text-slate-400 hover:text-slate-700"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button 
                                onClick={() => handleOpenNoticeModal(n)} 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 text-slate-400 hover:text-slate-700"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                onClick={() => handleDeleteNotice(n._id)} 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: QUICK LINK CARDS */}
          <TabsContent value="cards" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Navigation Cards Grid</h3>
              {quickSectionId ? (
                <Button onClick={() => handleOpenCardModal()} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Card
                </Button>
              ) : null}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : !quickSectionId ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                <AlertCircle className="w-10 h-10 mb-3 opacity-20 text-rose-500" />
                <p className="font-bold text-slate-700">Quick links grids not initialized</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">To allow students to dynamically jump into the typing simulator or online shorthand apps, initialize the quick navigation hub.</p>
                <Button onClick={handleInitializeQuickSection} className="bg-indigo-600 hover:bg-indigo-700 font-bold mt-4 h-9 text-xs">
                  Initialize Quick Links
                </Button>
              </div>
            ) : cards.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                <Layers className="w-10 h-10 mb-3 opacity-20 text-emerald-500" />
                <p className="font-bold text-slate-700">No custom navigation cards configured</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">You are currently using the default system cards (Hindi/English Short-hand link, Typing simulator link, My Web App link).</p>
                <Button onClick={() => handleOpenCardModal()} className="bg-emerald-600 hover:bg-emerald-700 font-bold h-9 text-xs">
                  Add First Custom Card
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-sky-800">
                    Custom navigation cards configured here will overwrite the fallback system cards on the landing page workspace grid.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {cards.map((c, i) => (
                    <div key={c._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        {/* Card image header */}
                        <div className="w-full aspect-[2.4/1] relative overflow-hidden bg-slate-900 flex items-center justify-center">
                          <img 
                            src={c.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600"} 
                            alt={c.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        {/* Card label */}
                        <div className="p-4 border-t border-slate-100 flex flex-col min-h-[90px] justify-between">
                          <span className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">{c.title}</span>
                          <span className="text-[10px] text-indigo-600 font-bold truncate mt-2">{c.button_link || "#"}</span>
                        </div>
                      </div>
                      
                      {/* Card actions */}
                      <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400">Position {i + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <Button 
                            onClick={() => handleOpenCardModal(c)} 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-slate-800"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            onClick={() => handleDeleteCard(c._id)} 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── HERO SLIDE MODAL ── */}
      <Dialog open={slideModalOpen} onOpenChange={setSlideModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">
              {editingSlide ? "Modify Hero Slide" : "Add New Hero Slide"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Input headers, subtitles, and redirects for the slideshow hero container.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSlide} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slide Title</label>
                <Input 
                  value={slideForm.title} 
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} 
                  placeholder="e.g. India's Finest Shorthand Academy"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subtitle / Category</label>
                <Input 
                  value={slideForm.subtitle} 
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} 
                  placeholder="e.g. CRACK GOVERNMENT EXAMS"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
              <Textarea 
                value={slideForm.description} 
                onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })} 
                placeholder="Brief slide descriptive paragraph..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Button Label</label>
                <Input 
                  value={slideForm.cta1Text} 
                  onChange={(e) => setSlideForm({ ...slideForm, cta1Text: e.target.value })} 
                  placeholder="e.g. Try Simulator"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Button Link</label>
                <Input 
                  value={slideForm.cta1Link} 
                  onChange={(e) => setSlideForm({ ...slideForm, cta1Link: e.target.value })} 
                  placeholder="e.g. /typing"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Button Label</label>
                <Input 
                  value={slideForm.cta2Text} 
                  onChange={(e) => setSlideForm({ ...slideForm, cta2Text: e.target.value })} 
                  placeholder="e.g. Contact Us"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Button Link</label>
                <Input 
                  value={slideForm.cta2Link} 
                  onChange={(e) => setSlideForm({ ...slideForm, cta2Link: e.target.value })} 
                  placeholder="e.g. /contact"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gradient / Background Color</label>
                <Input 
                  value={slideForm.bgColor} 
                  onChange={(e) => setSlideForm({ ...slideForm, bgColor: e.target.value })} 
                  placeholder="e.g. from-violet-900 to-indigo-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Graphic Image (Optional)</label>
                <div className="flex gap-2 items-center">
                  <Input 
                    value={slideForm.imageUrl} 
                    onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })} 
                    placeholder="Image URL or upload..."
                    className="flex-1"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer transition-colors shrink-0 h-9 flex items-center">
                    {uploadingSlide ? "Uploading..." : "Upload"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleSlideImageUpload} 
                      className="hidden" 
                      disabled={uploadingSlide}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visible Status</span>
                <Switch 
                  checked={slideForm.isActive} 
                  onCheckedChange={(checked) => setSlideForm({ ...slideForm, isActive: checked })} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sorting Sequence Order</label>
                <Input 
                  type="number"
                  value={slideForm.order} 
                  onChange={(e) => setSlideForm({ ...slideForm, order: parseInt(e.target.value) || 0 })} 
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" onClick={() => setSlideModalOpen(false)} variant="outline" className="h-9 text-xs font-semibold">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs">
                {editingSlide ? "Preserve Configuration" : "Deploy Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── NOTIFICATION MODAL ── */}
      <Dialog open={noticeModalOpen} onOpenChange={setNoticeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">
              {editingNotice ? "Edit Announcement" : "Post New Announcement"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Post dynamic alerts that will scroll inside the website ticker.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNotice} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Announcement Title</label>
              <Input 
                value={noticeForm.title} 
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} 
                placeholder="e.g. SSC CGL Mock Test Schedule Changed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detailed Content Text</label>
              <Textarea 
                value={noticeForm.description} 
                onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })} 
                placeholder="Enter complete notice summary details..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Redirect URL (Optional)</label>
              <Input 
                value={noticeForm.link} 
                onChange={(e) => setNoticeForm({ ...noticeForm, link: e.target.value })} 
                placeholder="e.g. /typing/exam/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Active</span>
                <Switch 
                  checked={noticeForm.isActive} 
                  onCheckedChange={(checked) => setNoticeForm({ ...noticeForm, isActive: checked })} 
                />
              </div>
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Ticker Scroller</span>
                <Switch 
                  checked={noticeForm.showInScroller} 
                  onCheckedChange={(checked) => setNoticeForm({ ...noticeForm, showInScroller: checked })} 
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" onClick={() => setNoticeModalOpen(false)} variant="outline" className="h-9 text-xs font-semibold">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs">
                {editingNotice ? "Apply Updates" : "Publish Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── QUICK LINK CARD MODAL ── */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">
              {editingCard ? "Modify Navigation Card" : "Add Custom Navigation Card"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create student workspace redirection link cards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCard} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Card Title Label</label>
              <Input 
                value={cardForm.title} 
                onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} 
                placeholder="e.g. Hindi Stenography Engine"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Card Image</label>
              <div className="flex gap-2 items-center">
                <Input 
                  value={cardForm.image} 
                  onChange={(e) => setCardForm({ ...cardForm, image: e.target.value })} 
                  placeholder="Image URL or upload..."
                  className="flex-1"
                  required
                />
                <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer transition-colors shrink-0 h-9 flex items-center">
                  {uploadingCard ? "Uploading..." : "Upload"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCardImageUpload} 
                    className="hidden" 
                    disabled={uploadingCard}
                  />
                </label>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold block">Use online image hosts or upload a custom image.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Redirection Action Link</label>
              <Input 
                value={cardForm.button_link} 
                onChange={(e) => setCardForm({ ...cardForm, button_link: e.target.value })} 
                placeholder="e.g. /typing or external links like student.domain.com"
                required
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" onClick={() => setCardModalOpen(false)} variant="outline" className="h-9 text-xs font-semibold">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs">
                {editingCard ? "Preserve Card" : "Integrate Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
