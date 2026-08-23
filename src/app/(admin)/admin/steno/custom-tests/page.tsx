"use client";

import { useEffect, useState } from "react";
import { getUserStenoCustomTestsAction } from "@/app/actions/steno";
import { Card } from "@/components/ui/card";
import { Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminStenoCustomTestsPage() {
  const [customTests, setCustomTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomTests();
  }, []);

  const loadCustomTests = async () => {
    setLoading(true);
    const res = await getUserStenoCustomTestsAction();
    if (res.success && res.customTests) {
      setCustomTests(res.customTests);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 min-h-screen space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-600" /> Student Custom Practice Tests
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Overview of custom practice tests created by students.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" /> Loading student custom tests...
        </div>
      ) : customTests.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 rounded-3xl border-dashed bg-white">
          No student custom practice tests recorded yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customTests.map((t) => (
            <Card key={t._id} className="p-5 rounded-3xl border-slate-200 shadow-sm bg-white space-y-3">
              <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-100">
                {t.language} • {t.targetWpm} WPM
              </span>
              <h3 className="text-base font-black text-slate-900">{t.title}</h3>
              <p className="text-xs text-slate-400">Font: {t.hindiFont} | Duration: {t.durationMinutes}m</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
