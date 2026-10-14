import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IPartnerInstitute extends Document {
    name: string;
    code: string;
    slug: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    city?: string;
    state?: string;
    address?: string;
    status: "ACTIVE" | "PAUSED" | "INACTIVE";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PartnerInstituteSchema = new Schema<IPartnerInstitute>(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        contactPerson: { type: String, required: true, trim: true },
        contactEmail: { type: String, required: true, lowercase: true, trim: true },
        contactPhone: { type: String, required: true, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        address: { type: String, trim: true },
        status: {
            type: String,
            enum: ["ACTIVE", "PAUSED", "INACTIVE"],
            default: "ACTIVE",
            index: true,
        },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && models.PartnerInstitute) {
    delete (models as any).PartnerInstitute;
}

const PartnerInstitute: Model<IPartnerInstitute> =
    models.PartnerInstitute || model<IPartnerInstitute>("PartnerInstitute", PartnerInstituteSchema);

export default PartnerInstitute;
