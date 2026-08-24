import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingTopic from "@/models/TypingTopic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const topics = await TypingTopic.find().sort({ name: 1 });
    return NextResponse.json(topics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TYPING_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    
    // Auto-generate slug if missing
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    const topic = await TypingTopic.create(data);
    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
