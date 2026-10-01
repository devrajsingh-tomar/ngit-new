import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoErrorRule extends Document {
  ruleName: string;
  authorityName?: string;
  description?: string;
  examType: string;
  spellingErrorWeight: number; // e.g. 1.0 (Full) or 0.5 (Half)
  matraErrorWeight: number; // e.g. 0.5 (Half)
  punctuationErrorWeight: number; // e.g. 0.5 or 0.0
  addedWordWeight: number; // e.g. 1.0
  skippedWordWeight: number; // e.g. 1.0
  spacingTranspositionWeight: number; // e.g. 0.5
  mistakeExemptionCount: number; // e.g. 20 (UPSSSC)
  ignoreChandrabindu: boolean; // true
  maxErrorPercentAllowed: number; // e.g. 5.0%
  backspaceMode: "full" | "word" | "disabled" | "upssssc";
  allowedFonts?: string[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StenoErrorRuleSchema = new Schema<IStenoErrorRule>(
  {
    ruleName: { type: String, required: true },
    authorityName: { type: String, default: "" },
    description: { type: String, default: "" },
    examType: { type: String, default: "General" },
    spellingErrorWeight: { type: Number, default: 1.0 },
    matraErrorWeight: { type: Number, default: 0.5 },
    punctuationErrorWeight: { type: Number, default: 0.5 },
    addedWordWeight: { type: Number, default: 1.0 },
    skippedWordWeight: { type: Number, default: 1.0 },
    spacingTranspositionWeight: { type: Number, default: 0.5 },
    mistakeExemptionCount: { type: Number, default: 20 },
    ignoreChandrabindu: { type: Boolean, default: true },
    maxErrorPercentAllowed: { type: Number, default: 5.0 },
    backspaceMode: { type: String, enum: ["full", "word", "disabled", "upssssc"], default: "full" },
    allowedFonts: { type: [String], default: ["Kruti Dev 010", "Mangal"] },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const StenoErrorRule: Model<IStenoErrorRule> =
  mongoose.models.StenoErrorRule || mongoose.model<IStenoErrorRule>("StenoErrorRule", StenoErrorRuleSchema);

export default StenoErrorRule;
