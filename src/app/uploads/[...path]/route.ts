
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), "uploads", ...pathSegments);

    try {
        let finalPath = filePath;
        
        if (!fs.existsSync(finalPath)) {
            // Try fallback to public/uploads
            const fallbackPath = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads", ...pathSegments);
            if (fs.existsSync(fallbackPath)) {
                finalPath = fallbackPath;
            } else {
                console.error(`[Upload Service] File not found at root OR public fallback: ${filePath}`);
                return new NextResponse("File not found", { status: 404 });
            }
        }

        const fileBuffer = fs.readFileSync(finalPath);
        const extension = path.extname(finalPath).toLowerCase();
        
        const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".bmp": "image/bmp",
            ".pdf": "application/pdf",
            ".mp4": "video/mp4",
        };

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": mimeTypes[extension] || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: any) {
        console.error(`[Upload Service] Internal error serving file ${filePath}:`, error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
