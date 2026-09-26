import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IStenoDoubtVideo extends Document {
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StenoDoubtVideoSchema = new Schema<IStenoDoubtVideo>(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StenoDoubtVideo =
  models.StenoDoubtVideo ||
  model<IStenoDoubtVideo>("StenoDoubtVideo", StenoDoubtVideoSchema);

export default StenoDoubtVideo;
