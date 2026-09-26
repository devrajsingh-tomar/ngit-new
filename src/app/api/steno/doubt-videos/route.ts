import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoDoubtVideo from "@/models/StenoDoubtVideo";
import { DEFAULT_STENO_DOUBT_VIDEOS } from "@/lib/steno/defaultDoubtVideos";

export async function GET() {
  try {
    await connectDB();
    const videos = await StenoDoubtVideo.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json(DEFAULT_STENO_DOUBT_VIDEOS);
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching steno doubt videos:", error);
    return NextResponse.json(DEFAULT_STENO_DOUBT_VIDEOS);
  }
}
