import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    price: number;
    isPublished: boolean;
    category: string;
    type: "ONLINE" | "OFFLINE";
    syllabusUrl?: string;
    instructorIds: mongoose.Types.ObjectId[];
    outcomes: string[];
    highlights: string[];
    instructions?: string;
    paperSetIds?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true },
        description: { type: String, required: true },
        thumbnail: { type: String, required: true },
        price: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: false },
        category: { type: String, required: true },
        type: { type: String, enum: ["ONLINE", "OFFLINE"], default: "ONLINE" },
        syllabusUrl: { type: String },
        instructorIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
        outcomes: [{ type: String }],
        highlights: [{ type: String }],
        instructions: { type: String, default: "" },
        paperSetIds: [{ type: Schema.Types.ObjectId, ref: "PaperSet" }],
    },
    { timestamps: true }
);

CourseSchema.index({ slug: 1 }, { unique: true });

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
