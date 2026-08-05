import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovExamCategory from "@/models/GovExamCategory";
import "@/models/GovExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const govExamId = searchParams.get("govExamId");

    const filter: any = {};
    if (govExamId) filter.govExamId = govExamId;

    const categories = await GovExamCategory.find(filter)
      .populate("govExamId", "title slug")
      .sort({ govExamId: 1, name: 1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();

    // Auto-generate slug
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    const category = await GovExamCategory.create(data);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
