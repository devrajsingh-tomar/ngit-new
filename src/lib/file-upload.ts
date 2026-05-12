
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
// Configuration - Store in root directory as expected by the /api/uploads route
const UPLOAD_BASE = /* turbopackIgnore: true */ process.cwd();
const UPLOAD_REL_PATH = path.join("public", "uploads", "gallery");
const UPLOAD_DIR = path.join(UPLOAD_BASE, UPLOAD_REL_PATH);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // Increased to 10MB for larger profile pics/materials
const ALLOWED_TYPES = [
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/gif", 
    "image/svg+xml",
    "image/bmp"
];

// Magic Numbers for File Types
const MAGIC_NUMBERS = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46], // partial check (RIFF)
    gif: [0x47, 0x49, 0x46, 0x38]   // GIF87a or GIF89a
};

const validateBuffer = (buffer: Buffer, type: string): boolean => {
    // Basic format validation via magic numbers
    if (type.includes("jpeg") || type.includes("jpg")) {
        return Buffer.compare(buffer.subarray(0, 3), Buffer.from(MAGIC_NUMBERS.jpg)) === 0;
    }
    if (type.includes("png")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.png)) === 0;
    }
    if (type.includes("webp")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.webp)) === 0;
    }
    if (type.includes("gif")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.gif)) === 0;
    }
    // SVG and others are harder to validate via bytes, skip strict check
    return true; 
};

/**
 * Ensures the upload directory exists and has correct permissions for VPS serving.
 */
const ensureUploadDir = async () => {
    try {
        const folders = ["uploads", "gallery"];
        let currentPath = /* turbopackIgnore: true */ process.cwd();

        for (const folder of folders) {
            currentPath = path.join(currentPath, folder);
            
            try {
                await mkdir(currentPath, { recursive: true });
                // Set directory permissions to 755 (drwxr-xr-x) for web access
                try {
                    const { chmod } = await import("fs/promises");
                    await chmod(currentPath, 0o755);
                } catch (e) {
                    // Windows or permission issue
                }
            } catch (err: any) {
                if (err.code !== 'EEXIST') {
                    console.error(`Failed to create directory ${currentPath}:`, err);
                    throw err;
                }
            }
        }
    } catch (error) {
        console.error("Error in ensureUploadDir:", error);
        throw error;
    }
};

/**
 * Validates and saves an image file to the local filesystem.
 * Returns the public URL and filename.
 */
export async function saveImage(file: File): Promise<UploadResult> {
    try {
        if (!file) return { success: false, error: "No file provided" };

        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: `Invalid type. Supported: JPG, PNG, WEBP, GIF, SVG` };
        }

        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "File size exceeds 10MB limit" };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!validateBuffer(buffer, file.type)) {
            return { success: false, error: "File content mismatch (invalid image data)" };
        }

        await ensureUploadDir();

        const timestamp = Date.now();
        const uniqueId = uuidv4();
        
        const mimeToExt: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "image/svg+xml": "svg",
            "image/bmp": "bmp"
        };
        const extension = mimeToExt[file.type] || "jpg";
        const filename = `${timestamp}-${uniqueId}.${extension}`;

        const filePath = path.join(UPLOAD_DIR, filename);
        await writeFile(filePath, buffer);
        
        // Set file permissions to 644 (rw-r--r--) so it's readable by the web server
        try {
            const { chmod } = await import("fs/promises");
            await chmod(filePath, 0o644);
        } catch (e) {
            // Ignore on Windows
        }

        const publicUrl = `/uploads/gallery/${filename}`;

        return {
            success: true,
            url: publicUrl,
            filename: filename
        };

    } catch (error: any) {
        console.error("File save error:", error);
        return { success: false, error: "Critical failure saving file to server" };
    }
}
