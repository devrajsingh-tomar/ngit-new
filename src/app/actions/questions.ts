"use server";

import connectDB from "@/lib/db";
import Question, { IQuestion } from "@/models/Question";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getQuestions() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const questions = await Question.find()
            .populate("courseId", "title")
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, questions: JSON.parse(JSON.stringify(questions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createQuestion(data: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const questionData = { ...data };
        if (questionData.courseId === "") delete questionData.courseId;

        const newQuestion = await Question.create(questionData);
        revalidatePath("/admin/mock-tests/questions");
        revalidatePath("/admin/mock-tests");
        return { success: true, question: JSON.parse(JSON.stringify(newQuestion)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteQuestion(id: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        await Question.findByIdAndDelete(id);
        revalidatePath("/admin/mock-tests/questions");
        revalidatePath("/admin/mock-tests");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkInsertQuestions(questions: any[]) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const inserted = await Question.insertMany(questions);
        revalidatePath("/admin/mock-tests/questions");
        revalidatePath("/admin/mock-tests");
        return { success: true, count: inserted.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getQuestionById(id: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const question = await Question.findById(id).lean();
        if (!question) return { success: false, error: "Question not found" };

        return { success: true, question: JSON.parse(JSON.stringify(question)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateQuestion(id: string, data: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const updateData = { ...data };
        if (updateData.courseId === "") updateData.courseId = null;

        const updatedQuestion = await Question.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        revalidatePath("/admin/mock-tests/questions");
        revalidatePath("/admin/mock-tests");
        return { success: true, question: JSON.parse(JSON.stringify(updatedQuestion)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkDeleteQuestions(ids: string[]) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        await Question.deleteMany({ _id: { $in: ids } });
        revalidatePath("/admin/mock-tests/questions");
        revalidatePath("/admin/mock-tests");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
