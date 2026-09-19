"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const RequestResetSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const requestPasswordResetAction = createSafeAction(
    { schema: RequestResetSchema, rateLimit: RATE_LIMIT_CONFIGS.AUTH },
    async (data) => {
        await connectDB();
        const email = data.email.trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) {
            // For security, do not disclose whether user exists, but give reassuring message
            return {
                message: "If an account with this email exists, a password reset link has been dispatched.",
                emailSent: true,
            };
        }

        // Generate 64-character hex token & set 1 hour expiry
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetToken = token;
        user.resetTokenExpiry = expiry;
        await user.save();

        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.ngitedu.com";
        const resetLink = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        const mailResult = await sendPasswordResetEmail({
            toEmail: user.email,
            userName: user.name,
            resetLink,
        });

        return {
            message: "Password recovery link dispatched to your email address!",
            emailSent: true,
            simulated: mailResult.simulated,
            resetLink: mailResult.simulated ? resetLink : undefined,
        };
    }
);

const VerifyTokenSchema = z.object({
    email: z.string().email(),
    token: z.string().min(10),
});

export const verifyResetTokenAction = createSafeAction(
    { schema: VerifyTokenSchema },
    async (data) => {
        await connectDB();
        const email = data.email.trim().toLowerCase();

        const user = await User.findOne({
            email,
            resetToken: data.token,
            resetTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            return { valid: false, error: "Password reset link is invalid or has expired. Please request a new one." };
        }

        return { valid: true, userName: user.name };
    }
);

const ResetPasswordSchema = z.object({
    email: z.string().email(),
    token: z.string().min(10),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const resetPasswordWithTokenAction = createSafeAction(
    { schema: ResetPasswordSchema, rateLimit: RATE_LIMIT_CONFIGS.AUTH },
    async (data) => {
        await connectDB();
        const email = data.email.trim().toLowerCase();

        const user = await User.findOne({
            email,
            resetToken: data.token,
            resetTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            throw new Error("Password reset link is invalid or has expired. Please request a new one.");
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return {
            success: true,
            message: "Password reset successfully! You can now log in with your new password.",
        };
    }
);
