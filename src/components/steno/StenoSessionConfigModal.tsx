"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, Sliders, Check } from "lucide-react";

export interface StenoSessionConfig {
  mode: "exam" | "manual";
  examPresetName?: string;
  backspaceStatus: "Enabled" | "Disabled";
  spellingMistake: "Full" | "Half" | "Ignore";
  capitalizationMistake: "Full" | "Half" | "Ignore";
  punctuationMistake: "Full" | "Half" | "Ignore";
  addedWordMistake: "Full" | "Half" | "Ignore";
  skippedWordMistake: "Full" | "Half" | "Ignore";
  durationMinutes: number;
}

interface StenoSessionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: StenoSessionConfig) => void;
  totalWords?: number;
}

export const StenoSessionConfigModal: React.FC<StenoSessionConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  totalWords = 1,
}) => {
  const [activeTab, setActiveTab] = useState<"exam" | "manual">("exam");
  const [selectedExam, setSelectedExam] = useState("SSC Grade D Steno");

  // Manual configuration state
  const [backspaceStatus, setBackspaceStatus] = useState<"Enabled" | "Disabled">("Enabled");
  const [spellingMistake, setSpellingMistake] = useState<"Full" | "Half" | "Ignore">("Full");
  const [capitalizationMistake, setCapitalizationMistake] = useState<"Full" | "Half" | "Ignore">("Full");
  const [punctuationMistake, setPunctuationMistake] = useState<"Full" | "Half" | "Ignore">("Full");
  const [addedWordMistake, setAddedWordMistake] = useState<"Full" | "Half" | "Ignore">("Full");
  const [skippedWordMistake, setSkippedWordMistake] = useState<"Full" | "Half" | "Ignore">("Full");
  const [durationMinutes, setDurationMinutes] = useState(15);

  const examPresetsRules: Record<string, any> = {
    "SSC Grade D Steno": {
      backspace: "Enabled",
      transcriptionDuration: 50,
      dictationDuration: 15,
      spelling: "Full",
      capitalization: "Full",
      punctuation: "Full",
      added: "Full",
      skipped: "Full",
    },
    "SSC Grade C Steno": {
      backspace: "Enabled",
      transcriptionDuration: 40,
      dictationDuration: 10,
      spelling: "Full",
      capitalization: "Full",
      punctuation: "Half",
      added: "Full",
      skipped: "Full",
    },
    "Allahabad High Court Steno": {
      backspace: "Enabled",
      transcriptionDuration: 30,
      dictationDuration: 5,
      spelling: "Full",
      capitalization: "Half",
      punctuation: "Half",
      added: "Full",
      skipped: "Full",
    },
    "UPSSSC Steno": {
      backspace: "Enabled",
      transcriptionDuration: 45,
      dictationDuration: 10,
      spelling: "Full",
      capitalization: "Ignore",
      punctuation: "Half",
      added: "Full",
      skipped: "Full",
    },
  };

  const handleSaveAndContinue = () => {
    if (activeTab === "exam") {
      const preset = examPresetsRules[selectedExam] || examPresetsRules["SSC Grade D Steno"];
      onSave({
        mode: "exam",
        examPresetName: selectedExam,
        backspaceStatus: preset.backspace,
        spellingMistake: preset.spelling,
        capitalizationMistake: preset.capitalization,
        punctuationMistake: preset.punctuation,
        addedWordMistake: preset.added,
        skippedWordMistake: preset.skipped,
        durationMinutes: preset.transcriptionDuration,
      });
    } else {
      onSave({
        mode: "manual",
        backspaceStatus,
        spellingMistake,
        capitalizationMistake,
        punctuationMistake,
        addedWordMistake,
        skippedWordMistake,
        durationMinutes,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8 bg-white border border-slate-200">
        <DialogHeader className="text-center space-y-1">
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight text-center">
            Configure Your Transcription Session
          </DialogTitle>
          <p className="text-xs text-slate-500 font-bold text-center">
            Set your error-checking style: Manual or Exam Based.
          </p>
        </DialogHeader>

        {/* Tab Toggle Bar */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mt-4">
          <button
            onClick={() => setActiveTab("exam")}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "exam"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> By Exam
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "manual"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4" /> Manual
          </button>
        </div>

        {/* Tab 1: By Exam */}
        {activeTab === "exam" && (
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                SELECT EXAM PRESET
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SSC Grade D Steno">SSC Grade D Steno</option>
                <option value="SSC Grade C Steno">SSC Grade C Steno</option>
                <option value="Allahabad High Court Steno">Allahabad High Court Steno</option>
                <option value="UPSSSC Steno">UPSSSC Steno</option>
              </select>
            </div>

            {/* Exam Rules Summary Box */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                📋 {selectedExam} — Exam Rules
              </h4>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-slate-700">
                <p>• Backspace: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.backspace}</strong></p>
                <p>• Transcription Duration: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.transcriptionDuration} Mins</strong></p>
                <p>• Total Words: <strong className="text-indigo-900 font-bold">{totalWords}</strong></p>
                <p>• Dictation Duration: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.dictationDuration} Mins</strong></p>
                <p>• Spelling Error: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.spelling}</strong></p>
                <p>• Capitalization Error: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.capitalization}</strong></p>
                <p>• Punctuation: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.punctuation}</strong></p>
                <p>• Added Words: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.added}</strong></p>
                <p>• Skipped Words: <strong className="text-indigo-900 font-bold">{examPresetsRules[selectedExam]?.skipped}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manual */}
        {activeTab === "manual" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                BACKSPACE STATUS
              </label>
              <select
                value={backspaceStatus}
                onChange={(e) => setBackspaceStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                COUNT SPELLING MISTAKE AS
              </label>
              <select
                value={spellingMistake}
                onChange={(e) => setSpellingMistake(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Full">Full</option>
                <option value="Half">Half</option>
                <option value="Ignore">Ignore</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                COUNT CAPITALIZATION MISTAKE AS
              </label>
              <select
                value={capitalizationMistake}
                onChange={(e) => setCapitalizationMistake(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Full">Full</option>
                <option value="Half">Half</option>
                <option value="Ignore">Ignore</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                COUNT PUNCTUATION MISTAKE AS
              </label>
              <select
                value={punctuationMistake}
                onChange={(e) => setPunctuationMistake(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Full">Full</option>
                <option value="Half">Half</option>
                <option value="Ignore">Ignore</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                COUNT ADDED WORD MISTAKE AS
              </label>
              <select
                value={addedWordMistake}
                onChange={(e) => setAddedWordMistake(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Full">Full</option>
                <option value="Half">Half</option>
                <option value="Ignore">Ignore</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                COUNT SKIPPED WORD MISTAKE AS
              </label>
              <select
                value={skippedWordMistake}
                onChange={(e) => setSkippedWordMistake(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Full">Full</option>
                <option value="Half">Half</option>
                <option value="Ignore">Ignore</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                DURATION (MINUTES)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-5 text-xs font-bold border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 text-xs shadow-md"
          >
            Save and Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
