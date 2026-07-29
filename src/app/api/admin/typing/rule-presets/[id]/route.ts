import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingRulePreset from "@/models/TypingRulePreset";
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

    const preset = await TypingRulePreset.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(preset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
