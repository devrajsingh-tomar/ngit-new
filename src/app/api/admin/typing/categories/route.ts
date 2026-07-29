import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingCategory from "@/models/TypingCategory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const categories = await TypingCategory.find().populate("parentCategoryId").sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    
    if (data.parentCategoryId === "") {
        data.parentCategoryId = null;
    }
    
    const slug = data.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    
    const category = await TypingCategory.create({
      ...data,
      slug
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Category Creation Error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
