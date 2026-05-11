import mongoose, { Schema, model, models } from "mongoose";

export interface IGovExam {
  title: string;
  slug: string;
  logo: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GovExamSchema = new Schema<IGovExam>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && models.GovExam) {
  delete (models as any).GovExam;
}
const GovExam = models.GovExam || model("GovExam", GovExamSchema);
export default GovExam;
