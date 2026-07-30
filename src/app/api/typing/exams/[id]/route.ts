import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import "@/models/TypingPassage";
import "@/models/TypingBook";
import "@/models/TypingRulePreset";
import "@/models/GovExam";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    
    const exam = await TypingExam.findById(id)
      .populate("passageId")
      .populate({ path: "bookId", strictPopulate: false })
      .populate({
        path: "govExamId",
        populate: {
          path: "rulePresetId",
          model: "TypingRulePreset"
        },
        strictPopulate: false
      })
      .populate({ path: "rulePresetId", strictPopulate: false });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch exam" }, { status: 500 });
  }
}
