import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoExam extends Document {
  name: string;
  language: "Hindi" | "English";
  dictationDurationMinutes: number;
  transcriptionDurationMinutes: number;
  targetWpm: number;
  backspaceMode: "full" | "word" | "disabled" | "upssssc";
  spellingErrorWeight: number;
  matraErrorWeight: number;
  punctuationErrorWeight: number;
  addedWordWeight: number;
  skippedWordWeight: number;
  allowedFonts: string[];
  isActive: boolean;
  passageId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StenoExamSchema = new Schema<IStenoExam>(
  {
    name: { type: String, required: true },
    language: { type: String, enum: ["Hindi", "English"], default: "Hindi" },
    dictationDurationMinutes: { type: Number, default: 5 },
    transcriptionDurationMinutes: { type: Number, default: 45 },
    targetWpm: { type: Number, default: 80 },
    backspaceMode: { type: String, enum: ["full", "word", "disabled", "upssssc"], default: "full" },
    spellingErrorWeight: { type: Number, default: 1.0 },
    matraErrorWeight: { type: Number, default: 0.5 },
    punctuationErrorWeight: { type: Number, default: 0.5 },
    addedWordWeight: { type: Number, default: 1.0 },
    skippedWordWeight: { type: Number, default: 1.0 },
    allowedFonts: { type: [String], default: ["Kruti Dev 010", "Mangal", "Arial"] },
    isActive: { type: Boolean, default: true },
    passageId: { type: Schema.Types.ObjectId, ref: "StenoPassage" },
  },
  { timestamps: true }
);

const StenoExam: Model<IStenoExam> =
  mongoose.models.StenoExam || mongoose.model<IStenoExam>("StenoExam", StenoExamSchema);

export default StenoExam;
