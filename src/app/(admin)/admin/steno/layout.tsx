import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardRoute } from "@/lib/role-routing";

export default async function StenoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const role = session.user.role;

  // Allowed for Steno area: ADMIN, STENO_ADMIN, CONTENT_MANAGER
  if (role !== "ADMIN" && role !== "STENO_ADMIN" && role !== "CONTENT_MANAGER") {
    redirect(getDashboardRoute(role));
  }

  return <>{children}</>;
}
