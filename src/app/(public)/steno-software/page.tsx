import React from "react";
import Link from "next/link";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Volume2, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Video, 
  Award,
  PlayCircle
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Best Steno Software Online | Steno Dictation & Transcription Practice | NGIT",
  description: "Practice Stenography online with NGIT's Steno dictation software. Features audio & YouTube video dictations, target WPM speed controls, automatic transcription evaluation, and mistake breakdown.",
  path: "/steno-software",
});

export default function StenoSoftwareLandingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Steno Software", url: "/steno-software" },
  ]);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NGIT Online Steno Software",
    operatingSystem: "Web-Based (Windows, Chrome, Edge, Mobile)",
    applicationCategory: "EducationalApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: "Online Stenography dictation and transcription evaluation software supporting YouTube video dictations, WPM speed controls, and automatic mistake calculation.",
  };

  const faqs = [
    {
      q: "How does NGIT Steno Software play dictations?",
      a: "NGIT Steno Software supports MP3 audio, direct video, and embedded YouTube video dictations. Students can watch dictation videos and control target WPM speed."
    },
    {
      q: "Can I adjust the target WPM speed during steno dictation?",
      a: "Yes! You can choose from Original speed, 60 WPM, 80 WPM, 100 WPM, or 120 WPM, with optional speed fluctuation settings."
    },
    {
      q: "How are steno transcription mistakes evaluated?",
      a: "Upon completing transcription, NGIT automatically compares your typed transcript word-by-word against the original master transcript, calculating full mistakes, half mistakes, net words, and percentage accuracy."
    },
    {
      q: "Which exams can I prepare for using NGIT Steno Software?",
      a: "NGIT provides official passage sets and exam presets for UPSSSC Steno, SSC Steno Grade C & D, High Court Stenographer, and state Stenography tests."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={[breadcrumbSchema, softwareSchema]} />

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> ONLINE STENOGRAPHY PLATFORM
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Best Steno Software Online for Dictation & Transcription
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg md:text-xl font-medium leading-relaxed">
              NGIT Steno Software provides high-quality audio and YouTube video dictations, target WPM speed controls, real-time transcription practice, and automatic mistake evaluation for UPSSSC, SSC, and High Court Steno exams.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/steno">
                <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm sm:text-base rounded-2xl shadow-lg gap-2">
                  <PlayCircle className="w-5 h-5" /> Start Steno Practice
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

      {/* 2. CORE FEATURES */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Powerful Features for Steno Aspirants
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Everything you need to master Stenography shorthand dictation and transcription.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">YouTube & Video Dictation</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Listen to dictations via embedded YouTube video player or audio streams with full playback synchronization.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Target WPM Speed Controls</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Choose dictation speed targets (60, 80, 100, 120 WPM) with optional fluctuation levels to build exam confidence.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Automatic Mistake Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Get immediate evaluation of full mistakes, half mistakes, omitted words, and accuracy percentages upon submitting transcriptions.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. EXAM PREPARATION Presets */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
              Government Steno Exam Preparation
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Practice official passage series customized for leading Stenography recruitment examinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900">UPSSSC Steno Exam</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Passage dictations tailored for Uttar Pradesh Subordinate Services Selection Commission Stenographer tests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900">SSC Steno Grade C & D</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                80 WPM and 100 WPM English and Hindi dictations specifically modeled after Staff Selection Commission standards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900">High Court Stenographer</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Legal dictation passages with legal terminology and rigorous accuracy calculation for court steno exams.
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
              Got questions about NGIT Steno Software? Find answers below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 rounded-2xl border-slate-200 bg-white shadow-xs space-y-2">
                <h3 className="text-sm font-black text-slate-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
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
        <div className="bg-purple-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Start Your Online Steno Dictation Practice Today
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm font-medium max-w-xl mx-auto">
            Experience real-time dictation playback, target speed controls, and automatic transcription evaluation.
          </p>
          <Link href="/steno" className="inline-block">
            <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm rounded-xl gap-2 shadow-lg">
              Explore Steno Dictations <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
