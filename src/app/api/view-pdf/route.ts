import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
        return new NextResponse("URL is required", { status: 400 });
    }

    try {
        // Handle local files only for security
        if (!fileUrl.startsWith("/uploads/")) {
             return new NextResponse("Only local uploads can be proxied", { status: 403 });
        }

        const filePath = path.join(process.cwd(), "public", fileUrl);
        
        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        
        // Return the file with headers that specifically ALLOW embedding
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
                "X-Frame-Options": "SAMEORIGIN", // Explicitly allow same origin
                "Content-Security-Policy": "frame-ancestors 'self'", // Explicitly allow self
            },
        });
    } catch (error) {
        console.error("PDF Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
