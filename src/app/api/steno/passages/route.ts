import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoPassage from "@/models/StenoPassage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const category = searchParams.get("category");
    const targetWpm = searchParams.get("targetWpm");
    const seriesId = searchParams.get("seriesId");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(50, Number(searchParams.get("limit")) || 12);
    const skip = (page - 1) * limit;

    const query: any = { isPublished: true };
    if (language && language !== "All") query.language = language;
    if (category && category !== "All") query.category = category;
    if (targetWpm) query.targetWpm = Number(targetWpm);
    if (seriesId && seriesId !== "All") query.seriesId = seriesId;

    const [passages, total] = await Promise.all([
      StenoPassage.find(query)
        .populate("seriesId")
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StenoPassage.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(passages)),
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
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const passage = await StenoPassage.create(body);
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(passage)) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const body = await req.json();
    const updated = await StenoPassage.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    await StenoPassage.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Passage deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
