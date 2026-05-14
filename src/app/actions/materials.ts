"use server";

import connectDB from "@/lib/db";
import Material from "@/models/Material";
import Enrollment from "@/models/Enrollment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export async function createMaterial(data: any) {
    try {
        await connectDB();

        const material = await Material.create(data);

        revalidatePath("/admin/materials");
        return { success: true, material: JSON.parse(JSON.stringify(material)) };
    } catch (error: any) {
        console.error("Create Material Error:", error);
        return { success: false, error: error.message || "Failed to add material" };
    }
}

export async function deleteMaterial(id: string) {
    try {
        await connectDB();
        const material = await Material.findById(id);
        if (!material) return { success: false, error: "Material not found" };

        // If it's a local file, delete it from disk
        if (material.url.startsWith("/uploads/")) {
            try {
                const filePath = path.join(process.cwd(), "public", material.url);
                await unlink(filePath);
            } catch (fileError) {
                console.error("Failed to delete file from disk:", fileError);
                // Continue with DB deletion even if file deletion fails
            }
        }

        await Material.findByIdAndDelete(id);
        revalidatePath("/admin/materials");
        return { success: true };
    } catch (error) {
        console.error("Delete Material Error:", error);
        return { success: false, error: "Failed to delete material" };
    }
}

export async function getMaterials() {
    try {
        await connectDB();
        const materials = await Material.find().sort({ createdAt: -1 }).lean();
        return { success: true, materials: JSON.parse(JSON.stringify(materials)) };
    } catch (error) {
        console.error("Failed to load materials", error);
        return { success: false, error: "Failed to fetch materials" };
    }
}

export async function getStudentMaterials() {
    try {
        await connectDB();

        await import("@/models/Course");

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const enrollments = await Enrollment.find({ userId: session.user.id })
            .populate("courseId", "title")
            .lean();

        const courseNames = enrollments
            .map((en: any) => en.courseId?.title)
            .filter(Boolean);

        const materials = await Material.find()
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, materials: JSON.parse(JSON.stringify(materials)) };
    } catch (error: any) {
        console.error("Failed to load student materials", error);
        return { success: false, error: "Failed to fetch materials" };
    }
}

export async function getMaterialById(id: string) {
    try {
        await connectDB();
        const material = await Material.findById(id).lean();
        if (!material) return { success: false, error: "Material not found" };
        return { success: true, material: JSON.parse(JSON.stringify(material)) };
    } catch (error) {
        return { success: false, error: "Failed to fetch material" };
    }
}

export async function updateMaterial(id: string, data: any) {
    try {
        await connectDB();
        const material = await Material.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/admin/materials");
        return { success: true, material: JSON.parse(JSON.stringify(material)) };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update material" };
    }
}
