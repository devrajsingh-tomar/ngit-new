import { redirect } from "next/navigation";

export default async function LegacyLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params || {})) {
        if (typeof value === "string") {
            query.set(key, value);
        } else if (Array.isArray(value) && value.length > 0) {
            query.set(key, value[0]);
        }
    }
    const queryString = query.toString();
    redirect(`/student/login${queryString ? `?${queryString}` : ""}`);
}
