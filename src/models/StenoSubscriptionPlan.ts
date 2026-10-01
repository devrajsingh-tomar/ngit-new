import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoSubscriptionPlan extends Document {
  name: string;
  code: string;
  price: number;
  originalPrice?: number;
  durationDays: number;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const StenoSubscriptionPlanSchema = new Schema<IStenoSubscriptionPlan>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    durationDays: { type: Number, required: true, default: 30 },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.StenoSubscriptionPlan) {
  delete (mongoose.models as any).StenoSubscriptionPlan;
}

const StenoSubscriptionPlan: Model<IStenoSubscriptionPlan> =
  mongoose.models.StenoSubscriptionPlan ||
  mongoose.model<IStenoSubscriptionPlan>("StenoSubscriptionPlan", StenoSubscriptionPlanSchema);

export default StenoSubscriptionPlan;
