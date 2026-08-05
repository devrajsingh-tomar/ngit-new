import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/typing/gov-exams/[id]/propagate
 * Returns all TypingExams under this GovExam (for admin to select which ones to update)
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const exams = await TypingExam.find({ govExamId: id, status: { $ne: "Inactive" } })
      .select("_id title language difficulty examMode duration category status")
      .sort({ title: 1 })
      .lean();

    return NextResponse.json(exams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/typing/gov-exams/[id]/propagate
 * Body: { examMode, duration?, examIds?: string[] }
 * 
 * If examIds provided: update only those specific exams.
 * If examIds is empty/missing: update ALL child exams.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const govExam = await GovExam.findById(id);
    if (!govExam) {
      return NextResponse.json({ error: "Government Exam not found" }, { status: 404 });
    }

    const body = await req.json();
    const { examMode, duration, examIds } = body;

    const validModes = ["General", "SSC", "CPCT", "Court", "Steno", "UPSSSC", "AHC", "UP_POLICE"];
    if (examMode && !validModes.includes(examMode)) {
      return NextResponse.json({ error: `Invalid examMode. Valid values: ${validModes.join(", ")}` }, { status: 400 });
    }

    const updateFields: any = {};
    if (examMode) updateFields.examMode = examMode;
    if (duration) updateFields.duration = Number(duration);

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No fields to update (provide examMode and/or duration)" }, { status: 400 });
    }

    // Build filter: if specific IDs provided, update only those; else update all under this govExam
    const filter: any = { govExamId: id };
    if (examIds && Array.isArray(examIds) && examIds.length > 0) {
      filter._id = { $in: examIds };
    }

    const result = await TypingExam.updateMany(filter, { $set: updateFields });

    return NextResponse.json({
      success: true,
      govExam: govExam.title,
      slug: govExam.slug,
      updatedFields: updateFields,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
