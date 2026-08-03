import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITypingExamAccess extends Document {
    userId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    createdAt: Date;
    updatedAt: Date;
}

const TypingExamAccessSchema = new Schema<ITypingExamAccess>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        examId: { type: Schema.Types.ObjectId, ref: "TypingExam", required: true },
        amount: { type: Number, required: true },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING",
        },
    },
    { timestamps: true }
);

// Force schema re-registration in dev to pick up schema changes
if (process.env.NODE_ENV !== "production" && mongoose.models.TypingExamAccess) {
    delete (mongoose.models as any).TypingExamAccess;
}

const TypingExamAccess: Model<ITypingExamAccess> = mongoose.models.TypingExamAccess || mongoose.model<ITypingExamAccess>("TypingExamAccess", TypingExamAccessSchema);

export default TypingExamAccess;
