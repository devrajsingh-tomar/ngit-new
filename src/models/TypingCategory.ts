import mongoose, { Schema, model, models } from "mongoose";

export interface ITypingCategory {
  name: string;
  description?: string;
  slug: string;
  parentCategoryId?: mongoose.Types.ObjectId; // References parent TypingCategory
  createdAt: Date;
  updatedAt: Date;
}

const TypingCategorySchema = new Schema<ITypingCategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: "TypingCategory" },
  },
  { timestamps: true }
);

const TypingCategory = models.TypingCategory || model("TypingCategory", TypingCategorySchema);
export default TypingCategory;
