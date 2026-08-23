import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoErrorRule extends Document {
  ruleName: string;
  description: string;
  examType: "SSC" | "HighCourt" | "UPSSSC" | "General";
  fullErrorPenalty: number; // e.g. 1 mistake per omitted/wrong word
  halfErrorPenalty: number; // e.g. 0.5 mistake per spelling/punctuation/capitalization
  maxAllowedErrorPercent: number; // e.g. 5% or 7%
  createdAt: Date;
  updatedAt: Date;
}

const StenoErrorRuleSchema = new Schema<IStenoErrorRule>(
  {
    ruleName: { type: String, required: true },
    description: { type: String, default: "" },
    examType: { type: String, enum: ["SSC", "HighCourt", "UPSSSC", "General"], default: "General" },
    fullErrorPenalty: { type: Number, default: 1.0 },
    halfErrorPenalty: { type: Number, default: 0.5 },
    maxAllowedErrorPercent: { type: Number, default: 5.0 },
  },
  { timestamps: true }
);

const StenoErrorRule: Model<IStenoErrorRule> =
  mongoose.models.StenoErrorRule || mongoose.model<IStenoErrorRule>("StenoErrorRule", StenoErrorRuleSchema);

export default StenoErrorRule;
