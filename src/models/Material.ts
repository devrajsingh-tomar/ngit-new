import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterial extends Document {
    title: string;
    course?: string;
    type: "PDF" | "VIDEO" | "LINK";
    url: string;
    size?: string;
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
    {
        title: { type: String, required: true },
        course: { type: String, default: "General" },
        type: {
            type: String,
            enum: ["PDF", "VIDEO", "LINK"],
            default: "PDF",
        },
        url: { type: String, required: true },
        size: { type: String }, // e.g. "2.5 MB" - Manual input for now
        downloads: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Material: Model<IMaterial> = mongoose.models.Material || mongoose.model<IMaterial>("Material", MaterialSchema);
export default Material;
