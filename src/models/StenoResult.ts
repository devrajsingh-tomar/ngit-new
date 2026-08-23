import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoResult extends Document {
  userId: mongoose.Types.ObjectId;
  passageId?: mongoose.Types.ObjectId;
  examId?: mongoose.Types.ObjectId;
  typedTranscription: string;
  grossWpm: number;
  netWpm: number;
  speedWpm: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  wrongWords: number;
  addedWords: number;
  skippedWords: number;
  spellingErrors: number;
  matraErrors: number;
  punctuationErrors: number;
  totalErrors: number;
  errorPercentage: number;
  score: number;
  targetWpm: number;
  status: "Passed" | "Failed" | "Evaluated";
  timeSpentSeconds: number;
  fontUsed?: string;
  wordBreakdown?: Array<{ original: string; typed: string; type: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const StenoResultSchema = new Schema<IStenoResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    passageId: { type: Schema.Types.ObjectId, ref: "StenoPassage" },
    examId: { type: Schema.Types.ObjectId, ref: "StenoExam" },
    typedTranscription: { type: String, default: "" },
    grossWpm: { type: Number, default: 0 },
    netWpm: { type: Number, default: 0 },
    speedWpm: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    correctWords: { type: Number, default: 0 },
    wrongWords: { type: Number, default: 0 },
    addedWords: { type: Number, default: 0 },
    skippedWords: { type: Number, default: 0 },
    spellingErrors: { type: Number, default: 0 },
    matraErrors: { type: Number, default: 0 },
    punctuationErrors: { type: Number, default: 0 },
    totalErrors: { type: Number, default: 0 },
    errorPercentage: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    targetWpm: { type: Number, default: 80 },
    status: { type: String, enum: ["Passed", "Failed", "Evaluated"], default: "Evaluated" },
    timeSpentSeconds: { type: Number, default: 0 },
    fontUsed: { type: String, default: "System Default" },
    wordBreakdown: [
      {
        original: { type: String },
        typed: { type: String },
        type: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const StenoResult: Model<IStenoResult> =
  mongoose.models.StenoResult || mongoose.model<IStenoResult>("StenoResult", StenoResultSchema);

export default StenoResult;
