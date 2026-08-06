import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import "@/models/TypingPassage";
import "@/models/TypingBook";
import "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const exams = await TypingExam.find()
      .populate("passageId")
      .sort({ startTime: -1 })
      .limit(200);
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    
    // Sanitize ObjectIds (convert empty strings to null to avoid BSON casting errors)
    const sanitizedData = { ...data };
    const idFields = ["rulePresetId", "govExamId", "govExamCategoryId", "bookId", "passageId"];
    idFields.forEach(field => {
      if (sanitizedData[field] === "") {
        sanitizedData[field] = null;
      }
    });

    // Auto-inherit duration/rules from Sub-Category or Parent Gov Exam if provided
    if (sanitizedData.govExamCategoryId) {
      const GovExamCategory = (await import("@/models/GovExamCategory")).default;
      const cat = await GovExamCategory.findById(sanitizedData.govExamCategoryId).lean();
      if (cat) {
        sanitizedData.duration = cat.duration;
        sanitizedData.examMode = cat.examMode;
      }
    } else if (sanitizedData.govExamId) {
      const GovExam = (await import("@/models/GovExam")).default;
      const gov = await GovExam.findById(sanitizedData.govExamId).lean();
      if (gov) {
        sanitizedData.duration = gov.defaultDuration || sanitizedData.duration || 10;
      }
    }

    // Auto-fill missing required fields
    const examData = {
      ...sanitizedData,
      startTime: sanitizedData.startTime || new Date(),
      endTime: sanitizedData.endTime || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: sanitizedData.status || "Active",
    };

    const exam = await TypingExam.create(examData);
    return NextResponse.json({ success: true, exam: exam.toObject() }, { status: 201 });
  } catch (error: any) {
    console.error("Exam Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create exam" }, { status: 500 });
  }
}
