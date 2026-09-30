import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  planCode: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  paymentType: "ONLINE" | "MANUAL" | "TRIAL";
  amount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StenoSubscriptionSchema = new Schema<IStenoSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "StenoSubscriptionPlan" },
    planCode: { type: String, required: true },
    planName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "PENDING"],
      default: "PENDING",
      index: true,
    },
    paymentType: {
      type: String,
      enum: ["ONLINE", "MANUAL", "TRIAL"],
      default: "ONLINE",
    },
    amount: { type: Number, required: true, default: 0 },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.StenoSubscription) {
  delete (mongoose.models as any).StenoSubscription;
}

const StenoSubscription: Model<IStenoSubscription> =
  mongoose.models.StenoSubscription ||
  mongoose.model<IStenoSubscription>("StenoSubscription", StenoSubscriptionSchema);

export default StenoSubscription;
