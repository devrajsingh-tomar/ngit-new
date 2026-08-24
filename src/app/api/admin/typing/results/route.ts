import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingResult from "@/models/TypingResult";
import "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TYPING_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    
    await connectDB();
    const query = examId ? { examId } : {};
    
    const [results, total] = await Promise.all([
      TypingResult.find(query)
        .populate("userId", "name email")
        .populate("examId", "title language")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TypingResult.countDocuments(query)
    ]);

    return NextResponse.json({
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
