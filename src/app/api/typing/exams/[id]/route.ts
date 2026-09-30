import { NextResponse } from "next/server";
import mongoose from "mongoose";
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
import { verifyTryoutToken } from "@/lib/tryoutToken";

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
    const govExamId = searchParams.get("govExamId");
    const token = searchParams.get("token");
    
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
      const category = await GovExamCategory.findById(govExamCategoryId).populate("govExamId").lean() as any;
      if (category) {
        examObj.govExamCategoryId = category;
        examObj.examMode = category.examMode;
        examObj.duration = category.duration;
        if (category.govExamId) {
          examObj.govExamId = category.govExamId;
        }
      }
    } else if (govExamId && mongoose.Types.ObjectId.isValid(govExamId)) {
      const GovExam = (await import("@/models/GovExam")).default;
      const gov = await GovExam.findById(govExamId).lean() as any;
      if (gov) {
        examObj.govExamId = gov;
        examObj.duration = gov.defaultDuration || examObj.duration;
      }
    }

    // Determine if the exam is free:
    // 1. Explicitly PAID -> not free
    // 2. Verified tryout token -> single selected tryout exam is free
    let isFree = false;
    if (exam.pricing?.type === "PAID") {
      isFree = false;
    } else if (token && verifyTryoutToken(exam._id.toString(), token)) {
      isFree = true;
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
