import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoResult from "@/models/StenoResult";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const resultDoc = await StenoResult.findById(id)
        .populate("passageId")
        .populate("examId")
        .populate("userId", "name image email role")
        .lean();

      if (!resultDoc) return NextResponse.json({ success: false, error: "Result not found" }, { status: 404 });

      const userRole = (session.user as any).role;
      const isOwner = (resultDoc.userId as any)?._id?.toString() === session.user.id;
      const isStaff = ["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER", "TYPING_ADMIN"].includes(userRole);

      if (!isOwner && !isStaff) {
        return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
      }

      return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(resultDoc)) });
    }

    const userRole = (session.user as any)?.role;
    const isStaff = ["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER", "TYPING_ADMIN"].includes(userRole);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (!isStaff) {
      // Students can only see their own test results
      filter.userId = session.user.id;
    }

    const [results, total] = await Promise.all([
      StenoResult.find(filter)
        .populate("userId", "name email image")
        .populate("passageId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StenoResult.countDocuments(filter),
    ]);

    const parsedResults = JSON.parse(JSON.stringify(results));

    return NextResponse.json({
      success: true,
      data: parsedResults,
      results: parsedResults,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
