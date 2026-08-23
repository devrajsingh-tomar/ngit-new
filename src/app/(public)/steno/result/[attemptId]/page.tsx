import { redirect } from "next/navigation";

export default async function PublicStenoResultRedirect({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/student/steno/result/${resolvedParams.attemptId}`);
}
