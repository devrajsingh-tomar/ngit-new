import { redirect } from "next/navigation";

export default function PublicStenoPracticeRedirect() {
  redirect("/student/steno/practice");
}
