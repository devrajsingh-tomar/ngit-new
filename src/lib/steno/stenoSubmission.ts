import mongoose from "mongoose";
import connectDB from "@/lib/db";
import StenoPassage from "@/models/StenoPassage";
import StenoSeries from "@/models/StenoSeries";
import StenoBatch from "@/models/StenoBatch";
import StenoExam from "@/models/StenoExam";
import StenoResult from "@/models/StenoResult";
import { evaluateStenoTranscription, ExamRules } from "@/lib/steno/evaluation";

export interface StenoSubmissionInput {
  passageId?: string;
  examId?: string;
  typedTranscription: string;
  timeSpentSeconds: number;
  fontUsed?: string;
  speedWpm?: number;
  accuracy?: number;
  fullErrors?: number;
  halfErrors?: number;
  totalErrors?: number;
  score?: number;
  status?: "Passed" | "Failed" | "Evaluated";
}

export async function processAndSaveStenoResult(
  data: StenoSubmissionInput,
  userId: string
): Promise<{ success: boolean; resultId?: string; error?: string }> {
  try {
    await connectDB();

    if (!userId) {
      return { success: false, error: "Unauthorized: Valid user ID is required" };
    }

    let passageDoc: any = null;
    if (data.passageId && mongoose.Types.ObjectId.isValid(data.passageId)) {
      passageDoc = await StenoPassage.findById(data.passageId).lean();
    }
    if (!passageDoc) {
      passageDoc = await StenoPassage.findOne().lean();
    }

    let examDoc: any = null;
    let examRules: Partial<ExamRules> = {};

    const presetId = data.examId || passageDoc?.examPresetId;
    if (presetId && mongoose.Types.ObjectId.isValid(presetId)) {
      examDoc = await StenoExam.findById(presetId).lean();
    }

    if (!examDoc && passageDoc?.seriesId) {
      const seriesDoc: any = await StenoSeries.findById(passageDoc.seriesId).lean();
      if (seriesDoc?.exam) {
        examDoc = await StenoExam.findOne({ name: seriesDoc.exam }).lean();
      }
      if (!examDoc && seriesDoc?.batch) {
        const batchDoc: any = await StenoBatch.findOne({ name: seriesDoc.batch }).lean();
        if (batchDoc?.examPresetId) {
          examDoc = await StenoExam.findById(batchDoc.examPresetId).lean();
        }
      }
    }

    if (!examDoc) {
      examDoc = await StenoExam.findOne({ isActive: true }).lean();
    }

    if (examDoc) {
      examRules = {
        spellingWeight: examDoc.spellingErrorWeight ?? 1.0,
        matraWeight: examDoc.matraErrorWeight ?? 0.5,
        punctuationWeight: examDoc.punctuationErrorWeight ?? 0.5,
        addedWordWeight: examDoc.addedWordWeight ?? 1.0,
        missingWordWeight: examDoc.skippedWordWeight ?? 1.0,
        spacingTranspositionWeight: examDoc.spacingTranspositionWeight ?? 0.5,
        mistakeExemptionCount: examDoc.mistakeExemptionCount ?? 20,
        ignoreChandrabindu: examDoc.ignoreChandrabindu ?? true,
        maxErrorPercentAllowed: examDoc.maxErrorPercentAllowed ?? 5.0,
      };
    }

    const originalText =
      passageDoc?.transcriptText ||
      passageDoc?.text ||
      "माननीय अध्यक्ष महोदय, मैं इस विधेयक का समर्थन करने के लिए खड़ा हुआ हूँ।";
    const targetWpm = passageDoc?.targetWpm || examDoc?.targetWpm || 80;

    // Authoritative Server-Side Result Evaluation
    const evaluation = evaluateStenoTranscription(
      originalText,
      data.typedTranscription || "",
      data.timeSpentSeconds || 1,
      targetWpm,
      examRules
    );

    const validPassageId =
      data.passageId && mongoose.Types.ObjectId.isValid(data.passageId)
        ? data.passageId
        : passageDoc?._id || null;
    const validExamId =
      data.examId && mongoose.Types.ObjectId.isValid(data.examId)
        ? data.examId
        : examDoc?._id || null;

    const resultDoc = await StenoResult.create({
      userId,
      passageId: validPassageId,
      examId: validExamId,
      passageTitle: passageDoc?.title || "Steno Practice Passage",
      examTitle: examDoc?.name || examDoc?.title || "Standard Practice",
      language: passageDoc?.language || "Hindi",
      originalText,
      typedTranscription: data.typedTranscription || "",
      originalWordCount: evaluation.originalWordCount,
      typedWordCount: evaluation.typedWordCount,
      grossWpm: evaluation.grossWpm,
      netWpm: evaluation.netWpm,
      speedWpm: evaluation.netWpm,
      accuracy: evaluation.accuracy,
      score: evaluation.score,
      targetWpm,
      totalMistakes: evaluation.totalMistakes,
      totalErrors: evaluation.totalMistakes,
      totalPenalty: evaluation.totalPenalty,
      status: evaluation.isPassed ? "Passed" : "Failed",
      timeSpentSeconds: data.timeSpentSeconds || 1,
      fontUsed: data.fontUsed || "Mangal",
      mistakeBreakdown: evaluation.mistakeBreakdown,
      frozenWeights: evaluation.frozenWeights,
      wordBreakdown: evaluation.wordBreakdown,
      errorLog: evaluation.errorLog,
    });

    return { success: true, resultId: resultDoc._id.toString() };
  } catch (err: any) {
    console.error("processAndSaveStenoResult error:", err);
    return { success: false, error: err.message || "Failed to process steno submission" };
  }
}
