"use server";

import connectDB from "@/lib/db";
import Attempt from "@/models/Attempt";
import Quiz from "@/models/Quiz";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import { AttendanceStatus } from "@/types/attendance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getStudentResults() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const userId = session.user.id;

        // All quiz attempts by student, populated with quiz info
        const attempts = await Attempt.find({ studentId: userId })
            .populate({ path: "quizId", model: Quiz, populate: { path: "courseId", model: Course } })
            .sort({ endTime: -1 })
            .lean();

        // All enrollments for course-level data
        const enrollments = await Enrollment.find({ userId })
            .populate({ path: "courseId", model: Course })
            .lean();

        // Attendance summary
        const attendanceRecords = await Attendance.find({ studentId: userId }).lean();
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(
            (r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
        ).length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // Aggregate stats
        const totalAttempts = attempts.length;
        const passedAttempts = attempts.filter((a) => a.isPassed).length;
        const avgScore =
            totalAttempts > 0
                ? Math.round(
                    attempts.reduce((acc, a) => acc + (a.totalScore / a.totalMarks) * 100, 0) / totalAttempts
                )
                : 0;

        // Best score per quiz
        const quizBestMap = new Map<string, number>();
        for (const a of attempts) {
            const qid = (a.quizId as any)?._id?.toString();
            if (!qid) continue;
            const pct = Math.round((a.totalScore / a.totalMarks) * 100);
            if (!quizBestMap.has(qid) || pct > (quizBestMap.get(qid) as number)) {
                quizBestMap.set(qid, pct);
            }
        }

        return {
            success: true,
            attempts: JSON.parse(JSON.stringify(attempts)),
            enrollments: JSON.parse(JSON.stringify(enrollments)),
            stats: {
                totalAttempts,
                passedAttempts,
                avgScore,
                attendancePercentage,
                activeCourses: enrollments.length,
                avgProgress:
                    enrollments.length > 0
                        ? Math.round(
                            enrollments.reduce((acc: number, e: any) => acc + e.progress, 0) /
                            enrollments.length
                        )
                        : 0,
            },
        };
    } catch (error) {
        console.error("Get Student Results Error:", error);
        return { success: false, error: "Failed to load results" };
    }
}

export async function getPublicResults() {
    try {
        await connectDB();
        
        // Fetch top 10 unique quiz attempts with high scores
        const topResults = await Attempt.find({ status: "EVALUATED" })
            .sort({ totalScore: -1 })
            .limit(20)
            .populate({ path: "studentId", select: "name photoUrl email" })
            .populate({ path: "quizId", select: "title totalMarks" })
            .lean();

        // Manual results could be coming from CMS sections (handled in DynamicRenderer)
        // This function focuses on real database attempts/quizzes

        return { 
            success: true, 
            results: JSON.parse(JSON.stringify(topResults)) 
        };
    } catch (error: any) {
        console.error("Get Public Results Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getPublicExams() {
    try {
        await connectDB();
        const exams = await Quiz.find({ isPublished: true, isMockTest: true, isPublic: true })
            .populate("courseId", "title")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        return { success: true, exams: JSON.parse(JSON.stringify(exams)) };
    } catch (error: any) {
        console.error("Get Public Exams Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getAdminResults(filters: { 
    courseType?: "ONLINE" | "OFFLINE", 
    quizId?: string, 
    date?: string 
}) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        let query: any = {};

        if (filters.quizId) {
            query.quizId = filters.quizId;
        }

        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            query.endTime = { $gte: startOfDay, $lte: endOfDay };
        }

        let attempts = await Attempt.find(query)
            .populate({ path: "studentId", select: "name email image photoUrl" })
            .populate({ path: "quizId", populate: { path: "courseId", select: "title type" } })
            .sort({ endTime: -1 })
            .lean();

        if (filters.courseType) {
            attempts = attempts.filter((a: any) => a.quizId?.courseId?.type === filters.courseType);
        }

        return { 
            success: true, 
            results: JSON.parse(JSON.stringify(attempts)) 
        };
    } catch (error: any) {
        console.error("Get Admin Results Error:", error);
        return { success: false, error: error.message };
    }
}
