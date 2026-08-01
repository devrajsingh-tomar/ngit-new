"use server";

import connectDB from "@/lib/db";
import Payment, { PaymentStatus } from "@/models/Payment";
import Enrollment from "@/models/Enrollment";
import User, { UserRole } from "@/models/User";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";

export const getAdminFeeData = createSafeAction(
    { roles: [UserRole.ADMIN], requireAuth: true },
    async () => {
        await connectDB();
        // Force model registration
        await import("@/models/Course");
        await import("@/models/User");

        // Find all users who are Students
        const students = await User.find({ role: UserRole.STUDENT })
            .select("name email phone createdAt")
            .lean();

        // Get all enrollments for students
        const studentIds = students.map((s: any) => s._id);
        const enrollments = await Enrollment.find({ userId: { $in: studentIds } })
            .populate("courseId", "title price category")
            .lean();

        // Get all successful/pending payments
        const payments = await Payment.find({ userId: { $in: studentIds } })
            .populate("courseId", "title price")
            .sort({ createdAt: -1 })
            .lean();

        return {
            students: JSON.parse(JSON.stringify(students)),
            enrollments: JSON.parse(JSON.stringify(enrollments)),
            payments: JSON.parse(JSON.stringify(payments))
        };
    }
);

const ManualPaymentSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Course ID"),
    amount: z.number().min(0),
});

export const addManualPayment = createSafeAction(
    { schema: ManualPaymentSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async ({ userId, courseId, amount }) => {
        await connectDB();

        // Create a manual payment record
        const payment = await Payment.create({
            userId,
            courseId,
            amount,
            status: PaymentStatus.SUCCESS,
            razorpayOrderId: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        });

        // Ensure enrollment exists
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (!existingEnrollment) {
            await Enrollment.create({
                userId,
                courseId,
                enrolledAt: new Date(),
                progress: 0,
                isActive: true
            });
        }

        revalidatePath("/admin/payments");
        return JSON.parse(JSON.stringify(payment));
    }
);

const AssignCourseSchema = z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Student ID"),
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Course ID"),
});

export const assignCourseOffline = createSafeAction(
    { schema: AssignCourseSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async ({ studentId, courseId }) => {
        await connectDB();

        const existingEnrollment = await Enrollment.findOne({ userId: studentId, courseId });
        if (existingEnrollment) {
            throw new Error("Student is already enrolled in this course.");
        }

        // Create enrollment directly (unpaid / offline managed)
        const enrollment = await Enrollment.create({
            userId: studentId,
            courseId,
            enrolledAt: new Date(),
            progress: 0,
            isActive: true
        });

        // Also create a pending/dummy offline payment record so it shows up in fee structures
        await Payment.create({
            userId: studentId,
            courseId,
            amount: 0, // Admin can set offline amount later or we mark it here
            status: PaymentStatus.PENDING,
            razorpayOrderId: `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        });

        revalidatePath("/admin/students/enrollments");
        revalidatePath("/admin/payments");

        return JSON.parse(JSON.stringify(enrollment));
    }
);

export const getGlobalPaymentsData = createSafeAction(
    { roles: [UserRole.ADMIN], requireAuth: true },
    async () => {
        await connectDB();
        await import("@/models/Course");
        await import("@/models/User");

        const allPayments = await Payment.find({})
            .populate("userId", "name email")
            .populate("courseId", "title price")
            .sort({ createdAt: -1 })
            .lean();

        let totalRevenue = 0;
        let pendingCount = 0;
        let failedCount = 0;

        const formattedPayments = allPayments.map((p: any) => {
            if (p.status === "SUCCESS") {
                totalRevenue += p.amount;
            } else if (p.status === "PENDING") {
                pendingCount++;
            } else if (p.status === "FAILED") {
                failedCount++;
            }

            return {
                id: p._id.toString(),
                orderId: p.razorpayOrderId ?? p._id.toString(),
                student: p.userId ? p.userId.name : "Unknown Student",
                course: p.courseId ? p.courseId.title : "Unknown Course",
                amount: p.amount,
                status: p.status,
                date: new Date(p.createdAt).toLocaleString(),
            };
        });

        return {
            totalRevenue,
            pendingCount,
            failedCount,
            payments: JSON.parse(JSON.stringify(formattedPayments))
        };
    }
);

const UpdatePaymentSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Payment ID"),
    amount: z.number().min(0),
    status: z.nativeEnum(PaymentStatus),
});

export const updatePaymentAction = createSafeAction(
    { schema: UpdatePaymentSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async ({ id, amount, status }) => {
        await connectDB();

        const payment = await Payment.findById(id);
        if (!payment) {
            throw new Error("Payment transaction not found.");
        }

        payment.amount = amount;
        payment.status = status;
        await payment.save();

        // If marked as successful, ensure student enrollment exists
        if (status === PaymentStatus.SUCCESS) {
            const existingEnrollment = await Enrollment.findOne({ 
                userId: payment.userId, 
                courseId: payment.courseId 
            });
            if (!existingEnrollment) {
                await Enrollment.create({
                    userId: payment.userId,
                    courseId: payment.courseId,
                    enrolledAt: new Date(),
                    progress: 0,
                    isActive: true
                });
            }
        }

        revalidatePath("/admin/payments");
        return { success: true };
    }
);

const DeletePaymentSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Payment ID"),
});

export const deletePaymentAction = createSafeAction(
    { schema: DeletePaymentSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async ({ id }) => {
        await connectDB();

        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            throw new Error("Payment transaction not found.");
        }

        revalidatePath("/admin/payments");
        return { success: true };
    }
);
