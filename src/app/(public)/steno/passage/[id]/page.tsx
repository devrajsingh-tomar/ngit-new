import { redirect } from "next/navigation";

export default async function PublicStenoPassageRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/student/steno/passage/${resolvedParams.id}`);
}
