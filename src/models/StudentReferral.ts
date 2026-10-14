import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IStudentReferral extends Document {
    studentId: mongoose.Types.ObjectId;
    partnerInstituteId: mongoose.Types.ObjectId;
    referralCodeId: mongoose.Types.ObjectId;
    codeUsed: string;
    attributedAt: Date;
    attributionSource: "URL_LINK" | "MANUAL_ENTRY" | "QR_CODE" | "SYSTEM";
    attributionStatus: "ATTRIBUTED" | "CONVERTED_PAID" | "FLAGGED";
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StudentReferralSchema = new Schema<IStudentReferral>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // Enforce one primary referral attribution per student
            index: true,
        },
        partnerInstituteId: {
            type: Schema.Types.ObjectId,
            ref: "PartnerInstitute",
            required: true,
            index: true,
        },
        referralCodeId: {
            type: Schema.Types.ObjectId,
            ref: "ReferralCode",
            required: true,
            index: true,
        },
        codeUsed: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        attributedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        attributionSource: {
            type: String,
            enum: ["URL_LINK", "MANUAL_ENTRY", "QR_CODE", "SYSTEM"],
            default: "URL_LINK",
        },
        attributionStatus: {
            type: String,
            enum: ["ATTRIBUTED", "CONVERTED_PAID", "FLAGGED"],
            default: "ATTRIBUTED",
            index: true,
        },
        ipAddress: { type: String },
        userAgent: { type: String },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

StudentReferralSchema.index({ partnerInstituteId: 1, attributedAt: -1 });

if (process.env.NODE_ENV !== "production" && models.StudentReferral) {
    delete (models as any).StudentReferral;
}

const StudentReferral: Model<IStudentReferral> =
    models.StudentReferral || model<IStudentReferral>("StudentReferral", StudentReferralSchema);

export default StudentReferral;
