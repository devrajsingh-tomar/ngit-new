"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sliders, Plus } from "lucide-react";

export default function AdminStenoErrorRulesPage() {
  const rules = [
    { name: "SSC Steno Grade C/D Standard Scheme", fullPenalty: "1.0 per omission/wrong word", halfPenalty: "0.5 per spelling/capitalization", maxErrorPercent: "5.0%" },
    { name: "Allahabad High Court Steno Scheme", fullPenalty: "1.0 per wrong word", halfPenalty: "0.5 per punctuation error", maxErrorPercent: "7.0%" },
    { name: "UPSSSC Steno Standard Scheme", fullPenalty: "1.0 per omission", halfPenalty: "0.5 per extra space", maxErrorPercent: "5.0%" },
  ];

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-orange-600" /> Error Rules & Evaluation Schemes
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure Full Mistakes, Half Mistakes, and percentage tolerance limits for government boards.
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs rounded-xl gap-1">
          <Plus className="w-4 h-4" /> Create Marking Scheme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rules.map((rule, idx) => (
          <Card key={idx} className="p-5 rounded-3xl border-slate-200 shadow-sm bg-white space-y-3">
            <span className="text-[10px] font-black uppercase bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">
              Max Limit: {rule.maxErrorPercent}
            </span>
            <h3 className="text-base font-black text-slate-900">{rule.name}</h3>
            <p className="text-xs text-slate-500">Full Error: {rule.fullPenalty}</p>
            <p className="text-xs text-slate-500">Half Error: {rule.halfPenalty}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
