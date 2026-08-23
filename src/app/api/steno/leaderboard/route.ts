import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoResult from "@/models/StenoResult";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const targetWpm = searchParams.get("targetWpm");
    const passageId = searchParams.get("passageId");
    const dateRange = searchParams.get("dateRange");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(50, Number(searchParams.get("limit")) || 25);
    const skip = (page - 1) * limit;

    const queryFilter: any = {};
    if (passageId && passageId !== "All") queryFilter.passageId = passageId;
    if (targetWpm) queryFilter.targetWpm = Number(targetWpm);

    if (dateRange === "this_week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      queryFilter.createdAt = { $gte: weekAgo };
    } else if (dateRange === "this_month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      queryFilter.createdAt = { $gte: monthAgo };
    }

    const [leaderboard, total] = await Promise.all([
      StenoResult.find(queryFilter)
        .populate("userId", "name image") // Safe public fields ONLY
        .populate("passageId", "title language targetWpm")
        .sort({ score: -1, accuracy: -1, speedWpm: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StenoResult.countDocuments(queryFilter),
    ]);

    const safeLeaderboard = leaderboard.map((item: any) => ({
      _id: item._id.toString(),
      studentName: item.userId?.name || "Anonymous Learner",
      studentImage: item.userId?.image || null,
      passageTitle: item.passageId?.title || "Steno Dictation",
      language: item.passageId?.language || "Hindi",
      targetWpm: item.targetWpm || item.passageId?.targetWpm || 80,
      speedWpm: item.speedWpm || item.netWpm || 0,
      accuracy: item.accuracy || 0,
      score: item.score || 0,
      status: item.status || "Evaluated",
    }));

    return NextResponse.json({
      success: true,
      data: safeLeaderboard,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
