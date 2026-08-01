"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import HeroSlide from "@/models/HeroSlide";
import CMSContent from "@/models/CMSContent";
import Course from "@/models/Course";
import Faculty from "@/models/Faculty";
import BlogPost from "@/models/BlogPost";
import CertificateTemplate from "@/models/CertificateTemplate";
import CmsContentBlock from "@/models/CmsContentBlock";
import { UserRole } from "@/models/User";

export async function getMediaGallery() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== UserRole.ADMIN) {
            return { success: false, error: "Unauthorized" };
        }

        await dbConnect();

        // 1. Fetch all media items
        const mediaItems = await Media.find({}).sort({ createdAt: -1 }).lean();

        // 2. Fetch all collections in parallel for usage checks
        const [
            heroSlides,
            courses,
            faculties,
            blogPosts,
            certTemplates,
            cmsContents,
            cmsBlocks
        ] = await Promise.all([
            HeroSlide.find({}, "imageUrl").lean(),
            Course.find({}, "thumbnail").lean(),
            Faculty.find({}, "photo").lean(),
            BlogPost.find({}, "featuredImage").lean(),
            CertificateTemplate.find({}, "backgroundImage").lean(),
            CMSContent.find({}).lean(),
            CmsContentBlock.find({}).lean()
        ]);

        // Build set of used static URLs for O(1) lookups
        const usedUrls = new Set<string>();
        heroSlides.forEach(h => { if (h.imageUrl) usedUrls.add(h.imageUrl); });
        courses.forEach(c => { if (c.thumbnail) usedUrls.add(c.thumbnail); });
        faculties.forEach(f => { if (f.photo) usedUrls.add(f.photo); });
        blogPosts.forEach(b => { if (b.featuredImage) usedUrls.add(b.featuredImage); });
        certTemplates.forEach(t => { if (t.backgroundImage) usedUrls.add(t.backgroundImage); });

        // CMS dynamic documents containing image strings
        const cmsDocsJson = [
            ...cmsContents.map(d => JSON.stringify(d.data || {})),
            ...cmsBlocks.map(b => JSON.stringify(b || {}))
        ];

        // 3. Map media items with usage details
        const enrichedMedia = mediaItems.map((media: any) => {
            const url = media.url;
            let inUse = usedUrls.has(url);

            if (!inUse) {
                // Scan JSON strings of dynamic content blocks
                inUse = cmsDocsJson.some(jsonStr => jsonStr.includes(url));
            }

            return {
                id: media._id.toString(),
                filename: media.filename,
                url: media.url,
                mimeType: media.mimeType,
                size: media.size,
                category: media.category || "Others",
                createdAt: media.createdAt ? new Date(media.createdAt).toISOString() : null,
                inUse
            };
        });

        return {
            success: true,
            media: enrichedMedia
        };
    } catch (error: any) {
        console.error("Error in getMediaGallery server action:", error);
        return { success: false, error: error.message || "Failed to load media gallery" };
    }
}

export async function deleteMediaItem(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== UserRole.ADMIN) {
            return { success: false, error: "Unauthorized" };
        }

        await dbConnect();

        // 1. Retrieve the media item from DB
        const media = await Media.findById(id);
        if (!media) {
            return { success: false, error: "Media item not found" };
        }

        // 2. Resolve target file path on local disk
        const relativeUrl = media.url; // e.g. "/uploads/gallery/filename.png"
        const filePath = path.join(process.cwd(), "public", ...relativeUrl.split("/").filter(Boolean));

        // 3. Delete file from local storage if it exists
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Successfully deleted file from disk: ${filePath}`);
            } else {
                console.warn(`File does not exist on disk at path: ${filePath}`);
            }
        } catch (fileError: any) {
            console.error(`Error deleting physical file: ${fileError.message}`);
            // Proceed with database deletion even if file was already removed from disk
        }

        // 4. Remove metadata record from database
        await Media.findByIdAndDelete(id);

        revalidatePath("/", "layout");
        return { success: true, message: "Media deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting media item:", error);
        return { success: false, error: error.message || "Failed to delete media item" };
    }
}
