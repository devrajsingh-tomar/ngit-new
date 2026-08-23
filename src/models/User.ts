import mongoose, { Schema, Document, Model } from "mongoose";

export enum UserRole {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
    STENO_ADMIN = "STENO_ADMIN",
    TYPING_ADMIN = "TYPING_ADMIN",
    CONTENT_MANAGER = "CONTENT_MANAGER",
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    mobile?: string;
    image?: string;
    bio?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        mobile: { type: String, required: false },
        image: { type: String },
        bio: { type: String, default: "" },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.STUDENT,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
