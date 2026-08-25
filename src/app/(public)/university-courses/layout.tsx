import React from "react";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = constructMetadata({
  title: "University Degree & Computer Diploma Courses | PGDCA, DCA, BCA | NGIT Prayagraj",
  description: "Explore university degree and diploma courses at NGIT Prayagraj: PGDCA, DCA, BCA, CCC, O Level, and professional IT certification programs.",
  path: "/university-courses",
});

export default function UniversityCoursesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "University Courses", url: "/university-courses" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
