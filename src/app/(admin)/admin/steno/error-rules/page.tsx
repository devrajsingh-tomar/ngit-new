"use client";

import { useEffect, useState } from "react";
import {
  getStenoErrorRulesAction,
  createStenoErrorRuleAction,
  updateStenoErrorRuleAction,
  deleteStenoErrorRuleAction,
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
  Sliders,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminStenoErrorRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    ruleName: "",
    authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
    examType: "UPSSSC",
    description: "",
    spellingErrorWeight: 1.0,
    matraErrorWeight: 0.5,
    punctuationErrorWeight: 0.5,
    addedWordWeight: 1.0,
    skippedWordWeight: 1.0,
    spacingTranspositionWeight: 0.5,
    mistakeExemptionCount: 20,
    ignoreChandrabindu: true,
    maxErrorPercentAllowed: 5.0,
    backspaceMode: "full",
    isDefault: false,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    const res = await getStenoErrorRulesAction();
    if (res.success && res.rules) {
      setRules(res.rules);
    } else {
      toast.error(res.error || "Failed to load evaluation rules");
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormData({
      ruleName: "",
      authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
      examType: "UPSSSC",
      description: "",
      spellingErrorWeight: 1.0,
      matraErrorWeight: 0.5,
      punctuationErrorWeight: 0.5,
      addedWordWeight: 1.0,
      skippedWordWeight: 1.0,
      spacingTranspositionWeight: 0.5,
      mistakeExemptionCount: 20,
      ignoreChandrabindu: true,
      maxErrorPercentAllowed: 5.0,
      backspaceMode: "full",
      isDefault: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditModal = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      ruleName: rule.ruleName || "",
      authorityName: rule.authorityName || "",
      examType: rule.examType || "General",
      description: rule.description || "",
      spellingErrorWeight: rule.spellingErrorWeight ?? 1.0,
      matraErrorWeight: rule.matraErrorWeight ?? 0.5,
      punctuationErrorWeight: rule.punctuationErrorWeight ?? 0.5,
      addedWordWeight: rule.addedWordWeight ?? 1.0,
      skippedWordWeight: rule.skippedWordWeight ?? 1.0,
      spacingTranspositionWeight: rule.spacingTranspositionWeight ?? 0.5,
      mistakeExemptionCount: rule.mistakeExemptionCount ?? 20,
      ignoreChandrabindu: rule.ignoreChandrabindu !== false,
      maxErrorPercentAllowed: rule.maxErrorPercentAllowed ?? 5.0,
      backspaceMode: rule.backspaceMode || "full",
      isDefault: Boolean(rule.isDefault),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruleName.trim()) {
      toast.error("Marking Scheme / Rule Name is required");
      return;
    }

    const payload = {
      ...formData,
      ruleName: formData.ruleName.trim(),
      authorityName: formData.authorityName.trim(),
      description: formData.description.trim(),
      spellingErrorWeight: Number(formData.spellingErrorWeight),
      matraErrorWeight: Number(formData.matraErrorWeight),
      punctuationErrorWeight: Number(formData.punctuationErrorWeight),
      addedWordWeight: Number(formData.addedWordWeight),
      skippedWordWeight: Number(formData.skippedWordWeight),
      spacingTranspositionWeight: Number(formData.spacingTranspositionWeight),
      mistakeExemptionCount: Number(formData.mistakeExemptionCount),
      maxErrorPercentAllowed: Number(formData.maxErrorPercentAllowed),
    };

    if (editingRule) {
      const res = await updateStenoErrorRuleAction(editingRule._id, payload);
      if (res.success) {
        toast.success("Evaluation Scheme updated successfully!");
        setIsDialogOpen(false);
        loadRules();
      } else {
        toast.error(res.error || "Failed to update rule");
      }
    } else {
      const res = await createStenoErrorRuleAction(payload);
      if (res.success) {
        toast.success("New Evaluation Scheme created!");
        setIsDialogOpen(false);
        loadRules();
      } else {
        toast.error(res.error || "Failed to create rule");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this evaluation rule scheme?")) return;
    const res = await deleteStenoErrorRuleAction(id);
    if (res.success) {
      toast.success("Evaluation scheme deleted");
      loadRules();
    } else {
      toast.error(res.error || "Failed to delete evaluation scheme");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Separate Management
            </span>
            <span className="text-xs font-bold text-slate-400">• Exam Evaluation Rules & Schemes</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Sliders className="w-6 h-6 text-orange-600" /> Exam Evaluation Rules & Marking Schemes
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure Full Mistakes, Half Mistakes, 20 Mistake Exemption, Backspace Policy, and Tolerance limits separately for government exam boards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/steno/exams">
            <Button
              variant="outline"
              className="rounded-2xl h-11 px-4 text-xs font-bold gap-2 border-slate-300"
            >
              <Award className="w-4 h-4 text-indigo-600" /> Step 2: Govt Exams →
            </Button>
          </Link>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl h-11 px-5 text-xs shadow-md gap-2"
          >
            <Plus className="w-4 h-4" /> Create Marking Scheme
          </Button>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-600" /> Loading Evaluation Rules...
        </div>
      ) : rules.length === 0 ? (
        <Card className="p-16 text-center text-slate-400 rounded-3xl border-dashed bg-white space-y-3">
          <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No Evaluation Rules Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create marking schemes for government boards like UPSSSC, SSC, and High Court.
          </p>
          <Button onClick={handleOpenCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs">
            <Plus className="w-4 h-4 mr-1" /> Add Marking Scheme
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <Card
              key={rule._id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {rule.authorityName && (
                      <span className="text-[10px] font-black uppercase bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md border border-orange-100">
                        {rule.authorityName}
                      </span>
                    )}
                    <h3 className="text-lg font-black text-slate-900 mt-2">{rule.ruleName}</h3>
                    {rule.description && (
                      <p className="text-xs text-slate-500 font-medium mt-1">{rule.description}</p>
                    )}
                  </div>
                  {rule.isDefault && (
                    <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                      DEFAULT SCHEME
                    </span>
                  )}
                </div>

                {/* Evaluation Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-semibold">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Spelling Error (वर्तनी)</span>
                    <p className="text-slate-800 font-extrabold">{rule.spellingErrorWeight === 1 ? "Full (1.0)" : `Weight: ${rule.spellingErrorWeight}`}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Maatra / Vachan (मात्रा)</span>
                    <p className="text-slate-800 font-extrabold">{rule.matraErrorWeight === 0.5 ? "Half (0.5)" : `Weight: ${rule.matraErrorWeight}`}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Punctuation Error</span>
                    <p className="text-slate-800 font-extrabold">{rule.punctuationErrorWeight === 0 ? "No Penalty (0)" : `Weight: ${rule.punctuationErrorWeight}`}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Added / Skipped Words</span>
                    <p className="text-slate-800 font-extrabold">Full (1.0)</p>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
                    <span className="text-[10px] text-emerald-700 uppercase font-black">Mistake Exemption (छूट)</span>
                    <p className="text-emerald-900 font-black">{rule.mistakeExemptionCount || 0} अशुद्धियों की छूट</p>
                  </div>

                  <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 space-y-0.5">
                    <span className="text-[10px] text-indigo-700 uppercase font-black">Max Error Limit</span>
                    <p className="text-indigo-900 font-black">{rule.maxErrorPercentAllowed || 5}% Tolerance</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 text-[11px] font-bold text-slate-600">
                  <span>• Backspace: <strong className="text-indigo-700 font-extrabold">{rule.backspaceMode === "full" ? "Enabled (सुधार मान्य)" : rule.backspaceMode}</strong></span>
                  <span>• Chandrabindu: <strong className="text-emerald-700 font-extrabold">{rule.ignoreChandrabindu !== false ? "मान्य (No Mistake)" : "Mistake"}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  onClick={() => handleOpenEditModal(rule)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold rounded-xl gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Scheme
                </Button>
                <Button
                  onClick={() => handleDelete(rule._id)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0 bg-white">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-600" />
              {editingRule ? "Edit Evaluation Marking Scheme" : "Create Evaluation Marking Scheme"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Scheme / Rule Name *</label>
                <Input
                  value={formData.ruleName}
                  onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                  placeholder="उदा: UPSSSC Steno Official Evaluation Scheme (20 छूट)"
                  className="rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Board Authority Name</label>
                  <Input
                    value={formData.authorityName}
                    onChange={(e) => setFormData({ ...formData, authorityName: e.target.value })}
                    placeholder="उदा: उ०प्र० अधीनस्थ सेवा चयन आयोग"
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Exam Board Code / Type</label>
                  <Input
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    placeholder="उदा: UPSSSC, SSC, HighCourt, UPSI"
                    className="rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Guidelines</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="मूल्यांकन नियम विवरण..."
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Exemption & Backspace & Max Error */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-orange-950">Mistake Exemption (छूट)</label>
                  <Input
                    type="number"
                    value={formData.mistakeExemptionCount}
                    onChange={(e) => setFormData({ ...formData, mistakeExemptionCount: Number(e.target.value) })}
                    placeholder="उदा: 20"
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                  <span className="text-[10px] text-slate-400">UPSSSC हेतु 20 अशुद्धियों की छूट</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-orange-950">Max Error % Allowed</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.maxErrorPercentAllowed}
                    onChange={(e) => setFormData({ ...formData, maxErrorPercentAllowed: Number(e.target.value) })}
                    placeholder="उदा: 5.0"
                    className="rounded-xl text-xs font-semibold bg-white"
                  />
                  <span className="text-[10px] text-slate-400">अधिकतम त्रुटि प्रतिशत (5% या 7%)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-orange-950">Backspace Policy</label>
                  <select
                    value={formData.backspaceMode}
                    onChange={(e) => setFormData({ ...formData, backspaceMode: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="full">Enabled (सुधार मान्य)</option>
                    <option value="word">Same Word Only</option>
                    <option value="disabled">Disabled Completely</option>
                  </select>
                </div>
              </div>

              {/* Penalty Weights */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Mistake Penalty Weights</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Spelling Error (वर्तनी)</label>
                    <select
                      value={formData.spellingErrorWeight}
                      onChange={(e) => setFormData({ ...formData, spellingErrorWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="0">Zero Penalty (0.0)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Maatra / Vachan (मात्रा/वचन)</label>
                    <select
                      value={formData.matraErrorWeight}
                      onChange={(e) => setFormData({ ...formData, matraErrorWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0">Zero Penalty (0.0)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Punctuation Error</label>
                    <select
                      value={formData.punctuationErrorWeight}
                      onChange={(e) => setFormData({ ...formData, punctuationErrorWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0">No Penalty (0.0)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Added Words (अतिरिक्त)</label>
                    <select
                      value={formData.addedWordWeight}
                      onChange={(e) => setFormData({ ...formData, addedWordWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0.5">Half Mistake (0.5)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Skipped Words (छूटे)</label>
                    <select
                      value={formData.skippedWordWeight}
                      onChange={(e) => setFormData({ ...formData, skippedWordWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="1">Full Mistake (1.0)</option>
                      <option value="0.5">Half Mistake (0.5)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Spacing / Transposition</label>
                    <select
                      value={formData.spacingTranspositionWeight}
                      onChange={(e) => setFormData({ ...formData, spacingTranspositionWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    >
                      <option value="0.5">Half Mistake (0.5)</option>
                      <option value="1">Full Mistake (1.0)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="ignoreChandrabindu"
                    checked={formData.ignoreChandrabindu}
                    onChange={(e) => setFormData({ ...formData, ignoreChandrabindu: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <label htmlFor="ignoreChandrabindu" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Ignore Chandrabindu (ँ / ं) - अनुस्वार/अनुनासिक छूट मान्य (No Mistake)
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md">
                {editingRule ? "Save Changes" : "Create Scheme"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
