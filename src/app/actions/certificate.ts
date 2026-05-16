
"use server";

import connectDB from "@/lib/db";
import Certificate, { CertificateStatus } from "@/models/Certificate";
import CertificateTemplate from "@/models/CertificateTemplate";
import { generateCertificateNumber } from "@/lib/certificate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DynamicCertificateTemplate } from "@/components/certificates/DynamicCertificateTemplate";
import QRCode from "qrcode";
import React from "react";
import User, { UserRole } from "@/models/User";
import Course from "@/models/Course";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Font } from "@react-pdf/renderer";
import { getGoogleFontDataUrl } from "@/lib/fonts";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";

// --- STUDENT: GET MY CERTIFICATES ---
export const getStudentCertificates = createSafeAction(
    { requireAuth: true, roles: [UserRole.STUDENT, UserRole.ADMIN] },
    async (_, session) => {
        await connectDB();
        const certs = await Certificate.find({ studentId: session.user.id })
            .populate("courseId", "title")
            .sort({ issuedDate: -1 });

        return JSON.parse(JSON.stringify(certs));
    }
);

// --- PUBLIC: VERIFY CERTIFICATE ---
export const verifyCertificate = createSafeAction(
    { schema: z.object({ certId: z.string().min(1) }), requireAuth: false },
    async ({ certId }) => {
        await connectDB();

        let query = {};
        if (certId.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: certId };
        } else {
            query = { certificateNumber: certId };
        }

        const cert = await Certificate.findOne(query)
            .populate("studentId", "name email image")
            .populate("courseId", "title description thumbnail");

        if (!cert) throw new Error("Certificate not found");

        return JSON.parse(JSON.stringify(cert));
    }
);

// --- DOWNLOAD PDF ---
export async function getCertificatePDF(certId: string) {
    try {
        await connectDB();
        const cert = await Certificate.findById(certId)
            .populate("studentId", "name email")
            .populate("courseId", "title");

        if (!cert) return { success: false, error: "Certificate record not found" };
        if (!cert.studentId) return { success: false, error: "Student for this certificate no longer exists" };
        if (!cert.courseId) return { success: false, error: "Course for this certificate no longer exists" };

        const student = cert.studentId as any;
        const course = cert.courseId as any;

        // Generate QR Code Data URL
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ngit-new.vercel.app"}/verify/${cert.certificateNumber}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

        // Prepare Date string
        const dateStr = new Date(cert.issuedDate).toLocaleDateString("en-GB", {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const { renderToBuffer } = await import("@react-pdf/renderer");
        let pdfBuffer: Buffer | null = null;

        // 1. Determine which template to use (Try specific, then default, then any)
        let template: any = null;
        
        // A. Try specific template from metadata
        if (cert.metadata?.templateId) {
            template = await CertificateTemplate.findById(cert.metadata.templateId);
            console.log("DEBUG: Specific template lookup:", template ? template.name : "FAILED/MISSING");
        }
        
        // B. If no specific found, try Default
        if (!template) {
            template = await CertificateTemplate.findOne({ isDefault: true });
            console.log("DEBUG: Default template lookup:", template ? template.name : "NOT SET");
        }
        
        // C. Last Resort: Pick any existing template
        if (!template) {
            template = await CertificateTemplate.findOne().sort({ updatedAt: -1 });
            console.log("DEBUG: Last resort template lookup:", template ? template.name : "NONE EXISTS");
        }

        if (template) {
            const templateIdToUse = template._id.toString();
            console.log("DEBUG: Proceeding with template:", template.name, `(${templateIdToUse})`);
            
            // LOG ELEMENTS to find corrupt sources
            console.log("DEBUG: TEMPLATE ELEMENTS RAW:", JSON.stringify(template.elements, null, 2));

            // --- SERVER-SIDE FONT REGISTRATION DISABLED PER USER REQUEST ---
            /*
            const standardFonts = ['Courier', 'Helvetica', 'Times-Roman'];
            const elements = template.elements as any[];
            const uniqueFonts = [...new Set(elements.map(el => el.style?.fontFamily || el.fontFamily || 'Helvetica'))];

            for (const font of uniqueFonts) {
                const rawFont = font as string;
                if (!standardFonts.includes(rawFont) && !rawFont.toLowerCase().includes('times') && !rawFont.toLowerCase().includes('courier')) {
                    try {
                        const fontDataUrl = await getGoogleFontDataUrl(rawFont);
                        Font.register({ family: rawFont, src: fontDataUrl });
                        console.log(`DEBUG: Successfully registered server-side font: ${rawFont} (as DataURL)`);
                    } catch (fontErr) {
                        console.error(`DEBUG: Failed to register font ${rawFont}:`, fontErr);
                    }
                }
            }
            */

            const heads = await headers();
            const host = heads.get("host");
            const proto = heads.get("x-forwarded-proto") || "http";
            const origin = `${proto}://${host}`;

            try {
                pdfBuffer = await renderToBuffer(
                        React.createElement(DynamicCertificateTemplate as any, {
                            elements: template.elements as any,
                            backgroundImage: template.backgroundImage,
                            config: template.config as any,
                            origin: origin,
                            placeholders: {
                                student_name: student.name || "Student Name",
                                course_name: course.title || "Course Name",
                                grade: cert.grade || "N/A",
                                percentage: (cert.percentage || 0).toString(),
                                enrollment_number: student.email || student._id.toString(),
                                certificate_number: cert.certificateNumber,
                                issue_date: dateStr,
                                qr_code: qrCodeDataUrl,
                                institute_name: "NGIT Institute"
                            }
                        }) as any
                    );
            } catch (err: any) {
                console.error("Dynamic Template Render Error:", err);
                return { 
                    success: false, 
                    error: `Render Error: ${err.message || 'Unknown error'}. Please check template elements.` 
                };
            }
        }

        console.log("DEBUG: pdfBuffer generated:", pdfBuffer ? pdfBuffer.length : "null");

        if (!pdfBuffer) {
            return { 
                success: false, 
                error: `Render Error: The system found a template but failed to generate the PDF.` 
            };
        }

        const base64 = pdfBuffer.toString('base64');
        return { 
            success: true, 
            pdfBase64: base64, 
            filename: `Certificate-${cert.certificateNumber.replace(/\//g, '-')}.pdf` 
        };

    } catch (error: any) {
        console.error("PDF Gen Error:", error);
        return { success: false, error: "Failed to generate PDF. Please try again later." };
    }
}

// --- ADMIN: LIST ALL CERTIFICATES ---
export const getAdminCertificates = createSafeAction(
    { 
        schema: z.object({
            page: z.number().optional().default(1),
            limit: z.number().optional().default(20),
            search: z.string().optional()
        }),
        roles: [UserRole.ADMIN], 
        requireAuth: true 
    },
    async ({ page = 1, limit = 20, search }) => {
        await connectDB();
        const skip = (page - 1) * limit;

        let query: any = {};
        if (search) {
            query = {
                $or: [
                    { certificateNumber: { $regex: search, $options: "i" } },
                ]
            };
        }

        const [certs, total] = await Promise.all([
            Certificate.find(query)
                .populate("studentId", "name email")
                .populate("courseId", "title thumbnail")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Certificate.countDocuments(query)
        ]);

        return {
            certs: JSON.parse(JSON.stringify(certs)),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
);

// ALIAS for backward compatibility
export const getAllCertificates = getAdminCertificates;

// --- ADMIN: ISSUE CERTIFICATE ---
const IssueCertificateSchema = z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Student ID"),
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Course ID"),
    grade: z.string().min(1),
    percentage: z.number().min(0).max(100),
    courseDuration: z.string().min(1),
    templateId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Template ID").optional(),
    remarks: z.string().optional(),
});

export const issueCertificate = createSafeAction(
    { schema: IssueCertificateSchema, roles: [UserRole.ADMIN], requireAuth: true },
    async (data, session) => {
        await connectDB();

        // Duplicate Check
        const existing = await Certificate.findOne({
            studentId: data.studentId,
            courseId: data.courseId,
            status: CertificateStatus.ISSUED
        });

        if (existing) {
            throw new Error("This student already has an active certificate for this course.");
        }

        // Generate Certificate Number
        const certNumber = await generateCertificateNumber(data.courseId);

        const cert = await Certificate.create({
            ...data,
            certificateNumber: certNumber,
            issuedDate: new Date(),
            status: CertificateStatus.ISSUED,
            metadata: {
                adminId: session.user.id,
                remarks: data.remarks,
                templateId: data.templateId
            }
        });

        revalidatePath("/admin/certificates");
        return JSON.parse(JSON.stringify(cert));
    }
);

// ALIAS
export const generateCertificate = issueCertificate;

// --- ADMIN: REVOKE CERTIFICATE ---
export async function revokeCertificate(certId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const cert = await Certificate.findById(certId);
        if (!cert) return { success: false, error: "Not found" };

        cert.status = CertificateStatus.REVOKED;
        await cert.save();

        revalidatePath("/admin/certificates");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- ADMIN: GET STUDENT LIST ---
export async function getStudentList() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const students = await User.find({ role: UserRole.STUDENT }).select("name email").sort({ name: 1 }).lean();
        return { success: true, students: JSON.parse(JSON.stringify(students)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- ADMIN: GET FORM DATA ---
export const getFormData = createSafeAction(
    { roles: [UserRole.ADMIN], requireAuth: true },
    async () => {
        await connectDB();
        const students = await User.find({ role: UserRole.STUDENT }).select("name email");
        const courses = await Course.find({ isPublished: true }).select("title");
        const templates = await CertificateTemplate.find().select("name");

        return {
            students: JSON.parse(JSON.stringify(students)),
            courses: JSON.parse(JSON.stringify(courses)),
            templates: JSON.parse(JSON.stringify(templates))
        };
    }
);
