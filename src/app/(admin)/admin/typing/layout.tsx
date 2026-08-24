import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardRoute } from "@/lib/role-routing";

export default async function TypingAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const role = session.user.role;

  // Allowed for Typing area: ADMIN, TYPING_ADMIN
  // (STENO_ADMIN & CONTENT_MANAGER are denied and redirected to /admin/steno)
  if (role !== "ADMIN" && role !== "TYPING_ADMIN") {
    redirect(getDashboardRoute(role));
  }

  return <>{children}</>;
}
