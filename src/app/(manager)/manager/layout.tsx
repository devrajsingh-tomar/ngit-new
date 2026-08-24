import { ReactNode } from "react";
import ManagerLayoutClient from "@/components/manager/ManagerLayoutClient";

export const metadata = {
    title: "Manager Workspace | NGIT",
};

export default function ManagerLayout({ children }: { children: ReactNode }) {
    return <ManagerLayoutClient>{children}</ManagerLayoutClient>;
}
