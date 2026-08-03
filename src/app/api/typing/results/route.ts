import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingResult from "@/models/TypingResult";
import "@/models/TypingExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route: /api/typing/results
 * Method: POST
 * Purpose: Securely save typing test attempts for students
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const data = await req.json();
    const { 
      examId, 
      wpm, 
      rawWpm, 
      netWpm,
      grossWpm,
      accuracy, 
      errorCount, 
      submittedText, 
      timeTaken,
      totalCharacters,
      backspaces
    } = data;

    // Validate required fields
    if (!examId || wpm === undefined || accuracy === undefined) {
      return NextResponse.json({ error: "Missing required performance metrics" }, { status: 400 });
    }

    await connectDB();

    // --- NEW: Duplicate Prevention (De-bouncing) ---
    // Check if the same student submitted for the same exam in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingRecentResult = await TypingResult.findOne({
      userId: session.user.id,
      examId,
      createdAt: { $gte: thirtySecondsAgo }
    });

    if (existingRecentResult) {
      return NextResponse.json({ 
        success: true, 
        message: "Result already saved recently", 
        resultId: existingRecentResult._id 
      }, { status: 200 });
    }

    // Create the result record
    const result = await TypingResult.create({
      userId: session.user.id,
      examId,
      wpm,
      rawWpm,
      netWpm: netWpm !== undefined ? netWpm : wpm,
      grossWpm: grossWpm !== undefined ? grossWpm : rawWpm,
      accuracy,
      errorCount,
      submittedText,
      timeTaken,
      totalCharacters,
      backspaces,
      completedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: "Result saved successfully", 
      resultId: result._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Result Submission Error:", error);
    return NextResponse.json({ error: "Failed to process results" }, { status: 500 });
  }
}

/**
 * Method: GET
 * Purpose: Fetch recent results for the current student
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const results = await TypingResult.find({ userId: session.user.id })
      .populate("examId", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
