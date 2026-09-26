import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoPassage extends Document {
  title: string;
  language: "Hindi" | "English";
  typingMode?: "unicode_hindi" | "krutidev_010" | "english";
  category: string;
  seriesId?: mongoose.Types.ObjectId;
  examPresetId?: mongoose.Types.ObjectId;
  examType?: string;
  transcriptText: string;
  wordCount: number;
  durationMinutes?: number;
  durationSeconds: number;
  audioUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  availableSpeeds: number[];
  targetWpm: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const StenoPassageSchema = new Schema<IStenoPassage>(
  {
    title: { type: String, required: true },
    language: { type: String, enum: ["Hindi", "English"], default: "Hindi" },
    typingMode: {
      type: String,
      enum: ["unicode_hindi", "krutidev_010", "english"],
      default: "unicode_hindi",
    },

    category: { type: String, default: "General Dictation" },
    seriesId: { type: Schema.Types.ObjectId, ref: "StenoSeries" },
    examPresetId: { type: Schema.Types.ObjectId, ref: "StenoExam" },
    examType: { type: String, default: "SSC Steno" },
    transcriptText: { type: String, required: true },
    wordCount: { type: Number, default: 400 },
    durationMinutes: { type: Number, default: 35 },
    durationSeconds: { type: Number, default: 2100 },
    audioUrl: { type: String, required: true },

    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    availableSpeeds: {
      type: [Number],
      default: [40, 50, 60, 70, 80, 90, 100, 110, 120],
    },
    targetWpm: { type: Number, default: 80 },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StenoPassage: Model<IStenoPassage> =
  mongoose.models.StenoPassage || mongoose.model<IStenoPassage>("StenoPassage", StenoPassageSchema);

export default StenoPassage;
