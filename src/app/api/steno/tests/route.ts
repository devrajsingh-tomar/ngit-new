import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoCustomTest from "@/models/StenoCustomTest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized: Student login required" }, { status: 401 });
    }

    const customTests = await StenoCustomTest.find({ userId: session.user.id })
      .populate("passageId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(customTests)) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized: Student login required" }, { status: 401 });
    }

    const body = await req.json();
    const customTest = await StenoCustomTest.create({
      userId: session.user.id,
      ...body,
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(customTest)) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized: Student login required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    await StenoCustomTest.findOneAndDelete({ _id: id, userId: session.user.id });
    return NextResponse.json({ success: true, message: "Custom test deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
