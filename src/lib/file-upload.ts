import fs from "fs";
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
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/gif", 
    "image/svg+xml",
    "image/bmp",
    "application/pdf"
];

const MAGIC_NUMBERS = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46],
    gif: [0x47, 0x49, 0x46, 0x38],
    pdf: [0x25, 0x50, 0x44, 0x46]
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
    if (type.includes("gif")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.gif)) === 0;
    }
    if (type.includes("pdf")) {
        return Buffer.compare(buffer.subarray(0, 4), Buffer.from(MAGIC_NUMBERS.pdf)) === 0;
    }
    return true; 
};

/**
 * Ensures the upload directory exists: public/uploads/[subDir]
 */
const ensureUploadDir = (subDir: string = "gallery") => {
    try {
        const targetDir = path.join(process.cwd(), "public", "uploads", subDir);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        return targetDir;
    } catch (error: any) {
        throw new Error(`Directory creation failed: ${error.message}`);
    }
};

/**
 * Validates and saves an image file to the local filesystem.
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
            return { success: false, error: `Invalid type: ${file.type}` };
        }

        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "File size exceeds 50MB limit" };
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!validateBuffer(buffer, file.type)) {
            return { success: false, error: "File content mismatch (invalid file data)" };
        }

        const uploadPath = ensureUploadDir(subDir);
        
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
        const filePath = path.join(uploadPath, filename);

        // Synchronous write for maximum compatibility in this environment
        fs.writeFileSync(filePath, buffer);

        return {
            success: true,
            url: `/uploads/${subDir}/${filename}`,
            filename: filename
        };

    } catch (error: any) {
        console.error("File save error:", error);
        return { 
            success: false, 
            error: `Server Error: ${error.message || 'Unknown failure'}` 
        };
    }
}


