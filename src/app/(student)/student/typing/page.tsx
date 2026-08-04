"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Keyboard, Zap, Target, AlertTriangle, ChevronDown, Award } from "lucide-react";
import Link from "next/link";
import { getActiveTypingSubscriptionAction } from "@/app/actions/subscription";

export default function StudentTypingDashboard() {
  const { data: session } = useSession();
  const [results, setResults] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (session) {
      setLoading(true);
      Promise.all([
        fetch("/api/typing/results").then(res => res.json()),
        getActiveTypingSubscriptionAction({})
      ]).then(([resultsData, subRes]) => {
        if (isMounted) {
          setResults(Array.isArray(resultsData) ? resultsData : []);
          if (subRes.success && subRes.data) {
            setSubscription(subRes.data.subscription);
          }
          setLoading(false);
        }
      }).catch(() => {
        if (isMounted) setLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Typing <span className="text-primary">Mastery</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Student Examination Portal</p>
        </div>
      </div>

      {/* Subscription Summary Card */}
      {subscription ? (
        <Card className="p-6 rounded-[2.2rem] border-emerald-100 bg-emerald-50/10 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm leading-tight">Typing Simulator Access: ACTIVE</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Valid until {format(new Date(subscription.endDate), "PPP")} ({subscription.planType} Plan)
              </p>
            </div>
          </div>
          <Link href="/student/typing/subscribe" className="w-full sm:w-auto shrink-0">
            <button className="w-full sm:w-auto h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer">
              Manage / Extend License
            </button>
          </Link>
        </Card>
      ) : (
        <Card className="p-6 rounded-[2.2rem] border-amber-100 bg-amber-50/10 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 bg-amber-505 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm leading-tight">No Active Typing Subscription</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Only first 3 oldest active exams in each category are free. Unlock full access now!
              </p>
            </div>
          </div>
          <Link href="/student/typing/subscribe" className="w-full sm:w-auto shrink-0">
            <button className="w-full sm:w-auto h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-600/10 cursor-pointer">
              Subscribe Now
            </button>
          </Link>
        </Card>
      )}

      {/* 1. Available Exams Section -> Replaced with Gov Exams CTA */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Government Exams Practice</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Pattern Typing Tests</p>
          </div>
        </div>

        <Card className="p-8 md:p-12 rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Select your target exam and start practicing today!</h3>
            <p className="text-slate-500 font-medium text-lg">
              We now feature a completely updated selection flow for government exams. Choose your exam (SSC, CPCT, UP Police, etc.), language, and difficulty level to find the exact official typing pattern you need.
            </p>
          </div>
          <Link href="/typing/official" className="relative z-10 w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95 flex items-center justify-center gap-3 cursor-pointer">
              Explore Exams
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </button>
          </Link>
        </Card>
      </section>

      {/* 2. Results History Section */}
      <section className="space-y-8 pt-10 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Examination Results</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">History of your taken exams</p>
          </div>
        </div>

        {results.length === 0 ? (
          <Card className="p-16 rounded-[3rem] bg-slate-50 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">You haven't completed any exams yet.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <Card key={result._id} className="p-2 rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white shrink-0 group-hover:bg-primary transition-colors">
                      <p className="text-lg font-black leading-none">{result.wpm}</p>
                      <p className="text-[7px] font-black uppercase tracking-widest opacity-60 mt-1">WPM</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                        {result.examId?.title || "Typing Practice"}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mt-2">
                        Attempted on {format(new Date(result.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 flex-1 max-w-3xl">
                    {[
                      { l: 'Accuracy', v: `${result.accuracy}%`, c: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { l: 'Errors', v: result.errorCount, vVal: result.errorCount, c: 'text-rose-600', bg: 'bg-rose-50' },
                      { l: 'Backspaces', v: result.backspaces || 0, c: 'text-amber-600', bg: 'bg-amber-50' },
                      { l: 'Net WPM', v: result.wpm, c: 'text-blue-600', bg: 'bg-blue-50' },
                      { l: 'Raw WPM', v: result.rawWpm, c: 'text-slate-600', bg: 'bg-slate-50' }
                    ].map((st, i) => (
                      <div key={i} className={`${st.bg} px-4 py-3 rounded-2xl`}>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{st.l}</p>
                        <p className={`text-lg font-black ${st.c}`}>{st.v}</p>
                      </div>
                    ))}
                  </div>

                  <Link href={`/typing/results/${result._id}`}>
                    <button className="h-14 w-full lg:w-14 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl flex items-center justify-center transition-all group/btn border border-slate-100 cursor-pointer">
                      <ChevronDown className="w-6 h-6 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
