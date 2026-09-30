import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStenoSetting extends Document {
  key: string;
  freeTrialDays: number;
  isTrialEnabled: boolean;
  isSubscriptionMandatory: boolean;
  trialBannerText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StenoSettingSchema = new Schema<IStenoSetting>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    freeTrialDays: { type: Number, default: 7 },
    isTrialEnabled: { type: Boolean, default: true },
    isSubscriptionMandatory: { type: Boolean, default: true },
    trialBannerText: {
      type: String,
      default: "नए छात्रों के लिए 7 दिन का फ़्री ट्रायल सक्रिय है!",
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.StenoSetting) {
  delete (mongoose.models as any).StenoSetting;
}

const StenoSetting: Model<IStenoSetting> =
  mongoose.models.StenoSetting ||
  mongoose.model<IStenoSetting>("StenoSetting", StenoSettingSchema);

export default StenoSetting;
