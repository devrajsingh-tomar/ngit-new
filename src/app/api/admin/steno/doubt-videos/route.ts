import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoDoubtVideo from "@/models/StenoDoubtVideo";
import { DEFAULT_STENO_DOUBT_VIDEOS } from "@/lib/steno/defaultDoubtVideos";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// GET — list all videos (admin)
export async function GET() {
  try {
    await connectDB();
    const videos = await StenoDoubtVideo.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json(videos);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// POST — create video OR seed default videos
export async function POST(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isSeed = searchParams.get("action") === "seed";

    if (isSeed) {
      // Remove default IDs before insert
      const seedItems = DEFAULT_STENO_DOUBT_VIDEOS.map(({ _id, ...rest }) => rest);
      await StenoDoubtVideo.insertMany(seedItems);
      const allVideos = await StenoDoubtVideo.find().sort({ order: 1 });
      return NextResponse.json({ success: true, count: seedItems.length, data: allVideos });
    }

    const body = await req.json();
    let { title, videoUrl, thumbnailUrl, description, order, isActive } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and Video URL are required" },
        { status: 400 }
      );
    }

    // Auto-generate YouTube thumbnail if thumbnail is missing
    if (!thumbnailUrl || thumbnailUrl.trim() === "") {
      const ytId = extractYouTubeId(videoUrl);
      if (ytId) {
        thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      } else {
        thumbnailUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
      }
    }

    const video = await StenoDoubtVideo.create({
      title,
      videoUrl,
      thumbnailUrl,
      description: description || "",
      order: typeof order === "number" ? order : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create video" },
      { status: 500 }
    );
  }
}
