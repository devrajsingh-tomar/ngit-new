import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ReferralCode from "@/models/ReferralCode";
import PartnerInstitute from "@/models/PartnerInstitute";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code")?.trim().toUpperCase();

        if (!code) {
            return NextResponse.json({ valid: false, error: "No referral code provided" }, { status: 400 });
        }

        await connectDB();

        const referral = await ReferralCode.findOne({ code }).populate("partnerInstituteId");
        if (!referral) {
            return NextResponse.json({ valid: false, error: "Referral code not found or invalid" }, { status: 200 });
        }

        const institute = referral.partnerInstituteId as any;
        if (!institute || institute.status !== "ACTIVE") {
            return NextResponse.json({
                valid: false,
                error: "The associated partner institute is currently paused or inactive",
            }, { status: 200 });
        }

        if (referral.status !== "ACTIVE") {
            const statusMap: Record<string, string> = {
                PAUSED: "This referral code is currently paused by the institute",
                EXPIRED: "This referral code has expired",
                DISABLED: "This referral code has been deactivated",
            };
            return NextResponse.json({
                valid: false,
                error: statusMap[referral.status] || "This referral code is not active",
            }, { status: 200 });
        }

        const now = new Date();
        if (referral.startsAt && new Date(referral.startsAt) > now) {
            return NextResponse.json({
                valid: false,
                error: `This referral campaign will start on ${new Date(referral.startsAt).toLocaleDateString()}`,
            }, { status: 200 });
        }

        if (referral.expiresAt && new Date(referral.expiresAt) < now) {
            return NextResponse.json({
                valid: false,
                error: `This referral code expired on ${new Date(referral.expiresAt).toLocaleDateString()}`,
            }, { status: 200 });
        }

        if (referral.usageLimit && referral.usageLimit > 0 && referral.usageCount >= referral.usageLimit) {
            return NextResponse.json({
                valid: false,
                error: "This referral code has reached its maximum registration limit",
            }, { status: 200 });
        }

        return NextResponse.json({
            valid: true,
            code: referral.code,
            instituteName: institute.name,
            instituteCode: institute.code,
            discountPercent: referral.discountPercent || undefined,
            discountAmount: referral.discountAmount || undefined,
            description: referral.description || undefined,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Referral validation error:", error);
        return NextResponse.json({ valid: false, error: "Failed to validate referral code" }, { status: 500 });
    }
}
