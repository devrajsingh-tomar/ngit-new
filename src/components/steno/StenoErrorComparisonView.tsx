"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { FileText, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

interface WordComparison {
  original: string;
  typed: string;
  type: "correct" | "spelling" | "matra" | "punctuation" | "added" | "skipped" | string;
}

interface StenoErrorComparisonViewProps {
  originalText?: string;
  typedText?: string;
  wordBreakdown?: WordComparison[];
}

export const StenoErrorComparisonView: React.FC<StenoErrorComparisonViewProps> = ({
  originalText = "",
  typedText = "",
  wordBreakdown = [],
}) => {
  return (
    <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Error Highlighting & Text Comparison
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Word-by-word error analysis comparing original passage against student transcription.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            Correct
          </span>
          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
            Spelling Error
          </span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
            Matra Error
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
            Punctuation
          </span>
          <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded border border-cyan-300">
            Added Word
          </span>
          <span className="bg-rose-50 text-rose-600 line-through px-2 py-0.5 rounded border border-rose-200">
            Skipped Word
          </span>
        </div>
      </div>

      {/* Word-by-Word Diff Highlights */}
      {wordBreakdown.length > 0 ? (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-sm font-medium flex flex-wrap gap-2">
          {wordBreakdown.map((item, idx) => {
            if (item.type === "correct") {
              return (
                <span key={idx} className="text-slate-800 font-semibold px-1">
                  {item.typed}
                </span>
              );
            }
            if (item.type === "spelling") {
              return (
                <span
                  key={idx}
                  title={`Original: "${item.original}" | Typed: "${item.typed}"`}
                  className="bg-rose-100 text-rose-900 border border-rose-300 px-1.5 py-0.5 rounded font-black cursor-help"
                >
                  {item.typed} <span className="text-[10px] opacity-75 font-mono">({item.original})</span>
                </span>
              );
            }
            if (item.type === "matra") {
              return (
                <span
                  key={idx}
                  title={`Matra Error - Original: "${item.original}"`}
                  className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-black cursor-help"
                >
                  {item.typed}
                </span>
              );
            }
            if (item.type === "punctuation") {
              return (
                <span
                  key={idx}
                  title={`Punctuation/Case - Original: "${item.original}"`}
                  className="bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.5 rounded font-black cursor-help"
                >
                  {item.typed}
                </span>
              );
            }
            if (item.type === "added") {
              return (
                <span
                  key={idx}
                  title={`Extra Added Word`}
                  className="bg-cyan-100 text-cyan-900 border border-cyan-300 px-1.5 py-0.5 rounded font-black cursor-help"
                >
                  +{item.typed}
                </span>
              );
            }
            if (item.type === "skipped") {
              return (
                <span
                  key={idx}
                  title={`Skipped/Omitted Word`}
                  className="bg-rose-50 text-rose-600 border border-rose-200 line-through px-1.5 py-0.5 rounded font-bold cursor-help"
                >
                  {item.original}
                </span>
              );
            }
            return <span key={idx}>{item.typed}</span>;
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-400">Original Passage Reference</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
              {originalText || "Reference text not available."}
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-400">Student Submitted Transcription</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
              {typedText || "No transcription text submitted."}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
