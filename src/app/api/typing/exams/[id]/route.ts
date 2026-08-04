import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import TypingExamAccess from "@/models/TypingExamAccess";
import TypingSubscription from "@/models/TypingSubscription";
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

    // Determine the 3 free exams (3 oldest active ones in the system)
    const freeExams = await TypingExam.find({ status: "Active" })
      .sort({ createdAt: 1 })
      .limit(3)
      .select("_id")
      .lean();
    const freeExamIds = freeExams.map(e => e._id.toString());
    const isFree = freeExamIds.includes(exam._id.toString());

    if (!isFree) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized. Please log in.", requiresAuth: true }, { status: 401 });
      }

      // Check active subscription
      const activeSub = await TypingSubscription.findOne({
        userId: session.user.id,
        status: "ACTIVE",
        endDate: { $gt: new Date() }
      });

      // Check legacy individual exam access
      const hasLegacyAccess = await TypingExamAccess.findOne({
        userId: session.user.id,
        examId: exam._id,
        status: "SUCCESS"
      });

      if (!activeSub && !hasLegacyAccess) {
        return NextResponse.json({
          error: "Subscription required to access this exam.",
          requiresSubscription: true,
          amount: 21,
          currency: "INR"
        }, { status: 403 });
      }
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch exam" }, { status: 500 });
  }
}
