"use server";

import connectDB from "@/lib/db";
import CmsPage from "@/models/CmsPage";
import CmsSection from "@/models/CmsSection";
import CmsContentBlock from "@/models/CmsContentBlock";
import HeroSlide from "@/models/HeroSlide";
import SecondarySlide from "@/models/SecondarySlide";
import { revalidatePath } from "next/cache";

export async function getHeroSlides() {
    try {
        await connectDB();
        const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean();
        return { success: true, slides: JSON.parse(JSON.stringify(slides)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCmsPages() {
    try {
        await connectDB();
        const pages = await CmsPage.find().lean();
        return { success: true, pages: JSON.parse(JSON.stringify(pages)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createCmsPage(data: any) {
    try {
        await connectDB();
        const page = await CmsPage.create(data);
        revalidatePath("/");
        return { success: true, page: JSON.parse(JSON.stringify(page)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCmsPage(id: string, data: any) {
    try {
        await connectDB();
        const page = await CmsPage.findByIdAndUpdate(id, data, { new: true }).lean();
        revalidatePath("/");
        return { success: true, page: JSON.parse(JSON.stringify(page)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCmsPage(id: string) {
    try {
        await connectDB();
        // Delete all sections and blocks for this page
        const sections = await CmsSection.find({ page_id: id });
        for (const section of sections) {
            await CmsContentBlock.deleteMany({ section_id: section._id });
        }
        await CmsSection.deleteMany({ page_id: id });
        await CmsPage.findByIdAndDelete(id);
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCmsSections(pageId: string) {
    try {
        await connectDB();
        const sections = await CmsSection.find({ page_id: pageId }).sort({ sort_order: 1 }).lean();
        return { success: true, sections: JSON.parse(JSON.stringify(sections)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createCmsSection(data: any) {
    try {
        await connectDB();
        const section = await CmsSection.create(data);
        revalidatePath("/");
        return { success: true, section: JSON.parse(JSON.stringify(section)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCmsSection(id: string, data: any) {
    try {
        await connectDB();
        const section = await CmsSection.findByIdAndUpdate(id, data, { new: true }).lean();
        revalidatePath("/");
        return { success: true, section: JSON.parse(JSON.stringify(section)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCmsSection(id: string) {
    try {
        await connectDB();
        await CmsContentBlock.deleteMany({ section_id: id });
        await CmsSection.findByIdAndDelete(id);
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCmsContentBlocks(sectionId: string) {
    try {
        await connectDB();
        const blocks = await CmsContentBlock.find({ section_id: sectionId }).sort({ sort_order: 1 }).lean();
        return { success: true, blocks: JSON.parse(JSON.stringify(blocks)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createCmsContentBlock(data: any) {
    try {
        await connectDB();
        const block = await CmsContentBlock.create(data);
        revalidatePath("/");
        return { success: true, block: JSON.parse(JSON.stringify(block)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCmsContentBlock(id: string, data: any) {
    try {
        await connectDB();
        const block = await CmsContentBlock.findByIdAndUpdate(id, data, { new: true }).lean();
        revalidatePath("/");
        return { success: true, block: JSON.parse(JSON.stringify(block)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCmsContentBlock(id: string) {
    try {
        await connectDB();
        await CmsContentBlock.findByIdAndDelete(id);
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getDynamicPageData(pageName: string) {
    try {
        await connectDB();
        const page: any = await CmsPage.findOne({ page_name: pageName }).lean();
        if (!page) return { success: false, error: "Page not found" };

        const sections: any[] = await CmsSection.find({ page_id: page._id, is_active: true }).sort({ sort_order: 1 }).lean();
        
        const sectionsData = await Promise.all(sections.map(async (section: any) => {
            const now = new Date();
            const blocks = await CmsContentBlock.find({ 
                section_id: section._id,
                is_active: { $ne: false },
                $and: [
                    { 
                        $or: [
                            { start_date: { $exists: false } },
                            { start_date: { $eq: null } },
                            { start_date: { $lte: now } }
                        ]
                    },
                    {
                        $or: [
                            { end_date: { $exists: false } },
                            { end_date: { $eq: null } },
                            { end_date: { $gte: now } }
                        ]
                    }
                ]
            }).sort({ sort_order: 1 }).lean();
            return {
                ...section,
                blocks
            };
        }));

        return { 
            success: true, 
            page: JSON.parse(JSON.stringify(page)), 
            sections: JSON.parse(JSON.stringify(sectionsData)) 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ── SECONDARY BANNER SLIDES ──

export async function getSecondarySlides(all = false) {
    try {
        await connectDB();
        const filter = all ? {} : { isActive: true };
        const slides = await SecondarySlide.find(filter).sort({ order: 1, createdAt: -1 }).lean();
        return { success: true, slides: JSON.parse(JSON.stringify(slides)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createSecondarySlideAction(data: any) {
    try {
        await connectDB();
        const slide = await SecondarySlide.create(data);
        revalidatePath("/");
        return { success: true, slide: JSON.parse(JSON.stringify(slide)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSecondarySlideAction(id: string, data: any) {
    try {
        await connectDB();
        const slide = await SecondarySlide.findByIdAndUpdate(id, data, { new: true }).lean();
        revalidatePath("/");
        return { success: true, slide: JSON.parse(JSON.stringify(slide)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSecondarySlideAction(id: string) {
    try {
        await connectDB();
        await SecondarySlide.findByIdAndDelete(id);
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
