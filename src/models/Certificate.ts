
import mongoose, { Schema, Document, Model } from "mongoose";

export enum CertificateStatus {
    ISSUED = "ISSUED",
    REVOKED = "REVOKED",
}

export interface ICertificate extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    customCourseName?: string;
    certificateNumber: string;
    grade: string;
    percentage: number;
    wpm?: number;
    courseDuration: string; // e.g. "6 Months"
    issuedDate: Date;
    status: CertificateStatus;
    qrCodeUrl?: string; // We might not store URL if we generate on fly, but storing is good for cache
    pdfUrl?: string; // For S3 storage in future
    metadata: {
        adminId: mongoose.Types.ObjectId;
        remarks?: string;
        templateId?: string;
    };
}

const CertificateSchema = new Schema<ICertificate>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: false },
        customCourseName: { type: String, required: false },
        certificateNumber: { type: String, required: true, unique: true },
        grade: { type: String, required: true },
        percentage: { type: Number, required: true },
        wpm: { type: Number },
        courseDuration: { type: String, required: true },
        issuedDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: Object.values(CertificateStatus),
            default: CertificateStatus.ISSUED
        },
        qrCodeUrl: { type: String },
        pdfUrl: { type: String },
        metadata: {
            adminId: { type: Schema.Types.ObjectId, ref: "User" },
            remarks: { type: String },
        },
    },
    { timestamps: true }
);

// Prevent duplicate certificates for same student/course unless revoked? 
// Or allow multiple (e.g. re-issue). 
// The unique constraint on certificateNumber automatically creates an index.
CertificateSchema.index({ studentId: 1, courseId: 1 });

const Certificate: Model<ICertificate> =
    mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
