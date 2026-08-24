import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingBook from "@/models/TypingBook";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TYPING_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const book = await TypingBook.create(data);
    return NextResponse.json(book);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Book with this name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

export async function GET() {
    try {
        await connectDB();
        const books = await TypingBook.find().sort({ name: 1 });
        return NextResponse.json(books);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }
}
