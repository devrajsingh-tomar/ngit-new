import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingResult from "@/models/TypingResult";
import "@/models/TypingExam";
import "@/models/TypingPassage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const result = await TypingResult.findById(id)
      .populate("userId", "name image email")
      .populate({
        path: "examId",
        populate: { path: "passageId" }
      });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }
}
