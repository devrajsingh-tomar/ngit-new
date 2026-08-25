import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import JsonLd from "@/components/seo/JsonLd";
import { getOrganizationSchema, getWebSiteSchema, SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.domain),
    title: {
        default: "NGIT | Computer Courses, Typing & Government Exam Institute in Prayagraj",
        template: "%s | NGIT",
    },
    description: "NGIT (National Genius Institute of Technology) is Prayagraj's premier computer institute offering Hindi & English typing test practice, Steno shorthand coaching, CCC, O Level, and government exam preparation.",
    keywords: [
      "NGIT",
      "Computer Institute in Prayagraj",
      "Hindi Typing Test Online",
      "English Typing Test Online",
      "Steno Practice Online",
      "UPSSSC Steno Practice",
      "SSC Steno Mock Test",
      "Computer Courses in Prayagraj",
    ],
    authors: [{ name: SITE_CONFIG.fullName }],
    creator: SITE_CONFIG.fullName,
    publisher: SITE_CONFIG.fullName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: "NGIT | Computer Courses, Typing & Government Exam Institute in Prayagraj",
      description: "NGIT (National Genius Institute of Technology) is Prayagraj's premier computer institute offering Hindi & English typing test practice, Steno shorthand coaching, CCC, O Level, and government exam preparation.",
      url: SITE_CONFIG.domain,
      siteName: SITE_CONFIG.fullName,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.fullName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "NGIT | Computer Courses, Typing & Government Exam Institute in Prayagraj",
      description: "NGIT (National Genius Institute of Technology) is Prayagraj's premier computer institute offering Hindi & English typing test practice, Steno shorthand coaching, CCC, O Level, and government exam preparation.",
      images: [SITE_CONFIG.ogImage],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const orgSchema = getOrganizationSchema();
    const websiteSchema = getWebSiteSchema();

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <JsonLd data={[orgSchema, websiteSchema]} />
            </head>
            <body className="font-sans" suppressHydrationWarning>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
