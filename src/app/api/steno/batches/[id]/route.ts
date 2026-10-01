import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoBatch from "@/models/StenoBatch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const payload = { ...body };
    if (payload.examPresetId === "" || payload.examPresetId === undefined) {
      payload.examPresetId = null;
    }

    const updated = await StenoBatch.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: "Batch not found" }, { status: 404 });
    }

    revalidatePath("/admin/steno/batches");
    revalidatePath("/admin/steno/exams");
    revalidatePath("/admin/steno/series");
    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");

    return NextResponse.json({ success: true, batch: JSON.parse(JSON.stringify(updated)) });
  } catch (err: any) {
    console.error("API /api/steno/batches/[id] PUT error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to update batch" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await StenoBatch.findByIdAndDelete(id);

    revalidatePath("/admin/steno/batches");
    revalidatePath("/admin/steno/exams");
    revalidatePath("/admin/steno/series");
    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/steno/batches/[id] DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to delete batch" }, { status: 500 });
  }
}
