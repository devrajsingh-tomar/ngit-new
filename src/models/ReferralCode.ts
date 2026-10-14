import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IReferralCode extends Document {
    code: string;
    partnerInstituteId: mongoose.Types.ObjectId;
    status: "ACTIVE" | "PAUSED" | "EXPIRED" | "DISABLED";
    startsAt?: Date;
    expiresAt?: Date;
    usageLimit?: number; // 0 or undefined for unlimited
    usageCount: number;
    discountPercent?: number; // Optional 0-100
    discountAmount?: number; // Optional fixed amount in INR
    description?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ReferralCodeSchema = new Schema<IReferralCode>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        partnerInstituteId: {
            type: Schema.Types.ObjectId,
            ref: "PartnerInstitute",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "PAUSED", "EXPIRED", "DISABLED"],
            default: "ACTIVE",
            index: true,
        },
        startsAt: { type: Date },
        expiresAt: { type: Date },
        usageLimit: { type: Number, default: 0 },
        usageCount: { type: Number, default: 0 },
        discountPercent: { type: Number, min: 0, max: 100 },
        discountAmount: { type: Number, min: 0 },
        description: { type: String, default: "" },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Compound index for active validity lookups
ReferralCodeSchema.index({ code: 1, status: 1 });

if (process.env.NODE_ENV !== "production" && models.ReferralCode) {
    delete (models as any).ReferralCode;
}

const ReferralCode: Model<IReferralCode> =
    models.ReferralCode || model<IReferralCode>("ReferralCode", ReferralCodeSchema);

export default ReferralCode;
