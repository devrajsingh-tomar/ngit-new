import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoSeries extends Document {
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  language: "Hindi" | "English";
  passages: mongoose.Types.ObjectId[];
  isPremium: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const StenoSeriesSchema = new Schema<IStenoSeries>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnailUrl: { type: String },
    category: { type: String, default: "General Series" },
    language: { type: String, enum: ["Hindi", "English"], default: "Hindi" },
    passages: [{ type: Schema.Types.ObjectId, ref: "StenoPassage" }],
    isPremium: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StenoSeries: Model<IStenoSeries> =
  mongoose.models.StenoSeries || mongoose.model<IStenoSeries>("StenoSeries", StenoSeriesSchema);

export default StenoSeries;
