import { redirect } from "next/navigation";

export default function PublicStenoDashboardRedirect() {
  redirect("/student/steno/dashboard");
}
