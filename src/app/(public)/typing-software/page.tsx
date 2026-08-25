import React from "react";
import Link from "next/link";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Keyboard, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Award 
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Best Typing Software Online | Hindi & English Typing Practice | NGIT",
  description: "Practice Hindi and English typing online with NGIT's exam-oriented typing software. Supports Mangal Unicode, Krutidev, Inscript, live WPM tracking, backspace rules, and government exam practice.",
  path: "/typing-software",
});

export default function TypingSoftwareLandingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Typing Software", url: "/typing-software" },
  ]);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NGIT Online Typing Software",
    operatingSystem: "Web-Based (Windows, Chrome, Edge, Mobile)",
    applicationCategory: "EducationalApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: "Online typing test software for Hindi and English typing practice supporting Mangal Unicode, Krutidev, and government exam presets.",
  };

  const faqs = [
    {
      q: "Which Hindi typing fonts are supported in NGIT Typing Software?",
      a: "NGIT Typing Software fully supports Mangal Unicode (Inscript and Remington CBI layouts), Krutidev 010, and standard English typing layouts."
    },
    {
      q: "How does NGIT calculate typing speed and accuracy?",
      a: "NGIT evaluates Gross Words Per Minute (GWPM), Net Words Per Minute (NWPM), and percentage accuracy using standard government exam formulas (5 characters = 1 word), with configurable error penalties."
    },
    {
      q: "Can I practice for specific government typing exams on NGIT?",
      a: "Yes! NGIT provides pre-configured rulesets and passage tests tailored for UPSSSC Junior Assistant, High Court, SSC CHSL, Railway, and state government typing exams."
    },
    {
      q: "Does NGIT Typing Software support backspace restriction modes?",
      a: "Yes, you can practice with Full Backspace Enabled, Restricted Backspace (word-level deletion only), or Completely Disabled Backspace to mirror actual exam rules."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={[breadcrumbSchema, softwareSchema]} />

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> EXAM-ORIENTED TYPING PLATFORM
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Best Typing Software Online for Government Exam Practice
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg md:text-xl font-medium leading-relaxed">
              NGIT is an advanced online typing software designed for students and government exam aspirants. Practice Hindi and English typing with exact exam environments, Mangal & Krutidev font support, and real-time WPM speed tracking.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/typing">
                <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm sm:text-base rounded-2xl shadow-lg gap-2">
                  <Keyboard className="w-5 h-5" /> Start Free Typing Practice
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-slate-700 bg-slate-950/50 hover:bg-slate-900 text-white font-bold h-12 px-6 text-sm rounded-2xl">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Why Students Choose NGIT Typing Software
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Designed to match official exam interfaces and evaluation formulas for peak performance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Keyboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Hindi & English Typing</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Seamlessly switch between Hindi and English typing passages with custom time limits and custom paragraph tests.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Mangal & Krutidev Fonts</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Full support for Mangal Unicode (Inscript / Remington CBI) and Krutidev 010 fonts used in state and central government exams.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Speed & Accuracy Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Detailed post-test analytics showing Gross WPM, Net WPM, accuracy %, key strokes, error breakdown, and mistake highlights.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. SUPPORTED FONTS DETAILED BREAKDOWN */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
              Supported Typing Fonts & Layouts
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              NGIT Typing Software provides complete support for all major font layouts required by government exam boards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900">Mangal Unicode</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Standard Unicode layout widely mandated by SSC, High Courts, and UPSSSC for modern government typing tests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900">Krutidev 010</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Traditional Remington-style Hindi font popular in state government exams, court typing tests, and departmental tests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900">Inscript Layout</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Official standardized keyboard layout for Indian languages approved by the Government of India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Got questions about NGIT Typing Software? Find answers below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-2">
                <h3 className="text-sm font-black text-slate-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6 font-medium">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="container mx-auto px-4 lg:px-10">
        <div className="bg-indigo-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Boost Your Typing Speed?
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm font-medium max-w-xl mx-auto">
            Join thousands of students practicing daily on NGIT. Test your speed in Hindi and English with live exam feedback.
          </p>
          <Link href="/typing" className="inline-block">
            <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm rounded-xl gap-2 shadow-lg">
              Start Typing Practice Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
