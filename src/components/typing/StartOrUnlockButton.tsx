"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Play, Lock, CheckCircle2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { initiateTypingSubscriptionPayment, verifyTypingSubscriptionPayment } from "@/app/actions/subscription";

interface StartOrUnlockButtonProps {
  testId: string;
  isPaid: boolean;
  isUnlocked: boolean;
  amount: number;
  duration: number;
  langFormatted: string;
}

export default function StartOrUnlockButton({
  testId,
  isPaid,
  isUnlocked,
  amount,
  duration,
  langFormatted
}: StartOrUnlockButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "QUARTERLY" | "HALF_YEARLY">("MONTHLY");
  const router = useRouter();

  const handleUnlock = async () => {
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
        setShowModal(false);
        router.refresh();
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
            setShowModal(false);
            router.refresh();
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
            setShowModal(false);
            router.refresh();
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

  if (!isPaid || isUnlocked) {
    return (
      <button
        onClick={() => {
          router.push(`/typing/exam/${testId}?lang=${langFormatted}&layout=${langFormatted === 'English' ? 'English' : 'Inscript'}`);
        }}
        className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-650 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
      >
        Start <Play className="w-3 h-3 ml-2" />
      </button>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
      >
        Subscribe <Lock className="w-3 h-3 ml-2" />
      </button>

      {/* PLAN SELECTOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-slate-150 animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] text-left">
            <header className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> Typing Simulator
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Choose Your Access Plan</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Get full access to all typing exam passages</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="overflow-y-auto flex-1 pr-1 space-y-4 py-1">
              {[
                { 
                  id: "MONTHLY", 
                  title: "1 Month License", 
                  price: 21, 
                  desc: "Ideal for short term preparation & exam quick revision.",
                  badge: "Starter"
                },
                { 
                  id: "QUARTERLY", 
                  title: "3 Months (Quarterly)", 
                  price: 51, 
                  desc: "Recommended plan. Perfect for thorough exam practice & mock tests.",
                  badge: "Popular"
                },
                { 
                  id: "HALF_YEARLY", 
                  title: "6 Months License", 
                  price: 99, 
                  desc: "Best value. Best for multi-exam preparations and steno training.",
                  badge: "Best Value"
                }
              ].map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative flex justify-between items-center ${
                    selectedPlan === plan.id 
                      ? "border-indigo-600 bg-indigo-50/10 shadow-lg shadow-indigo-100" 
                      : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{plan.title}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        selectedPlan === plan.id 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-150 text-slate-500"
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{plan.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-slate-900">₹{plan.price}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">one-time charge</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
              <button
                disabled={isProcessing}
                onClick={handleUnlock}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? "Processing..." : `Subscribe Now (₹${selectedPlan === "MONTHLY" ? 21 : selectedPlan === "QUARTERLY" ? 51 : 99})`}
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Secure Payment processed via Razorpay Gateway</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
