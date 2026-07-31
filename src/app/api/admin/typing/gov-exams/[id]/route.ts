import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import TypingExam from "@/models/TypingExam";
import TypingRulePreset from "@/models/TypingRulePreset";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    await GovExam.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();
    
    // Explicitly pick allowed fields to avoid unintended overwrites
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rulePresetId !== undefined) {
      updateData.rulePresetId = data.rulePresetId === "" ? null : data.rulePresetId;
    }
    if (data.defaultDuration !== undefined) {
      updateData.defaultDuration = data.defaultDuration === "" ? 10 : Number(data.defaultDuration);
    }
    
    // Auto-update slug if title changed
    if (data.title) {
      updateData.slug = data.title.toLowerCase().replace(/\s+/g, '-');
    }

    const exam = await GovExam.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    
    if (!exam) {
      return NextResponse.json({ error: `Exam not found with ID: ${id}` }, { status: 404 });
    }

    // Automatically propagate linked rule preset configurations to all child Typing Exams
    if (updateData.rulePresetId !== undefined) {
      if (updateData.rulePresetId) {
        const preset = await TypingRulePreset.findById(updateData.rulePresetId).lean();
        if (preset) {
          await TypingExam.updateMany(
            { govExamId: id },
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
      } else {
        // Preset was unlinked, clear preset reference from child exams
        await TypingExam.updateMany(
          { govExamId: id },
          { 
            $unset: { rulePresetId: "" },
            $set: {
              wordLimit: 0,
              backspaceMode: "full",
              highlightMode: "word",
              autoScroll: true,
              showScrollbar: true,
              examMode: "General"
            }
          }
        );
      }
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
