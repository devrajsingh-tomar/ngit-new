"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  Users,
  Settings,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  UserPlus,
  Calendar,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  getAdminStenoPlansAction,
  saveStenoPlanAction,
  deleteStenoPlanAction,
  saveStenoSettingsAction,
  getAdminStenoSubscriptionsAction,
  manualActivateStenoSubscriptionAction,
  DEFAULT_STENO_PLANS
} from "@/app/actions/steno-subscription";

export default function AdminStenoPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [setting, setSetting] = useState<any>({
    freeTrialDays: 7,
    isTrialEnabled: true,
    isSubscriptionMandatory: true,
    trialBannerText: "नए छात्रों के लिए 7 दिन का फ़्री ट्रायल सक्रिय है!",
  });
  const [stats, setStats] = useState<any>({ totalActiveSubscribers: 0, totalTrialUsers: 0 });
  const [loading, setLoading] = useState(true);

  // Subscriptions Table State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsTotal, setSubsTotal] = useState(0);
  const [subsPage, setSubsPage] = useState(1);
  const [subsSearch, setSubsSearch] = useState("");
  const [subsStatus, setSubsStatus] = useState("ALL");
  const [subsLoading, setSubsLoading] = useState(false);

  // Plan Edit / Create Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    id: "",
    name: "",
    code: "",
    price: 99,
    originalPrice: 199,
    durationDays: 30,
    description: "",
    featuresText: "",
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  });

  // Manual Activation Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    studentId: "",
    planCode: "MANUAL",
    planName: "Offline / Manual Steno Pass",
    durationDays: 30,
    amount: 99,
    notes: "Offline cash payment",
  });

  useEffect(() => {
    loadPlansAndSettings();
  }, []);

  const loadPlansAndSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdminStenoPlansAction({});
      if (res.success && res.data) {
        setPlans(res.data.plans || []);
        if (res.data.setting) {
          setSetting(res.data.setting);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    setSubsLoading(true);
    try {
      const res = await getAdminStenoSubscriptionsAction({
        page: subsPage,
        limit: 15,
        search: subsSearch,
        status: subsStatus,
      });
      if (res.success && res.data) {
        setSubscriptions(res.data.subscriptions || []);
        setSubsTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscriptions");
    } finally {
      setSubsLoading(false);
    }
  };

  // Open Create Plan
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      id: "",
      name: "",
      code: "",
      price: 99,
      originalPrice: 199,
      durationDays: 30,
      description: "",
      featuresText: "सभी स्टेनो बैचेस का पूर्ण एक्सेस\nदैनिक ऑडियो व वीडियो डिक्टेशन\nऑटोमैटिक ट्रांसक्रिप्शन व एक्यूरेसी रिपोर्ट",
      isPopular: false,
      isActive: true,
      sortOrder: (plans.length || 0) + 1,
    });
    setIsPlanModalOpen(true);
  };

  // Open Edit Plan
  const handleOpenEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      id: plan._id,
      name: plan.name,
      code: plan.code,
      price: plan.price,
      originalPrice: plan.originalPrice || 0,
      durationDays: plan.durationDays,
      description: plan.description || "",
      featuresText: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      isPopular: !!plan.isPopular,
      isActive: plan.isActive !== false,
      sortOrder: plan.sortOrder || 1,
    });
    setIsPlanModalOpen(true);
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.code) {
      toast.error("Plan name and code are required");
      return;
    }

    const features = planForm.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const res = await saveStenoPlanAction({
      id: planForm.id || undefined,
      name: planForm.name,
      code: planForm.code,
      price: Number(planForm.price) || 0,
      originalPrice: Number(planForm.originalPrice) || 0,
      durationDays: Number(planForm.durationDays) || 30,
      description: planForm.description,
      features,
      isPopular: planForm.isPopular,
      isActive: planForm.isActive,
      sortOrder: Number(planForm.sortOrder) || 0,
    });

    if (res.success) {
      toast.success(editingPlan ? "Plan updated successfully!" : "Plan created successfully!");
      setIsPlanModalOpen(false);
      loadPlansAndSettings();
    } else {
      toast.error(res.error || "Failed to save plan");
    }
  };

  // Delete Plan
  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;
    const res = await deleteStenoPlanAction({ planId });
    if (res.success) {
      toast.success("Plan deleted successfully");
      loadPlansAndSettings();
    } else {
      toast.error(res.error || "Failed to delete plan");
    }
  };

  // Save Global Settings
  const handleSaveSettings = async () => {
    const res = await saveStenoSettingsAction({
      freeTrialDays: Number(setting.freeTrialDays) || 7,
      isTrialEnabled: setting.isTrialEnabled,
      isSubscriptionMandatory: setting.isSubscriptionMandatory,
      trialBannerText: setting.trialBannerText,
    });

    if (res.success) {
      toast.success("Steno subscription settings saved!");
      loadPlansAndSettings();
    } else {
      toast.error(res.error || "Failed to save settings");
    }
  };

  // Manual Activate
  const handleManualActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.studentId) {
      toast.error("Please enter a valid Student User ID");
      return;
    }

    const res = await manualActivateStenoSubscriptionAction({
      studentId: manualForm.studentId.trim(),
      planCode: manualForm.planCode,
      planName: manualForm.planName,
      durationDays: Number(manualForm.durationDays) || 30,
      amount: Number(manualForm.amount) || 0,
      notes: manualForm.notes,
    });

    if (res.success) {
      toast.success("Manual subscription activated successfully!");
      setIsManualModalOpen(false);
      loadSubscriptions();
    } else {
      toast.error(res.error || "Failed to activate subscription");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/steno"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Steno Overview
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Super Admin Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Steno Subscription Plans & Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage Steno plan pricing, 7-day free trial settings, Razorpay gateway integration, and student subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreatePlan}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs sm:text-sm rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" /> Add New Plan
          </Button>
          <Button
            onClick={() => setIsManualModalOpen(true)}
            variant="outline"
            className="border-slate-300 font-bold gap-2 text-xs sm:text-sm rounded-xl"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" /> Offline Activation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Paid Subscribers</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalActiveSubscribers}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Generating recurring revenue</div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Trial Students</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalTrialUsers}</div>
            <div className="text-[11px] text-amber-600 font-semibold">{setting.freeTrialDays}-day trial active</div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trial Days Setting</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{setting.freeTrialDays} Days Free</div>
            <div className="text-[11px] text-slate-500 font-semibold">New user trial window</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <TabsTrigger value="plans" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CreditCard className="w-4 h-4 mr-2" /> Subscription Plans ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings className="w-4 h-4 mr-2" /> 7-Day Trial & Global Settings
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            onClick={loadSubscriptions}
            className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 mr-2" /> Student Subscriptions List
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Plans List */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {plan.isPopular && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                    Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.isActive ? "default" : "secondary"} className="text-[10px] font-black">
                      {plan.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {plan.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {plan.description || "Steno preparation subscription pass"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                    {plan.originalPrice > plan.price && (
                      <span className="text-sm font-bold text-slate-400 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500 ml-auto">
                      {plan.durationDays} Days ({Math.round(plan.durationDays / 30)} Month)
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Features:</div>
                    {(plan.features || []).map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-slate-100 mt-6">
                  <Button
                    onClick={() => handleOpenEditPlan(plan)}
                    variant="outline"
                    className="flex-1 font-bold text-xs rounded-xl border-slate-200 gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" /> Edit Plan
                  </Button>
                  <Button
                    onClick={() => handleDeletePlan(plan._id)}
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Global Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-sm max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">7-Day Free Trial & Subscription Rules</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Configure trial window for new students and enforce subscription for Steno tests.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-600">
                  New User Free Trial Duration (in Days)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={setting.freeTrialDays}
                    onChange={(e) => setSetting({ ...setting, freeTrialDays: Number(e.target.value) })}
                    className="w-32 rounded-xl font-bold"
                  />
                  <span className="text-xs text-slate-500 font-semibold">
                    Days (default: 7 days free on registration)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-900">Enable 7-Day Free Trial</div>
                  <div className="text-xs text-slate-500 font-medium">
                    New students automatically receive free Steno access for {setting.freeTrialDays} days.
                  </div>
                </div>
                <Switch
                  checked={setting.isTrialEnabled}
                  onCheckedChange={(checked) => setSetting({ ...setting, isTrialEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-900">Mandatory Subscription</div>
                  <div className="text-xs text-slate-500 font-medium">
                    After trial expiry, students must subscribe to unlock Steno tests and dictations.
                  </div>
                </div>
                <Switch
                  checked={setting.isSubscriptionMandatory}
                  onCheckedChange={(checked) => setSetting({ ...setting, isSubscriptionMandatory: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-600">
                  Trial Announcement Banner Text
                </Label>
                <Input
                  value={setting.trialBannerText || ""}
                  onChange={(e) => setSetting({ ...setting, trialBannerText: e.target.value })}
                  placeholder="नए छात्रों के लिए 7 दिन का फ़्री ट्रायल सक्रिय है!"
                  className="rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button
                onClick={handleSaveSettings}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
              >
                Save Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Subscriptions List */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search student by name, email, or mobile..."
                  value={subsSearch}
                  onChange={(e) => setSubsSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadSubscriptions()}
                  className="pl-9 rounded-xl font-medium"
                />
              </div>
              <Button onClick={loadSubscriptions} variant="outline" className="rounded-xl font-bold">
                Search
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {["ALL", "ACTIVE", "EXPIRED", "PENDING"].map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={subsStatus === st ? "default" : "outline"}
                  onClick={() => {
                    setSubsStatus(st);
                    setTimeout(loadSubscriptions, 50);
                  }}
                  className={`rounded-xl text-xs font-bold ${subsStatus === st ? "bg-slate-900" : ""}`}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>

          {/* Subscriptions Table */}
          <Card className="rounded-3xl border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Plan / Type</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {subsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading subscriptions...
                      </td>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No subscriptions found matching filter.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.userId?.name || "Student"}</div>
                          <div className="text-[11px] text-slate-500">{sub.userId?.email}</div>
                          {sub.userId?.mobile && (
                            <div className="text-[10px] text-slate-400">{sub.userId.mobile}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.planName}</div>
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">
                            Method: {sub.paymentType}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {sub.planCode}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹{sub.amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            className={`text-[10px] font-black uppercase ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : sub.status === "EXPIRED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>Start: {new Date(sub.startDate).toLocaleDateString()}</div>
                          <div className="font-bold">Expires: {new Date(sub.endDate).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Create / Edit Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 bg-white border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingPlan ? "Edit Subscription Plan" : "Create Steno Subscription Plan"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSavePlan} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Plan Name *</Label>
                <Input
                  required
                  placeholder="e.g. 1 Month Steno Pass"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Plan Code (Unique) *</Label>
                <Input
                  required
                  placeholder="e.g. MONTHLY"
                  value={planForm.code}
                  onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.toUpperCase() })}
                  className="rounded-xl font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Selling Price (₹) *</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Original Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={planForm.originalPrice}
                  onChange={(e) => setPlanForm({ ...planForm, originalPrice: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Duration (Days) *</Label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={planForm.durationDays}
                  onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-600">Short Description</Label>
              <Input
                placeholder="e.g. शुरुआती अभ्यास के लिए 30 दिनों का संपूर्ण एक्सेस"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                className="rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-600">
                Features List (1 line per feature)
              </Label>
              <Textarea
                rows={4}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                value={planForm.featuresText}
                onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                className="rounded-xl font-medium text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={planForm.isPopular}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, isPopular: checked })}
                />
                <Label className="text-xs font-bold text-slate-700">Mark as Popular</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={planForm.isActive}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
                />
                <Label className="text-xs font-bold text-slate-700">Active (Visible to Students)</Label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => setIsPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
                Save Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Activation Modal */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 bg-white border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Offline Manual Steno Activation
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManualActivate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-600">Student User ID (MongoDB _id) *</Label>
              <Input
                required
                placeholder="Paste Student ObjectId..."
                value={manualForm.studentId}
                onChange={(e) => setManualForm({ ...manualForm, studentId: e.target.value })}
                className="rounded-xl font-bold font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Duration (Days)</Label>
                <Input
                  type="number"
                  min={1}
                  value={manualForm.durationDays}
                  onChange={(e) => setManualForm({ ...manualForm, durationDays: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Amount Paid (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-600">Admin Notes / Receipt Ref</Label>
              <Input
                value={manualForm.notes}
                onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                placeholder="Offline cash payment received at institute"
                className="rounded-xl font-medium text-xs"
              />
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => setIsManualModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
                Activate Subscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
