"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Payment, { PaymentStatus } from "@/models/Payment";
import Attempt from "@/models/Attempt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import Enrollment from "@/models/Enrollment";
import Attendance from "@/models/Attendance";
import MockTestResult from "@/models/MockTestResult";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import TypingResult from "@/models/TypingResult";
import TypingExam from "@/models/TypingExam";

export async function getMockTestStats() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const [totalQuestions, totalQuizzes, totalAttempts, latestLogs] = await Promise.all([
            Question.countDocuments(),
            Quiz.countDocuments(),
            Attempt.countDocuments(),
            Question.find().sort({ createdAt: -1 }).limit(3).lean()
        ]);

        return { 
            success: true, 
            stats: { totalQuestions, totalQuizzes, totalAttempts },
            logs: JSON.parse(JSON.stringify(latestLogs))
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
export async function getDashboardStats() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const [totalStudents, activeCourses, payments, allAttempts, recentStudents, totalPublishedResults] = await Promise.all([
            User.countDocuments({ role: "STUDENT" }),
            Course.countDocuments({ isPublished: true }),
            Payment.find({ status: PaymentStatus.SUCCESS }).lean(),
            Attempt.find()
                .populate({ path: "studentId", select: "name email" })
                .populate({ path: "quizId", select: "title" })
                .sort({ createdAt: -1 })
                .lean(),
            User.find({ role: "STUDENT" })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name email createdAt")
                .lean(),
            MockTestResult.countDocuments()
        ]);

        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        // Mock Test Analytics
        const mockTestAttempts = allAttempts.length;
        const highestScore = allAttempts.length > 0 ? Math.max(...allAttempts.map(a => a.totalScore || 0)) : 0;
        const avgScore = allAttempts.length > 0 ? Math.round(allAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / allAttempts.length) : 0;
        const uniqueTests = new Set(allAttempts.map(a => a.quizId?._id?.toString())).size;
        
        const stats = {
            totalStudents,
            activeCourses,
            totalRevenue,
            pendingApprovals: mockTestAttempts - totalPublishedResults,
            mockMetrics: {
                totalTests: uniqueTests,
                totalAttempts: mockTestAttempts,
                highestScore,
                avgScore,
                pending: Math.max(0, mockTestAttempts - totalPublishedResults)
            },
            recentAttempts: JSON.parse(JSON.stringify(allAttempts.slice(0, 10))),
            recentStudents: JSON.parse(JSON.stringify(recentStudents))
        };

        return { success: true, stats };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentDashboardData() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const userId = session.user.id;

        const [enrollments, attempts, attendance, typingResults, typingExams] = await Promise.all([
            Enrollment.find({ userId }).populate({ path: "courseId", select: "title thumbnail _id slug" }).lean(),
            Attempt.find({ studentId: userId }).lean(),
            Attendance.find({ studentId: userId }).lean(),
            TypingResult.find({ userId }).populate("examId", "title duration").sort({ createdAt: -1 }).limit(5).lean(),
            TypingExam.find({ status: "Active" }).limit(5).lean()
        ]);

        const activeCourses = enrollments.length;
        const avgProgress = activeCourses > 0 
            ? Math.round(enrollments.reduce((acc, e: any) => acc + (e.progress || 0), 0) / activeCourses)
            : 0;

        const attendancePercentage = attendance.length > 0
            ? Math.round((attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length / attendance.length) * 100)
            : 0;

        const enrolledCourseIds = enrollments.map(e => (e.courseId as any)?._id);
        const attemptedQuizIds = attempts.map(a => a.quizId.toString());

        const upcomingQuiz = await Quiz.findOne({
            courseId: { $in: enrolledCourseIds },
            isPublished: true,
            _id: { $nin: attemptedQuizIds }
        }).sort({ createdAt: -1 }).lean();

        const testsCompleted = attempts.length;

        const stats = {
            avgProgress,
            activeCourses,
            attendancePercentage,
            testsCompleted,
            avgGrade: "A" // Placeholder if no grading logic yet
        };

        return {
            success: true,
            stats,
            upcomingQuiz: JSON.parse(JSON.stringify(upcomingQuiz)),
            enrollments: JSON.parse(JSON.stringify(enrollments)),
            typingResults: JSON.parse(JSON.stringify(typingResults)),
            typingExams: JSON.parse(JSON.stringify(typingExams)),
            userName: session.user.name,
            userImage: session.user.image,
            userId: session.user.id,
            progressTrend: [65, 72, 68, 85, 90, 88, 92] // Placeholder for chart until more data exists
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
