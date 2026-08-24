import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingBook from "@/models/TypingBook";
import TypingPassage from "@/models/TypingPassage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TYPING_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Unlink all passages that belong to this book
    await TypingPassage.updateMany({ bookId: id }, { $unset: { bookId: "" } });

    await TypingBook.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Book Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete book" }, { status: 500 });
  }
}
