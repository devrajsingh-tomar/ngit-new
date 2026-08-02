"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const UpdateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    image: z.string().optional(),
});

export const updateUserDetails = createSafeAction(
    { schema: UpdateUserSchema, requireAuth: true },
    async (data, session) => {
        await connectDB();
        const userId = session.user.id;

        // Explicitly only pick allowed fields to prevent mass assignment
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.image) updateData.image = data.image;

        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        if (!updated) throw new Error("User not found");

        revalidatePath("/", "layout");
        
        return { 
            name: updated.name, 
            image: updated.image 
        };
    }
);

const UpdatePasswordSchema = z.object({
    current: z.string().min(6),
    new: z.string().min(8).regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
});

export const updateUserPassword = createSafeAction(
    { schema: UpdatePasswordSchema, requireAuth: true, rateLimit: RATE_LIMIT_CONFIGS.AUTH },
    async (data, session) => {
        await connectDB();
        const user = await User.findById(session.user.id);
        
        if (!user || !user.password) {
            throw new Error("User not found or password login not enabled");
        }

        const isMatch = await bcrypt.compare(data.current, user.password);
        if (!isMatch) {
            throw new Error("Current password does not match");
        }

        const hashed = await bcrypt.hash(data.new, 12); // Increased salt rounds for production
        user.password = hashed;
        await user.save();

        return { success: true };
    }
);

// Fetch logged-in student profile
export const getStudentProfile = createSafeAction(
    { schema: z.object({}), requireAuth: true },
    async (_, session) => {
        await connectDB();
        const userId = session.user.id;
        let profile = await StudentProfile.findOne({ userId }).lean();
        
        if (!profile) {
            // Auto-create stub profile if somehow missing
            profile = await StudentProfile.create({
                userId,
                name: session.user.name || "Student",
                dateOfBirth: "—",
                fatherName: "—",
                motherName: "—",
                aadharNo: "—",
                category: "General",
                localAddress: "—",
                localPhone: "—",
                permanentAddress: "—",
                course: "General Typing",
                status: "Approved",
            });
        }
        return JSON.parse(JSON.stringify(profile));
    }
);

const UpdateStudentProfileSchema = z.object({
    fatherName: z.string().min(2, "Father's name is too short").max(100),
    motherName: z.string().min(2, "Mother's name is too short").max(100),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    aadharNo: z.string().min(12, "Aadhar must be exactly 12 digits").max(12, "Aadhar must be exactly 12 digits"),
    category: z.string().min(1, "Category is required"),
    localAddress: z.string().min(5, "Local address is too short"),
    localPhone: z.string().min(10, "Local phone number must be at least 10 digits").max(15),
    permanentAddress: z.string().min(5, "Permanent address is too short"),
    permanentPhone: z.string().max(15).optional().nullable(),
    gender: z.string().min(1, "Gender is required"),
    nationality: z.string().min(1, "Nationality is required"),
    religion: z.string().min(1, "Religion is required"),
    abcId: z.string().optional().nullable(),
    guardianPhone: z.string().optional().nullable(),
    whatsappNo: z.string().optional().nullable(),
});

// Update logged-in student profile
export const updateStudentProfile = createSafeAction(
    { schema: UpdateStudentProfileSchema, requireAuth: true },
    async (data, session) => {
        await connectDB();
        const userId = session.user.id;

        const updated = await StudentProfile.findOneAndUpdate(
            { userId },
            { $set: data },
            { new: true, upsert: true }
        );

        revalidatePath("/", "layout");
        revalidatePath("/admin/students");
        return JSON.parse(JSON.stringify(updated));
    }
);
