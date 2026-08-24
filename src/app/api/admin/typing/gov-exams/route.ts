import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovExam from "@/models/GovExam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TYPING_ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();
    
    // Auto-generate slug from title if not provided
    if (!data.slug && data.title) {
        data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (data.rulePresetId === "") {
        data.rulePresetId = null;
    }

    const exam = await GovExam.create(data);
    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
