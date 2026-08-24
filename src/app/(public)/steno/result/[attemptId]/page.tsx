import { getStenoResultByIdAction } from "@/app/actions/steno";
import StenoResultView from "@/components/steno/StenoResultView";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Steno Test Result | NGIT",
};

export default async function StenoResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const res = await getStenoResultByIdAction(attemptId);

  if (!res.success || !res.result) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto my-20 bg-white rounded-3xl border shadow-xl space-y-4">
        <h2 className="text-2xl font-black text-rose-600">Result Not Found</h2>
        <p className="text-sm text-slate-500 font-bold">{res.error || "Unable to access requested Steno result report."}</p>
      </div>
    );
  }

  return <StenoResultView result={res.result} />;
}
