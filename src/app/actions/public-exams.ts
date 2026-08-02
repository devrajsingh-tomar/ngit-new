"use server";

import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import "@/models/GovExam";
import "@/models/TypingPassage";

export async function getRecentTypingExams() {
    try {
        await connectDB();
        const now = new Date();
        
        // Find recent active exams
        const latestExams = await TypingExam.find({ 
            status: "Active",
            startTime: { $lte: now },
            endTime: { $gte: now }
        })
        .populate({ path: "govExamId", strictPopulate: false })
        .populate({ path: "passageId", strictPopulate: false })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

        const selected: any[] = [];
        const seenCategories = new Set<string>();
        
        // Step 1: Maximize diversity by taking one from each unique category/govExam first
        for (const exam of latestExams) {
            if (selected.length >= 5) break;
            const catName = exam.category || (exam.govExamId as any)?.title || "General";
            if (!seenCategories.has(catName)) {
                selected.push(exam);
                seenCategories.add(catName);
            }
        }
        
        // Step 2: Fill remaining slots up to 5 with newest exams
        if (selected.length < 5) {
            for (const exam of latestExams) {
                if (selected.length >= 5) break;
                if (!selected.some(s => s._id.toString() === exam._id.toString())) {
                    selected.push(exam);
                }
            }
        }

        return { 
            success: true, 
            exams: JSON.parse(JSON.stringify(selected)) 
        };
    } catch (error: any) {
        console.error("Failed to fetch recent exams:", error);
        return { success: false, error: error.message };
    }
}
