import mongoose, { Schema, Document, Model } from "mongoose";

export enum AttemptStatus {
    IN_PROGRESS = "IN_PROGRESS",
    SUBMITTED = "SUBMITTED",
    EVALUATED = "EVALUATED",
}

export interface IAttempt extends Document {
    studentId: mongoose.Types.ObjectId;
    quizId: mongoose.Types.ObjectId;
    status: AttemptStatus;
    startTime: Date;
    endTime?: Date;
    totalScore: number;
    totalMarks: number;
    isPassed?: boolean;
    securityLogs: {
        ipAddress?: string;
        deviceInfo?: string;
        tabSwitchCount: number;
        violations: { reason: string; timestamp: Date }[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        status: {
            type: String,
            enum: Object.values(AttemptStatus),
            default: AttemptStatus.IN_PROGRESS,
        },
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        totalScore: { type: Number, default: 0 },
        totalMarks: { type: Number, required: true },
        isPassed: { type: Boolean },
        securityLogs: {
            ipAddress: { type: String },
            deviceInfo: { type: String },
            tabSwitchCount: { type: Number, default: 0 },
            violations: [
                {
                    reason: { type: String },
                    timestamp: { type: Date },
                },
            ],
        },
    },
    { timestamps: true }
);

// Add indexes for common queries
AttemptSchema.index({ studentId: 1, createdAt: -1 });
AttemptSchema.index({ quizId: 1, createdAt: -1 });

const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>("Attempt", AttemptSchema);

export default Attempt;
