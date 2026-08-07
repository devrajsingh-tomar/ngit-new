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
      .populate({ path: "govExamCategoryId", strictPopulate: false })
      .populate({ path: "rulePresetId", strictPopulate: false });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const govExamCategoryId = searchParams.get("govExamCategoryId");
    
    let examObj = exam.toObject();

    // Auto-inherit rules from database populates
    if (examObj.govExamCategoryId) {
      examObj.examMode = examObj.govExamCategoryId.examMode || examObj.examMode;
      examObj.duration = examObj.govExamCategoryId.duration || examObj.duration;
    } else if (examObj.govExamId) {
      examObj.duration = examObj.govExamId.defaultDuration || examObj.duration;
    }

    if (govExamCategoryId && mongoose.Types.ObjectId.isValid(govExamCategoryId)) {
      const GovExamCategory = (await import("@/models/GovExamCategory")).default;
      const category = await GovExamCategory.findById(govExamCategoryId).populate("govExamId").lean();
      if (category) {
        examObj.govExamCategoryId = category;
        examObj.examMode = category.examMode;
        examObj.duration = category.duration;
        if (category.govExamId) {
          examObj.govExamId = category.govExamId;
        }
      }
    }

    // Determine if the exam is free:
    // 1. Explicitly PAID -> not free
    // 2. Otherwise, check if it's one of the 3 oldest active exams in this category
    let isFree = false;
    if (exam.pricing?.type === "PAID") {
      isFree = false;
    } else {
      const categoryQuery: any = { status: "Active" };
      if (exam.govExamId) {
        categoryQuery.govExamId = exam.govExamId;
      } else {
        categoryQuery.govExamId = { $in: [null, undefined] };
      }
      categoryQuery["pricing.type"] = { $ne: "PAID" };

      const freeExams = await TypingExam.find(categoryQuery)
        .sort({ createdAt: 1 })
        .limit(3)
        .select("_id")
        .lean();
      const freeExamIds = freeExams.map(e => e._id.toString());
      isFree = freeExamIds.includes(exam._id.toString());
    }

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

    return NextResponse.json(examObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch exam" }, { status: 500 });
  }
}
