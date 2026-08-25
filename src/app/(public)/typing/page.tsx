import TypingSelectionLayer from "@/components/typing/TypingSelectionLayer";
import { constructMetadata, getBreadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = constructMetadata({
  title: "Hindi & English Typing Test Online | Mangal & Krutidev Practice",
  description: "Practice Hindi and English typing online with NGIT's exam-oriented typing software. Supports Mangal Unicode, Krutidev, speed tracking, backspace control, and government exam practice.",
  path: "/typing",
});

export default function TypingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Typing Practice", url: "/typing" },
  ]);

  return (
    <div className="pt-20">
      <JsonLd data={breadcrumbSchema} />
      <TypingSelectionLayer />
    </div>
  );
}
