"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getHeaderFooterData, updateHeaderData, updateFooterData } from "@/app/actions/layoutContent";
import { toast } from "sonner";
import { Save, Plus, Trash2, Layout, Menu, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

export default function LayoutManagementPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

    // Header State
    const [headerLogoImage, setHeaderLogoImage] = useState("");
    const [headerLogoText, setHeaderLogoText] = useState("");
    const [headerNav, setHeaderNav] = useState<{ label: string; href: string }[]>([]);
    const [headerCTA, setHeaderCTA] = useState({ label: "", href: "" });

    // Footer State
    const [footerLogoImage, setFooterLogoImage] = useState("");
    const [footerLogoText, setFooterLogoText] = useState("");
    const [footerDescription, setFooterDescription] = useState("");
    const [footerSections, setFooterSections] = useState<{ title: string; links: { label: string; href: string }[] }[]>([]);
    const [footerSocial, setFooterSocial] = useState<{ platform: string; url: string }[]>([]);
    const [footerCopyright, setFooterCopyright] = useState("");

    const availableLinks = [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/#about" },
        { label: "Mock Tests", href: "/exams" },
        { label: "Events", href: "/events" },
        { label: "Gallery", href: "/gallery" },
        { label: "Faculty", href: "/faculty" },
        { label: "Achievements", href: "/#results" },
        { label: "Contact", href: "/contact" },
        { label: "Student Login", href: "/student/login" },
        { label: "Register", href: "/register" }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await getHeaderFooterData();
        if (result.success) {
            // Load Header Data
            setHeaderLogoImage(result.header.logoImage || "");
            setHeaderLogoText(result.header.logoText || "");
            setHeaderNav(result.header.navigation || []);
            setHeaderCTA(result.header.ctaButton || { label: "", href: "" });

            // Load Footer Data
            setFooterLogoImage(result.footer.logoImage || "");
            setFooterLogoText(result.footer.logoText || "");
            setFooterDescription(result.footer.description || "");
            setFooterSections(result.footer.sections || []);
            setFooterSocial(result.footer.social || []);
            setFooterCopyright(result.footer.copyright || "");
        } else {
            toast.error("Failed to load data");
        }
        setLoading(false);
    };

    const handleSaveHeader = async () => {
        setSaving(true);
        const result = await updateHeaderData({
            logoImage: headerLogoImage,
            logoText: headerLogoText,
            navigation: headerNav,
            ctaButton: headerCTA,
        });

        if (result.success) {
            toast.success("Header updated successfully!");
        } else {
            toast.error(result.error || "Failed to update header");
        }
        setSaving(false);
    };

    const handleSaveFooter = async () => {
        setSaving(true);
        const result = await updateFooterData({
            logoImage: footerLogoImage,
            logoText: footerLogoText,
            description: footerDescription,
            sections: footerSections,
            social: footerSocial,
            copyright: footerCopyright,
        });

        if (result.success) {
            toast.success("Footer updated successfully!");
        } else {
            toast.error(result.error || "Failed to update footer");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Layout className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Header & Footer Management</h1>
                        <p className="text-sm text-slate-500 font-medium">Manage your website's header and footer content</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setActiveTab("header")}
                        className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === "header"
                            ? "text-primary border-b-2 border-primary"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Header
                    </button>
                    <button
                        onClick={() => setActiveTab("footer")}
                        className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === "footer"
                            ? "text-primary border-b-2 border-primary"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Footer
                    </button>
                </div>

                {/* Header Tab */}
                {activeTab === "header" && (
                    <div className="space-y-6">
                        {/* Logo Section */}
                        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="block text-sm font-bold text-slate-700">Logo Configuration</label>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                                    Image takes priority over text
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Logo Image</label>
                                <ImageUpload 
                                    value={headerLogoImage}
                                    onChange={(url) => setHeaderLogoImage(url)}
                                    label="Upload Header Logo"
                                />
                                <p className="text-xs text-slate-500 mt-1">Recommended size: 200x80px (PNG/SVG preferred)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Logo Text (Fallback)</label>
                                <input
                                    type="text"
                                    value={headerLogoText}
                                    onChange={(e) => setHeaderLogoText(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                    placeholder="e.g., NGIT Institute"
                                />
                                <p className="text-xs text-slate-500 mt-1">This text will be displayed if no logo image is provided</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Navigation Links</label>
                                    <p className="text-xs text-slate-500 mt-1">Add custom links or choose from the available pages below.</p>
                                </div>
                                <Button
                                    onClick={() => setHeaderNav([...headerNav, { label: "", href: "" }])}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs shrink-0"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Custom Link
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-xs font-bold text-slate-500 flex items-center mr-2">Quick Add:</span>
                                {availableLinks.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setHeaderNav([...headerNav, { ...link }])}
                                        className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:border-primary hover:text-primary transition-colors font-bold"
                                    >
                                        + {link.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {headerNav.map((link, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl group transition-all">
                                        
                                        {/* Drag / Reorder Controls */}
                                        <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                                            <button 
                                                onClick={() => {
                                                    if (index === 0) return;
                                                    const updated = [...headerNav];
                                                    const temp = updated[index];
                                                    updated[index] = updated[index - 1];
                                                    updated[index - 1] = temp;
                                                    setHeaderNav(updated);
                                                }}
                                                className={`p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 hover:text-primary ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (index === headerNav.length - 1) return;
                                                    const updated = [...headerNav];
                                                    const temp = updated[index];
                                                    updated[index] = updated[index + 1];
                                                    updated[index + 1] = temp;
                                                    setHeaderNav(updated);
                                                }}
                                                className={`p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 hover:text-primary ${index === headerNav.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const updated = [...headerNav];
                                                updated[index].label = e.target.value;
                                                setHeaderNav(updated);
                                            }}
                                            className="w-1/3 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                            placeholder="Label"
                                        />
                                        <input
                                            type="text"
                                            value={link.href}
                                            onChange={(e) => {
                                                const updated = [...headerNav];
                                                updated[index].href = e.target.value;
                                                setHeaderNav(updated);
                                            }}
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                            placeholder="URL"
                                        />
                                        <Button
                                            onClick={() => setHeaderNav(headerNav.filter((_, i) => i !== index))}
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">CTA Button</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={headerCTA.label}
                                    onChange={(e) => setHeaderCTA({ ...headerCTA, label: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                    placeholder="Button Label"
                                />
                                <input
                                    type="text"
                                    value={headerCTA.href}
                                    onChange={(e) => setHeaderCTA({ ...headerCTA, href: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                    placeholder="Button URL"
                                />
                            </div>
                        </div>

                        <Button onClick={handleSaveHeader} disabled={saving} className="w-full h-12 font-bold">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "Saving..." : "Save Header"}
                        </Button>
                    </div>
                )}

                {/* Footer Tab */}
                {activeTab === "footer" && (
                    <div className="space-y-6">
                        {/* Logo Section */}
                        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="block text-sm font-bold text-slate-700">Footer Logo Configuration</label>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                                    Image takes priority over text
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Logo Image</label>
                                <ImageUpload 
                                    value={footerLogoImage}
                                    onChange={(url) => setFooterLogoImage(url)}
                                    label="Upload Footer Logo"
                                />
                                <p className="text-xs text-slate-500 mt-1">Recommended size: 200x80px (PNG/SVG preferred)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Logo Text (Fallback)</label>
                                <input
                                    type="text"
                                    value={footerLogoText}
                                    onChange={(e) => setFooterLogoText(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                    placeholder="e.g., NGIT Institute"
                                />
                                <p className="text-xs text-slate-500 mt-1">This text will be displayed if no logo image is provided</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Footer Description</label>
                            <textarea
                                value={footerDescription}
                                onChange={(e) => setFooterDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                                rows={3}
                                placeholder="Brief description about your institute"
                            />
                        </div>

                        {/* Footer Sections */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-slate-700">Footer Link Sections</label>
                                <Button
                                    onClick={() => setFooterSections([...footerSections, { title: "New Section", links: [] }])}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Section
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-xs font-bold text-slate-500 flex items-center mr-2">Quick Copy Link (Click to copy URL):</span>
                                {availableLinks.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            navigator.clipboard.writeText(link.href);
                                            toast.success(`Copied ${link.href} to clipboard!`);
                                        }}
                                        className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:border-primary hover:text-primary transition-colors font-bold"
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {footerSections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="bg-slate-50 p-4 rounded-xl space-y-3">
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => {
                                                    const updated = [...footerSections];
                                                    updated[sectionIndex].title = e.target.value;
                                                    setFooterSections(updated);
                                                }}
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                                                placeholder="Section Title"
                                            />
                                            <Button
                                                onClick={() => {
                                                    const updated = [...footerSections];
                                                    updated[sectionIndex].links.push({ label: "", href: "" });
                                                    setFooterSections(updated);
                                                }}
                                                size="sm"
                                                variant="outline"
                                                className="h-9 text-xs"
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Link
                                            </Button>
                                            <Button
                                                onClick={() => setFooterSections(footerSections.filter((_, i) => i !== sectionIndex))}
                                                size="sm"
                                                variant="outline"
                                                className="h-9 w-9 p-0 text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2 pl-4">
                                            {section.links.map((link, linkIndex) => (
                                                <div key={linkIndex} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={link.label}
                                                        onChange={(e) => {
                                                            const updated = [...footerSections];
                                                            updated[sectionIndex].links[linkIndex].label = e.target.value;
                                                            setFooterSections(updated);
                                                        }}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                                                        placeholder="Link Label"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={link.href}
                                                        onChange={(e) => {
                                                            const updated = [...footerSections];
                                                            updated[sectionIndex].links[linkIndex].href = e.target.value;
                                                            setFooterSections(updated);
                                                        }}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium"
                                                        placeholder="URL"
                                                    />
                                                    <Button
                                                        onClick={() => {
                                                            const updated = [...footerSections];
                                                            updated[sectionIndex].links = updated[sectionIndex].links.filter((_, i) => i !== linkIndex);
                                                            setFooterSections(updated);
                                                        }}
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-slate-700">Social Media</label>
                                <Button
                                    onClick={() => setFooterSocial([...footerSocial, { platform: "", url: "" }])}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Social
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {footerSocial.map((social, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl">
                                        <input
                                            type="text"
                                            value={social.platform}
                                            onChange={(e) => {
                                                const updated = [...footerSocial];
                                                updated[index].platform = e.target.value;
                                                setFooterSocial(updated);
                                            }}
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                            placeholder="Platform (e.g., Facebook)"
                                        />
                                        <input
                                            type="text"
                                            value={social.url}
                                            onChange={(e) => {
                                                const updated = [...footerSocial];
                                                updated[index].url = e.target.value;
                                                setFooterSocial(updated);
                                            }}
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                            placeholder="URL"
                                        />
                                        <Button
                                            onClick={() => setFooterSocial(footerSocial.filter((_, i) => i !== index))}
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0 text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Copyright */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Copyright Text</label>
                            <input
                                type="text"
                                value={footerCopyright}
                                onChange={(e) => setFooterCopyright(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                placeholder="© 2024 Your Institute. All rights reserved."
                            />
                        </div>

                        <Button onClick={handleSaveFooter} disabled={saving} className="w-full h-12 font-bold">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "Saving..." : "Save Footer"}
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}
