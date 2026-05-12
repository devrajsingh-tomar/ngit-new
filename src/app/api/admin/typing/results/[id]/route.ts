import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingResult from "@/models/TypingResult";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectDB();
    
    const result = await TypingResult.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Result deleted successfully" });
  } catch (error: any) {
    console.error("Delete Typing Result Error:", error);
    return NextResponse.json({ error: "Failed to delete result" }, { status: 500 });
  }
}
