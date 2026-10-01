"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Award, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Play,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Mic,
  Headphones,
  Lock,
  Unlock,
  Layers,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  checkStenoAccessAction,
  getStenoSubscriptionPlansAction,
  initiateStenoSubscriptionPaymentAction,
  verifyStenoSubscriptionPaymentAction
} from "@/app/actions/steno-subscription";

export default function StudentStenoSubscribePage() {
  const router = useRouter();
  const [accessState, setAccessState] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accessRes, plansRes] = await Promise.all([
        checkStenoAccessAction({}),
        getStenoSubscriptionPlansAction({}),
      ]);

      if (accessRes.success && accessRes.data) {
        setAccessState(accessRes.data);
      }

      if (plansRes.success && plansRes.data && plansRes.data.plans) {
        setPlans(plansRes.data.plans);
        // Default select the popular plan or first plan
        const popular = plansRes.data.plans.find((p: any) => p.isPopular);
        if (popular) {
          setSelectedPlanId(popular._id);
        } else if (plansRes.data.plans.length > 0) {
          setSelectedPlanId(plansRes.data.plans[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load subscription data:", err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      toast.error("कृपया एक प्लान चुनें");
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    toast.info("भुगतान प्रक्रिया शुरू हो रही है...");

    try {
      const res = await initiateStenoSubscriptionPaymentAction({ planId: selectedPlanId });

      if (!res.success) {
        toast.error(res.error || "Failed to initiate payment");
        setIsProcessing(false);
        return;
      }

      const data = res.data;
      if (!data) {
        toast.error("Payment initiation failed");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: data.key || "rzp_test_dummy",
        amount: data.amount,
        currency: data.currency || "INR",
        name: "NGIT Steno Shorthand Portal",
        description: `${data.planName} (${data.durationDays} Days Access)`,
        order_id: data.orderId,
        handler: async (response: any) => {
          toast.info("सत्यापन हो रहा है, कृपया प्रतीक्षा करें...");
          const verifyRes = await verifyStenoSubscriptionPaymentAction({
            razorpayOrderId: response.razorpay_order_id || data.orderId,
            razorpayPaymentId: response.razorpay_payment_id || "pay_dummy_123",
            razorpaySignature: response.razorpay_signature || "mock_signature_success",
          });

          if (verifyRes.success) {
            toast.success("बधाई हो! आपकी स्टेनो सदस्यता सफलतापूर्वक सक्रिय हो गई है 🎉");
            await loadData();
            setTimeout(() => {
              router.push("/student/steno/series");
            }, 1200);
          } else {
            toast.error(verifyRes.error || "Payment verification failed");
          }
        },
        prefill: {
          name: data.userName,
          email: data.userEmail,
        },
        theme: { color: "#059669" },
      };

      // Mock Sandbox Checkout Simulator (if Razorpay keys are not provided yet in .env)
      if (data.orderId?.startsWith("order_mock_")) {
        toast.info("Sandbox Mode: Simulating secure gateway payment...");
        setTimeout(async () => {
          const verifyRes = await verifyStenoSubscriptionPaymentAction({
            razorpayOrderId: data.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: "mock_signature_success",
          });

          if (verifyRes.success) {
            toast.success("सदस्यता सक्रिय हो गई (Sandbox Demo Mode) 🎉");
            await loadData();
            setTimeout(() => {
              router.push("/student/steno/series");
            }, 1200);
          } else {
            toast.error(verifyRes.error || "Sandbox verification failed");
          }
          setIsProcessing(false);
        }, 1200);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error?.description || "Payment was cancelled or failed.");
        setIsProcessing(false);
      });
      rzp.open();
      setIsProcessing(false);
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Checkout failed");
      setIsProcessing(false);
    }
  };

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Back Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/student/steno/series"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> स्टेनो बैचेस पर वापस जाएं
            </Link>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout
            </Badge>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-emerald-500/20">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full border border-emerald-500/30 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Crown className="w-4 h-4 text-amber-400" /> NGIT Steno Pro Access
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                शॉर्टहैंड में सफलता की गारंटी • <span className="text-emerald-400">स्टेनो प्रो पास</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                उत्तर प्रदेश अधीनस्थ सेवा चयन आयोग (UPSSSC), इलाहाबाद हाई कोर्ट, UP SI और SSC स्टेनो ग्रेड C & D के लिए 
                दैनिक ऑडियो डिक्टेशन, रियल एग्जाम स्पीड फ्लक्चुएशन, और सटीक ऑटो-मूल्यांकन।
              </p>
            </div>

            {/* Background glowing orb */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Current Access Status Notice */}
          {accessState && (
            <div>
              {accessState.isSubscribed && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                        सक्रिय सदस्यता (Active Subscription)
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {accessState.subscription?.planName || "Steno Pro Plan"}
                      </div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        वैधता: {new Date(accessState.subscription?.endDate).toLocaleDateString("hi-IN")} ({accessState.daysLeft} दिन शेष)
                      </div>
                    </div>
                  </div>
                  <Link href="/student/steno/series">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 rounded-xl gap-2 text-sm shadow-md">
                      <Play className="w-4 h-4 fill-white" /> टेस्ट शुरू करें
                    </Button>
                  </Link>
                </div>
              )}

              {accessState.isTrialActive && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-800 uppercase tracking-wider">
                        फ़्री ट्रायल सक्रिय (Free 7-Day Trial Active)
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        आपके फ़्री ट्रायल के {accessState.daysLeftInTrial} दिन शेष हैं!
                      </div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        ट्रायल समाप्ति: {new Date(accessState.trialEndDate).toLocaleDateString("hi-IN")} • बिना किसी रुकावट के जारी रखने के लिए अभी सब्सक्राइब करें।
                      </div>
                    </div>
                  </div>
                  <Link href="/student/steno/series">
                    <Button variant="outline" className="border-amber-500 text-amber-900 hover:bg-amber-100 font-black px-5 rounded-xl text-sm">
                      ट्रायल में टेस्ट दें <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}

              {accessState.trialExpired && !accessState.isSubscribed && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-rose-800 uppercase tracking-wider">
                        फ़्री ट्रायल समाप्त (Free Trial Expired)
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        आपका 7 दिन का फ़्री ट्रायल समाप्त हो चुका है।
                      </div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        स्टेनो टेस्ट, डिक्टेशन प्लेयर और रैंकिंग एक्सेस करने के लिए कृपया नीचे से कोई प्लान चुनें।
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Plans Grid */}
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                अपना उपयुक्त प्लान चुनें
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                किफायती दाम, संपूर्ण डिक्टेशन सामग्री, और असीमित अभ्यास की सुविधा।
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-3xl bg-slate-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan._id;
                  const discountPercent = plan.originalPrice && plan.originalPrice > plan.price
                    ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)
                    : 0;

                  return (
                    <Card
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={`relative p-7 sm:p-8 rounded-[2rem] cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? "border-2 border-emerald-500 bg-white shadow-2xl ring-4 ring-emerald-500/10 scale-[1.02]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                      }`}
                    >
                      {/* Popular Badge */}
                      {plan.isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Most Popular
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              {plan.durationDays} Days Plan
                            </span>
                            {discountPercent > 0 && (
                              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mt-1">{plan.name}</h3>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                              ₹{plan.price}
                            </span>
                            {plan.originalPrice > plan.price && (
                              <span className="text-base font-bold text-slate-400 line-through">
                                ₹{plan.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">
                            कुल अवधि: {plan.durationDays} दिन ({Math.round(plan.durationDays / 30)} माह)
                          </span>
                        </div>

                        {/* Features List */}
                        <div className="space-y-2.5 pt-2">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                            शामिल सुविधाएं:
                          </span>
                          {(plan.features && plan.features.length > 0
                            ? plan.features
                            : [
                                "सभी स्टेनो बैचेस का पूर्ण एक्सेस",
                                "दैनिक लीगल व एडिटोरियल डिक्टेशन",
                                "रियल टाइम ऑडियो प्लेयर व स्पीड कंट्रोल",
                                "ऑटोमैटिक ट्रांसक्रिप्शन एक्यूरेसी रिपोर्ट",
                                "साप्ताहिक टेस्ट व लाइव रैंकिंग",
                              ]
                          ).map((feat: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-snug">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select / Radio Indicator */}
                      <div className="pt-6 border-t border-slate-100 mt-6">
                        <div
                          className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm text-center transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "चयनित (Selected)" : "यह प्लान चुनें"}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Bottom Checkout CTA Bar */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-emerald-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                  <Zap className="w-4 h-4 fill-emerald-600" /> Instant Activation Guarantee
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900">
                  {selectedPlan ? (
                    <>
                      {selectedPlan.name} • <span className="text-emerald-600 font-black">₹{selectedPlan.price}</span> ({selectedPlan.durationDays} दिन)
                    </>
                  ) : (
                    "कृपया कोई एक प्लान चुनें"
                  )}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Razorpay सुरक्षित गेटवे द्वारा UPI, GPay, PhonePe, Paytm, नेट बैंकिंग व कार्ड्स द्वारा भुगतान।
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isProcessing || !selectedPlanId}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 sm:h-16 px-10 rounded-2xl shadow-xl hover:shadow-2xl text-base sm:text-lg gap-3 transition-all shrink-0"
              >
                {isProcessing ? (
                  "प्रक्रिया जारी है..."
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> अभी सब्सक्राइब करें (₹{selectedPlan?.price || 0}) <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Original Audio Dictations</h4>
              <p className="text-xs text-slate-500 font-medium">
                अनुभवी शिक्षकों द्वारा रिकॉर्ड की गई उच्च गुणवत्ता वाली ऑडियो डिक्टेशन।
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Speed Range 60-120 WPM</h4>
              <p className="text-xs text-slate-500 font-medium">
                शुरुआती से लेकर उन्नत स्तर तक, गति परिवर्तन (Speed Fluctuation) के साथ अभ्यास।
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Instant Exam Evaluation</h4>
              <p className="text-xs text-slate-500 font-medium">
                सरकारी परीक्षा नियमों (UPSSSC, High Court) के अनुसार फुल और हाफ मिस्टेक का सटीक मूल्यांकन।
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
