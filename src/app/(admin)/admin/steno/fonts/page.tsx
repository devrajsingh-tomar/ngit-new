"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Plus } from "lucide-react";

export default function AdminStenoFontsPage() {
  const fontPresets = [
    { name: "Kruti Dev 010", cssFamily: "Kruti Dev 010", category: "Hindi (Remington)", status: "Active System Font" },
    { name: "Mangal Unicode", cssFamily: "Mangal", category: "Hindi (Inscript)", status: "Active System Font" },
    { name: "Arial / Roboto", cssFamily: "Arial", category: "English Standard", status: "Active System Font" },
  ];

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Type className="w-6 h-6 text-cyan-600" /> Steno & Hindi Fonts Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure Kruti Dev, Devlys, Mangal Inscript, and custom shorthand outline font mappings.
          </p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-9 text-xs rounded-xl gap-1">
          <Plus className="w-4 h-4" /> Add Custom Font
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fontPresets.map((font, idx) => (
          <Card key={idx} className="p-5 rounded-3xl border-slate-200 shadow-sm bg-white space-y-3">
            <span className="text-[10px] font-black uppercase bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-100">
              {font.category}
            </span>
            <h3 className="text-base font-black text-slate-900">{font.name}</h3>
            <p className="text-xs text-slate-400 font-mono">Font Family: {font.cssFamily}</p>
            <p className="text-[10px] font-bold text-emerald-600">{font.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
