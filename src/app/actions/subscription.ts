"use server";

import connectDB from "@/lib/db";
import TypingSubscription from "@/models/TypingSubscription";
import User, { UserRole } from "@/models/User";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/services/RazorpayService";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const InitiateSubscriptionPaymentSchema = z.object({});

export const initiateTypingSubscriptionPayment = createSafeAction(
    { schema: InitiateSubscriptionPaymentSchema, requireAuth: true, rateLimit: RATE_LIMIT_CONFIGS.SENSITIVE },
    async (_, session) => {
        await connectDB();

        const amount = 21; // fixed online subscription fee
        
        // Check if user already has an active subscription
        const existingSub = await TypingSubscription.findOne({
            userId: session.user.id,
            status: "ACTIVE",
            endDate: { $gt: new Date() }
        });

        if (existingSub) {
            return { success: true, instant: true };
        }

        // Create Razorpay Order
        const order = await createRazorpayOrder(amount);

        // Save Intention in DB as PENDING
        // startDate and endDate can be set to now, they'll be corrected on successful payment
        await TypingSubscription.create({
            userId: session.user.id,
            startDate: new Date(),
            endDate: new Date(),
            status: "PENDING",
            planType: "MONTHLY",
            paymentType: "ONLINE",
            amount: amount,
            razorpayOrderId: order.id,
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            userName: session.user.name,
            userEmail: session.user.email,
        };
    }
);

const VerifySubscriptionPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
});

export const verifyTypingSubscriptionPayment = createSafeAction(
    { schema: VerifySubscriptionPaymentSchema, requireAuth: true },
    async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, session) => {
        await connectDB();

        // 1. Verify the record belongs to the current user
        const subRecord = await TypingSubscription.findOne({
            razorpayOrderId,
            userId: session.user.id
        });

        if (!subRecord) {
            throw new Error("Subscription transaction record not found.");
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
        if (subRecord.status !== "ACTIVE") {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30); // 1 month online subscription

            subRecord.razorpayPaymentId = razorpayPaymentId;
            subRecord.razorpaySignature = razorpaySignature;
            subRecord.status = "ACTIVE";
            subRecord.startDate = startDate;
            subRecord.endDate = endDate;
            await subRecord.save();

            // 4. Notify user
            await createNotification(
                session.user.id,
                "Typing Subscription Activated!",
                `Your typing exam subscription has been successfully activated. You now have full access to all passages until ${endDate.toLocaleDateString()}!`,
                "SUCCESS",
                "/student/typing"
            );
        }

        revalidatePath("/student");
        return { success: true };
    }
);

const ActivateOrExtendSubscriptionAdminSchema = z.object({
    userId: z.string().min(1),
    planType: z.enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY"]),
});

export const activateOrExtendSubscriptionAdminAction = createSafeAction(
    { schema: ActivateOrExtendSubscriptionAdminSchema, requireAuth: true, roles: [UserRole.ADMIN] },
    async ({ userId, planType }, session) => {
        await connectDB();

        // Check if student exists
        const userObj = await User.findById(userId);
        if (!userObj) {
            throw new Error("Student account not found");
        }

        // Find if there is currently an active subscription for this user
        const activeSub = await TypingSubscription.findOne({
            userId,
            status: "ACTIVE",
            endDate: { $gt: new Date() }
        }).sort({ endDate: -1 });

        let startDate = new Date();
        let endDate = new Date();

        if (activeSub) {
            // Extend the active subscription
            startDate = new Date(activeSub.startDate);
            endDate = new Date(activeSub.endDate);
        }

        if (planType === "MONTHLY") {
            endDate.setDate(endDate.getDate() + 30);
        } else if (planType === "QUARTERLY") {
            endDate.setDate(endDate.getDate() + 90);
        } else if (planType === "HALF_YEARLY") {
            endDate.setDate(endDate.getDate() + 180);
        }

        const amountMap = {
            MONTHLY: 21,
            QUARTERLY: 60,
            HALF_YEARLY: 120,
        };

        const newSub = await TypingSubscription.create({
            userId,
            startDate,
            endDate,
            status: "ACTIVE",
            planType,
            paymentType: "MANUAL",
            amount: amountMap[planType] || 0,
        });

        // Notify user
        await createNotification(
            userId,
            "Typing Subscription Activated/Extended!",
            `Admin has manually activated/extended your typing exam subscription (${planType}). Full access granted until ${endDate.toLocaleDateString()}!`,
            "SUCCESS",
            "/student/typing"
        );

        revalidatePath("/admin/students");
        revalidatePath("/admin/students/enrollments");
        return { success: true, subscription: JSON.parse(JSON.stringify(newSub)) };
    }
);

const GetAdminTypingSubscriptionsSchema = z.object({});

export const getAdminTypingSubscriptionsAction = createSafeAction(
    { schema: GetAdminTypingSubscriptionsSchema, requireAuth: true, roles: [UserRole.ADMIN] },
    async () => {
        await connectDB();
        await import("@/models/User");

        const subscriptions = await TypingSubscription.find()
            .populate("userId", "name email phone")
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, subscriptions: JSON.parse(JSON.stringify(subscriptions)) };
    }
);
