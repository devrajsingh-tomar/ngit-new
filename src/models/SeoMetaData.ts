import mongoose, { Schema, Document } from "mongoose";

export interface ISeoMetaData extends Document {
  routeSlug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeoMetaDataSchema = new Schema(
  {
    routeSlug: { type: String, required: true, unique: true, trim: true },
    metaTitle: { type: String, required: true, trim: true },
    metaDescription: { type: String, required: true, trim: true },
    focusKeyword: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    canonicalUrl: { type: String, trim: true },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.SeoMetaData ||
  mongoose.model<ISeoMetaData>("SeoMetaData", SeoMetaDataSchema);
