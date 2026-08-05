import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/admin/typing/gov-exams/[id]/propagate
 * Body: { examMode: "AHC" | "UPSSSC" | "UP_POLICE" | "General" | ... , duration?: number }
 * 
 * Sets examMode (and optionally duration) on ALL child TypingExams under this GovExam.
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
    const { examMode, duration } = body;

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

    const result = await TypingExam.updateMany(
      { govExamId: id },
      { $set: updateFields }
    );

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
