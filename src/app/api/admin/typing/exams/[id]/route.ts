import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const deletedExam = await TypingExam.findByIdAndDelete(id);
    
    if (!deletedExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Exam deleted successfully" });
  } catch (error: any) {
    console.error("Exam Deletion Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete exam" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    // Sanitize and handle optional IDs
    const updateData = { ...data };
    if (!updateData.govExamId || updateData.govExamId === "" || updateData.govExamId === "None") {
        updateData.govExamId = null;
    }
    if (!updateData.govExamCategoryId || updateData.govExamCategoryId === "" || updateData.govExamCategoryId === "None") {
        updateData.govExamCategoryId = null;
    }
    if (!updateData.rulePresetId || updateData.rulePresetId === "" || updateData.rulePresetId === "None") {
        updateData.rulePresetId = null;
    }
    if (!updateData.bookId || updateData.bookId === "" || updateData.bookId === "None") {
        updateData.bookId = null;
    }

    // Auto-inherit duration/rules from Sub-Category or Parent Gov Exam if provided
    if (updateData.govExamCategoryId) {
      const GovExamCategory = (await import("@/models/GovExamCategory")).default;
      const cat = await GovExamCategory.findById(updateData.govExamCategoryId).lean();
      if (cat) {
        updateData.duration = cat.duration;
        updateData.examMode = cat.examMode;
      }
    } else if (updateData.govExamId) {
      const GovExam = (await import("@/models/GovExam")).default;
      const gov = await GovExam.findById(updateData.govExamId).lean();
      if (gov) {
        updateData.duration = gov.defaultDuration || updateData.duration || 10;
      }
    }

    const updatedExam = await TypingExam.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(updatedExam);
  } catch (error: any) {
    console.error("Exam Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update exam" }, { status: 500 });
  }
}
