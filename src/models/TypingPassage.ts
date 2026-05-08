import mongoose, { Schema, model, models } from "mongoose";

export interface ITypingPassage {
  title: string;
  content: string;
  language: "English" | "Hindi" | "Unicode Hindi" | "Krutidev Hindi";
  wordCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  bookId?: mongoose.Types.ObjectId;
  section: "Government" | "Special" | "Book";
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TypingPassageSchema = new Schema<ITypingPassage>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    language: { type: String, enum: ["English", "Hindi", "Unicode Hindi", "Krutidev Hindi"], default: "English" },
    wordCount: { type: Number, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    bookId: { type: Schema.Types.ObjectId, ref: "TypingBook" },
    section: { type: String, enum: ["Government", "Special", "Book"], default: "Government" },
    duration: { type: Number, default: 10 },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && models.TypingPassage) {
  delete (models as any).TypingPassage;
}
const TypingPassage = models.TypingPassage || model<ITypingPassage>("TypingPassage", TypingPassageSchema);
export default TypingPassage;
