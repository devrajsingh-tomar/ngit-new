import { redirect } from "next/navigation";

export default function PublicStenoDictationRedirect() {
  redirect("/student/steno/dictation");
}
