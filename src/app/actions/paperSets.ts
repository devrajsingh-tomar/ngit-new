"use server";

import connectDB from "@/lib/db";
import PaperSet, { IPaperSet } from "@/models/PaperSet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPaperSets() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const paperSets = await PaperSet.find()
            .populate("courseIds", "title")
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, paperSets: JSON.parse(JSON.stringify(paperSets)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createPaperSet(data: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const paperSetData = { ...data };
        if (Array.isArray(paperSetData.courseIds)) {
            paperSetData.courseIds = paperSetData.courseIds.filter((id: any) => id && id !== "");
        }

        const newPaperSet = await PaperSet.create(paperSetData);
        revalidatePath("/admin/mock-tests/papers");
        return { success: true, paperSet: JSON.parse(JSON.stringify(newPaperSet)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePaperSet(id: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        await PaperSet.findByIdAndDelete(id);
        revalidatePath("/admin/mock-tests/papers");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPaperSetById(id: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const paperSet = await PaperSet.findById(id).populate("courseIds", "title").lean();
        if (!paperSet) return { success: false, error: "Paper Set not found" };

        return { success: true, paperSet: JSON.parse(JSON.stringify(paperSet)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePaperSet(id: string, data: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const paperSetData = { ...data };
        if (Array.isArray(paperSetData.courseIds)) {
            paperSetData.courseIds = paperSetData.courseIds.filter((id: any) => id && id !== "");
        }

        const updated = await PaperSet.findByIdAndUpdate(id, { $set: paperSetData }, { new: true });
        revalidatePath("/admin/mock-tests/papers");
        return { success: true, paperSet: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
