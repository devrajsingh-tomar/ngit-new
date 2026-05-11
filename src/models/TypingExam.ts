import mongoose, { Schema, model, models, connection } from "mongoose";

export interface ITypingExam {
  title: string;
  category: string; // SSC, UP Police, KVS, etc.
  language: "English" | "Hindi" | "Unicode Hindi" | "Krutidev Hindi";
  passageId: mongoose.Types.ObjectId;
  duration: number; // in minutes
  wordLimit: number;
  backspaceMode: "full" | "word" | "disabled";
  highlightMode: "word" | "word_error" | "letter" | "none";
  autoScroll: boolean;
  showScrollbar: boolean;
  examMode: "SSC" | "CPCT" | "Court" | "General" | "UPSSSC" | "AHC" | "UP_POLICE";
  bookId?: mongoose.Types.ObjectId;
  govExamId?: mongoose.Types.ObjectId; // References GovExam
  rulePresetId?: mongoose.Types.ObjectId; // References TypingRulePreset
  difficulty?: "Easy" | "Medium" | "Hard";
  sourcePosition?: "top" | "left" | "right" | "bottom";
  typingEngineType?: "classic" | "modern";
  startTime: Date;
  endTime: Date;
  status: "Draft" | "Active" | "Expired";
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TypingExamSchema = new Schema<ITypingExam>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    language: { type: String, enum: ["English", "Hindi", "Unicode Hindi", "Krutidev Hindi"], default: "Unicode Hindi" },
    passageId: { type: Schema.Types.ObjectId, ref: "TypingPassage", required: true },
    duration: { type: Number, required: true },
    wordLimit: { type: Number, default: 0 },
    backspaceMode: { type: String, enum: ["full", "word", "disabled"], default: "full" },
    highlightMode: { type: String, enum: ["word", "word_error", "letter", "none"], default: "word" },
    autoScroll: { type: Boolean, default: true },
    showScrollbar: { type: Boolean, default: true },
    examMode: { type: String, enum: ["SSC", "CPCT", "Court", "General", "Steno", "UPSSSC", "AHC", "UP_POLICE"], default: "General" },
    bookId: { type: Schema.Types.ObjectId, ref: "TypingBook" },
    govExamId: { type: Schema.Types.ObjectId, ref: "GovExam" },
    rulePresetId: { type: Schema.Types.ObjectId, ref: "TypingRulePreset" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    sourcePosition: { type: String, enum: ["top", "left", "right", "bottom"], default: "top" },
    typingEngineType: { type: String, enum: ["classic", "modern"], default: "classic" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["Draft", "Active", "Expired"], default: "Draft" },
    rules: [{ type: String }],
  },
  { timestamps: true }
);

// Force schema re-registration in dev to pick up schema changes (e.g. bookId added)
if (process.env.NODE_ENV !== "production" && models.TypingExam) {
  delete (models as any).TypingExam;
}
const TypingExam = models.TypingExam || model("TypingExam", TypingExamSchema);
export default TypingExam;
