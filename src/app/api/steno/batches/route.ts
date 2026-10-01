import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoBatch from "@/models/StenoBatch";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const batches = await StenoBatch.find({ isPublished: { $ne: false } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: batches.length,
      batches: JSON.parse(JSON.stringify(batches || [])),
    });
  } catch (err: any) {
    console.error("API /api/steno/batches error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load batches", batches: [] },
      { status: 500 }
    );
  }
}
