"use server";

import connectDB from "@/lib/db";
import TypingExam from "@/models/TypingExam";
import TypingExamAccess from "@/models/TypingExamAccess";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/services/RazorpayService";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import mongoose from "mongoose";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const InitiateTypingExamPaymentSchema = z.object({
    examId: z.string().min(1),
});

export const initiateTypingExamPayment = createSafeAction(
    { schema: InitiateTypingExamPaymentSchema, requireAuth: true, rateLimit: RATE_LIMIT_CONFIGS.SENSITIVE },
    async ({ examId }, session) => {
        await connectDB();

        const exam = await TypingExam.findById(examId);
        if (!exam) {
            throw new Error("Typing exam not found.");
        }

        if (!exam.pricing || exam.pricing.type !== "PAID") {
            throw new Error("This exam is free or does not require payment.");
        }

        const amount = exam.pricing.amount;
        if (amount <= 0) {
            throw new Error("Invalid exam pricing amount.");
        }

        // Check if user already has access
        const existingAccess = await TypingExamAccess.findOne({
            userId: session.user.id,
            examId: exam._id,
            status: "SUCCESS"
        });

        if (existingAccess) {
            return { success: true, instant: true };
        }

        // Create Razorpay Order
        const order = await createRazorpayOrder(amount);

        // Save Intention in DB
        await TypingExamAccess.create({
            userId: session.user.id,
            examId: exam._id,
            amount: amount,
            razorpayOrderId: order.id,
            status: "PENDING",
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            examTitle: exam.title,
            userName: session.user.name,
            userEmail: session.user.email,
        };
    }
);

const VerifyTypingExamPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
});

export const verifyTypingExamPayment = createSafeAction(
    { schema: VerifyTypingExamPaymentSchema, requireAuth: true },
    async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, session) => {
        await connectDB();

        // 1. Verify the record belongs to the current user
        const accessRecord = await TypingExamAccess.findOne({
            razorpayOrderId,
            userId: session.user.id
        });

        if (!accessRecord) {
            throw new Error("Access transaction record not found.");
        }

        // 2. Verify signature
        const isValid = verifyRazorpaySignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            throw new Error("Invalid payment signature detected.");
        }

        // 3. Update Status
        if (accessRecord.status !== "SUCCESS") {
            accessRecord.razorpayPaymentId = razorpayPaymentId;
            accessRecord.razorpaySignature = razorpaySignature;
            accessRecord.status = "SUCCESS";
            await accessRecord.save();

            // 4. Notify user
            await createNotification(
                session.user.id,
                "Typing Exam Unlocked!",
                `You have successfully unlocked access to the exam "${accessRecord.examId}". Start practicing now!`,
                "SUCCESS",
                "/student/typing"
            );
        }

        revalidatePath("/student");
        return { success: true };
    }
);
