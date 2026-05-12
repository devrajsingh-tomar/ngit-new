import mongoose, { Schema, Document, Model } from "mongoose";

export enum QuestionType {
    MCQ_SINGLE = "MCQ_SINGLE",
    MCQ_MULTIPLE = "MCQ_MULTIPLE",
    TRUE_FALSE = "TRUE_FALSE",
    NUMERIC = "NUMERIC",
    SHORT_ANSWER = "SHORT_ANSWER",
    DESCRIPTIVE = "DESCRIPTIVE",
    MATCH_THE_FOLLOWING = "MATCH_THE_FOLLOWING",
    ASSERTION_REASON = "ASSERTION_REASON",
    TYPING = "TYPING",
}

export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
}

export interface IQuestion extends Document {
    courseId: mongoose.Types.ObjectId;
    examCode?: string; // M1-R5, M2-R5, M3-R5, M4-R5
    subject: string;
    topic: string;
    type: QuestionType;
    difficulty: Difficulty;
    content: {
        en: string;
        hi?: string;
    };
    options?: {
        _id?: mongoose.Types.ObjectId;
        text: { en: string; hi?: string };
        isCorrect: boolean;
        pair?: { en: string; hi?: string }; // For Match Following
    }[];
    numericAnswer?: number;
    shortAnswer?: string; // For Short Answer
    assertion?: { en: string; hi?: string }; // For Assertion Reason
    reason?: { en: string; hi?: string };    // For Assertion Reason
    marks: number;
    negativeMarks: number;
    explanation?: {
        en: string;
        hi?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        examCode: { 
            type: String
        },
        subject: { type: String },
        topic: { type: String },
        type: {
            type: String,
            enum: Object.values(QuestionType),
            required: true,
        },
        difficulty: {
            type: String,
            enum: Object.values(Difficulty),
            default: Difficulty.MEDIUM,
        },
        content: {
            en: { type: String, required: true },
            hi: { type: String },
        },
        options: [
            {
                text: {
                    en: { type: String },
                    hi: { type: String },
                },
                isCorrect: { type: Boolean, default: false },
                pair: {
                    en: { type: String },
                    hi: { type: String },
                }
            },
        ],
        numericAnswer: { type: Number },
        shortAnswer: { type: String },
        assertion: {
            en: { type: String },
            hi: { type: String },
        },
        reason: {
            en: { type: String },
            hi: { type: String },
        },
        marks: { type: Number, default: 4 },
        negativeMarks: { type: Number, default: 1 },
        explanation: {
            en: { type: String },
            hi: { type: String },
        },
    },
    { timestamps: true }
);

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
