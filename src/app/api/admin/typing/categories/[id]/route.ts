import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingCategory from "@/models/TypingCategory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TYPING_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    console.log("Attempting to delete category with ID:", id);
    
    if (!id) {
        return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const result = await TypingCategory.findByIdAndDelete(id);
    console.log("Delete result:", result);

    if (!result) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
