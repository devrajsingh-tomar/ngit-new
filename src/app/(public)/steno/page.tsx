"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Headphones,
  BarChart3,
  ArrowRight,
  Layers,
  Lock,
} from "lucide-react";

export default function StenoMainLandingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Single Top Banner Image */}
        <div className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
          <img
            src="https://ngitedu.com/uploads/gallery/1787956222932-d84153c2-8f95-4d2e-8690-207c4d3b679f.jpg"
            alt="NGIT Steno Shorthand Portal"
            className="w-full h-auto object-cover rounded-[2.5rem]"
          />
        </div>

        {/* 2. Quick Access Bar */}
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

        {/* 3. Steno Batches & Series Collections Section with Image Banner Above */}
        <Card className="p-0 rounded-[2.5rem] border-slate-200 bg-white shadow-md overflow-hidden space-y-0 hover:shadow-lg transition-all">
          {/* Image Banner Above Section */}
          <div className="w-full overflow-hidden bg-slate-900 border-b border-slate-200">
            <img
              src="https://ngitedu.com/uploads/gallery/1787956467734-3fe88938-2d9d-4471-9a0d-e24dac83cdf4.jpg"
              alt="Steno Batches & Series Collections"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Section Details & CTA */}
          <div className="p-6 sm:p-8 space-y-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Official Steno Portal
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Steno Batches & Series Collections</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Curated Legal, Editorial, PYQ, and Speed Building passage collections categorized for targeted speed enhancement.
              </p>
            </div>

            <Link
              href={isLoggedIn ? "/student/steno/series" : "/login?callbackUrl=/student/steno/series"}
              className="shrink-0"
            >
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 px-6 rounded-2xl shadow-md text-xs gap-2">
                {isLoggedIn ? "Browse Steno Batches & Series" : "Login Required to Access"} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
