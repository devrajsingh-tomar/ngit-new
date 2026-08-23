import { redirect } from "next/navigation";

export default function PublicStenoLeaderboardRedirect() {
  redirect("/student/steno/leaderboard");
}
