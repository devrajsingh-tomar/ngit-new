import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaperSet extends Document {
    name: string;
    courseIds?: mongoose.Types.ObjectId[];
    examCode?: string;
    subject: string;
    totalQuestions: number;
    totalMarks: number;
    duration: number; // in minutes
    negativeMarking: boolean;
    questions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const PaperSetSchema = new Schema<IPaperSet>(
    {
        name: { type: String, required: true },
        courseIds: [{ type: Schema.Types.ObjectId, ref: "Course" }],
        examCode: { type: String },
        subject: { type: String, required: true },
        totalQuestions: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
        duration: { type: Number, required: true },
        negativeMarking: { type: Boolean, default: true },
        questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    },
    { timestamps: true }
);

const PaperSet: Model<IPaperSet> = mongoose.models.PaperSet || mongoose.model<IPaperSet>("PaperSet", PaperSetSchema);

export default PaperSet;
