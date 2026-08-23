import React from "react";
import StenoNavHeader from "@/components/steno/StenoNavHeader";

export default function StenoModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StenoNavHeader />
      <main>{children}</main>
    </div>
  );
}
