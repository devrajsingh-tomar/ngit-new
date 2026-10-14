"use server";

import connectDB from "@/lib/db";
import PartnerInstitute from "@/models/PartnerInstitute";
import ReferralCode from "@/models/ReferralCode";
import StudentReferral from "@/models/StudentReferral";
import User, { UserRole } from "@/models/User";
import TypingResult from "@/models/TypingResult";
import StenoResult from "@/models/StenoResult";
import Payment from "@/models/Payment";
import TypingSubscription from "@/models/TypingSubscription";
import StenoSubscription from "@/models/StenoSubscription";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────
// PARTNER INSTITUTES
// ─────────────────────────────────────────────────────────────

export const getPartnerInstitutes = createSafeAction(
    {
        schema: z.object({
            search: z.string().optional(),
            status: z.string().optional(),
            page: z.number().optional().default(1),
            limit: z.number().optional().default(20),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ search, status, page = 1, limit = 20 }) => {
        await connectDB();
        const skip = (page - 1) * limit;

        const query: any = {};
        if (status && status !== "ALL") {
            query.status = status;
        }
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { code: regex },
                { contactPerson: regex },
                { contactEmail: regex },
                { city: regex },
            ];
        }

        const [institutes, total] = await Promise.all([
            PartnerInstitute.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            PartnerInstitute.countDocuments(query),
        ]);

        // Enrich each institute with code count and student count
        const instituteIds = institutes.map((i) => i._id);
        const [codeCounts, referralCounts] = await Promise.all([
            ReferralCode.aggregate([
                { $match: { partnerInstituteId: { $in: instituteIds } } },
                { $group: { _id: "$partnerInstituteId", count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } } } },
            ]),
            StudentReferral.aggregate([
                { $match: { partnerInstituteId: { $in: instituteIds } } },
                { $group: { _id: "$partnerInstituteId", count: { $sum: 1 }, paidCount: { $sum: { $cond: [{ $eq: ["$attributionStatus", "CONVERTED_PAID"] }, 1, 0] } } } },
            ]),
        ]);

        const codeCountMap = new Map(codeCounts.map((c) => [c._id.toString(), c]));
        const refCountMap = new Map(referralCounts.map((r) => [r._id.toString(), r]));

        const enriched = institutes.map((inst) => {
            const idStr = inst._id.toString();
            const cInfo = codeCountMap.get(idStr);
            const rInfo = refCountMap.get(idStr);
            return {
                ...inst,
                totalCodes: cInfo?.count || 0,
                activeCodes: cInfo?.activeCount || 0,
                totalStudents: rInfo?.count || 0,
                paidStudents: rInfo?.paidCount || 0,
            };
        });

        return {
            institutes: JSON.parse(JSON.stringify(enriched)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
);

export const getPartnerInstituteById = createSafeAction(
    {
        schema: z.object({ id: z.string() }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ id }) => {
        await connectDB();
        const institute = await PartnerInstitute.findById(id).lean();
        if (!institute) throw new Error("Partner institute not found");

        const [codes, totalStudents, recentReferrals] = await Promise.all([
            ReferralCode.find({ partnerInstituteId: id }).sort({ createdAt: -1 }).lean(),
            StudentReferral.countDocuments({ partnerInstituteId: id }),
            StudentReferral.find({ partnerInstituteId: id })
                .populate("studentId", "name email mobile createdAt")
                .populate("referralCodeId", "code")
                .sort({ attributedAt: -1 })
                .limit(10)
                .lean(),
        ]);

        return {
            institute: JSON.parse(JSON.stringify(institute)),
            codes: JSON.parse(JSON.stringify(codes)),
            totalStudents,
            recentReferrals: JSON.parse(JSON.stringify(recentReferrals)),
        };
    }
);

const CreateInstituteSchema = z.object({
    name: z.string().min(2, "Institute name must be at least 2 characters"),
    code: z.string().min(2, "Code must be at least 2 characters").regex(/^[A-Za-z0-9-_]+$/, "Code can only contain alphanumeric characters, hyphens, and underscores"),
    contactPerson: z.string().min(2, "Contact person required"),
    contactEmail: z.string().email("Invalid email address"),
    contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    city: z.string().optional(),
    state: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(["ACTIVE", "PAUSED", "INACTIVE"]).default("ACTIVE"),
    notes: z.string().optional(),
});

export const createPartnerInstitute = createSafeAction(
    {
        schema: CreateInstituteSchema,
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async (data) => {
        await connectDB();

        const cleanCode = data.code.trim().toUpperCase();
        const existingCode = await PartnerInstitute.findOne({ code: cleanCode }).lean();
        if (existingCode) {
            throw new Error(`An institute with code "${cleanCode}" already exists.`);
        }

        const slug = data.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const existingSlug = await PartnerInstitute.findOne({ slug }).lean();
        const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

        const institute = await PartnerInstitute.create({
            ...data,
            code: cleanCode,
            slug: finalSlug,
            contactEmail: data.contactEmail.trim().toLowerCase(),
        });

        revalidatePath("/admin/referrals/institutes");
        revalidatePath("/admin/referrals");
        return { success: true, instituteId: institute._id.toString() };
    }
);

export const updatePartnerInstitute = createSafeAction(
    {
        schema: z.object({
            id: z.string(),
            name: z.string().min(2),
            contactPerson: z.string().min(2),
            contactEmail: z.string().email(),
            contactPhone: z.string().min(10),
            city: z.string().optional(),
            state: z.string().optional(),
            address: z.string().optional(),
            status: z.enum(["ACTIVE", "PAUSED", "INACTIVE"]),
            notes: z.string().optional(),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ id, ...data }) => {
        await connectDB();

        const updated = await PartnerInstitute.findByIdAndUpdate(
            id,
            { ...data, contactEmail: data.contactEmail.trim().toLowerCase() },
            { new: true }
        ).lean();

        if (!updated) throw new Error("Institute not found");

        revalidatePath(`/admin/referrals/institutes/${id}`);
        revalidatePath("/admin/referrals/institutes");
        revalidatePath("/admin/referrals");
        return { success: true, institute: JSON.parse(JSON.stringify(updated)) };
    }
);

export const toggleInstituteStatus = createSafeAction(
    {
        schema: z.object({
            id: z.string(),
            status: z.enum(["ACTIVE", "PAUSED", "INACTIVE"]),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ id, status }) => {
        await connectDB();
        const updated = await PartnerInstitute.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) throw new Error("Institute not found");

        revalidatePath("/admin/referrals/institutes");
        revalidatePath("/admin/referrals");
        return { success: true, status: updated.status };
    }
);

// ─────────────────────────────────────────────────────────────
// REFERRAL CODES
// ─────────────────────────────────────────────────────────────

export const getReferralCodes = createSafeAction(
    {
        schema: z.object({
            instituteId: z.string().optional(),
            status: z.string().optional(),
            search: z.string().optional(),
            page: z.number().optional().default(1),
            limit: z.number().optional().default(20),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ instituteId, status, search, page = 1, limit = 20 }) => {
        await connectDB();
        const skip = (page - 1) * limit;

        const query: any = {};
        if (instituteId && instituteId !== "ALL") {
            query.partnerInstituteId = instituteId;
        }
        if (status && status !== "ALL") {
            query.status = status;
        }
        if (search && search.trim()) {
            query.code = new RegExp(search.trim().toUpperCase(), "i");
        }

        const [codes, total, allInstitutes] = await Promise.all([
            ReferralCode.find(query)
                .populate("partnerInstituteId", "name code status")
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ReferralCode.countDocuments(query),
            PartnerInstitute.find({ status: "ACTIVE" }).select("name code").sort({ name: 1 }).lean(),
        ]);

        return {
            codes: JSON.parse(JSON.stringify(codes)),
            institutes: JSON.parse(JSON.stringify(allInstitutes)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
);

const CreateReferralCodeSchema = z.object({
    partnerInstituteId: z.string(),
    code: z.string().min(3, "Code must be at least 3 characters").max(20).regex(/^[A-Za-z0-9-_]+$/, "Only letters, numbers, hyphens, and underscores allowed"),
    startsAt: z.string().optional(),
    expiresAt: z.string().optional(),
    usageLimit: z.number().min(0).optional().default(0),
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    description: z.string().optional(),
});

export const createReferralCode = createSafeAction(
    {
        schema: CreateReferralCodeSchema,
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async (data, session) => {
        await connectDB();

        const cleanCode = data.code.trim().toUpperCase();
        const existing = await ReferralCode.findOne({ code: cleanCode }).lean();
        if (existing) {
            throw new Error(`Referral code "${cleanCode}" already exists. Please choose a unique code.`);
        }

        const institute = await PartnerInstitute.findById(data.partnerInstituteId).lean();
        if (!institute) throw new Error("Selected partner institute not found");

        const newCode = await ReferralCode.create({
            code: cleanCode,
            partnerInstituteId: data.partnerInstituteId,
            status: "ACTIVE",
            startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            usageLimit: data.usageLimit || 0,
            usageCount: 0,
            discountPercent: data.discountPercent,
            discountAmount: data.discountAmount,
            description: data.description || "",
            createdBy: session?.user?.id,
        });

        revalidatePath("/admin/referrals/codes");
        revalidatePath("/admin/referrals");
        return { success: true, code: JSON.parse(JSON.stringify(newCode)) };
    }
);

export const toggleReferralCodeStatus = createSafeAction(
    {
        schema: z.object({
            id: z.string(),
            status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ id, status }) => {
        await connectDB();
        const updated = await ReferralCode.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) throw new Error("Referral code not found");

        revalidatePath("/admin/referrals/codes");
        revalidatePath("/admin/referrals");
        return { success: true, status: updated.status };
    }
);

// ─────────────────────────────────────────────────────────────
// REFERRED STUDENTS DIRECTORY
// ─────────────────────────────────────────────────────────────

export const getReferredStudents = createSafeAction(
    {
        schema: z.object({
            instituteId: z.string().optional(),
            codeId: z.string().optional(),
            search: z.string().optional(),
            dateFrom: z.string().optional(),
            dateTo: z.string().optional(),
            page: z.number().optional().default(1),
            limit: z.number().optional().default(20),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ instituteId, codeId, search, dateFrom, dateTo, page = 1, limit = 20 }) => {
        await connectDB();
        const skip = (page - 1) * limit;

        const query: any = {};
        if (instituteId && instituteId !== "ALL") {
            query.partnerInstituteId = instituteId;
        }
        if (codeId && codeId !== "ALL") {
            query.referralCodeId = codeId;
        }
        if (dateFrom || dateTo) {
            query.attributedAt = {};
            if (dateFrom) query.attributedAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                query.attributedAt.$lte = end;
            }
        }

        // Handle student search (by name/email/mobile)
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            const matchingUsers = await User.find({
                $or: [{ name: regex }, { email: regex }, { mobile: regex }],
            })
                .select("_id")
                .lean();
            const userIds = matchingUsers.map((u) => u._id);
            query.studentId = { $in: userIds };
        }

        const [referrals, total, institutes] = await Promise.all([
            StudentReferral.find(query)
                .populate("studentId", "name email mobile createdAt isActive")
                .populate("partnerInstituteId", "name code")
                .populate("referralCodeId", "code")
                .sort({ attributedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            StudentReferral.countDocuments(query),
            PartnerInstitute.find().select("name code").sort({ name: 1 }).lean(),
        ]);

        // Enrich students with real typing, steno, and payment activity
        const studentIds = referrals.map((r) => (r.studentId as any)?._id).filter(Boolean);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [typingCounts, stenoCounts, recentTyping, recentSteno, payments] = await Promise.all([
            TypingResult.aggregate([
                { $match: { userId: { $in: studentIds } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } },
            ]),
            StenoResult.aggregate([
                { $match: { userId: { $in: studentIds } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } },
            ]),
            TypingResult.find({ userId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } }).select("userId").lean(),
            StenoResult.find({ userId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } }).select("userId").lean(),
            Payment.find({ userId: { $in: studentIds }, status: "SUCCESS" }).select("userId amount").lean(),
        ]);

        const typingMap = new Map(typingCounts.map((t) => [t._id.toString(), t.count]));
        const stenoMap = new Map(stenoCounts.map((s) => [s._id.toString(), s.count]));
        const activeUserIds = new Set([
            ...recentTyping.map((r) => r.userId.toString()),
            ...recentSteno.map((r) => r.userId.toString()),
        ]);
        const paidUserIds = new Set(payments.map((p) => p.userId.toString()));

        const enrichedReferrals = referrals.map((r) => {
            const sid = (r.studentId as any)?._id?.toString();
            return {
                ...r,
                typingExamsCount: sid ? typingMap.get(sid) || 0 : 0,
                stenoExamsCount: sid ? stenoMap.get(sid) || 0 : 0,
                isActiveStudent: sid ? activeUserIds.has(sid) : false,
                isPaidCustomer: sid ? (paidUserIds.has(sid) || r.attributionStatus === "CONVERTED_PAID") : false,
            };
        });

        return {
            students: JSON.parse(JSON.stringify(enrichedReferrals)),
            institutes: JSON.parse(JSON.stringify(institutes)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
);

// ─────────────────────────────────────────────────────────────
// DASHBOARD OVERVIEW & ANALYTICS
// ─────────────────────────────────────────────────────────────

export const getReferralDashboardOverview = createSafeAction(
    {
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async () => {
        await connectDB();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalInstitutes,
            activeInstitutes,
            totalCodes,
            activeCodes,
            totalReferredStudents,
            paidAttributions,
            topInstitutes,
            recentReferrals,
        ] = await Promise.all([
            PartnerInstitute.countDocuments(),
            PartnerInstitute.countDocuments({ status: "ACTIVE" }),
            ReferralCode.countDocuments(),
            ReferralCode.countDocuments({ status: "ACTIVE" }),
            StudentReferral.countDocuments(),
            StudentReferral.countDocuments({ attributionStatus: "CONVERTED_PAID" }),
            StudentReferral.aggregate([
                {
                    $group: {
                        _id: "$partnerInstituteId",
                        totalStudents: { $sum: 1 },
                        paidStudents: {
                            $sum: { $cond: [{ $eq: ["$attributionStatus", "CONVERTED_PAID"] }, 1, 0] },
                        },
                    },
                },
                { $sort: { totalStudents: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "partnerinstitutes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "institute",
                    },
                },
                { $unwind: "$institute" },
                {
                    $project: {
                        name: "$institute.name",
                        code: "$institute.code",
                        totalStudents: 1,
                        paidStudents: 1,
                    },
                },
            ]),
            StudentReferral.find()
                .populate("studentId", "name email createdAt")
                .populate("partnerInstituteId", "name code")
                .populate("referralCodeId", "code")
                .sort({ attributedAt: -1 })
                .limit(8)
                .lean(),
        ]);

        // Calculate 30-day active students among referred users
        const allReferredStudentIds = (await StudentReferral.find().select("studentId").lean()).map((r) => r.studentId);
        
        let active30DayCount = 0;
        if (allReferredStudentIds.length > 0) {
            const [recentTyping, recentSteno] = await Promise.all([
                TypingResult.distinct("userId", { userId: { $in: allReferredStudentIds }, createdAt: { $gte: thirtyDaysAgo } }),
                StenoResult.distinct("userId", { userId: { $in: allReferredStudentIds }, createdAt: { $gte: thirtyDaysAgo } }),
            ]);
            const distinctActive = new Set([...recentTyping.map((id) => id.toString()), ...recentSteno.map((id) => id.toString())]);
            active30DayCount = distinctActive.size;
        }

        const conversionRate = totalReferredStudents > 0
            ? Math.round((paidAttributions / totalReferredStudents) * 100 * 10) / 10
            : 0;

        return {
            totalInstitutes,
            activeInstitutes,
            totalCodes,
            activeCodes,
            totalReferredStudents,
            active30DayCount,
            paidAttributions,
            conversionRate,
            topInstitutes: JSON.parse(JSON.stringify(topInstitutes)),
            recentReferrals: JSON.parse(JSON.stringify(recentReferrals)),
        };
    }
);

// ─────────────────────────────────────────────────────────────
// INSTITUTE PERFORMANCE REPORT
// ─────────────────────────────────────────────────────────────

export const getInstitutePerformanceReport = createSafeAction(
    {
        schema: z.object({
            dateFrom: z.string().optional(),
            dateTo: z.string().optional(),
        }),
        roles: [UserRole.ADMIN],
        requireAuth: true,
    },
    async ({ dateFrom, dateTo }) => {
        await connectDB();

        const matchFilter: any = {};
        if (dateFrom || dateTo) {
            matchFilter.attributedAt = {};
            if (dateFrom) matchFilter.attributedAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                matchFilter.attributedAt.$lte = end;
            }
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const institutes = await PartnerInstitute.find().lean();
        const instituteIds = institutes.map((i) => i._id);

        const [referralsAgg, activeCodesAgg] = await Promise.all([
            StudentReferral.aggregate([
                { $match: { ...matchFilter, partnerInstituteId: { $in: instituteIds } } },
                {
                    $group: {
                        _id: "$partnerInstituteId",
                        totalStudents: { $sum: 1 },
                        studentIds: { $push: "$studentId" },
                        paidStudents: {
                            $sum: { $cond: [{ $eq: ["$attributionStatus", "CONVERTED_PAID"] }, 1, 0] },
                        },
                    },
                },
            ]),
            ReferralCode.aggregate([
                { $match: { partnerInstituteId: { $in: instituteIds }, status: "ACTIVE" } },
                { $group: { _id: "$partnerInstituteId", count: { $sum: 1 } } },
            ]),
        ]);

        const refMap = new Map(referralsAgg.map((r) => [r._id.toString(), r]));
        const codeMap = new Map(activeCodesAgg.map((c) => [c._id.toString(), c.count]));

        // Calculate activity per institute
        const rows = await Promise.all(
            institutes.map(async (inst) => {
                const idStr = inst._id.toString();
                const refData = refMap.get(idStr);
                const studentIds = refData?.studentIds || [];
                const totalStudents = refData?.totalStudents || 0;
                const paidStudents = refData?.paidStudents || 0;

                let typingAttempts = 0;
                let stenoAttempts = 0;
                let activeStudents = 0;

                if (studentIds.length > 0) {
                    const [tCount, sCount, recentTyping, recentSteno] = await Promise.all([
                        TypingResult.countDocuments({ userId: { $in: studentIds } }),
                        StenoResult.countDocuments({ userId: { $in: studentIds } }),
                        TypingResult.distinct("userId", { userId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } }),
                        StenoResult.distinct("userId", { userId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } }),
                    ]);

                    typingAttempts = tCount;
                    stenoAttempts = sCount;
                    const distinctActive = new Set([
                        ...recentTyping.map((id) => id.toString()),
                        ...recentSteno.map((id) => id.toString()),
                    ]);
                    activeStudents = distinctActive.size;
                }

                const conversionRate = totalStudents > 0
                    ? Math.round((paidStudents / totalStudents) * 100 * 10) / 10
                    : 0;

                return {
                    instituteId: idStr,
                    instituteName: inst.name,
                    instituteCode: inst.code,
                    status: inst.status,
                    contactPerson: inst.contactPerson,
                    contactEmail: inst.contactEmail,
                    activeCodes: codeMap.get(idStr) || 0,
                    totalRegistrations: totalStudents,
                    activeStudents,
                    typingAttempts,
                    stenoAttempts,
                    paidStudents,
                    conversionRate,
                };
            })
        );

        return JSON.parse(JSON.stringify(rows));
    }
);
