"use server";

import connectDB from "@/lib/db";
import TypingResult from "@/models/TypingResult";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteTypingResult(id: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const result = await TypingResult.findByIdAndDelete(id);
        if (!result) return { success: false, error: "Result not found" };

        revalidatePath("/admin/typing/results");
        return { success: true, message: "Result deleted successfully" };
    } catch (error: any) {
        console.error("Delete Typing Result Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteTypingResultsBulk(ids: string[]) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const res = await TypingResult.deleteMany({ _id: { $in: ids } });
        
        revalidatePath("/admin/typing/results");
        return { success: true, message: `Successfully deleted ${res.deletedCount} results.` };
    } catch (error: any) {
        console.error("Bulk Delete Typing Results Error:", error);
        return { success: false, error: error.message };
    }
}
