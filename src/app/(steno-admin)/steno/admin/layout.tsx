import { ReactNode } from "react";
import StenoAdminLayoutClient from "@/components/steno-admin/StenoAdminLayoutClient";

export const metadata = {
    title: "Steno Admin Workspace | NGIT",
};

export default function StenoAdminLayout({ children }: { children: ReactNode }) {
    return <StenoAdminLayoutClient>{children}</StenoAdminLayoutClient>;
}
