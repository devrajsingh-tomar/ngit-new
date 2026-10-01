import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoBatch from "@/models/StenoBatch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isPublished = searchParams.get("isPublished");

    const filter: any = {};
    if (isPublished === "true") {
      filter.isPublished = { $ne: false };
    } else if (isPublished === "false") {
      filter.isPublished = false;
    }

    const batches = await StenoBatch.find(filter)
      .populate("examPresetId")
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: batches.length,
      batches: JSON.parse(JSON.stringify(batches || [])),
    });
  } catch (err: any) {
    console.error("API /api/steno/batches GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load batches", batches: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Batch Name is required" }, { status: 400 });
    }

    const batchName = body.name.trim();

    let batch: any = await StenoBatch.findOne({ name: batchName });
    if (batch) {
      batch = await StenoBatch.findByIdAndUpdate(
        batch._id,
        {
          $set: {
            name: batchName,
            hindiName: body.hindiName || "",
            description: body.description || "",
            thumbnailUrl: body.thumbnailUrl || "",
            examPresetId: body.examPresetId ? body.examPresetId : null,
            coachingName: body.coachingName || "",
            instituteCode: body.instituteCode || "",
            managedByEmail: body.managedByEmail || "",
            sortOrder: body.sortOrder !== undefined ? body.sortOrder : 0,
            isPublished: body.isPublished !== undefined ? body.isPublished : true,
          },
        },
        { new: true }
      ).lean();
    } else {
      batch = await StenoBatch.create({
        name: batchName,
        hindiName: body.hindiName || "",
        description: body.description || "",
        thumbnailUrl: body.thumbnailUrl || "",
        examPresetId: body.examPresetId ? body.examPresetId : null,
        coachingName: body.coachingName || "",
        instituteCode: body.instituteCode || "",
        managedByEmail: body.managedByEmail || "",
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : 0,
        isPublished: body.isPublished !== undefined ? body.isPublished : true,
      });
    }

    revalidatePath("/admin/steno/batches");
    revalidatePath("/admin/steno/exams");
    revalidatePath("/admin/steno/series");
    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");

    return NextResponse.json({ success: true, batch: JSON.parse(JSON.stringify(batch)) }, { status: 201 });
  } catch (err: any) {
    console.error("API /api/steno/batches POST error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create batch" }, { status: 500 });
  }
}
