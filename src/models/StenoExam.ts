import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoExam extends Document {
  name: string;
  authorityName?: string;
  dictationDurationMinutes: number;
  transcriptionDurationMinutes: number;
  targetWpm: number;
  totalWords: number;
  backspaceMode: "full" | "word" | "disabled" | "upssssc";
  spellingErrorWeight: number;
  matraErrorWeight: number;
  punctuationErrorWeight: number;
  addedWordWeight: number;
  skippedWordWeight: number;
  spacingTranspositionWeight: number;
  mistakeExemptionCount: number;
  ignoreChandrabindu: boolean;
  maxErrorPercentAllowed: number;
  allowedFonts: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StenoExamSchema = new Schema<IStenoExam>(
  {
    name: { type: String, required: true },
    authorityName: { type: String, default: "उ०प्र० अधीनस्थ सेवा चयन आयोग" },
    dictationDurationMinutes: { type: Number, default: 5 },
    transcriptionDurationMinutes: { type: Number, default: 40 },
    targetWpm: { type: Number, default: 80 },
    totalWords: { type: Number, default: 420 },
    backspaceMode: { type: String, enum: ["full", "word", "disabled", "upssssc"], default: "full" },
    spellingErrorWeight: { type: Number, default: 1.0 },
    matraErrorWeight: { type: Number, default: 0.5 },
    punctuationErrorWeight: { type: Number, default: 0.5 },
    addedWordWeight: { type: Number, default: 1.0 },
    skippedWordWeight: { type: Number, default: 1.0 },
    spacingTranspositionWeight: { type: Number, default: 0.5 },
    mistakeExemptionCount: { type: Number, default: 20 },
    ignoreChandrabindu: { type: Boolean, default: true },
    maxErrorPercentAllowed: { type: Number, default: 5.0 },
    allowedFonts: { type: [String], default: ["Kruti Dev 010", "Mangal"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StenoExam: Model<IStenoExam> =
  mongoose.models.StenoExam || mongoose.model<IStenoExam>("StenoExam", StenoExamSchema);

export default StenoExam;
