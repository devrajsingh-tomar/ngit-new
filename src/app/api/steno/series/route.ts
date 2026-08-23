import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoSeries from "@/models/StenoSeries";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const category = searchParams.get("category");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
    const skip = (page - 1) * limit;

    const query: any = { isPublished: true };
    if (language && language !== "All") query.language = language;
    if (category && category !== "All") query.category = category;

    const [series, total] = await Promise.all([
      StenoSeries.find(query)
        .populate("passages")
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StenoSeries.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(series)),
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
    const seriesDoc = await StenoSeries.create(body);
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(seriesDoc)) }, { status: 201 });
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
    const updated = await StenoSeries.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
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

    await StenoSeries.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Series deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
