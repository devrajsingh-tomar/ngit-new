import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuiz extends Document {
    title: string;
    logo?: string;
    courseId?: mongoose.Types.ObjectId;
    examCode?: string;
    batchIds?: mongoose.Types.ObjectId[];
    settings: {
        timeLimit: number; // in minutes
        totalMarks: number;
        passingMarks: number;
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
        availableLanguages: string[]; // e.g., ["en", "hi"]
    };
    schedule: {
        startDate: Date;
        endDate: Date;
        gracePeriodMinutes: number;
    };
    security: {
        maxAttempts: number;
        preventTabSwitch: boolean;
        requireFullscreen: boolean;
        trackIpDevice: boolean;
    };
    questions: mongoose.Types.ObjectId[]; // References to Question model
    paperSetId?: mongoose.Types.ObjectId;   // Optional reference to PaperSet
    description?: string;
    pricing: {
        type: "FREE" | "PAID";
        amount: number;
        currency: string;
    };
    instructions: {
        en: string;
        hi?: string;
    };
    isMockTest: boolean;
    isPublished: boolean;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
    {
        title: { type: String, required: true },
        logo: { type: String },
        description: { type: String },
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        examCode: { type: String },
        batchIds: [{ type: Schema.Types.ObjectId, ref: "Batch" }],
        settings: {
            timeLimit: { type: Number, required: true },
            totalMarks: { type: Number, required: true },
            passingMarks: { type: Number, required: true },
            shuffleQuestions: { type: Boolean, default: false },
            shuffleOptions: { type: Boolean, default: false },
            availableLanguages: [{ type: String, default: "en" }],
        },
        schedule: {
            startDate: { type: Date },
            endDate: { type: Date },
            gracePeriodMinutes: { type: Number, default: 0 },
        },
        security: {
            maxAttempts: { type: Number, default: 1 },
            preventTabSwitch: { type: Boolean, default: false },
            requireFullscreen: { type: Boolean, default: false },
            trackIpDevice: { type: Boolean, default: true },
        },
        questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        paperSetId: { type: Schema.Types.ObjectId, ref: "PaperSet" },
        pricing: {
            type: { type: String, enum: ["FREE", "PAID"], default: "FREE" },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: "INR" },
        },
        instructions: {
            en: { type: String },
            hi: { type: String },
        },
        isMockTest: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: false },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
