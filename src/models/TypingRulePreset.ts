import mongoose, { Schema, model, models } from "mongoose";

export interface ITypingRulePreset {
  name: string;
  govExamId?: mongoose.Types.ObjectId; // References GovExam
  
  // Backspace Rules
  backspaceMode: "full" | "word" | "disabled" | "upssssc";
  
  // Highlight Rules
  highlightMode: "word" | "word_error" | "letter" | "none";
  
  // Scrollbar Rules
  autoScroll: boolean;
  showScrollbar: boolean;
  scrollMode: "auto" | "manual";
  
  // Paragraph Rules
  wordLimit: number; // 0 for unlimited
  paragraphLock: boolean;
  fixedFormatting: boolean;
  
  // Word Processing Rules
  allowTabs: boolean;
  allowParagraphs: boolean;
  examMode: "General" | "SSC" | "CPCT" | "Court" | "Steno" | "UPSSSC" | "AHC" | "UP_POLICE";
  
  // Timer Rules
  autoStart: boolean;
  pauseOnIdle: boolean;
  hardStop: boolean;
  autoSubmit: boolean;
  
  // Exam Restrictions
  disableCopyPaste: boolean;
  disableRightClick: boolean;
  fullscreenMode: boolean;
  blurDetection: boolean;
  keyboardRestriction: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const TypingRulePresetSchema = new Schema<ITypingRulePreset>(
  {
    name: { type: String, required: true, unique: true },
    govExamId: { type: Schema.Types.ObjectId, ref: "GovExam" },
    
    backspaceMode: { type: String, enum: ["full", "word", "disabled", "upssssc"], default: "full" },
    highlightMode: { type: String, enum: ["word", "word_error", "letter", "none"], default: "word" },
    
    autoScroll: { type: Boolean, default: true },
    showScrollbar: { type: Boolean, default: true },
    scrollMode: { type: String, enum: ["auto", "manual"], default: "auto" },
    
    wordLimit: { type: Number, default: 0 },
    paragraphLock: { type: Boolean, default: false },
    fixedFormatting: { type: Boolean, default: false },
    
    allowTabs: { type: Boolean, default: false },
    allowParagraphs: { type: Boolean, default: false },
    examMode: { type: String, enum: ["General", "SSC", "CPCT", "Court", "Steno", "UPSSSC", "AHC", "UP_POLICE"], default: "General" },
    
    autoStart: { type: Boolean, default: false },
    pauseOnIdle: { type: Boolean, default: false },
    hardStop: { type: Boolean, default: true },
    autoSubmit: { type: Boolean, default: true },
    
    disableCopyPaste: { type: Boolean, default: true },
    disableRightClick: { type: Boolean, default: true },
    fullscreenMode: { type: Boolean, default: false },
    blurDetection: { type: Boolean, default: false },
    keyboardRestriction: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && models.TypingRulePreset) {
  delete (models as any).TypingRulePreset;
}
const TypingRulePreset = models.TypingRulePreset || model("TypingRulePreset", TypingRulePresetSchema);
export default TypingRulePreset;
