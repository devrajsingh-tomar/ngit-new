import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingRulePreset from "@/models/TypingRulePreset";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    if (data.govExamId === "") {
      data.govExamId = null;
    }

    const preset = await TypingRulePreset.create(data);
    return NextResponse.json(preset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const presets = await TypingRulePreset.find().populate("govExamId").sort({ name: 1 });
    return NextResponse.json(presets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
