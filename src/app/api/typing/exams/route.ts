import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import "@/models/TypingPassage";
import "@/models/TypingBook";
import "@/models/TypingRulePreset";
import "@/models/GovExam";
import TypingResult from "@/models/TypingResult";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TypingSubscription from "@/models/TypingSubscription";
import TypingExamAccess from "@/models/TypingExamAccess";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    let hasFullAccess = false;
    let legacyAccessList: string[] = [];

    if (session) {
      const activeSub = await TypingSubscription.findOne({
        userId: session.user.id,
        status: "ACTIVE",
        endDate: { $gt: new Date() }
      });
      if (activeSub) {
        hasFullAccess = true;
      } else {
        const legacyAccess = await TypingExamAccess.find({
          userId: session.user.id,
          status: "SUCCESS"
        }).select("examId").lean();
        legacyAccessList = legacyAccess.map(a => a.examId.toString());
      }
    }
    
    // Use req.nextUrl for safer access to searchParams in Next.js
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const lang = searchParams.get("language") || searchParams.get("lang");
    const bookId = searchParams.get("bookId");
    const govExamId = searchParams.get("govExamId");
    const difficulty = searchParams.get("difficulty");
    
    const includeAll = searchParams.get("all") === "true";
    
    const now = new Date();
    const query: any = { status: "Active" };

    // Only apply date constraints for general timed live contests when not fetching all active practice tests
    if (!govExamId && !category && !bookId && !includeAll) {
        query.startTime = { $lte: now };
        query.endTime = { $gte: now };
    }

    if (lang && lang !== "All" && lang !== "undefined" && lang !== "null") {
      // If the language param is any Hindi variant, match ALL Hindi variants
      if (lang.toLowerCase().includes('hindi')) {
        query.language = { $regex: /hindi/i };
      } else {
        query.language = { $regex: new RegExp(`^${lang}$`, 'i') };
      }
    }

    if (bookId && bookId !== "All") {
      query.bookId = bookId;
    }

    const validGovExamId = govExamId && govExamId !== "null" && govExamId !== "undefined" && govExamId !== "[object Object]" ? govExamId : null;
    const validCategory = category && category !== "All" && category !== "undefined" && category !== "null" ? category : null;

    if (validGovExamId && validCategory) {
      query.$or = [
        { govExamId: validGovExamId },
        { category: validCategory }
      ];
    } else if (validGovExamId) {
      query.govExamId = validGovExamId;
    } else if (validCategory) {
      query.category = validCategory;
    } else if (govExamId === "null") {
      query.$or = [
        { govExamId: null },
        { govExamId: { $exists: false } }
      ];
    }

    if (difficulty && difficulty !== "All") {
      query.difficulty = difficulty;
    }

    const exams = await TypingExam.find(query)
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
    .populate({ path: "rulePresetId", strictPopulate: false })
    .sort({ createdAt: -1 });

    if (!exams) {
      return NextResponse.json([]);
    }

    // Add participant count to each exam (only run database queries if list size is small)
    // Find all distinct govExamIds in the retrieved list (plus null/undefined)
    const govExamIds = Array.from(new Set(exams.map(e => e.govExamId?.toString()).filter(Boolean)));
    const freeExamIdsSet = new Set<string>();
    
    // 3 oldest with null/undefined govExamId
    const freeNullExams = await TypingExam.find({
      status: "Active",
      $or: [
        { govExamId: null },
        { govExamId: { $exists: false } }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(3)
    .select("_id")
    .lean();
    freeNullExams.forEach(e => freeExamIdsSet.add(e._id.toString()));
    
    // 3 oldest for each distinct govExamId
    for (const gId of govExamIds) {
      const freeGovExams = await TypingExam.find({
        status: "Active",
        govExamId: gId
      })
      .sort({ createdAt: 1 })
      .limit(3)
      .select("_id")
      .lean();
      freeGovExams.forEach(e => freeExamIdsSet.add(e._id.toString()));
    }

    const isLargeList = exams.length > 50;
    const examsWithCounts = await Promise.all(exams.map(async (exam) => {
      if (!exam) return null;
      
      const isFree = (exam.pricing?.type !== "PAID") && freeExamIdsSet.has(exam._id.toString());
      const isAccessible = hasFullAccess || isFree || legacyAccessList.includes(exam._id.toString());
      
      let count = 0;
      if (!isLargeList) {
        count = await TypingResult.countDocuments({ examId: exam._id });
      }
      
      const examObj = exam.toObject();
      if (!isAccessible && examObj.passageId) {
        examObj.passageId.content = ""; // Clear content to prevent unauthorized access
      }
      
      return { 
        ...examObj, 
        isFree,
        isAccessible,
        participantCount: count 
      };
    }));
    
    return NextResponse.json(examsWithCounts.filter(Boolean));
  } catch (error: any) {
    console.error("Exams API Error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch active exams",
      details: error.message 
    }, { status: 500 });
  }
}
