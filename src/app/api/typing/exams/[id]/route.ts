import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import TypingExamAccess from "@/models/TypingExamAccess";
import "@/models/TypingPassage";
import "@/models/TypingBook";
import "@/models/TypingRulePreset";
import "@/models/GovExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Access check for PAID exams
    if (exam.pricing && exam.pricing.type === "PAID") {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized. Please log in.", requiresAuth: true }, { status: 401 });
      }

      const hasAccess = await TypingExamAccess.findOne({
        userId: session.user.id,
        examId: exam._id,
        status: "SUCCESS"
      });

      if (!hasAccess) {
        return NextResponse.json({
          error: "Payment required to access this exam.",
          requiresPayment: true,
          amount: exam.pricing.amount,
          currency: exam.pricing.currency
        }, { status: 403 });
      }
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch exam" }, { status: 500 });
  }
}
