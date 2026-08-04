"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  Calendar, 
  Clock, 
  Award, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Play
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { 
  initiateTypingSubscriptionPayment, 
  verifyTypingSubscriptionPayment, 
  getActiveTypingSubscriptionAction 
} from "@/app/actions/subscription";

export default function StudentSubscriptionPage() {
  const [activeSub, setActiveSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "QUARTERLY" | "HALF_YEARLY">("QUARTERLY");
  const router = useRouter();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const res = await getActiveTypingSubscriptionAction({});
      if (res.success && res.data) {
        setActiveSub(res.data.subscription);
      }
    } catch (err) {
      console.error("Failed to load active subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    toast.info("Initiating checkout...");

    try {
      const res = await initiateTypingSubscriptionPayment({ planType: selectedPlan });

      if (res.error) {
        toast.error(res.error || "Failed to initiate payment");
        setIsProcessing(false);
        return;
      }

      const data = res.data;
      if (!data) {
        toast.error("Invalid payment metadata returned");
        setIsProcessing(false);
        return;
      }

      if (data.instant) {
        toast.success("Subscription is already active!");
        loadSubscription();
        setIsProcessing(false);
        return;
      }

      const options = {
        key: data.key || "rzp_test_dummy",
        amount: data.amount,
        currency: data.currency,
        name: "NGIT Institute",
        description: `NGIT Typing License (${selectedPlan === "MONTHLY" ? "1 Month" : selectedPlan === "QUARTERLY" ? "3 Months" : "6 Months"})`,
        order_id: data.orderId,
        handler: async (response: any) => {
          const verifyRes = await verifyTypingSubscriptionPayment({
            razorpayOrderId: response.razorpay_order_id || data.orderId,
            razorpayPaymentId: response.razorpay_payment_id || "pay_dummy_123",
            razorpaySignature: response.razorpay_signature || "mock_signature_success"
          });

          if (verifyRes.data?.success) {
            toast.success("Subscription successfully activated!");
            loadSubscription();
          } else {
            toast.error(verifyRes.error || "Payment verification failed");
          }
        },
        prefill: {
          name: data.userName,
          email: data.userEmail,
        },
        theme: { color: "#4f46e5" },
      };

      // Mock checkout simulator
      if (data.orderId?.startsWith("order_mock_")) {
        setTimeout(async () => {
          toast.info("Simulating payment gateway...");
          const verifyRes = await verifyTypingSubscriptionPayment({
            razorpayOrderId: data.orderId,
            razorpayPaymentId: "pay_dummy_123",
            razorpaySignature: "mock_signature_success"
          });
          if (verifyRes.data?.success) {
            toast.success("Subscription activated successfully (Sandbox)");
            loadSubscription();
          } else {
            toast.error(verifyRes.error || "Sandbox verification failed");
          }
        }, 1000);
        setIsProcessing(false);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setIsProcessing(false);
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during checkout");
      setIsProcessing(false);
    }
  };

  const plans = [
    { 
      id: "MONTHLY", 
      title: "1 Month Plan", 
      price: 21, 
      desc: "Perfect for quick revision and steno pattern practice.",
      badge: "Starter",
      period: "/ month"
    },
    { 
      id: "QUARTERLY", 
      title: "3 Months Plan", 
      price: 51, 
      desc: "Recommended. Best for complete typing syllabus & mock tests.",
      badge: "Best Seller",
      period: "/ 3 months"
    },
    { 
      id: "HALF_YEARLY", 
      title: "6 Months Plan", 
      price: 99, 
      desc: "Best savings. Ideal for candidates targets multiple gov exams.",
      badge: "Best Value",
      period: "/ 6 months"
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isSubActive = activeSub && new Date(activeSub.endDate) > new Date();

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Typing Simulator <span className="text-primary">License</span></h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Purchase or Extend Typing Exam Simulator Access</p>
      </div>

      {/* Subscription Status Card */}
      <Card className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 ${
        isSubActive ? "border-emerald-100 bg-emerald-50/10" : "border-amber-100 bg-amber-50/10"
      }`}>
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {isSubActive ? (
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px]">Active License</span>
            ) : (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px]">No Active License</span>
            )}
          </div>
          
          {isSubActive ? (
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Your Typing Simulator access is active!</h3>
              <p className="text-slate-600 font-bold text-sm leading-relaxed flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-emerald-600 shrink-0" /> Starts: {new Date(activeSub.startDate).toLocaleDateString()}</span>
                <span className="text-slate-350">•</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-600 shrink-0" /> Expires: {new Date(activeSub.endDate).toLocaleDateString()}</span>
              </p>
              <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mt-2">
                Active Plan: <span className="text-slate-900 font-black">{activeSub.planType}</span> • Amount Paid: <span className="text-slate-900 font-black">₹{activeSub.amount}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Unlock all official exam typing tests!</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                You are currently on the free tier. Try the 3 free oldest active typing tests in any government exam category, then subscribe to unlock unlimited tests.
              </p>
            </div>
          )}
        </div>

        {isSubActive && (
          <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-emerald-150 shadow-sm min-w-[200px]">
            <Award className="w-12 h-12 text-emerald-500 mb-2 stroke-[2.5]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Remaining</p>
            <p className="text-3xl font-black text-slate-800 mt-1">
              {Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days
            </p>
          </div>
        )}
      </Card>

      {/* Plans Selection Area */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900">Select Access Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card 
              key={p.id}
              onClick={() => setSelectedPlan(p.id as any)}
              className={`p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative hover:shadow-xl ${
                selectedPlan === p.id 
                  ? "border-indigo-600 bg-indigo-50/5 shadow-indigo-100 shadow-md" 
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              {selectedPlan === p.id && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {p.badge}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-1 mt-2">
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{p.title}</h4>
                  <p className="text-xs text-slate-450 font-bold leading-relaxed">{p.desc}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100/80 mt-6 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-950">₹{p.price}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.period}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Call To Action Proceed Button */}
      <Card className="p-8 rounded-[2rem] border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-650 shrink-0 stroke-[2.5]" />
          <div>
            <p className="font-extrabold text-slate-800 text-sm">Flexible Duration Licenses</p>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Cancel anytime • Unlimited mock attempts</p>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full sm:w-auto h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? "Processing..." : `Proceed to Pay (₹${selectedPlan === "MONTHLY" ? 21 : selectedPlan === "QUARTERLY" ? 51 : 99})`}
          <Play className="w-3.5 h-3.5 fill-white" />
        </button>
      </Card>
    </div>
  );
}
