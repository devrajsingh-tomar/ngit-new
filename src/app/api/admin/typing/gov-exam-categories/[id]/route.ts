import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovExamCategory from "@/models/GovExamCategory";
import TypingExam from "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();

    const allowed = ["name", "description", "active", "examMode", "duration",
      "totalMarks", "qualifyingMarks", "errorPenalty", "minWpm", "minAccuracy", "allowHalfMistakes"];
    const update: any = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }

    // Auto-update slug if name changed
    if (data.name) {
      update.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    const category = await GovExamCategory.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    // Propagate examMode + duration to all linked TypingExams
    const propagate: any = {};
    if (update.examMode) propagate.examMode = update.examMode;
    if (update.duration) propagate.duration = update.duration;
    if (Object.keys(propagate).length > 0) {
      await TypingExam.updateMany({ govExamCategoryId: id }, { $set: propagate });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Unlink any exams pointing to this category
    await TypingExam.updateMany({ govExamCategoryId: id }, { $unset: { govExamCategoryId: "" } });

    await GovExamCategory.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
