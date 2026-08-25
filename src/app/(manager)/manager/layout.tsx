import { ReactNode } from "react";
import type { Metadata } from "next";
import ManagerLayoutClient from "@/components/manager/ManagerLayoutClient";

export const metadata: Metadata = {
    title: "Manager Workspace | NGIT",
    robots: {
        index: false,
        follow: false,
    },
};

export default function ManagerLayout({ children }: { children: ReactNode }) {
    return <ManagerLayoutClient>{children}</ManagerLayoutClient>;
}
