import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITypingSubscription extends Document {
    userId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: "PENDING" | "ACTIVE" | "EXPIRED";
    planType: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY"; // 1, 3, or 6 months
    paymentType: "ONLINE" | "MANUAL";
    amount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TypingSubscriptionSchema = new Schema<ITypingSubscription>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: { type: String, enum: ["PENDING", "ACTIVE", "EXPIRED"], default: "PENDING" },
        planType: { type: String, enum: ["MONTHLY", "QUARTERLY", "HALF_YEARLY"], required: true },
        paymentType: { type: String, enum: ["ONLINE", "MANUAL"], required: true },
        amount: { type: Number, required: true },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
    },
    { timestamps: true }
);

// Force schema re-registration in dev to pick up schema changes
if (process.env.NODE_ENV !== "production" && mongoose.models.TypingSubscription) {
    delete (mongoose.models as any).TypingSubscription;
}

const TypingSubscription: Model<ITypingSubscription> =
    mongoose.models.TypingSubscription || mongoose.model<ITypingSubscription>("TypingSubscription", TypingSubscriptionSchema);

export default TypingSubscription;
