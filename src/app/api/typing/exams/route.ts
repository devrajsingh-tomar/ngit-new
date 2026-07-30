import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import "@/models/TypingPassage";
import "@/models/TypingBook";
import "@/models/TypingRulePreset";
import "@/models/GovExam";
import TypingResult from "@/models/TypingResult";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Use req.nextUrl for safer access to searchParams in Next.js
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const lang = searchParams.get("language") || searchParams.get("lang");
    const bookId = searchParams.get("bookId");
    const govExamId = searchParams.get("govExamId");
    const difficulty = searchParams.get("difficulty");
    
    const now = new Date();
    const query: any = { status: "Active" };

    // Only apply date constraints for general timed exams, 
    // allow practice flow to access all active tests.
    if (!govExamId && !bookId) {
        query.startTime = { $lte: now };
        query.endTime = { $gte: now };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (lang) {
      // If the language param is any Hindi variant, match ALL Hindi variants
      // so exercises from 'Unicode Hindi', 'Mangal Hindi', 'Krutidev Hindi', and 'Hindi' are all grouped together
      if (lang.toLowerCase().includes('hindi')) {
        query.language = { $regex: /hindi/i };
      } else {
        query.language = lang;
      }
    }

    if (bookId && bookId !== "All") {
      query.bookId = bookId;
    }

    if (govExamId && govExamId !== "null" && govExamId !== "undefined") {
      query.govExamId = govExamId;
    } else {
      query.$or = [
        { govExamId: null },
        { govExamId: { $exists: false } }
      ];
    }

    if (difficulty) {
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
    const isLargeList = exams.length > 50;
    const examsWithCounts = await Promise.all(exams.map(async (exam) => {
      if (!exam) return null;
      let count = 0;
      if (!isLargeList) {
        count = await TypingResult.countDocuments({ examId: exam._id });
      }
      return { ...exam.toObject(), participantCount: count };
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
