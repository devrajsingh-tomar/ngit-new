import { Card } from "@/components/ui/card";
import { Type } from "lucide-react";
import { STENO_TYPING_MODES } from "@/modules/steno/utils/hindiKeystrokeMap";

export default function AdminStenoFontsPage() {
  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Type className="w-6 h-6 text-cyan-600" /> Steno Typing Modes & Font Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Official Steno Exam Typing Modes: Unicode/Mangal, Kruti Dev 010 (Legacy), and English.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STENO_TYPING_MODES.map((mode, idx) => (
          <Card key={idx} className="p-5 rounded-3xl border-slate-200 shadow-sm bg-white space-y-3">
            <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
              {mode.type}
            </span>
            <h3 className="text-base font-black text-slate-900">{mode.label}</h3>
            <p className="text-xs text-slate-400 font-mono">Display Font: {mode.displayFont}</p>
            <p className="text-xs text-slate-500">Input Engine: <span className="font-bold text-slate-800">{mode.inputMode}</span></p>
            <p className="text-[10px] font-bold text-emerald-600">Active System Mode</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

