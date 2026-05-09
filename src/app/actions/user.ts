"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
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
