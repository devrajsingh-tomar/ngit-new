"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function AdminStenoTestsPage() {
  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" /> Manage Steno Tests
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure test paper metadata and evaluation criteria.
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 text-xs rounded-xl gap-1">
          <Plus className="w-4 h-4" /> Create Test Configuration
        </Button>
      </div>

      <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
        No test configurations created yet. Click "Create Test Configuration" to configure one.
      </Card>
    </div>
  );
}
