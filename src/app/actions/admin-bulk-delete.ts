"use server";

import connectDB from "@/lib/db";
import TypingResult from "@/models/TypingResult";
import Attempt from "@/models/Attempt";
import MockTestResult from "@/models/MockTestResult";
import Answer from "@/models/Answer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteResultsByFilters(formData: {
    startDate?: string;
    endDate?: string;
    type: "TYPING" | "MOCK_TEST" | "ALL";
    studentEmail?: string;
}) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        let query: any = {};

        // Date Range Filter
        if (formData.startDate || formData.endDate) {
            query.createdAt = {};
            if (formData.startDate) {
                const start = new Date(formData.startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (formData.endDate) {
                const end = new Date(formData.endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Student Filter (needs to resolve Email to ID first)
        if (formData.studentEmail) {
            const User = (await import("@/models/User")).default;
            const student = await User.findOne({ email: formData.studentEmail, role: "STUDENT" });
            if (!student) return { success: false, error: "Student not found with this email" };
            
            // Add studentId filter depending on model field name
            // For TypingResult and MockTestResult it's userId or studentId
            // We'll handle this per model below
        }

        let deletedCount = 0;

        // 1. Delete Typing Results
        if (formData.type === "TYPING" || formData.type === "ALL") {
            const typingQuery = { ...query };
            if (formData.studentEmail) {
                const User = (await import("@/models/User")).default;
                const student = await User.findOne({ email: formData.studentEmail });
                if (student) typingQuery.userId = student._id;
            }
            const res = await TypingResult.deleteMany(typingQuery);
            deletedCount += res.deletedCount || 0;
        }

        // 2. Delete Mock Test Results & Attempts
        if (formData.type === "MOCK_TEST" || formData.type === "ALL") {
            const mockQuery = { ...query };
            if (formData.studentEmail) {
                const User = (await import("@/models/User")).default;
                const student = await User.findOne({ email: formData.studentEmail });
                if (student) mockQuery.studentId = student._id;
            }

            // Find attempts to delete associated answers
            const attempts = await Attempt.find(mockQuery).select("_id");
            const attemptIds = attempts.map(a => a._id);

            if (attemptIds.length > 0) {
                await Answer.deleteMany({ attemptId: { $in: attemptIds } });
                const res1 = await Attempt.deleteMany({ _id: { $in: attemptIds } });
                const res2 = await MockTestResult.deleteMany({ attemptId: { $in: attemptIds } });
                deletedCount += (res1.deletedCount || 0) + (res2.deletedCount || 0);
            }
        }

        revalidatePath("/admin/results");
        revalidatePath("/admin/typing/results");
        
        return { 
            success: true, 
            message: `Cleanup Complete: Deleted ${deletedCount} records across selected categories.` 
        };
    } catch (error: any) {
        console.error("Bulk Delete Error:", error);
        return { success: false, error: error.message };
    }
}
