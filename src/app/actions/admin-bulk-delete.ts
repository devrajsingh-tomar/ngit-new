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

        let dateQuery: any = {};
        if (formData.startDate || formData.endDate) {
            dateQuery = { createdAt: {} };
            if (formData.startDate) {
                const start = new Date(formData.startDate);
                start.setHours(0, 0, 0, 0);
                dateQuery.createdAt.$gte = start;
            }
            if (formData.endDate) {
                const end = new Date(formData.endDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.createdAt.$lte = end;
            }
        }

        let studentId: any = null;
        if (formData.studentEmail) {
            const User = (await import("@/models/User")).default;
            const student = await User.findOne({ email: formData.studentEmail.trim().toLowerCase() });
            if (!student) return { success: false, error: "Student not found with this email" };
            studentId = student._id;
        }

        let deletedCount = 0;

        // 1. Cleanup Typing Results
        if (formData.type === "TYPING" || formData.type === "ALL") {
            const typingQuery = { ...dateQuery };
            if (studentId) typingQuery.userId = studentId;
            
            const res = await TypingResult.deleteMany(typingQuery);
            deletedCount += res.deletedCount || 0;
        }

        // 2. Cleanup Mock Test Data (Attempts, Results, Answers)
        if (formData.type === "MOCK_TEST" || formData.type === "ALL") {
            const mockQuery = { ...dateQuery };
            if (studentId) mockQuery.studentId = studentId;

            // We must find IDs first to cascade delete Answers
            const attempts = await Attempt.find(mockQuery).select("_id");
            const attemptIds = attempts.map(a => a._id);

            if (attemptIds.length > 0) {
                await Answer.deleteMany({ attemptId: { $in: attemptIds } });
                const res1 = await Attempt.deleteMany({ _id: { $in: attemptIds } });
                const res2 = await MockTestResult.deleteMany({ attemptId: { $in: attemptIds } });
                deletedCount += (res1.deletedCount || 0) + (res2.deletedCount || 0);
            }
        }

        revalidatePath("/admin/typing/results");
        revalidatePath("/admin/mock-test/results");
        revalidatePath("/admin/dashboard");
        
        return { 
            success: true, 
            message: `Success: Successfully purged ${deletedCount} records from the database.` 
        };
    } catch (error: any) {
        console.error("CRITICAL Cleanup Error:", error);
        return { success: false, error: "Internal Database Error: " + error.message };
    }
}
