import mongoose, { Schema, model, models } from "mongoose";

export interface IGovExamCategory {
  govExamId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  active: boolean;

  // Exam Rules
  examMode: "General" | "SSC" | "CPCT" | "Court" | "Steno" | "UPSSSC" | "AHC" | "UP_POLICE";
  duration: number; // in minutes

  // Scoring / Qualifying Rules
  totalMarks: number;       // 0 = marks not applicable (use accuracy instead)
  qualifyingMarks: number;  // e.g. 25 out of 50
  errorPenalty: number;     // marks deducted per error, e.g. 0.1
  minWpm: number;           // minimum net WPM required
  minAccuracy: number;      // minimum accuracy % (used when totalMarks=0)
  allowHalfMistakes: boolean; // false for AHC RO/ARO

  createdAt: Date;
  updatedAt: Date;
}

const GovExamCategorySchema = new Schema<IGovExamCategory>(
  {
    govExamId: { type: Schema.Types.ObjectId, ref: "GovExam", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },

    examMode: {
      type: String,
      enum: ["General", "SSC", "CPCT", "Court", "Steno", "UPSSSC", "AHC", "UP_POLICE"],
      default: "General",
    },
    duration: { type: Number, default: 10 },

    totalMarks: { type: Number, default: 0 },
    qualifyingMarks: { type: Number, default: 0 },
    errorPenalty: { type: Number, default: 0 },
    minWpm: { type: Number, default: 30 },
    minAccuracy: { type: Number, default: 85 },
    allowHalfMistakes: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GovExamCategorySchema.index({ govExamId: 1, slug: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && models.GovExamCategory) {
  delete (models as any).GovExamCategory;
}
const GovExamCategory = models.GovExamCategory || model("GovExamCategory", GovExamCategorySchema);
export default GovExamCategory;
