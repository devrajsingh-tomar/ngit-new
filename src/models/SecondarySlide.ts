import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISecondarySlide extends Document {
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SecondarySlideSchema = new Schema<ISecondarySlide>(
  {
    title: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SecondarySlide = models.SecondarySlide || model<ISecondarySlide>("SecondarySlide", SecondarySlideSchema);
export default SecondarySlide;
