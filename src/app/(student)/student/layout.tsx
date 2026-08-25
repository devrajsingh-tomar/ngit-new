import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal | NGIT",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentSubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
