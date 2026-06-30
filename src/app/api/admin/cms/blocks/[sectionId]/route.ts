import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CmsContentBlock from "@/models/CmsContentBlock";

export async function GET(_: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  try {
    await connectDB();
    const { sectionId } = await params;
    const blocks = await CmsContentBlock.find({ section_id: sectionId })
      .sort({ sort_order: 1 })
      .lean();
    return NextResponse.json({ success: true, blocks: JSON.parse(JSON.stringify(blocks)) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
