"use server";

import connectDB from "@/lib/db";
import User, { UserRole } from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Course from "@/models/Course";
import Payment, { PaymentStatus } from "@/models/Payment";
import Enrollment from "@/models/Enrollment";
import bcrypt from "bcryptjs";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/services/RazorpayService";
import { COURSE_CATALOG } from "@/lib/course-catalog";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const OnlineEnrollmentFormSchema = z.object({
    name: z.string().min(2, "Name is required"),
    dateOfBirth: z.string().min(1, "Date of Birth is required"),
    fatherName: z.string().min(2, "Father's name is required"),
    motherName: z.string().min(2, "Mother's name is required"),
    aadharNo: z.string().length(12, "Aadhar must be 12 digits").regex(/^\d+$/, "Aadhar must contain only digits"),
    category: z.string(),
    localAddress: z.string().min(5, "Local address is required"),
    localPhone: z.string().min(10).max(15),
    email: z.string().email("Invalid email address"),
    permanentAddress: z.string().min(5, "Permanent address is required"),
    permanentPhone: z.string().optional(),
    courseId: z.string().min(1, "Please select a course"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    photoUrl: z.string().optional(),

    // Extra Details
    year: z.string().optional(),
    mode: z.string().optional(),
    gender: z.string().optional(),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    abcId: z.string().optional(),
    guardianPhone: z.string().optional(),
    whatsappNo: z.string().optional(),
});

export const initiateOnlineEnrollmentPayment = createSafeAction(
    { schema: OnlineEnrollmentFormSchema, requireAuth: false, rateLimit: RATE_LIMIT_CONFIGS.SENSITIVE },
    async (formData) => {
        await connectDB();

        // 1. Check if user email already exists
        const existingUser = await User.findOne({ email: formData.email.toLowerCase().trim() }).lean();
        if (existingUser) {
            throw new Error("An account with this email address already exists. Please login instead.");
        }

        // 2. Lookup Course in Catalog
        const catalogCourse = COURSE_CATALOG.find((c) => c.id === formData.courseId);
        if (!catalogCourse) {
            throw new Error("Invalid course selection.");
        }

        // 3. Create Razorpay Payment Order for exact course fee
        const order = await createRazorpayOrder(catalogCourse.fee);

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID || "",
            courseTitle: catalogCourse.name,
            courseFee: catalogCourse.fee,
            studentName: formData.name,
            studentEmail: formData.email,
        };
    }
);

const CompleteOnlineEnrollmentSchema = z.object({
    formData: OnlineEnrollmentFormSchema,
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
});

export const completeOnlineEnrollmentAndPayment = createSafeAction(
    { schema: CompleteOnlineEnrollmentSchema, requireAuth: false },
    async ({ formData, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
        await connectDB();

        // 1. Verify Payment Signature
        const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) {
            throw new Error("Payment signature verification failed. Enrollment aborted.");
        }

        // 2. Lookup Course in Catalog
        const catalogCourse = COURSE_CATALOG.find((c) => c.id === formData.courseId);
        if (!catalogCourse) {
            throw new Error("Invalid course selection.");
        }

        // 3. Ensure User email isn't created in parallel
        const email = formData.email.toLowerCase().trim();
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            throw new Error("An account with this email already exists.");
        }

        // 4. Create Active User Account
        const hashedPassword = await bcrypt.hash(formData.password, 12);
        const user = await User.create({
            name: formData.name,
            email: email,
            password: hashedPassword,
            mobile: formData.localPhone,
            role: UserRole.STUDENT,
            isActive: true, // Auto-approved upon online payment completion
        });

        // 5. Generate Student ID Number
        const count = await StudentProfile.countDocuments();
        let suffix = count + 1001;
        let idNo = `NGIT-${suffix}`;
        while (await StudentProfile.exists({ idNo })) {
            suffix++;
            idNo = `NGIT-${suffix}`;
        }

        // 6. Save Student Profile
        const profile = await StudentProfile.create({
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
            permanentPhone: formData.permanentPhone || formData.localPhone,
            course: catalogCourse.name,
            photoUrl: formData.photoUrl || "",
            status: "Approved",
            email: email,

            // Additional details
            year: formData.year || new Date().getFullYear().toString(),
            mode: formData.mode || "Online",
            idNo: idNo,
            gender: formData.gender || "Male",
            nationality: formData.nationality || "Indian",
            religion: formData.religion || "",
            abcId: formData.abcId || "",
            guardianPhone: formData.guardianPhone || "",
            whatsappNo: formData.whatsappNo || "",
        });

        // 7. Find or Create DB Course Document
        const courseSlug = catalogCourse.id.toLowerCase();
        let dbCourse = await Course.findOne({ slug: courseSlug });
        if (!dbCourse) {
            dbCourse = await Course.create({
                title: catalogCourse.name,
                slug: courseSlug,
                description: catalogCourse.description,
                thumbnail: "/images/course-default.jpg",
                price: catalogCourse.fee,
                category: catalogCourse.level,
                isPublished: true,
                type: "ONLINE",
            });
        }

        // 8. Create Successful Payment Record
        await Payment.create({
            userId: user._id,
            courseId: dbCourse._id,
            amount: catalogCourse.fee,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            razorpaySignature: razorpaySignature,
            status: PaymentStatus.SUCCESS,
        });

        // 9. Create Course Enrollment
        await Enrollment.create({
            userId: user._id,
            courseId: dbCourse._id,
            enrolledAt: new Date(),
            progress: 0,
            isActive: true,
        });

        return {
            success: true,
            studentIdNo: idNo,
            userName: user.name,
            userEmail: user.email,
            courseName: catalogCourse.name,
            amountPaid: catalogCourse.fee,
            paymentId: razorpayPaymentId,
        };
    }
);
