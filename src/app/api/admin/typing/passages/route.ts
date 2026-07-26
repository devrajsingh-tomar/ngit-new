import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingPassage from "@/models/TypingPassage";
import TypingExam from "@/models/TypingExam";
import GovExam from "@/models/GovExam";
import TypingRulePreset from "@/models/TypingRulePreset";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const passages = await TypingPassage.find().sort({ createdAt: -1 });
    return NextResponse.json(passages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch passages" }, { status: 500 });
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
    
    // Extract govExamIds if provided
    const { govExamIds, ...passageData } = data;
    
    // Auto calculate word count
    const wordCount = passageData.content.trim().split(/\s+/).length;
    
    // Clear bookId if empty string submitted
    if (passageData.bookId === "") {
      passageData.bookId = null;
    }
    
    const passage = await TypingPassage.create({
      ...passageData,
      wordCount
    });

    // Auto-create tests (TypingExam) for selected Gov Exams
    if (govExamIds && Array.isArray(govExamIds) && govExamIds.length > 0) {
      for (const govExamId of govExamIds) {
        if (!govExamId) continue;
        const govExam = await GovExam.findById(govExamId).populate("rulePresetId");
        if (!govExam) continue;

        const preset: any = govExam.rulePresetId;
        
        await TypingExam.create({
          title: passage.title,
          category: govExam.title,
          language: passage.language,
          passageId: passage._id,
          govExamId: govExam._id,
          duration: govExam.defaultDuration || 10,
          wordLimit: preset?.wordLimit || 0,
          backspaceMode: preset?.backspaceMode || "full",
          highlightMode: preset?.highlightMode || "word",
          autoScroll: preset?.autoScroll !== undefined ? preset.autoScroll : true,
          showScrollbar: preset?.showScrollbar !== undefined ? preset.showScrollbar : true,
          examMode: preset?.examMode || "General",
          rulePresetId: preset?._id || null,
          difficulty: passage.difficulty || "Medium",
          status: "Active",
          startTime: new Date(),
          endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        });
      }
    }

    return NextResponse.json({ success: true, passage: passage.toObject() }, { status: 201 });
  } catch (error: any) {
    console.error("Passage Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create passage" }, { status: 500 });
  }
}
