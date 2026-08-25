import React from "react";
import Link from "next/link";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Keyboard, 
  CheckCircle2, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  BookOpen 
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Best Typing Software in Prayagraj | Online Typing Practice | NGIT",
  description: "NGIT offers online typing practice software for students and government exam aspirants in Prayagraj (Allahabad). Practice Hindi & English typing with Mangal, Krutidev, and exam presets.",
  path: "/typing-software-prayagraj",
});

export default function TypingSoftwarePrayagrajPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Typing Software Prayagraj", url: "/typing-software-prayagraj" },
  ]);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "National Genius Institute of Technology (NGIT)",
    url: "https://ngitedu.com/typing-software-prayagraj",
    telephone: "+91 80049 58441",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Prayagraj",
      addressLocality: "Prayagraj",
      addressRegion: "Uttar Pradesh",
      postalCode: "211001",
      addressCountry: "IN",
    },
    description: "Online typing test software platform for students and government exam aspirants in Prayagraj (Allahabad).",
  };

  const faqs = [
    {
      q: "Can students in Prayagraj (Allahabad) access NGIT Typing Software online?",
      a: "Yes! NGIT Typing Software is fully web-based. Students in Prayagraj and Allahabad can practice from home on any computer or laptop."
    },
    {
      q: "Does NGIT prepare students for UPSSSC and High Court typing exams in UP?",
      a: "Absolutely. NGIT provides official rulesets for UPSSSC, High Court Stenographer/Typist, and state government computer typing tests."
    },
    {
      q: "Are Mangal and Krutidev font layouts supported?",
      a: "Yes, both Mangal Unicode (Inscript and Remington CBI) and Krutidev 010 font layouts are built into the typing engine."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={[breadcrumbSchema, localBusinessSchema]} />

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold text-xs uppercase tracking-widest">
              <MapPin className="w-4 h-4 text-indigo-400" /> PRAYAGRAJ (ALLAHABAD) ONLINE TYPING HUB
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Best Typing Software in Prayagraj for Government Exam Practice
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg md:text-xl font-medium leading-relaxed">
              NGIT is an online typing practice and test platform designed for students and government-exam aspirants in Prayagraj (Allahabad). Practice Hindi & English typing with official exam rules from home.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/typing">
                <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm sm:text-base rounded-2xl shadow-lg gap-2">
                  <Keyboard className="w-5 h-5" /> Start Typing Test Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOCAL ADVANTAGE */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Why NGIT for Typing Practice in Prayagraj?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Empowering students in Prayagraj (Allahabad) with professional exam-level typing software.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Keyboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Online Practice from Home</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              No need to travel to computer centers. Access full Hindi and English typing tests directly on your browser anytime.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">UP Exam Oriented Presets</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Specially tuned for UPSSSC Junior Assistant, Allahabad High Court Typist/RO/ARO, and state departmental typing tests.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Mangal & Krutidev Fonts</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Full support for Mangal Unicode (Inscript / Remington CBI) and Krutidev 010 layouts required by state boards.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Prayagraj Typing Software FAQ
            </h2>
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

      {/* 4. CTA */}
      <section className="container mx-auto px-4 lg:px-10">
        <div className="bg-indigo-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Start Practice on Prayagraj's Premier Online Typing Platform
          </h2>
          <Link href="/typing" className="inline-block">
            <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm rounded-xl gap-2 shadow-lg">
              Start Free Practice Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
