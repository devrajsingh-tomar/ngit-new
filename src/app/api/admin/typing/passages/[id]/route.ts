import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingPassage from "@/models/TypingPassage";
import TypingExam from "@/models/TypingExam";
import GovExam from "@/models/GovExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    await connectDB();

    const { govExamIds, ...passageData } = data;

    // Recalculate wordCount if content changed
    if (passageData.content) {
      passageData.wordCount = passageData.content.trim().split(/\s+/).length;
    }
    // Clear bookId if empty string submitted
    if (passageData.bookId === "") {
      passageData.bookId = null;
    }

    const passage = await TypingPassage.findByIdAndUpdate(id, passageData, { new: true });
    
    if (!passage) {
      return NextResponse.json({ error: "Passage not found" }, { status: 404 });
    }

    // Sync Gov Exam assignments if provided
    if (govExamIds && Array.isArray(govExamIds)) {
      // Find all existing exams for this passage that are linked to a Gov Exam
      const existingExams = await TypingExam.find({ passageId: id, govExamId: { $ne: null } });
      const existingGovExamIds = existingExams.map(e => e.govExamId?.toString()).filter(Boolean) as string[];

      const newlyAdded = govExamIds.filter(gid => gid && !existingGovExamIds.includes(gid.toString()));
      const removed = existingGovExamIds.filter(gid => !govExamIds.map(x => x.toString()).includes(gid));

      // 1. Delete removed assignments
      if (removed.length > 0) {
        await TypingExam.deleteMany({ passageId: id, govExamId: { $in: removed } });
      }

      // 2. Create newly added assignments
      for (const govExamId of newlyAdded) {
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

      // 3. Keep remaining active tests in sync if title/language/difficulty updated
      const remainingGovExamIds = govExamIds.filter(gid => existingGovExamIds.includes(gid.toString()));
      if (remainingGovExamIds.length > 0) {
        await TypingExam.updateMany(
          { passageId: id, govExamId: { $in: remainingGovExamIds } },
          { 
            $set: { 
              title: passage.title, 
              language: passage.language, 
              difficulty: passage.difficulty 
            } 
          }
        );
      }
    }

    return NextResponse.json(passage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const passage = await TypingPassage.findByIdAndDelete(id);

    if (!passage) {
      return NextResponse.json({ error: "Passage not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Passage deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
