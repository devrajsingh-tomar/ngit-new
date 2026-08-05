"use server";

import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import "@/models/GovExam";
import "@/models/TypingPassage";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TypingSubscription from "@/models/TypingSubscription";
import TypingExamAccess from "@/models/TypingExamAccess";

export async function getRecentTypingExams() {
    try {
        await connectDB();
        const now = new Date();
        
        const session = await getServerSession(authOptions);
        let hasFullAccess = false;
        let legacyAccessList: string[] = [];

        if (session) {
          const activeSub = await TypingSubscription.findOne({
            userId: session.user.id,
            status: "ACTIVE",
            endDate: { $gt: new Date() }
          });
          if (activeSub) {
            hasFullAccess = true;
          } else {
            const legacyAccess = await TypingExamAccess.find({
              userId: session.user.id,
              status: "SUCCESS"
            }).select("examId").lean();
            legacyAccessList = legacyAccess.map(a => a.examId.toString());
          }
        }

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

        // Determine free exams
        const govExamIds = Array.from(new Set(latestExams.map(e => e.govExamId?.toString()).filter(Boolean)));
        const freeExamIdsSet = new Set<string>();
        
        const freeNullExams = await TypingExam.find({
          status: "Active",
          $or: [
            { govExamId: null },
            { govExamId: { $exists: false } }
          ]
        })
        .sort({ createdAt: 1 })
        .limit(3)
        .select("_id")
        .lean();
        freeNullExams.forEach(e => freeExamIdsSet.add(e._id.toString()));
        
        for (const gId of govExamIds) {
          const freeGovExams = await TypingExam.find({
            status: "Active",
            govExamId: gId
          })
          .sort({ createdAt: 1 })
          .limit(3)
          .select("_id")
          .lean();
          freeGovExams.forEach(e => freeExamIdsSet.add(e._id.toString()));
        }

        const selected: any[] = [];
        const seenCategories = new Set<string>();
        
        // Helper to format/sanitize exam object before sending to client
        const processExam = (exam: any) => {
            let isFree = false;
            if (exam.pricing?.type === "PAID") {
              isFree = false;
            } else if (exam.pricing?.type === "FREE") {
              isFree = true;
            } else {
              isFree = freeExamIdsSet.has(exam._id.toString());
            }
            const isAccessible = hasFullAccess || isFree || legacyAccessList.includes(exam._id.toString());
            
            const examObj = JSON.parse(JSON.stringify(exam));
            if (!isAccessible && examObj.passageId) {
              examObj.passageId.content = ""; // Strip passage content
            }
            
            return {
              ...examObj,
              isFree,
              isAccessible
            };
        };

        // Step 1: Maximize diversity by taking one from each unique category/govExam first
        for (const exam of latestExams) {
            if (selected.length >= 5) break;
            const catName = exam.category || (exam.govExamId as any)?.title || "General";
            if (!seenCategories.has(catName)) {
                selected.push(processExam(exam));
                seenCategories.add(catName);
            }
        }
        
        // Step 2: Fill remaining slots up to 5 with newest exams
        if (selected.length < 5) {
            for (const exam of latestExams) {
                if (selected.length >= 5) break;
                if (!selected.some(s => s._id.toString() === exam._id.toString())) {
                    selected.push(processExam(exam));
                }
            }
        }

        return { 
            success: true, 
            exams: selected 
        };
    } catch (error: any) {
        console.error("Failed to fetch recent exams:", error);
        return { success: false, error: error.message };
    }
}
