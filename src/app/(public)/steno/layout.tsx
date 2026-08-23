import React from "react";
import StenoNavHeader from "@/components/steno/StenoNavHeader";
import StenoAuthGuard from "@/components/steno/StenoAuthGuard";

export default function StenoModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StenoNavHeader />
      <StenoAuthGuard>
        <main>{children}</main>
      </StenoAuthGuard>
    </div>
  );
}
