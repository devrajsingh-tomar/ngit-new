import { ReactNode } from "react";
import type { Metadata } from "next";
import StenoAdminLayoutClient from "@/components/steno-admin/StenoAdminLayoutClient";

export const metadata: Metadata = {
    title: "Steno Admin Workspace | NGIT",
    robots: {
        index: false,
        follow: false,
    },
};

export default function StenoAdminLayout({ children }: { children: ReactNode }) {
    return <StenoAdminLayoutClient>{children}</StenoAdminLayoutClient>;
}
