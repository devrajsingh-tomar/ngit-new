"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Play, Lock } from "lucide-react";
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
  const router = useRouter();

  const handleUnlock = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    toast.info("Initiating checkout...");

    try {
      const res = await initiateTypingSubscriptionPayment({});

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
        router.refresh();
        setIsProcessing(false);
        return;
      }

      const options = {
        key: data.key || "rzp_test_dummy",
        amount: data.amount,
        currency: data.currency,
        name: "NGIT Institute",
        description: "NGIT Typing Subscription (1 Month)",
        order_id: data.orderId,
        handler: async (response: any) => {
          const verifyRes = await verifyTypingSubscriptionPayment({
            razorpayOrderId: response.razorpay_order_id || data.orderId,
            razorpayPaymentId: response.razorpay_payment_id || "pay_dummy_123",
            razorpaySignature: response.razorpay_signature || "mock_signature_success"
          });

          if (verifyRes.data?.success) {
            toast.success("Subscription successfully activated!");
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
        disabled={isProcessing}
        onClick={handleUnlock}
        className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? "Processing..." : `Subscribe (₹${amount}/mo)`} <Lock className="w-3 h-3 ml-2" />
      </button>
    </>
  );
}
