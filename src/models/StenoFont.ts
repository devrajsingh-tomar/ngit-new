import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoFont extends Document {
  name: string;
  cssFamily: string;
  sampleText?: string;
  isSystemFont: boolean;
  category: "Hindi" | "English" | "Shorthand Outline";
  createdAt: Date;
  updatedAt: Date;
}

const StenoFontSchema = new Schema<IStenoFont>(
  {
    name: { type: String, required: true },
    cssFamily: { type: String, required: true },
    sampleText: { type: String, default: "अभ्यास ही सफलता की कुंजी है।" },
    isSystemFont: { type: Boolean, default: true },
    category: { type: String, enum: ["Hindi", "English", "Shorthand Outline"], default: "Hindi" },
  },
  { timestamps: true }
);

const StenoFont: Model<IStenoFont> =
  mongoose.models.StenoFont || mongoose.model<IStenoFont>("StenoFont", StenoFontSchema);

export default StenoFont;
