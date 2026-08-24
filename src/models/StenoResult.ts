import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoResult extends Document {
  userId: mongoose.Types.ObjectId;
  passageId?: mongoose.Types.ObjectId;
  examId?: mongoose.Types.ObjectId;
  passageTitle?: string;
  examTitle?: string;
  language?: string;
  originalText?: string;
  typedTranscription: string;
  originalWordCount: number;
  typedWordCount: number;
  grossWpm: number;
  netWpm: number;
  speedWpm: number;
  accuracy: number;
  score: number;
  targetWpm: number;
  totalMistakes: number;
  totalErrors: number;
  totalPenalty: number;
  status: "Passed" | "Failed" | "Evaluated";
  timeSpentSeconds: number;
  fontUsed?: string;
  mistakeBreakdown?: {
    spelling: number;
    missing: number;
    added: number;
    matra: number;
    punctuation: number;
  };
  frozenWeights?: {
    spellingWeight: string;
    matraWeight: string;
    punctuationWeight: string;
    addedWordWeight: string;
    missingWordWeight: string;
  };
  wordBreakdown?: Array<{
    original: string;
    typed: string;
    type: string;
    category?: string;
  }>;
  errorLog?: Array<{
    index: number;
    errorType: string;
    typedWord: string;
    originalWord: string;
    category: string;
    weight: string;
    penalty: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StenoResultSchema = new Schema<IStenoResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    passageId: { type: Schema.Types.ObjectId, ref: "StenoPassage" },
    examId: { type: Schema.Types.ObjectId, ref: "StenoExam" },
    passageTitle: { type: String, default: "" },
    examTitle: { type: String, default: "" },
    language: { type: String, default: "Hindi" },
    originalText: { type: String, default: "" },
    typedTranscription: { type: String, default: "" },
    originalWordCount: { type: Number, default: 0 },
    typedWordCount: { type: Number, default: 0 },
    grossWpm: { type: Number, default: 0 },
    netWpm: { type: Number, default: 0 },
    speedWpm: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    targetWpm: { type: Number, default: 80 },
    totalMistakes: { type: Number, default: 0 },
    totalErrors: { type: Number, default: 0 },
    totalPenalty: { type: Number, default: 0 },
    status: { type: String, enum: ["Passed", "Failed", "Evaluated"], default: "Evaluated" },
    timeSpentSeconds: { type: Number, default: 0 },
    fontUsed: { type: String, default: "System Default" },
    mistakeBreakdown: {
      spelling: { type: Number, default: 0 },
      missing: { type: Number, default: 0 },
      added: { type: Number, default: 0 },
      matra: { type: Number, default: 0 },
      punctuation: { type: Number, default: 0 },
    },
    frozenWeights: {
      spellingWeight: { type: String, default: "full" },
      matraWeight: { type: String, default: "half" },
      punctuationWeight: { type: String, default: "half" },
      addedWordWeight: { type: String, default: "full" },
      missingWordWeight: { type: String, default: "full" },
    },
    wordBreakdown: [
      {
        original: { type: String },
        typed: { type: String },
        type: { type: String },
        category: { type: String },
      },
    ],
    errorLog: [
      {
        index: { type: Number },
        errorType: { type: String },
        typedWord: { type: String },
        originalWord: { type: String },
        category: { type: String },
        weight: { type: String },
        penalty: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const StenoResult: Model<IStenoResult> =
  mongoose.models.StenoResult || mongoose.model<IStenoResult>("StenoResult", StenoResultSchema);

export default StenoResult;
