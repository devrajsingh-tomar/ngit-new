"use server";

import connectDB from "@/lib/db";
import Faculty from "@/models/Faculty";
import { revalidatePath } from "next/cache";

export async function createFaculty(data: any) {
    try {
        await connectDB();

        const faculty = await Faculty.create(data);

        revalidatePath("/admin/faculty");
        revalidatePath("/faculty");
        revalidatePath("/", "layout");
        return { success: true, faculty: JSON.parse(JSON.stringify(faculty)) };
    } catch (error: any) {
        console.error("Create Faculty Error:", error);
        return { success: false, error: error.message || "Failed to add faculty" };
    }
}

export async function deleteFaculty(id: string) {
    try {
        await connectDB();
        await Faculty.findByIdAndDelete(id);
        revalidatePath("/admin/faculty");
        revalidatePath("/faculty");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete faculty" };
    }
}

export async function getFaculty() {
    try {
        await connectDB();
        const faculty = await Faculty.find({
            position: { $not: /Director|MD|Chairman|Managing Director|Principal/i }
        }).sort({ createdAt: -1 }).lean();
        return { success: true, faculty: JSON.parse(JSON.stringify(faculty)) };
    } catch (error) {
        console.error("Failed to load faculty", error);
        return { success: false, error: "Failed to fetch faculty" };
    }
}

export async function getFacultyById(id: string) {
    try {
        await connectDB();
        const faculty = await Faculty.findById(id).lean();
        if (!faculty) return { success: false, error: "Faculty not found" };
        return { success: true, faculty: JSON.parse(JSON.stringify(faculty)) };
    } catch (error) {
        console.error("Failed to load faculty", error);
        return { success: false, error: "Failed to fetch faculty" };
    }
}

export async function updateFaculty(id: string, data: any) {
    try {
        await connectDB();
        const faculty = await Faculty.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/admin/faculty");
        revalidatePath("/faculty");
        revalidatePath("/", "layout");
        return { success: true, faculty: JSON.parse(JSON.stringify(faculty)) };
    } catch (error: any) {
        console.error("Update Faculty Error:", error);
        return { success: false, error: error.message || "Failed to update faculty" };
    }
}
