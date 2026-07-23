import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentProfile extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    dateOfBirth: string;
    fatherName: string;
    motherName: string;
    aadharNo: string;
    category: string;
    localAddress: string;
    localPhone: string;
    permanentAddress: string;
    permanentPhone: string;
    course: string;
    photoUrl?: string;
    status: "Pending" | "Approved" | "Rejected";
    email?: string;
    
    // Offline Form Fields
    year?: string;
    mode?: string;
    idNo?: string;
    gender?: string;
    nationality?: string;
    religion?: string;
    abcId?: string;
    guardianPhone?: string;
    whatsappNo?: string;

    createdAt: Date;
    updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        dateOfBirth: { type: String, required: true },
        fatherName: { type: String, required: true },
        motherName: { type: String, required: true },
        aadharNo: { type: String, required: true },
        category: { type: String, required: true },
        localAddress: { type: String, required: true },
        localPhone: { type: String, required: true },
        permanentAddress: { type: String, required: true },
        permanentPhone: { type: String },
        course: { type: String, required: true },
        photoUrl: { type: String, default: "" },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        
        // Offline Form Fields
        year: { type: String },
        mode: { type: String },
        idNo: { type: String },
        gender: { type: String },
        nationality: { type: String },
        religion: { type: String },
        abcId: { type: String },
        guardianPhone: { type: String },
        whatsappNo: { type: String },
    },
    { timestamps: true }
);

const StudentProfile: Model<IStudentProfile> =
    mongoose.models.StudentProfile ||
    mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);

export default StudentProfile;
