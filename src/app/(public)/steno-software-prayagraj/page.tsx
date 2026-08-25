import React from "react";
import Link from "next/link";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Volume2, 
  Video, 
  BarChart3, 
  ArrowRight, 
  HelpCircle, 
  PlayCircle 
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Best Steno Software in Prayagraj | Online Steno Practice | NGIT",
  description: "Practice Stenography shorthand online in Prayagraj (Allahabad) with NGIT. Access audio & YouTube video dictations, target WPM speed fluctuation, and transcription tests.",
  path: "/steno-software-prayagraj",
});

export default function StenoSoftwarePrayagrajPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Steno Software Prayagraj", url: "/steno-software-prayagraj" },
  ]);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "National Genius Institute of Technology (NGIT)",
    url: "https://ngitedu.com/steno-software-prayagraj",
    telephone: "+91 80049 58441",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Prayagraj",
      addressLocality: "Prayagraj",
      addressRegion: "Uttar Pradesh",
      postalCode: "211001",
      addressCountry: "IN",
    },
    description: "Online Stenography dictation and transcription evaluation software platform for students and government exam aspirants in Prayagraj (Allahabad).",
  };

  const faqs = [
    {
      q: "Why do Steno aspirants in Prayagraj (Allahabad) use NGIT Steno Software?",
      a: "NGIT provides a web-based Steno practice environment with YouTube video/audio dictations, target WPM controls, and automatic mistake evaluation, allowing students to practice dictations from home."
    },
    {
      q: "Can I prepare for UPSSSC Steno and High Court Stenographer tests?",
      a: "Yes! NGIT features dictations and passages curated specifically for UPSSSC Steno and Allahabad High Court Stenographer exams."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <JsonLd data={[breadcrumbSchema, localBusinessSchema]} />

      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold text-xs uppercase tracking-widest">
              <MapPin className="w-4 h-4 text-purple-400" /> PRAYAGRAJ (ALLAHABAD) ONLINE STENO HUB
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Steno Software in Prayagraj for Online Practice
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg md:text-xl font-medium leading-relaxed">
              NGIT Steno Software allows Stenography aspirants in Prayagraj (Allahabad) to practice dictations, control target WPM speed, transcribe online, and receive automated mistake evaluation.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/steno">
                <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black h-12 px-8 text-sm sm:text-base rounded-2xl shadow-lg gap-2">
                  <PlayCircle className="w-5 h-5" /> Explore Steno Dictations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADVANTAGES */}
      <section className="container mx-auto px-4 lg:px-10 mb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Why Steno Aspirants in Prayagraj Choose NGIT
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Designed for convenience, accuracy, and rigorous exam preparation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Audio & YouTube Dictations</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Listen and watch dictation videos with synced playback controls and target WPM adjustments.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Speed Fluctuation Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Practice at 60, 80, 100, or 120 WPM to build speed flexibility for unpredictable exam conditions.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Instant Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Immediate feedback on full/half mistakes, net words, and accuracy percentages.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. FAQ */}
      <section className="container mx-auto px-4 lg:px-10 mb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Prayagraj Steno Software FAQ
            </h2>
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

      {/* 4. CTA */}
      <section className="container mx-auto px-4 lg:px-10">
        <div className="bg-purple-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Start Practice on Prayagraj's Premier Online Steno Platform
          </h2>
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
