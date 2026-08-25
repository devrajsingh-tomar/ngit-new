import React from "react";
import StenoNavHeader from "@/components/steno/StenoNavHeader";
import StenoAuthGuard from "@/components/steno/StenoAuthGuard";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = constructMetadata({
  title: "Steno Shorthand Practice & Dictation Tests Online | UPSSSC & SSC Steno",
  description: "Practice Stenography shorthand online with audio/video dictations, speed fluctuation, automatic transcription evaluation, and UPSSSC/SSC Steno exam prep at NGIT.",
  path: "/steno",
});

export default function StenoModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Steno Shorthand Practice", url: "/steno" },
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={breadcrumbSchema} />
      <StenoNavHeader />
      <StenoAuthGuard>
        <main>{children}</main>
      </StenoAuthGuard>
    </div>
  );
}
