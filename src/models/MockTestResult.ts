import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMockTestResult extends Document {
    studentId: mongoose.Types.ObjectId;
    mockTestId: mongoose.Types.ObjectId;
    attemptId: mongoose.Types.ObjectId;
    score: number;
    totalMarks: number;
    rank: number;
    percentile: number;
    attemptDate: Date;
    batch?: string;
    course?: string;
    publishStatus: "PENDING" | "PUBLISHED" | "UNPUBLISHED";
    publicVisibility: boolean;
    analysis: {
        correctAnswers: number;
        incorrectAnswers: number;
        unattemptedQuestions: number;
        accuracy: number;
        timeTaken: number; // in seconds
    };
    createdAt: Date;
    updatedAt: Date;
}

const MockTestResultSchema = new Schema<IMockTestResult>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mockTestId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        attemptId: { type: Schema.Types.ObjectId, ref: "Attempt", required: true },
        score: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
        rank: { type: Number },
        percentile: { type: Number },
        attemptDate: { type: Date, required: true },
        batch: { type: String },
        course: { type: String },
        publishStatus: {
            type: String,
            enum: ["PENDING", "PUBLISHED", "UNPUBLISHED"],
            default: "PENDING",
        },
        publicVisibility: { type: Boolean, default: false },
        analysis: {
            correctAnswers: { type: Number, default: 0 },
            incorrectAnswers: { type: Number, default: 0 },
            unattemptedQuestions: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
            timeTaken: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

// Add indexes for optimized lookups and leaderboard generation
MockTestResultSchema.index({ studentId: 1, attemptDate: -1 });
MockTestResultSchema.index({ mockTestId: 1, score: -1 });
MockTestResultSchema.index({ publishStatus: 1, attemptDate: -1 });

const MockTestResult: Model<IMockTestResult> = mongoose.models.MockTestResult || mongoose.model<IMockTestResult>("MockTestResult", MockTestResultSchema);

export default MockTestResult;
