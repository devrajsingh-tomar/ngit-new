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
      return NextResponse.json({ success: false, error: "Unauthorized: Login required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(50, Number(searchParams.get("limit")) || 10);
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      StenoResult.find({ userId: session.user.id })
        .populate("passageId")
        .populate("examId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StenoResult.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(attempts)),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized: Login required" }, { status: 401 });
    }

    const body = await req.json();
    const resultDoc = await StenoResult.create({
      userId: session.user.id,
      ...body,
    });

    return NextResponse.json(
      { success: true, data: { resultId: resultDoc._id.toString() } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
