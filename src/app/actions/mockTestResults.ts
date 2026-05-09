"use server";

import connectDB from "@/lib/db";
import MockTestResult from "@/models/MockTestResult";
import ResultPublishSetting from "@/models/ResultPublishSetting";
import Attempt from "@/models/Attempt";
import Answer from "@/models/Answer";
import Quiz from "@/models/Quiz";
import User, { UserRole } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";

// --- ADMIN ACTIONS ---

export async function getMockTestResultsAdmin(filters: any = {}) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        const query: any = {};
        if (filters.quizId) query.mockTestId = filters.quizId;
        if (filters.publishStatus) query.publishStatus = filters.publishStatus;
        if (filters.courseId) query.course = filters.courseId;

        const results = await MockTestResult.find(query)
            .populate("studentId", "name email")
            .populate("mockTestId", "title")
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, results: JSON.parse(JSON.stringify(results)) };
    } catch (error) {
        console.error("Get Mock Test Results Admin Error:", error);
        return { success: false, error: "Failed to load results" };
    }
}

export async function publishMockTestResults(quizId: string, settings: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        const quiz = await Quiz.findById(quizId).populate("courseId");
        if (!quiz) throw new Error("Quiz not found");

        // 1. Define query based on settings (Filter by batch/course if provided)
        const attemptQuery: any = {
            quizId: new mongoose.Types.ObjectId(quizId),
            status: { $in: ["SUBMITTED", "EVALUATED"] }
        };

        // If specific student filters are applied in settings, we might need a more complex join
        // But for now, we process all attempts for the quiz and filter them during result generation if needed

        const attempts = await Attempt.find(attemptQuery)
            .populate("studentId", "name email image")
            .sort({ totalScore: -1 })
            .lean();

        if (attempts.length === 0) {
            return { success: false, error: "No attempts found for this quiz" };
        }

        // 2. Calculate Rank & Percentile
        const totalAttempts = attempts.length;
        const resultsToSave = [];

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            const rank = i + 1;
            const percentile = ((totalAttempts - rank) / totalAttempts) * 100;

            const answers = await Answer.find({ attemptId: attempt._id }).lean();
            const correct = answers.filter(a => a.evaluation?.isCorrect === true).length;
            const incorrect = answers.filter(a => a.evaluation?.isCorrect === false).length;
            const unattempted = answers.filter(a => !a.selectedOptionIds || a.selectedOptionIds.length === 0).length;
            const timeTaken = (attempt.endTime?.getTime() || 0) - (attempt.startTime?.getTime() || 0);

            resultsToSave.push({
                studentId: attempt.studentId._id,
                mockTestId: attempt.quizId,
                attemptId: attempt._id,
                score: attempt.totalScore,
                totalMarks: attempt.totalMarks,
                rank,
                percentile: parseFloat(percentile.toFixed(2)),
                attemptDate: attempt.createdAt,
                batch: (attempt.studentId as any).batch || "N/A",
                course: (quiz.courseId as any)?.title || "General",
                publishStatus: "PUBLISHED",
                publicVisibility: settings.publishToPublicWebsite || false,
                analysis: {
                    correctAnswers: correct,
                    incorrectAnswers: incorrect,
                    unattemptedQuestions: unattempted,
                    accuracy: (correct / (correct + incorrect)) * 100 || 0,
                    timeTaken: Math.floor(timeTaken / 1000)
                }
            });
        }

        // 3. Save to MockTestResult
        for (const res of resultsToSave) {
            await MockTestResult.findOneAndUpdate(
                { attemptId: res.attemptId },
                res,
                { upsert: true, new: true }
            );
        }

        // 4. Update Publish Setting record
        await ResultPublishSetting.findOneAndUpdate(
            { mockTestId: new mongoose.Types.ObjectId(quizId) },
            {
                ...settings,
                title: quiz.title,
                mockTestId: new mongoose.Types.ObjectId(quizId),
                isPublished: true
            },
            { upsert: true }
        );

        return { success: true, message: "Results published successfully" };
    } catch (error: any) {
        console.error("Publish Results Error:", error);
        return { success: false, error: error.message || "Failed to publish results" };
    }
}

export async function unpublishMockTestResults(quizId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        await MockTestResult.updateMany(
            { mockTestId: new mongoose.Types.ObjectId(quizId) },
            { publishStatus: "UNPUBLISHED", publicVisibility: false }
        );

        await ResultPublishSetting.findOneAndUpdate(
            { mockTestId: new mongoose.Types.ObjectId(quizId) },
            { isPublished: false, publishToPublicWebsite: false }
        );

        return { success: true, message: "Results unpublished" };
    } catch (error) {
        return { success: false, error: "Failed to unpublish" };
    }
}

export async function deleteMockTestResult(resultId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        await MockTestResult.findByIdAndDelete(resultId);
        return { success: true, message: "Result deleted" };
    } catch (error) {
        console.error("Delete Result Error:", error);
        return { success: false, error: "Failed to delete result" };
    }
}

// --- STUDENT ACTIONS ---

export async function getStudentResults() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const results = await MockTestResult.find({
            studentId: session.user.id,
            publishStatus: "PUBLISHED"
        })
        .populate("mockTestId", "title")
        .sort({ createdAt: -1 })
        .lean();

        const publishedAttemptIds = results.map(r => r.attemptId);

        const attempts = await Attempt.find({ 
            studentId: session.user.id, 
            status: { $in: ["SUBMITTED", "EVALUATED"] },
            _id: { $nin: publishedAttemptIds }
        })
        .populate("quizId", "title")
        .sort({ createdAt: -1 })
        .lean();

        return { 
            success: true, 
            results: JSON.parse(JSON.stringify(results)),
            attempts: JSON.parse(JSON.stringify(attempts))
        };
    } catch (error) {
        console.error("Get Student Results Error:", error);
        return { success: false, error: "Failed to load results" };
    }
}

export async function getDetailedResult(resultId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const result = await MockTestResult.findById(resultId)
            .populate("studentId", "name image email")
            .populate("mockTestId")
            .populate("attemptId")
            .lean();

        if (!result) return { success: false, error: "Result not found" };
        if (result.studentId.toString() !== session.user.id && session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch answers with question details
        const answers = await Answer.find({ attemptId: result.attemptId })
            .populate("questionId")
            .lean();

        return {
            success: true,
            result: JSON.parse(JSON.stringify(result)),
            answers: JSON.parse(JSON.stringify(answers))
        };
    } catch (error) {
        console.error("Get Detailed Result Error:", error);
        return { success: false, error: "Failed to load detailed result" };
    }
}

// --- PUBLIC ACTIONS ---

export async function getPublicMockTestResults(filters: any = {}) {
    try {
        await connectDB();
        
        // Find published settings that have public visibility enabled
        const publishSettings = await ResultPublishSetting.find({
            publishToPublicWebsite: true,
            isPublished: true
        }).lean();

        const quizIds = publishSettings.map(s => s.mockTestId);

        const query: any = {
            mockTestId: { $in: quizIds },
            publishStatus: "PUBLISHED",
            publicVisibility: true
        };

        if (filters.mockTestId) query.mockTestId = filters.mockTestId;
        // Add more filters if needed

        const results = await MockTestResult.find(query)
            .populate("studentId", "name image")
            .populate("mockTestId", "title")
            .sort({ score: -1 })
            .lean();

        // Group results by mockTestId for sectioning if no specific quiz selected
        const groupedResults: any = {};
        for (const res of results) {
            const quizTitle = (res.mockTestId as any).title;
            const setting = publishSettings.find(s => s.mockTestId.toString() === (res.mockTestId as any)._id.toString());
            const sectionHeading = setting?.customHeading || quizTitle;

            if (!groupedResults[sectionHeading]) {
                groupedResults[sectionHeading] = [];
            }
            groupedResults[sectionHeading].push(res);
        }

        return {
            success: true,
            sections: JSON.parse(JSON.stringify(groupedResults))
        };
    } catch (error) {
        console.error("Get Public Results Error:", error);
        return { success: false, error: "Failed to load public results" };
    }
}

// --- DASHBOARD WIDGET ---

export async function getMockTestResultsSummary() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

        const totalMockTests = await Quiz.countDocuments();
        const totalAttempts = await Attempt.countDocuments({ status: { $in: ["SUBMITTED", "EVALUATED"] } });
        
        const aggregation = await MockTestResult.aggregate([
            {
                $group: {
                    _id: null,
                    highestScore: { $max: "$score" },
                    averageScore: { $avg: "$score" }
                }
            }
        ]);

        const pendingResults = await Attempt.countDocuments({
            status: { $in: ["SUBMITTED", "EVALUATED"] },
            _id: { $not: { $in: (await MockTestResult.find({}, "attemptId")).map(r => r.attemptId) } }
        });

        return {
            success: true,
            summary: {
                totalMockTests,
                totalAttempts,
                highestScore: aggregation[0]?.highestScore || 0,
                averageScore: Math.round(aggregation[0]?.averageScore || 0),
                pendingResults
            }
        };
    } catch (error) {
        console.error("Get Results Summary Error:", error);
        return { success: false, error: "Failed to load results summary" };
    }
}

const LeaderboardSchema = z.object({
    quizId: z.string().optional()
});

export const getLeaderboard = createSafeAction(
    { schema: LeaderboardSchema, requireAuth: true, roles: [UserRole.STUDENT, UserRole.ADMIN] },
    async ({ quizId }) => {
        await connectDB();
        
        const query: any = { publishStatus: "PUBLISHED" };
        if (quizId) query.mockTestId = new mongoose.Types.ObjectId(quizId);

        const results = await MockTestResult.find(query)
            .populate("studentId", "name image email")
            .populate("mockTestId", "title")
            .sort({ score: -1, attemptDate: 1 })
            .lean();

        return JSON.parse(JSON.stringify(results));
    }
);
