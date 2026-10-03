import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import StenoPassage from "@/models/StenoPassage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid passage ID" }, { status: 400 });
    }

    let passage: any = null;
    try {
      passage = await StenoPassage.findById(id).populate("seriesId").populate("examPresetId").lean();
    } catch {
      passage = await StenoPassage.findById(id).lean();
    }

    if (!passage) {
      return NextResponse.json({ success: false, error: "Passage not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      passage: JSON.parse(JSON.stringify(passage)),
      data: JSON.parse(JSON.stringify(passage)),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
