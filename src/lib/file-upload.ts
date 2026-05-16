import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export type UploadResult = {
    success: boolean;
    url?: string;
    filename?: string;
    size?: string;
    error?: string;
};

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

const MAX_FILE_SIZE = 50 * 1024 * 1024; // Increased to 50MB
const ALLOWED_TYPES = [
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/gif", 
    "image/svg+xml",
    "image/bmp",
    "application/pdf"
];

// Magic Numbers for File Types
const MAGIC_NUMBERS = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46], // partial check (RIFF)
    gif: [0x47, 0x49, 0x46, 0x38],   // GIF87a or GIF89a
    pdf: [0x25, 0x50, 0x44, 0x46]    // %PDF
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
    if (type.includes("pdf")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.pdf)) === 0;
    }
    // SVG and others are harder to validate via bytes, skip strict check
    return true; 
};

/**
 * Ensures the upload directory exists and has correct permissions for VPS serving.
 */
/**
 * Ensures the upload directory exists: public/uploads/[subDir]
 */
const ensureUploadDir = async (subDir: string = "gallery") => {
    try {
        const base = path.join(process.cwd(), "public", "uploads");
        const targetDir = path.join(base, subDir);

        // Create public/uploads first, then public/uploads/subDir
        await mkdir(base, { recursive: true });
        await mkdir(targetDir, { recursive: true });

        // Set directory permissions to 755 for web access (Linux/VPS)
        try {
            const { chmod } = await import("fs/promises");
            await chmod(base, 0o755);
            await chmod(targetDir, 0o755);
        } catch (e) {
            // Ignore on Windows or if permissions not applicable
        }
    } catch (error: any) {
        if (error.code !== 'EEXIST') {
            console.error("Error in ensureUploadDir:", error);
            throw error;
        }
    }
};


/**
 * Validates and saves an image file to the local filesystem.
 * Returns the public URL and filename.
 */
export async function saveImage(file: File): Promise<UploadResult> {
    return saveFile(file, "gallery");
}

/**
 * Generic function to save any allowed file to a specific subdirectory.
 */
export async function saveFile(file: File, subDir: string = "gallery"): Promise<UploadResult> {
    try {
        if (!file) return { success: false, error: "No file provided" };

        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: `Invalid type: ${file.type}. Supported: JPG, PNG, WEBP, GIF, SVG, PDF` };
        }

        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "File size exceeds 50MB limit" };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!validateBuffer(buffer, file.type)) {
            return { success: false, error: "File content mismatch (invalid file data)" };
        }

        await ensureUploadDir(subDir);

        const timestamp = Date.now();
        const uniqueId = uuidv4();
        
        const mimeToExt: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "image/svg+xml": "svg",
            "image/bmp": "bmp",
            "application/pdf": "pdf"
        };
        const extension = mimeToExt[file.type] || "file";
        const filename = `${timestamp}-${uniqueId}.${extension}`;

        const UPLOAD_PATH = path.join(process.cwd(), "public", "uploads", subDir);
        const filePath = path.join(UPLOAD_PATH, filename);
        await writeFile(filePath, buffer);
        
        // Set file permissions to 644 (rw-r--r--) so it's readable by the web server
        try {
            const { chmod } = await import("fs/promises");
            await chmod(filePath, 0o644);
        } catch (e) {
            // Ignore on Windows
        }

        const publicUrl = `/uploads/${subDir}/${filename}`;

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

