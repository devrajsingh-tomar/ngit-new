"use server";

import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@/models/User";

const CourseSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    price: z.preprocess((val) => Number(val), z.number().min(0)), // Parse string to number
    category: z.string(),
    type: z.enum(["ONLINE", "OFFLINE"]).optional().default("ONLINE"),
    thumbnail: z.string().min(1),
});

import { createSafeAction } from "@/lib/safe-action";

export const createCourse = createSafeAction(
    { schema: CourseSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async (data) => {
        await connectDB();

        const slug = data.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

        const course = await Course.create({
            ...data,
            slug,
        });

        revalidatePath("/admin/courses");
        return JSON.parse(JSON.stringify(course));
    }
);

export async function getCourses(page: number = 1, limit: number = 20) {
    try {
        await connectDB();
        
        const skip = (page - 1) * limit;
        
        const courses = await Course.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title description price category thumbnail isPublished level instructor duration lessonCount enrollmentCount type')
            .lean();
            
        return JSON.parse(JSON.stringify(courses));
    } catch (error) {
        return [];
    }
}

export async function deleteCourse(id: string) {
    try {
        await connectDB();
        await Course.findByIdAndDelete(id);
        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
