"use client";
import React from "react";
import { MessageSquare, ChevronLeft, Mail, Phone, User, Clock, CheckCircle2, Download, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getLeadsAction, updateLeadStatusAction } from "@/app/actions/cms-leads";

export default function FormsLeadsPage() {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  const fetchLeads = async () => {
    setLoading(true);
    const res = await getLeadsAction();
    if (res.success) setLeads(res.leads);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter((l) => {
    const matchSearch = l.name?.toLowerCase().includes(search.toLowerCase()) || 
                       l.email?.toLowerCase().includes(search.toLowerCase()) ||
                       l.message?.toLowerCase().includes(search.toLowerCase());
    const statusMap: Record<string, string> = {
        all: "all",
        new: "New",
        resolved: "Contacted"
    };
    const matchFilter = filter === "all" || l.status === statusMap[filter];
    return matchSearch && matchFilter;
  });

  const markResolved = async (id: string) => {
    const res = await updateLeadStatusAction(id, "Contacted");
    if (res.success) {
        toast.success("Lead marked as contacted");
        fetchLeads();
    } else {
        toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fb]">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900">Forms & Leads</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Student enquiries and form submissions</p>
          </div>
        </div>
        <button
          onClick={() => toast.success("Downloading CSV...")}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: leads.length, color: "bg-violet-50 text-violet-600", icon: MessageSquare },
            { label: "New / Unread", value: leads.filter(l => l.status === "new").length, color: "bg-amber-50 text-amber-600", icon: Mail },
            { label: "Resolved", value: leads.filter(l => l.status === "resolved").length, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
            { label: "Callback Requests", value: leads.filter(l => l.formType === "Callback").length, color: "bg-blue-50 text-blue-600", icon: Phone },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 leading-none mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 w-full text-xs font-medium bg-white border border-slate-200 rounded-lg outline-none focus:border-violet-400"
            />
          </div>
          <div className="flex gap-2">
            {["all", "new", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                  filter === f ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Form Type</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Message</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Date</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Querying Neural Core...</p>
                  </td>
                </tr>
              ) : filtered.map((lead) => (
                <tr key={lead._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-black shrink-0">
                        {lead.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{lead.name}</p>
                        <p className="text-[10px] text-slate-400">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">{lead.source || "Direct"}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{lead.message}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <p className="text-xs text-slate-400 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {lead.status === "New" ? (
                      <button
                        onClick={() => markResolved(lead._id)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Mark Contacted
                      </button>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Contacted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-bold">No submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
