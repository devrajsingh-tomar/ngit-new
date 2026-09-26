import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StenoDoubtVideo from "@/models/StenoDoubtVideo";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// PATCH — update a video
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.videoUrl && (!body.thumbnailUrl || body.thumbnailUrl.trim() === "")) {
      const ytId = extractYouTubeId(body.videoUrl);
      if (ytId) {
        body.thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }

    const video = await StenoDoubtVideo.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE — remove a video
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await StenoDoubtVideo.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}
