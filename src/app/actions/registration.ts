"use server";

import connectDB from "@/lib/db";
import User, { UserRole } from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const RegistrationSchema = z.object({
    name: z.string().min(2),
    dateOfBirth: z.string(),
    fatherName: z.string().min(2),
    motherName: z.string().min(2),
    aadharNo: z.string().length(12).regex(/^\d+$/, "Aadhar must be 12 digits"),
    category: z.string(),
    localAddress: z.string().min(10),
    localPhone: z.string().min(10).max(15),
    email: z.string().email(),
    permanentAddress: z.string().min(10),
    permanentPhone: z.string().max(15).optional(),
    course: z.string(),
    password: z.string().min(8),
    photoUrl: z.string().optional(),
    
    // Offline Form Fields
    year: z.string().optional(),
    mode: z.string().optional(),
    idNo: z.string().optional(),
    gender: z.string().optional(),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    abcId: z.string().optional(),
    guardianPhone: z.string().optional(),
    whatsappNo: z.string().optional(),
});

export const registerStudent = createSafeAction(
    { schema: RegistrationSchema, requireAuth: false, rateLimit: RATE_LIMIT_CONFIGS.AUTH },
    async (formData) => {
        await connectDB();

        // Check if email already exists
        const existing = await User.findOne({ email: formData.email }).lean();
        if (existing) {
            throw new Error("An account with this email already exists.");
        }

        // Hash password with high work factor
        const hashedPassword = await bcrypt.hash(formData.password, 12);

        // Create user account (inactive until admin approves)
        const user = await User.create({
            name: formData.name,
            email: formData.email,
            password: hashedPassword,
            role: UserRole.STUDENT,
            isActive: false, // pending admin approval
        });

        // Save full student profile
        await StudentProfile.create({
            userId: user._id,
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            aadharNo: formData.aadharNo,
            category: formData.category,
            localAddress: formData.localAddress,
            localPhone: formData.localPhone,
            permanentAddress: formData.permanentAddress,
            permanentPhone: formData.permanentPhone,
            course: formData.course,
            photoUrl: formData.photoUrl || "",
            status: "Pending",
            
            // Offline Form Fields
            year: formData.year,
            mode: formData.mode,
            idNo: formData.idNo,
            gender: formData.gender,
            nationality: formData.nationality,
            religion: formData.religion,
            abcId: formData.abcId,
            guardianPhone: formData.guardianPhone,
            whatsappNo: formData.whatsappNo,
        });

        revalidatePath("/admin/students");

        return { userId: user._id.toString() };
    }
);

export const getStudentRegistrations = createSafeAction(
    { 
        schema: z.object({
            page: z.number().optional().default(1),
            limit: z.number().optional().default(20),
            status: z.string().optional()
        }),
        roles: [UserRole.ADMIN], 
        requireAuth: true 
    },
    async ({ page = 1, limit = 20, status }) => {
        await connectDB();
        const skip = (page - 1) * limit;

        let query: any = {};
        if (status && status !== "All") {
            query.status = status;
        }

        const [profiles, total, pendingCount, approvedCount, allCount] = await Promise.all([
            StudentProfile.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            StudentProfile.countDocuments(query),
            StudentProfile.countDocuments({ status: "Pending" }),
            StudentProfile.countDocuments({ status: "Approved" }),
            StudentProfile.countDocuments({})
        ]);

        return {
            data: JSON.parse(JSON.stringify(profiles)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
            counts: {
                Pending: pendingCount,
                Approved: approvedCount,
                All: allCount
            }
        };
    }
);

const ProfileIdSchema = z.object({
    profileId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});

export const approveStudent = createSafeAction(
    { schema: ProfileIdSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async ({ profileId }) => {
        await connectDB();
        const profile = await StudentProfile.findByIdAndUpdate(
            profileId,
            { status: "Approved" },
            { new: true }
        );

        if (!profile) throw new Error("Profile not found");

        // Activate the user account so they can login
        await User.findByIdAndUpdate(profile.userId, { isActive: true });

        revalidatePath("/admin/students");
        return { success: true };
    }
);

export const rejectStudent = createSafeAction(
    { schema: ProfileIdSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async ({ profileId }) => {
        await connectDB();
        const profile = await StudentProfile.findByIdAndDelete(profileId);
        if (!profile) throw new Error("Profile not found");

        // Also delete the user account
        await User.findByIdAndDelete(profile.userId);

        revalidatePath("/admin/students");
        return { success: true };
    }
);

const SimpleRegistrationSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
});

export const registerUser = createSafeAction(
    { schema: SimpleRegistrationSchema, requireAuth: false, rateLimit: RATE_LIMIT_CONFIGS.AUTH },
    async (formData) => {
        await connectDB();

        const existing = await User.findOne({ email: formData.email }).lean();
        if (existing) {
            throw new Error("An account with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(formData.password, 12);

        // Simple user registration creates active user directly
        const user = await User.create({
            name: formData.name,
            email: formData.email,
            password: hashedPassword,
            mobile: formData.mobile,
            role: UserRole.STUDENT,
            isActive: true, 
        });

        return { success: true, userId: user._id.toString() };
    }
);

export const getWebsiteUsers = createSafeAction(
    { roles: [UserRole.ADMIN], requireAuth: true },
    async () => {
        await connectDB();
        const users = await User.find({ role: UserRole.STUDENT })
            .select("name email mobile isActive createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(users));
    }
);
