import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/lib/role-routing";

export { UserRole };

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    mobile?: string;
    image?: string;
    bio?: string;
    role: UserRole;
    instituteCode?: string;
    isActive: boolean;
    resetToken?: string;
    resetTokenExpiry?: Date;
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
        instituteCode: { type: String, index: true },
        isActive: { type: Boolean, default: true },
        resetToken: { type: String, default: null },
        resetTokenExpiry: { type: Date, default: null },
    },
    { timestamps: true }
);

const User: Model<IUser> = (mongoose.models && mongoose.models.User) || mongoose.model<IUser>("User", UserSchema);

export default User;
