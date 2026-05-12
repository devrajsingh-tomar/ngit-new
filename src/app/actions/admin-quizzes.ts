"use server";

import connectDB from "@/lib/db";
import Quiz from "@/models/Quiz";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAdminQuizzes() {
    try {
        await connectDB();
        const quizzes = await Quiz.find({})
            .populate("courseId", "title")
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, quizzes: JSON.parse(JSON.stringify(quizzes)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAdminQuiz(id: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

        await Quiz.findByIdAndDelete(id);
        revalidatePath("/admin/mock-tests/list");
        revalidatePath("/exams");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createAdminQuiz(data: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

        const quizData = { ...data };
        if (quizData.courseId === "") delete quizData.courseId;

        const quiz = await Quiz.create({
            ...quizData,
            isMockTest: data.isMockTest ?? true,
            isPublished: data.isPublished ?? true,
        });

        revalidatePath("/admin/mock-tests/list");
        return { success: true, quiz: JSON.parse(JSON.stringify(quiz)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleQuizStatus(quizId: string, isPublished: boolean) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

        await Quiz.findByIdAndUpdate(quizId, { isPublished });
        revalidatePath("/admin/mock-tests/list");
        revalidatePath("/exams");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAdminQuiz(id: string) {
    try {
        await connectDB();
        const quiz = await Quiz.findById(id).populate("courseId", "title").lean();
        if (!quiz) return { success: false, error: "Quiz not found" };
        return { success: true, quiz: JSON.parse(JSON.stringify(quiz)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAdminQuiz(id: string, data: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

        const updateData = { ...data };
        if (updateData.courseId === "") updateData.courseId = null;

        const updated = await Quiz.findByIdAndUpdate(id, updateData, { new: true });
        revalidatePath("/admin/mock-tests/list");
        return { success: true, quiz: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
