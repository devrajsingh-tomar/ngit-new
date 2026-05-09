
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

type UploadResult = {
    success: boolean;
    url?: string;
    filename?: string;
    error?: string;
};

// Configuration
// Configuration - Store in public directory so Next.js can serve them directly
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];


// Magic Numbers for File Types
const MAGIC_NUMBERS = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46] // partial check (RIFF)
};

const validateBuffer = (buffer: Buffer, type: string): boolean => {
    if (type.includes("jpeg") || type.includes("jpg")) {
        return Buffer.compare(buffer.subarray(0, 3), Buffer.from(MAGIC_NUMBERS.jpg)) === 0;
    }
    if (type.includes("png")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.png)) === 0;
    }
    if (type.includes("webp")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.webp)) === 0;
    }
    return true; // Weak check if unknown but allowed
};


const ensureUploadDir = async () => {
    try {
        // Create the full path
        await mkdir(UPLOAD_DIR, { recursive: true });
        
        // Ensure parent and child directories are searchable and readable on VPS
        const { chmod } = await import("fs/promises");
        
        // Try to set permissions for the 'uploads' and 'gallery' directories
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        try {
            await chmod(uploadsDir, 0o755);
            await chmod(UPLOAD_DIR, 0o755);
        } catch (chmodErr) {
            console.warn("Could not set directory permissions (may be on Windows):", chmodErr);
        }
    } catch (error) {
        console.error("Error creating upload directory:", error);
    }
};

/**
 * Validates and saves an image file to the local filesystem.
 * Returns the public URL and filename.
 */
export async function saveImage(file: File): Promise<UploadResult> {
    try {
        // 1. Validate File Existence
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // 2. Client-Side Type Check (Keep for fast reject)
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` };
        }

        // 3. Validate File Size
        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "File size exceeds 5MB limit" };
        }

        // 4. Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 5. Server-Side Magic Byte Check (Security)
        if (!validateBuffer(buffer, file.type)) {
            return { success: false, error: "File content does not match extension (spoofing detected)" };
        }

        // 6. Prepare Directory
        await ensureUploadDir();

        // 7. Generate Unique Filename
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        // Use mapped extension based on MIME type to ensure consistency
        const mimeToExt: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        };
        const extension = mimeToExt[file.type] || "jpg";
        const filename = `${timestamp}-${uniqueId}.${extension}`;

        // 8. Save File to Disk
        const filePath = path.join(UPLOAD_DIR, filename);
        await writeFile(filePath, buffer);
        
        // 9. Set permissions for VPS serving
        const { chmod } = await import("fs/promises");
        await chmod(filePath, 0o644);

        // 9. Generate Public URL
        const publicUrl = `/uploads/gallery/${filename}`;

        return {
            success: true,
            url: publicUrl,
            filename: filename
        };

    } catch (error: any) {
        console.error("File save error:", error);
        return { success: false, error: "Failed to save file" };
    }
}
