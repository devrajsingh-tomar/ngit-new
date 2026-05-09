
import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "@/lib/file-upload";
import connectDB from "@/lib/db";
import Media from "@/models/Media";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication Check
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // 3. Save File to Disk
        const result = await saveImage(file);

        if (!result.success || !result.url) {
            return NextResponse.json({ error: result.error || "Upload failed" }, { status: 500 });
        }

        // 4. Save Metadata to Database
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
                mediaId: newMedia._id
            }, { status: 201 });
        } catch (dbError: any) {
            console.error("Database save error for media:", dbError);
            return NextResponse.json({ 
                error: "Image saved but metadata failed", 
                url: result.url,
                details: dbError.message 
            }, { status: 201 }); // Return 201 because image IS saved
        }
    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
