import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingRulePreset from "@/models/TypingRulePreset";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Clear references from GovExam before deleting
    const preset = await TypingRulePreset.findById(id).lean();
    if (preset && preset.govExamId) {
      await GovExam.findByIdAndUpdate(preset.govExamId, { $unset: { rulePresetId: "" } });
      await TypingExam.updateMany({ govExamId: preset.govExamId }, { $unset: { rulePresetId: "" } });
    }

    await TypingRulePreset.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    if (data.govExamId === "") {
      data.govExamId = null;
    }

    // Get old preset to check for govExamId change
    const oldPreset = await TypingRulePreset.findById(id).lean();

    const preset = await TypingRulePreset.findByIdAndUpdate(id, data, { new: true });
    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // 1. Sync GovExam linking
    if (oldPreset && oldPreset.govExamId?.toString() !== preset.govExamId?.toString()) {
      // Clear rulePresetId from old GovExam
      if (oldPreset.govExamId) {
        await GovExam.findByIdAndUpdate(oldPreset.govExamId, { $unset: { rulePresetId: "" } });
        // Clear preset from old exams
        await TypingExam.updateMany({ govExamId: oldPreset.govExamId }, { $unset: { rulePresetId: "" } });
      }
    }

    if (preset.govExamId) {
      // Link to new GovExam
      await GovExam.findByIdAndUpdate(preset.govExamId, { rulePresetId: preset._id });
    }

    // 2. Propagate rule changes to all associated TypingExams
    const targetGovExamId = preset.govExamId;
    if (targetGovExamId) {
      await TypingExam.updateMany(
        { govExamId: targetGovExamId },
        {
          $set: {
            rulePresetId: preset._id,
            wordLimit: preset.wordLimit || 0,
            backspaceMode: preset.backspaceMode || "full",
            highlightMode: preset.highlightMode || "word",
            autoScroll: preset.autoScroll !== undefined ? preset.autoScroll : true,
            showScrollbar: preset.showScrollbar !== undefined ? preset.showScrollbar : true,
            examMode: preset.examMode || "General"
          }
        }
      );
    }

    return NextResponse.json(preset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
