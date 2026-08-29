"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  Headphones,
  PlayCircle,
  Trophy,
  BarChart3,
  Award,
  ArrowRight,
  Layers,
  FileText,
  CheckCircle2,
  Lock,
  GraduationCap,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function StenoMainLandingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Single Top Banner Image */}
        <div className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
          <img
            src="https://ngitedu.com/uploads/gallery/1787956222932-d84153c2-8f95-4d2e-8690-207c4d3b679f.jpg"
            alt="NGIT Steno Shorthand Portal"
            className="w-full h-auto object-cover rounded-[2.5rem]"
          />
        </div>

        {/* Quick Access Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              National Genius Institute of Technology • Stenography Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Explore official Steno dictation batches, speed fluctuation audio player, and government exam evaluation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/student/steno/dashboard">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 px-5 rounded-2xl shadow-md gap-2 text-xs">
                    <BarChart3 className="w-4 h-4" /> Open Student Steno Dashboard
                  </Button>
                </Link>
                <Link href="/student/steno/series">
                  <Button variant="outline" className="font-bold h-11 px-5 rounded-2xl border-slate-200 text-slate-700 text-xs gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" /> Browse Steno Batches
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login?callbackUrl=/student/steno/dashboard">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 px-5 rounded-2xl shadow-md gap-2 text-xs">
                    <Lock className="w-4 h-4" /> Student Login for Access
                  </Button>
                </Link>
                <Link href="/login?callbackUrl=/student/steno/dictation">
                  <Button variant="outline" className="font-bold h-11 px-5 rounded-2xl border-slate-200 text-slate-700 text-xs gap-2">
                    <Headphones className="w-4 h-4 text-indigo-600" /> Access Dictation Software
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Steno Batches & Series Collections</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Curated Legal, Editorial, PYQ, and Speed Building passage collections categorized for targeted speed enhancement.
            </p>
            <Link
              href={isLoggedIn ? "/student/steno/series" : "/login?callbackUrl=/student/steno/series"}
              className="inline-flex items-center text-xs font-bold text-emerald-600 hover:gap-2 transition-all"
            >
              {isLoggedIn ? "Browse Steno Batches & Series" : "Login Required to Access"} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Official Exam Presets & Evaluation</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              SSC Steno Grade C & D, Allahabad High Court, UPSSSC, and HSSC pattern shorthand exams with automated mistake calculations.
            </p>
            <Link
              href={isLoggedIn ? "/student/steno/dashboard" : "/login?callbackUrl=/student/steno/dashboard"}
              className="inline-flex items-center text-xs font-bold text-amber-600 hover:gap-2 transition-all"
            >
              {isLoggedIn ? "Open Student Dashboard" : "Login Required to Access"} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Card>
        </div>

        {/* Informational Exam Standards & Font Support Banner */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl font-black text-slate-900">Supported Stenography Exam Patterns</h2>
            <p className="text-xs text-slate-500 font-medium">
              Evaluated strictly according to official government board parameters and guidelines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">SSC Grade C & D</span>
              <p className="text-[11px] text-slate-500">80 WPM & 100 WPM • Full & Half mistake rules</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">Allahabad High Court</span>
              <p className="text-[11px] text-slate-500">Legal Dictations • Kruti Dev / Mangal support</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">UPSSSC Steno</span>
              <p className="text-[11px] text-slate-500">Remington GAIL & Inscript layout support</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-black text-indigo-600">Custom Practice</span>
              <p className="text-[11px] text-slate-500">Student custom speed drills & tests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
