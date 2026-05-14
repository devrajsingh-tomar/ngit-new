
import { NextRequest, NextResponse } from "next/server";
import { saveFile } from "@/lib/file-upload";
import connectDB from "@/lib/db";
import Media from "@/models/Media";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Save File to 'materials' subdirectory
        const result = await saveFile(file, "materials");

        if (!result.success || !result.url) {
            return NextResponse.json({ error: result.error || "Upload failed" }, { status: 500 });
        }

        await connectDB();

        try {
            const newMedia = await Media.create({
                filename: result.filename,
                url: result.url,
                mimeType: file.type,
                size: file.size,
                uploadedBy: session.user.id
            });

            return NextResponse.json({
                success: true,
                url: result.url,
                mediaId: newMedia._id,
                size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
            }, { status: 201 });
        } catch (dbError: any) {
            console.error("Database save error for material media:", dbError);
            return NextResponse.json({ 
                success: true, // Still success since file is saved
                url: result.url,
                size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
            }, { status: 201 });
        }
    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
