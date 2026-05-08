import mongoose, { Schema, model, models } from "mongoose";

export interface ITypingResult {
  userId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  wpm: number;
  rawWpm: number;
  grossWpm?: number;
  netWpm?: number;
  accuracy: number;
  errorCount: number;
  wrongWords?: number;
  keystrokes?: number;
  totalCharacters: number;
  timeTaken: number; // in seconds
  submittedText: string;
  backspaces?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TypingResultSchema = new Schema<ITypingResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    examId: { type: Schema.Types.ObjectId, ref: "TypingExam", required: true },
    wpm: { type: Number, required: true },
    rawWpm: { type: Number, required: true },
    grossWpm: { type: Number },
    netWpm: { type: Number },
    accuracy: { type: Number, required: true },
    errorCount: { type: Number, required: true },
    wrongWords: { type: Number },
    keystrokes: { type: Number },
    totalCharacters: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    submittedText: { type: String, required: true },
    backspaces: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Add indexes for common queries
TypingResultSchema.index({ userId: 1, createdAt: -1 });
TypingResultSchema.index({ examId: 1, createdAt: -1 });

const TypingResult = models.TypingResult || model("TypingResult", TypingResultSchema);
export default TypingResult;
