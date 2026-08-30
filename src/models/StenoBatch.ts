import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoBatch extends Document {
  name: string;
  hindiName?: string;
  description?: string;
  thumbnailUrl?: string;
  examPresetId?: mongoose.Types.ObjectId;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const StenoBatchSchema = new Schema<IStenoBatch>(
  {
    name: { type: String, required: true, unique: true },
    hindiName: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    examPresetId: { type: Schema.Types.ObjectId, ref: "StenoExam" },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StenoBatch: Model<IStenoBatch> =
  mongoose.models.StenoBatch || mongoose.model<IStenoBatch>("StenoBatch", StenoBatchSchema);

export default StenoBatch;
