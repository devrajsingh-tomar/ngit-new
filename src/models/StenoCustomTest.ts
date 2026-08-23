import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoCustomTest extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  language: "Hindi" | "English";
  hindiFont: string;
  category: string;
  durationMinutes: number;
  targetWpm: number;
  passageId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StenoCustomTestSchema = new Schema<IStenoCustomTest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    language: { type: String, enum: ["Hindi", "English"], default: "Hindi" },
    hindiFont: { type: String, default: "Kruti Dev 010" },
    category: { type: String, default: "Custom Practice" },
    durationMinutes: { type: Number, default: 10 },
    targetWpm: { type: Number, default: 80 },
    passageId: { type: Schema.Types.ObjectId, ref: "StenoPassage", required: true },
  },
  { timestamps: true }
);

const StenoCustomTest: Model<IStenoCustomTest> =
  mongoose.models.StenoCustomTest || mongoose.model<IStenoCustomTest>("StenoCustomTest", StenoCustomTestSchema);

export default StenoCustomTest;
