"use server";

import connectDB from "@/lib/db";
import mongoose from "mongoose";
import StenoPassage from "@/models/StenoPassage";
import StenoSeries from "@/models/StenoSeries";
import StenoBatch from "@/models/StenoBatch";
import StenoExam from "@/models/StenoExam";
import StenoResult from "@/models/StenoResult";
import StenoFont from "@/models/StenoFont";
import StenoErrorRule from "@/models/StenoErrorRule";
import StenoCustomTest from "@/models/StenoCustomTest";
import User, { UserRole } from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isRealPoster } from "@/lib/steno/stenoUtils";
import { evaluateStenoTranscription, ExamRules } from "@/lib/steno/evaluation";
import { processAndSaveStenoResult } from "@/lib/steno/stenoSubmission";

// ── PUBLIC & STUDENT STENO DATA ──

export async function getStenoPassagesAction(query?: any) {
  try {
    await connectDB();
    const filter: any = {};
    if (query?.isPublished !== undefined) {
      filter.isPublished = query.isPublished;
    } else {
      filter.isPublished = true;
    }
    if (query?.language) filter.language = query.language;
    if (query?.category) filter.category = query.category;
    if (query?.targetWpm) filter.targetWpm = Number(query.targetWpm);
    if (query?.seriesId) {
      const seriesCondition = [
        { seriesId: query.seriesId },
        { seriesIds: query.seriesId },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: seriesCondition }];
        delete filter.$or;
      } else {
        filter.$or = seriesCondition;
      }
    }

    if (query?.typingMode) {
      if (query.typingMode === "unicode_hindi") {
        const modeCond = [
          { typingMode: "unicode_hindi" },
          { typingMode: { $exists: false }, language: "Hindi" },
        ];
        if (filter.$and) {
          filter.$and.push({ $or: modeCond });
        } else if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: modeCond }];
          delete filter.$or;
        } else {
          filter.$or = modeCond;
        }
      } else if (query.typingMode === "krutidev_010") {
        filter.typingMode = "krutidev_010";
      } else if (query.typingMode === "english") {
        const modeCond = [
          { typingMode: "english" },
          { language: "English" },
        ];
        if (filter.$and) {
          filter.$and.push({ $or: modeCond });
        } else if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: modeCond }];
          delete filter.$or;
        } else {
          filter.$or = modeCond;
        }
      }
    }

    const passages = await StenoPassage.find(filter)
      .populate("seriesId")
      .populate("seriesIds")
      .sort({ createdAt: -1, _id: -1 })
      .lean();
    return { success: true, passages: JSON.parse(JSON.stringify(passages)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}



export async function getStenoSeriesListAction(query?: any) {
  try {
    await connectDB();

    // Clean up any previously auto-created "सामान्य अभ्यास" series
    await StenoSeries.deleteMany({ title: "सामान्य अभ्यास" });

    const filter: any = {};
    if (query?.isPublished !== undefined) filter.isPublished = query.isPublished;
    if (query?.batch && query.batch !== "all") {
      const escapedBatch = query.batch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { batch: query.batch.trim() },
        { batch: { $regex: new RegExp(`^${escapedBatch}$`, "i") } },
      ];
    }
    if (query?.exam && query.exam !== "all") {
      const escapedExam = query.exam.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const examCondition = [
        { exam: query.exam.trim() },
        { exam: { $regex: new RegExp(`^${escapedExam}$`, "i") } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: examCondition }];
        delete filter.$or;
      } else {
        filter.$or = examCondition;
      }
    } else if (query?.category && query.category !== "all") {
      filter.category = query.category;
    }

    const series = await StenoSeries.find(filter)
      .populate("passages")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();
    return { success: true, series: JSON.parse(JSON.stringify(series)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoSeriesByIdAction(id: string) {
  try {
    await connectDB();
    let seriesItem = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      seriesItem = await StenoSeries.findById(id).populate("passages").lean();
    }
    if (!seriesItem) return { success: false, error: "Series not found" };
    return { success: true, series: JSON.parse(JSON.stringify(seriesItem)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoPassageByIdAction(id: string) {
  try {
    await connectDB();
    let passage: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      try {
        passage = await StenoPassage.findById(id).populate("seriesId").populate("seriesIds").populate("examPresetId").lean();
      } catch {
        passage = await StenoPassage.findById(id).lean();
      }
    }
    if (!passage) return { success: false, error: "Passage not found" };
    return { success: true, passage: JSON.parse(JSON.stringify(passage)) };
  } catch (err: any) {
    console.error("getStenoPassageByIdAction error:", err);
    return { success: false, error: err.message };
  }
}

// ── CUSTOM STENO TEST ACTIONS (STEP 15) ──

export async function createStenoCustomTestAction(data: {
  title: string;
  language: "Hindi" | "English";
  hindiFont: string;
  category: string;
  durationMinutes: number;
  targetWpm: number;
  passageId: string;
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Student login required" };
    }

    const customTest = await StenoCustomTest.create({
      userId: session.user.id,
      title: data.title.trim(),
      language: data.language,
      hindiFont: data.hindiFont,
      category: data.category,
      durationMinutes: Number(data.durationMinutes),
      targetWpm: Number(data.targetWpm),
      passageId: data.passageId,
    });

    revalidatePath("/steno/my-tests");
    return { success: true, test: JSON.parse(JSON.stringify(customTest)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserStenoCustomTestsAction() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const customTests = await StenoCustomTest.find({ userId: session.user.id })
      .populate("passageId")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, customTests: JSON.parse(JSON.stringify(customTests)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoCustomTestByIdAction(id: string) {
  try {
    await connectDB();
    let customTest = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      customTest = await StenoCustomTest.findById(id).populate("passageId").lean();
    }
    if (!customTest) {
      const defaultPassage = await StenoPassage.findOne().lean();
      customTest = {
        _id: id,
        title: `Custom Test (${id})`,
        language: "Hindi",
        hindiFont: "Mangal",
        category: "Practice",
        durationMinutes: 15,
        targetWpm: 80,
        passageId: defaultPassage || null,
      };
    }
    return { success: true, customTest: JSON.parse(JSON.stringify(customTest)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStenoCustomTestAction(id: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await StenoCustomTest.findOneAndDelete({ _id: id, userId: session.user.id });
    revalidatePath("/steno/my-tests");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── ADMIN STENO PASSAGES CRUD (STEP 9) ──

export async function createStenoPassageAction(data: {
  title: string;
  language: "Hindi" | "English";
  typingMode?: "unicode_hindi" | "krutidev_010" | "english";
  category: string;
  seriesId?: string;
  seriesIds?: string[];
  examPresetId?: string;
  examType?: string;
  transcriptText: string;
  wordCount: number;
  durationMinutes?: number;
  durationSeconds?: number;
  audioUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  availableSpeeds: number[];
  targetWpm: number;
  isPublished: boolean;
  sortOrder: number;
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const durationMins = Number(data.durationMinutes || (data.durationSeconds ? Math.round(data.durationSeconds / 60) : 35));
    const durationSecs = Number(data.durationSeconds || durationMins * 60);

    const cleanAudio = (data.audioUrl || "").trim();
    const cleanVideo = (data.videoUrl || "").trim();
    const finalAudio = cleanAudio && cleanAudio !== "0" && cleanAudio !== "#"
      ? cleanAudio
      : (cleanVideo && cleanVideo !== "0" && cleanVideo !== "#" ? cleanVideo : "#");

    let finalSeriesIds: string[] = [];
    if (Array.isArray(data.seriesIds) && data.seriesIds.length > 0) {
      finalSeriesIds = data.seriesIds.filter(Boolean);
    } else if (data.seriesId) {
      finalSeriesIds = [data.seriesId];
    }
    const primarySeriesId = finalSeriesIds[0] || null;

    const passage = await StenoPassage.create({
      ...data,
      audioUrl: finalAudio,
      videoUrl: cleanVideo && cleanVideo !== "0" && cleanVideo !== "#" ? cleanVideo : undefined,
      durationMinutes: durationMins,
      durationSeconds: durationSecs,
      seriesId: primarySeriesId,
      seriesIds: finalSeriesIds,
      examPresetId: data.examPresetId ? data.examPresetId : null,
    });

    if (finalSeriesIds.length > 0) {
      await StenoSeries.updateMany(
        { _id: { $in: finalSeriesIds } },
        { $addToSet: { passages: passage._id } }
      );
    }

    revalidatePath("/admin/steno/passages");
    revalidatePath("/admin/steno/series");
    revalidatePath("/steno/dictation");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/passage/[id]", "page");
    return { success: true, passage: JSON.parse(JSON.stringify(passage)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStenoPassageAction(id: string, data: any) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const payload = { ...data };
    if (payload.durationMinutes !== undefined) {
      payload.durationMinutes = Number(payload.durationMinutes);
      payload.durationSeconds = payload.durationMinutes * 60;
    } else if (payload.durationSeconds !== undefined) {
      payload.durationMinutes = Math.round(Number(payload.durationSeconds) / 60);
    }

    const cleanAudio = (payload.audioUrl || "").trim();
    const cleanVideo = (payload.videoUrl || "").trim();
    if (cleanAudio === "0" || cleanAudio === "#" || !cleanAudio) {
      if (cleanVideo && cleanVideo !== "0" && cleanVideo !== "#") {
        payload.audioUrl = cleanVideo;
      }
    }
    if (cleanVideo === "0" || cleanVideo === "#") {
      payload.videoUrl = undefined;
    }

    let newSeriesIds: string[] = [];
    if (Array.isArray(payload.seriesIds)) {
      newSeriesIds = payload.seriesIds.filter(Boolean);
      payload.seriesId = newSeriesIds[0] || null;
    } else if (payload.seriesId !== undefined) {
      if (payload.seriesId) {
        newSeriesIds = [payload.seriesId];
      } else {
        newSeriesIds = [];
        payload.seriesId = null;
      }
      payload.seriesIds = newSeriesIds;
    }

    if (payload.examPresetId === "" || payload.examPresetId === undefined) {
      payload.examPresetId = null;
    }

    const oldPassage = await StenoPassage.findById(id).lean();
    const updated = await StenoPassage.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean();

    // Sync StenoSeries.passages:
    const oldSeriesIds: string[] = [];
    if (oldPassage) {
      if (Array.isArray(oldPassage.seriesIds) && oldPassage.seriesIds.length > 0) {
        for (const s of oldPassage.seriesIds) {
          if (s) oldSeriesIds.push(String(s._id || s));
        }
      } else if (oldPassage.seriesId) {
        oldSeriesIds.push(String(oldPassage.seriesId._id || oldPassage.seriesId));
      }
    }

    const removedSeriesIds = oldSeriesIds.filter((sId) => !newSeriesIds.includes(sId));
    const addedSeriesIds = newSeriesIds.filter((sId) => !oldSeriesIds.includes(sId));

    if (removedSeriesIds.length > 0) {
      await StenoSeries.updateMany(
        { _id: { $in: removedSeriesIds } },
        { $pull: { passages: id } }
      );
    }
    if (addedSeriesIds.length > 0) {
      await StenoSeries.updateMany(
        { _id: { $in: addedSeriesIds } },
        { $addToSet: { passages: id } }
      );
    }

    revalidatePath("/admin/steno/passages");
    revalidatePath("/admin/steno/series");
    revalidatePath("/steno/dictation");
    revalidatePath("/student/steno/series");
    revalidatePath(`/student/steno/passage/${id}`);
    revalidatePath("/student/steno/passage/[id]", "page");
    return { success: true, passage: JSON.parse(JSON.stringify(updated)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function deleteStenoPassageAction(id: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    await StenoPassage.findByIdAndDelete(id);
    await StenoSeries.updateMany({}, { $pull: { passages: id } });

    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno/dictation");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function bulkAssignStenoPassagesAction(data: {
  passageIds: string[];
  seriesId?: string;
  seriesIds?: string[];
  examPresetId?: string;
  examType?: string;
  category?: string;
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    if (!data.passageIds || !data.passageIds.length) {
      return { success: false, error: "No dictation passages selected" };
    }

    let targetSeriesIds: string[] = [];
    if (Array.isArray(data.seriesIds) && data.seriesIds.length > 0) {
      targetSeriesIds = data.seriesIds.filter(Boolean);
    } else if (data.seriesId) {
      targetSeriesIds = [data.seriesId];
    }

    const updatePayload: any = {};
    if (data.examPresetId) updatePayload.examPresetId = data.examPresetId;
    if (data.examType) updatePayload.examType = data.examType;
    if (data.category) updatePayload.category = data.category;

    if (targetSeriesIds.length === 0 && Object.keys(updatePayload).length === 0) {
      return { success: false, error: "Please select Series Topics, Exam Rules Preset, or Category to assign" };
    }

    if (Object.keys(updatePayload).length > 0) {
      await StenoPassage.updateMany(
        { _id: { $in: data.passageIds } },
        { $set: updatePayload }
      );
    }

    if (targetSeriesIds.length > 0) {
      // Add seriesIds to each passage
      await StenoPassage.updateMany(
        { _id: { $in: data.passageIds } },
        {
          $addToSet: { seriesIds: { $each: targetSeriesIds } },
        }
      );
      // For any passage that doesn't have seriesId set yet, set the first targetSeriesId as primary seriesId
      await StenoPassage.updateMany(
        { _id: { $in: data.passageIds }, $or: [{ seriesId: null }, { seriesId: { $exists: false } }] },
        { $set: { seriesId: targetSeriesIds[0] } }
      );

      // Add these passages to all selected series
      await StenoSeries.updateMany(
        { _id: { $in: targetSeriesIds } },
        { $addToSet: { passages: { $each: data.passageIds } } }
      );
    }

    revalidatePath("/admin/steno/passages");
    revalidatePath("/admin/steno/series");
    revalidatePath("/steno/dictation");
    return { success: true, count: data.passageIds.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── ADMIN STENO SERIES CRUD (STEP 10) ──

export async function createStenoSeriesAction(data: {
  title: string;
  description: string;
  thumbnailUrl?: string;
  batch?: string;
  category: string;
  exam?: string;
  language: "Hindi" | "English";
  passages?: string[];
  isPremium?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const series = await StenoSeries.create({
      ...data,
      exam: data.exam || "",
      passages: data.passages || [],
      isPublished: data.isPublished ?? true,
      sortOrder: data.sortOrder || 0,
    });

    revalidatePath("/admin/steno/series");
    revalidatePath("/manager/steno/series");
    revalidatePath("/steno/admin/series");
    revalidatePath("/steno");
    revalidatePath("/steno/series");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");
    revalidatePath("/student/steno/series/[id]", "page");
    return { success: true, series: JSON.parse(JSON.stringify(series)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStenoSeriesAction(id: string, data: any) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const updated = await StenoSeries.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();

    revalidatePath("/admin/steno/series");
    revalidatePath("/manager/steno/series");
    revalidatePath("/steno/admin/series");
    revalidatePath("/steno");
    revalidatePath("/steno/series");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");
    revalidatePath("/student/steno/series/[id]", "page");
    return { success: true, series: JSON.parse(JSON.stringify(updated)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStenoSeriesAction(id: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    await StenoSeries.findByIdAndDelete(id);

    revalidatePath("/admin/steno/series");
    revalidatePath("/manager/steno/series");
    revalidatePath("/steno/admin/series");
    revalidatePath("/steno");
    revalidatePath("/steno/series");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");
    revalidatePath("/student/steno/series/[id]", "page");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── SEEDING DEFAULT SERIES AND PASSAGES (LEGACY HANDLER) ──

export async function seedDefaultSeriesAndPassagesAction() {
  try {
    await connectDB();
    await seedStenoInstituteAccountAction();
  } catch (err) {
    console.error("seedDefaultSeriesAndPassagesAction error:", err);
  }
}

export async function seedStenoInstituteAccountAction() {
  try {
    await connectDB();
    
    // 1. NGIT Combined Content Manager Account (Typing + Steno)
    const mgrPassHash = await bcrypt.hash("Manager@2026", 10);
    await User.findOneAndUpdate(
      { email: "manager@ngitedu.com" },
      {
        $set: {
          name: "NGIT Content Manager (Typing & Steno)",
          email: "manager@ngitedu.com",
          password: mgrPassHash,
          role: UserRole.CONTENT_MANAGER,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );

    // 2. Steno Institute Admin Account
    const instPassHash = await bcrypt.hash("StenoInst@2026", 10);
    await User.findOneAndUpdate(
      { email: "stenoinstitute@ngitedu.com" },
      {
        $set: {
          name: "NGIT Steno Institute Admin",
          email: "stenoinstitute@ngitedu.com",
          password: instPassHash,
          role: UserRole.STENO_ADMIN,
          instituteCode: "NGIT-STENO",
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );

    // 3. Dedicated Steno Module Manager Account
    const stenoMgrPassHash = await bcrypt.hash("StenoManager@2026", 10);
    await User.findOneAndUpdate(
      { email: "stenomanager@ngitedu.com" },
      {
        $set: {
          name: "NGIT Steno Module Manager",
          email: "stenomanager@ngitedu.com",
          password: stenoMgrPassHash,
          role: UserRole.STENO_ADMIN,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );


    return { success: true };
  } catch (err: any) {
    console.error("seedStenoInstituteAccountAction error:", err);
    return { success: false, error: err.message };
  }
}

// ── STUDENT DASHBOARD STATISTICS & RECOMMENDED PRACTICE ──

export async function getStudentStenoDashboardDataAction(filterOptions?: {
  language?: string;
  exam?: string;
  duration?: number;
  targetWpm?: number;
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    let stats = {
      testsAttempted: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      bestAccuracy: 0,
      currentRank: "N/A",
      recentRank: "N/A",
    };

    let continuePractice = null;
    let commonRecurringMistakes: Array<{ original: string; typed: string; count: number; errorType: string }> = [];
    let performanceByCategory: Array<{ category: string; attemptsCount: number; avgWpm: number; avgAccuracy: number }> = [];
    let recentLogs: Array<any> = [];

    if (session?.user?.id) {
      const userResults: any[] = await StenoResult.find({ userId: session.user.id })
        .populate("passageId")
        .populate("examId")
        .sort({ createdAt: -1 })
        .lean();

      if (userResults.length > 0) {
        stats.testsAttempted = userResults.length;

        const totalWpm = userResults.reduce((acc, curr) => acc + (curr.netWpm || curr.speedWpm || 0), 0);
        stats.avgWpm = Math.round(totalWpm / userResults.length);
        stats.bestWpm = Math.max(...userResults.map((r) => r.netWpm || r.speedWpm || 0));

        const totalAcc = userResults.reduce((acc, curr) => acc + (curr.accuracy || 0), 0);
        stats.avgAccuracy = Math.round(totalAcc / userResults.length);
        stats.bestAccuracy = Math.max(...userResults.map((r) => r.accuracy || 0));

        // Global Leaderboard Rank among all participants
        const leaderboard = await StenoResult.aggregate([
          {
            $group: {
              _id: "$userId",
              avgAcc: { $avg: "$accuracy" },
              avgWpm: { $avg: { $ifNull: ["$netWpm", "$speedWpm"] } },
              totalAttempts: { $sum: 1 },
            },
          },
          { $sort: { avgAcc: -1, avgWpm: -1, totalAttempts: -1 } },
        ]);

        const rankIndex = leaderboard.findIndex((item) => item._id.toString() === session.user.id);
        if (rankIndex !== -1) {
          stats.currentRank = `#${rankIndex + 1}`;
          stats.recentRank = `#${rankIndex + 1}`;
        } else {
          stats.currentRank = "#1";
          stats.recentRank = "#1";
        }

        continuePractice = userResults[0];

        // 1. Common Recurring Mistakes Aggregator
        const recurringMistakesMap: Record<string, { original: string; typed: string; count: number; errorType: string }> = {};

        userResults.forEach((res) => {
          if (Array.isArray(res.errorLog) && res.errorLog.length > 0) {
            res.errorLog.forEach((err: any) => {
              const orig = (err.originalWord || "").trim();
              const typed = (err.typedWord || "").trim();
              if (orig || typed) {
                const key = `${orig}:::${typed}`;
                if (!recurringMistakesMap[key]) {
                  recurringMistakesMap[key] = {
                    original: orig || "(Omitted)",
                    typed: typed || "(Missed)",
                    count: 1,
                    errorType: err.errorType || "Spelling Error",
                  };
                } else {
                  recurringMistakesMap[key].count += 1;
                }
              }
            });
          } else if (Array.isArray(res.wordBreakdown)) {
            res.wordBreakdown.forEach((wb: any) => {
              if (wb.type && wb.type !== "correct") {
                const orig = (wb.original || "").trim();
                const typed = (wb.typed || "").trim();
                if (orig || typed) {
                  const key = `${orig}:::${typed}`;
                  if (!recurringMistakesMap[key]) {
                    recurringMistakesMap[key] = {
                      original: orig || "(Omitted)",
                      typed: typed || "(Missed)",
                      count: 1,
                      errorType: wb.type === "missing" ? "Missing Word" : wb.type === "added" ? "Added Word" : "Typing Mistake",
                    };
                  } else {
                    recurringMistakesMap[key].count += 1;
                  }
                }
              }
            });
          }
        });

        commonRecurringMistakes = Object.values(recurringMistakesMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // 2. Performance by Category
        const categoryStatsMap: Record<string, { count: number; totalWpm: number; totalAcc: number }> = {};
        userResults.forEach((res) => {
          const cat = res.passageId?.category || res.examTitle || "General Dictation";
          if (!categoryStatsMap[cat]) {
            categoryStatsMap[cat] = {
              count: 1,
              totalWpm: res.netWpm || res.speedWpm || 0,
              totalAcc: res.accuracy || 0,
            };
          } else {
            categoryStatsMap[cat].count += 1;
            categoryStatsMap[cat].totalWpm += (res.netWpm || res.speedWpm || 0);
            categoryStatsMap[cat].totalAcc += (res.accuracy || 0);
          }
        });

        performanceByCategory = Object.entries(categoryStatsMap).map(([category, data]) => ({
          category,
          attemptsCount: data.count,
          avgWpm: Math.round(data.totalWpm / data.count),
          avgAccuracy: Math.round(data.totalAcc / data.count),
        }));

        // 3. Recent Transcription Logs
        recentLogs = userResults.slice(0, 10).map((r) => ({
          _id: r._id.toString(),
          testTitle: r.passageTitle || r.passageId?.title || "Steno Practice Test",
          dictationWpm: r.targetWpm || r.passageId?.targetWpm || 80,
          netWpm: r.netWpm || r.speedWpm || 0,
          grossWpm: r.grossWpm || r.speedWpm || 0,
          accuracy: r.accuracy || 0,
          totalErrors: r.totalMistakes || r.totalErrors || 0,
          strokes: (r.typedTranscription || "").length,
          category: r.passageId?.category || r.examTitle || "General",
          status: r.status || "Evaluated",
          date: r.createdAt,
        }));
      }
    }

    const passageFilter: any = { isPublished: true };
    if (filterOptions?.language && filterOptions.language !== "All") {
      passageFilter.language = filterOptions.language;
    }
    if (filterOptions?.targetWpm) {
      passageFilter.targetWpm = Number(filterOptions.targetWpm);
    }
    if (filterOptions?.exam && filterOptions.exam !== "All") {
      passageFilter.category = filterOptions.exam;
    }

    const recommendedPassages = await StenoPassage.find(passageFilter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(6)
      .lean();

    if (!continuePractice && recommendedPassages.length > 0) {
      continuePractice = { passageId: recommendedPassages[0] };
    }

    return {
      success: true,
      data: {
        stats,
        commonRecurringMistakes,
        performanceByCategory,
        recentLogs: JSON.parse(JSON.stringify(recentLogs)),
        continuePractice: JSON.parse(JSON.stringify(continuePractice)),
        recommendedPassages: JSON.parse(JSON.stringify(recommendedPassages)),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStudentStenoProfileDataAction(page = 1, limit = 10) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    const user = await User.findById(session.user.id).select("-password").lean();
    const skip = (page - 1) * limit;

    const [totalAttempts, resultsDocs]: [number, any[]] = await Promise.all([
      StenoResult.countDocuments({ userId: session.user.id }),
      StenoResult.find({ userId: session.user.id })
        .populate("passageId")
        .populate("examId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const allLeaderboard = await StenoResult.aggregate([
      {
        $group: {
          _id: "$userId",
          avgAcc: { $avg: "$accuracy" },
          avgWpm: { $avg: { $ifNull: ["$netWpm", "$speedWpm"] } },
        },
      },
      { $sort: { avgAcc: -1, avgWpm: -1 } },
    ]);

    const userRankIndex = allLeaderboard.findIndex((i) => i._id.toString() === session.user.id);
    const overallRank = userRankIndex !== -1 ? `#${userRankIndex + 1}` : "#1";

    const attempts = resultsDocs.map((r, idx) => ({
      _id: r._id.toString(),
      attemptNumber: totalAttempts - (skip + idx),
      testName: r.passageTitle || r.passageId?.title || "Steno Practice Test",
      category: r.passageId?.category || r.examTitle || "General",
      language: r.language || "Hindi",
      speedWpm: r.netWpm || r.speedWpm || 0,
      grossWpm: r.grossWpm || r.speedWpm || 0,
      accuracy: r.accuracy || 0,
      grossAccuracy: Math.min(100, Math.round((r.accuracy || 0) * 1.05)),
      mistakes: r.totalMistakes || r.totalErrors || 0,
      strokes: (r.typedTranscription || "").length,
      rank: overallRank,
      status: r.status || "Evaluated",
      date: r.createdAt,
    }));

    return {
      success: true,
      user: JSON.parse(JSON.stringify(user)),
      activePlan: {
        name: "Pro Shorthand & Steno Access Plan",
        type: "Full Steno Portal Access",
        status: "Active",
        validTill: "Lifetime Access / Active",
        features: ["Unlimited Audio Dictations", "SSC & High Court Exam Rules", "Live Speed Analysis", "PDF Export"],
      },
      pagination: {
        page,
        limit,
        totalAttempts,
        totalPages: Math.ceil(totalAttempts / limit) || 1,
        hasMore: page * limit < totalAttempts,
      },
      attempts: JSON.parse(JSON.stringify(attempts)),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStenoResultAction(attemptId: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const result = await StenoResult.findById(attemptId);
    if (!result) return { success: false, error: "Record not found" };

    const userRole = (session.user as any).role;
    if (result.userId.toString() !== session.user.id && userRole !== "ADMIN" && userRole !== "STENO_ADMIN") {
      return { success: false, error: "Unauthorized to delete this test attempt" };
    }

    await StenoResult.findByIdAndDelete(attemptId);
    revalidatePath("/student/steno/my-tests");
    revalidatePath("/student/steno/dashboard");
    revalidatePath("/student/steno/results");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function submitStenoResultAction(data: {
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
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    if (!userId && session?.user?.email) {
      const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).select("_id").lean();
      if (dbUser) userId = (dbUser as any)._id.toString();
    }
    if (!userId) {
      return { success: false, error: "Unauthorized: Student login required" };
    }

    const saveRes = await processAndSaveStenoResult(data, userId);
    if (!saveRes.success || !saveRes.resultId) {
      return { success: false, error: saveRes.error || "Failed to save steno evaluation result" };
    }

    // Safely revalidate student pages without throwing if route components perform internal redirects
    try {
      revalidatePath("/student/steno/my-tests");
      revalidatePath("/student/steno/dashboard");
      revalidatePath("/student/steno/leaderboard");
      revalidatePath("/student/steno/results");
    } catch (revalErr) {
      console.warn("revalidatePath warning in submitStenoResultAction:", revalErr);
    }

    return { success: true, resultId: saveRes.resultId };
  } catch (err: any) {
    console.error("submitStenoResultAction error:", err);
    return { success: false, error: err.message || "Failed to submit steno examination" };
  }
}

export async function getStenoResultByIdAction(attemptId: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    let currentUserIdStr = session?.user?.id;
    if (!currentUserIdStr && session?.user?.email) {
      const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).select("_id").lean();
      if (dbUser) currentUserIdStr = (dbUser as any)._id.toString();
    }

    if (!currentUserIdStr) {
      return { success: false, error: "Authentication required to view results" };
    }

    let resultDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(attemptId)) {
      resultDoc = await StenoResult.findById(attemptId)
        .populate("passageId")
        .populate("examId")
        .populate("userId", "name email image role")
        .lean();
    }

    if (!resultDoc) return { success: false, error: "Result record not found" };

    const userRole = (session?.user as any)?.role || "STUDENT";
    const resultUserIdStr =
      (resultDoc.userId as any)?._id?.toString() ||
      (resultDoc.userId as any)?.toString() ||
      resultDoc.userId;

    const sessionEmail = session?.user?.email?.toLowerCase();
    const resultUserEmail = (resultDoc.userId as any)?.email?.toLowerCase();

    const isOwner =
      resultUserIdStr === currentUserIdStr ||
      (sessionEmail && resultUserEmail && sessionEmail === resultUserEmail);
    const isStaff = ["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER", "TYPING_ADMIN"].includes(userRole);

    if (!isOwner && !isStaff) {
      return { success: false, error: "Access Denied: You can only view your own test results." };
    }

    return { success: true, result: JSON.parse(JSON.stringify(resultDoc)) };
  } catch (err: any) {
    console.error("getStenoResultByIdAction error:", err);
    return { success: false, error: err.message || "Failed to retrieve steno result" };
  }
}

export async function getStenoUserHistoryAction() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const results = await StenoResult.find({ userId: session.user.id })
      .populate("passageId")
      .populate("examId")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, results: JSON.parse(JSON.stringify(results)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoLeaderboardAction(filters?: {
  exam?: string;
  examId?: string;
  seriesId?: string;
  passageId?: string;
  language?: string;
  targetWpm?: number;
  dateRange?: string;
}) {
  try {
    await connectDB();
    const queryFilter: any = {};

    if (filters?.passageId && filters.passageId !== "All") {
      queryFilter.passageId = filters.passageId;
    }
    const targetExam = filters?.examId || filters?.exam;
    if (targetExam && targetExam !== "All") {
      queryFilter.examId = targetExam;
    }
    if (filters?.targetWpm) {
      queryFilter.targetWpm = Number(filters.targetWpm);
    }
    if (filters?.dateRange === "this_week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      queryFilter.createdAt = { $gte: weekAgo };
    } else if (filters?.dateRange === "this_month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      queryFilter.createdAt = { $gte: monthAgo };
    }

    const leaderboard = await StenoResult.find(queryFilter)
      .populate("userId", "name image") // ONLY safe public student name & image
      .populate("passageId", "title language targetWpm category")
      .sort({ score: -1, accuracy: -1, speedWpm: -1 })
      .limit(30)
      .lean();

    // Map to safe public display array with ZERO sensitive info
    const safeLeaderboard = leaderboard.map((item: any) => ({
      _id: item._id.toString(),
      studentName: item.userId?.name || "Anonymous Learner",
      studentImage: item.userId?.image || null,
      passageTitle: item.passageId?.title || "Steno Dictation",
      language: item.passageId?.language || "Hindi",
      targetWpm: item.targetWpm || item.passageId?.targetWpm || 80,
      speedWpm: item.speedWpm || item.netWpm || 0,
      accuracy: item.accuracy || 0,
      score: item.score || 0,
      status: item.status || "Evaluated",
    }));

    return { success: true, leaderboard: safeLeaderboard };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── ADMIN EXAM PRESETS ACTIONS (STEP 8 / STEP 2 GOVT EXAMS) ──

export async function getStenoExamsAction(query?: { batch?: string; isActive?: boolean }) {
  try {
    await connectDB();

    const filter: any = {};
    if (query?.isActive !== undefined) {
      if (query.isActive === true) {
        filter.isActive = { $ne: false };
      } else {
        filter.isActive = query.isActive;
      }
    }

    if (query?.batch && query.batch !== "all") {
      const cleanBatch = query.batch.trim();
      const escaped = cleanBatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { batch: cleanBatch },
        { batch: { $regex: new RegExp(`^${escaped}$`, "i") } },
        { batch: { $regex: new RegExp(escaped, "i") } },
      ];
    }

    const exams = await StenoExam.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, exams: JSON.parse(JSON.stringify(exams)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createStenoExamAction(data: any) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const exam = await StenoExam.create(data);
    revalidatePath("/admin/steno/exams");
    revalidatePath("/manager/steno/exams");
    revalidatePath("/steno/admin/exams");
    revalidatePath("/student/steno/exams");
    revalidatePath("/steno/mock-tests");
    return { success: true, exam: JSON.parse(JSON.stringify(exam)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStenoExamAction(id: string, data: any) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const updated = await StenoExam.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    revalidatePath("/admin/steno/exams");
    revalidatePath("/manager/steno/exams");
    revalidatePath("/steno/admin/exams");
    revalidatePath("/student/steno/exams");
    return { success: true, exam: JSON.parse(JSON.stringify(updated)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStenoExamAction(id: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    await StenoExam.findByIdAndDelete(id);
    revalidatePath("/admin/steno/exams");
    revalidatePath("/manager/steno/exams");
    revalidatePath("/steno/admin/exams");
    revalidatePath("/student/steno/exams");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAdminStenoOverviewAction() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const [totalDictations, totalSeries, totalMockTests, totalAttempts, distinctStudents, avgStats] =
      await Promise.all([
        StenoPassage.countDocuments(),
        StenoSeries.countDocuments(),
        StenoExam.countDocuments(),
        StenoResult.countDocuments(),
        StenoResult.distinct("userId"),
        StenoResult.aggregate([
          {
            $group: {
              _id: null,
              avgWpm: { $avg: { $ifNull: ["$netWpm", "$speedWpm"] } },
              avgAccuracy: { $avg: "$accuracy" },
            },
          },
        ]),
      ]);

    const totalStudents = distinctStudents.length;
    const avgWpm = Math.round(avgStats[0]?.avgWpm || 0);
    const avgAccuracy = Math.round(avgStats[0]?.avgAccuracy || 0);

    // Recent Attempts
    const recentAttempts = await StenoResult.find({})
      .populate("userId", "name email image")
      .populate("passageId", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Highest Scores
    const highestScores = await StenoResult.find({})
      .populate("userId", "name email image")
      .populate("passageId", "title")
      .sort({ score: -1, accuracy: -1 })
      .limit(5)
      .lean();

    // Popular Passages
    const popularPassagesAgg = await StenoResult.aggregate([
      { $match: { passageId: { $ne: null } } },
      { $group: { _id: "$passageId", attemptsCount: { $sum: 1 } } },
      { $sort: { attemptsCount: -1 } },
      { $limit: 5 },
    ]);
    const passageIds = popularPassagesAgg.map((p) => p._id);
    const passagesDocs = await StenoPassage.find({ _id: { $in: passageIds } }).lean();
    const popularPassages = popularPassagesAgg.map((p) => {
      const found = passagesDocs.find((doc) => doc._id.toString() === p._id.toString());
      return {
        title: found?.title || "Dictation Passage",
        attemptsCount: p.attemptsCount,
      };
    });

    return {
      success: true,
      stats: {
        totalStudents,
        totalDictations,
        totalAttempts,
        totalMockTests,
        avgWpm,
        avgAccuracy,
      },
      recentAttempts: JSON.parse(JSON.stringify(recentAttempts)),
      highestScores: JSON.parse(JSON.stringify(highestScores)),
      popularPassages: JSON.parse(JSON.stringify(popularPassages)),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   STENO TARGET BATCHES (STEP 1 BATCH) ACTIONS
   ========================================================================== */


export async function getStenoBatchesAction(query?: any): Promise<{ success: boolean; batches: any[]; error?: string }> {
  try {
    await connectDB();

    // Silently cleanup any unwanted auto-generated General Batch
    try {
      await StenoBatch.deleteMany({ name: "General Batch" });
      await StenoSeries.deleteMany({ batch: "General Batch" });
    } catch {
      // ignore
    }

    const filter: any = {};
    if (query?.isPublished !== undefined) {
      if (query.isPublished === true) {
        filter.isPublished = { $ne: false };
      } else {
        filter.isPublished = query.isPublished;
      }
    }

    let batches: any[] = [];
    try {
      batches = await StenoBatch.find(filter).populate("examPresetId").sort({ sortOrder: 1, createdAt: -1 }).lean();
    } catch {
      // Fallback without populate if populate fails
      batches = await StenoBatch.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
    }

    return { success: true, batches: JSON.parse(JSON.stringify(batches || [])) };
  } catch (err: any) {
    console.error("getStenoBatchesAction error:", err);
    return { success: false, batches: [], error: err.message };
  }
}

export async function createStenoBatchAction(data: {
  name: string;
  hindiName?: string;
  description?: string;
  thumbnailUrl?: string;
  examPresetId?: string;
  coachingName?: string;
  instituteCode?: string;
  managedByEmail?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  try {
    await connectDB();
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Batch Name is required" };
    }

    const batchName = data.name.trim();

    let batch: any = await StenoBatch.findOne({ name: batchName });
    if (batch) {
      batch = await StenoBatch.findByIdAndUpdate(
        batch._id,
        {
          $set: {
            name: batchName,
            hindiName: data.hindiName || "",
            description: data.description || "",
            thumbnailUrl: data.thumbnailUrl || "",
            examPresetId: data.examPresetId ? data.examPresetId : null,
            coachingName: data.coachingName || "",
            instituteCode: data.instituteCode || "",
            managedByEmail: data.managedByEmail || "",
            sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
            isPublished: data.isPublished !== undefined ? data.isPublished : true,
          }
        },
        { new: true }
      ).lean();
    } else {
      batch = await StenoBatch.create({
        name: batchName,
        hindiName: data.hindiName || "",
        description: data.description || "",
        thumbnailUrl: data.thumbnailUrl || "",
        examPresetId: data.examPresetId ? data.examPresetId : null,
        coachingName: data.coachingName || "",
        instituteCode: data.instituteCode || "",
        managedByEmail: data.managedByEmail || "",
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      });
    }

    revalidatePath("/admin/steno/batches");
    revalidatePath("/admin/steno/exams");
    revalidatePath("/admin/steno/series");
    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");
    return { success: true, batch: JSON.parse(JSON.stringify(batch)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStenoBatchAction(id: string, data: any) {
  try {
    await connectDB();
    const payload = { ...data };
    if (payload.examPresetId === "" || payload.examPresetId === undefined) {
      payload.examPresetId = null;
    }
    const updated = await StenoBatch.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean();
    revalidatePath("/admin/steno/batches");
    revalidatePath("/admin/steno/exams");
    revalidatePath("/admin/steno/series");
    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/exams");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");
    return { success: true, batch: JSON.parse(JSON.stringify(updated)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStenoBatchAction(id: string) {
  try {
    await connectDB();
    await StenoBatch.findByIdAndDelete(id);
    revalidatePath("/admin/steno/batches");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/series/batch/[batchSlug]", "page");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoInstituteStudentsAction(instCode = "NGIT-STENO") {
  try {
    await connectDB();
    const targetCode = instCode.trim().toUpperCase();

    // 1. Find users with matching instituteCode or whose StudentProfile has this code
    const users = await User.find({
      $or: [
        { instituteCode: targetCode },
        { email: "stenoinstitute@ngitedu.com" }
      ]
    }).select("name email mobile instituteCode createdAt isActive role").lean();

    const userIds = users.filter((u: any) => u.role === UserRole.STUDENT).map((u: any) => u._id);

    // 2. Fetch results for these students
    const StenoResult = (await import("@/models/StenoResult")).default;
    const results = await StenoResult.find({ userId: { $in: userIds } })
      .select("userId speedWpm netWpm accuracy createdAt score")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Aggregate per student stats
    const studentDataMap: Record<string, any> = {};
    for (const u of users) {
      if (u.role !== UserRole.STUDENT) continue;
      const uidStr = u._id.toString();
      studentDataMap[uidStr] = {
        _id: uidStr,
        name: u.name,
        email: u.email,
        mobile: u.mobile || "N/A",
        instituteCode: u.instituteCode || targetCode,
        createdAt: u.createdAt,
        totalAttempts: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        results: [],
      };
    }

    let accSumMap: Record<string, number> = {};

    for (const r of results) {
      const uidStr = r.userId?.toString();
      if (studentDataMap[uidStr]) {
        studentDataMap[uidStr].totalAttempts += 1;
        const wpm = r.netWpm || r.speedWpm || 0;
        if (wpm > studentDataMap[uidStr].bestWpm) {
          studentDataMap[uidStr].bestWpm = wpm;
        }
        accSumMap[uidStr] = (accSumMap[uidStr] || 0) + (r.accuracy || 0);
        studentDataMap[uidStr].results.push(r);
      }
    }

    const studentList = Object.values(studentDataMap).map((s: any) => {
      if (s.totalAttempts > 0) {
        s.avgAccuracy = Math.round((accSumMap[s._id] / s.totalAttempts) * 10) / 10;
      }
      return s;
    });

    return {
      success: true,
      instituteCode: targetCode,
      totalStudents: studentList.length,
      students: JSON.parse(JSON.stringify(studentList)),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cleanupAutoCreatedSeriesAction() {
  try {
    await connectDB();
    const res = await StenoSeries.deleteMany({ title: "सामान्य अभ्यास" });
    revalidatePath("/admin/steno/series");
    revalidatePath("/steno");
    revalidatePath("/student/steno/series");
    return { success: true, deletedCount: res.deletedCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── SEPARATE STENO EXAM EVALUATION & ERROR RULES CRUD ──

export async function getStenoErrorRulesAction(): Promise<{ success: boolean; rules: any[]; error?: string }> {
  try {
    await connectDB();
    const count = await StenoErrorRule.countDocuments();

    if (count === 0) {
      const defaultRules = [
        {
          ruleName: "UPSSSC Steno Official Evaluation Scheme",
          authorityName: "उ०प्र० अधीनस्थ सेवा चयन आयोग",
          examType: "UPSSSC",
          description: "20 अशुद्धियों की पूर्ण छूट, बैकस्पेस मान्य, वर्तनी 1.0, मात्रा/वचन 0.5, अधिकतम 5% त्रुटि सीमा",
          spellingErrorWeight: 1.0,
          matraErrorWeight: 0.5,
          punctuationErrorWeight: 0.5,
          addedWordWeight: 1.0,
          skippedWordWeight: 1.0,
          spacingTranspositionWeight: 0.5,
          mistakeExemptionCount: 20,
          ignoreChandrabindu: true,
          maxErrorPercentAllowed: 5.0,
          backspaceMode: "full",
          isDefault: true,
        },
        {
          ruleName: "SSC Steno Grade C & D Marking Scheme",
          authorityName: "Staff Selection Commission",
          examType: "SSC",
          description: "Full Error (1.0) per omission/substitution, Half Error (0.5) per spelling/capitalization, 5% Grade C / 7% Grade D",
          spellingErrorWeight: 0.5,
          matraErrorWeight: 0.5,
          punctuationErrorWeight: 0.0,
          addedWordWeight: 1.0,
          skippedWordWeight: 1.0,
          spacingTranspositionWeight: 0.5,
          mistakeExemptionCount: 0,
          ignoreChandrabindu: true,
          maxErrorPercentAllowed: 5.0,
          backspaceMode: "full",
          isDefault: false,
        },
        {
          ruleName: "Allahabad High Court Steno Evaluation Scheme",
          authorityName: "High Court of Judicature at Allahabad",
          examType: "HighCourt",
          description: "लीगल डिक्टेशन मार्किंग स्कीम: Wrong Word (1.0), Punctuation/Capitalization (0.5), 7% अधिकतम त्रुटि सीमा",
          spellingErrorWeight: 1.0,
          matraErrorWeight: 0.5,
          punctuationErrorWeight: 0.5,
          addedWordWeight: 1.0,
          skippedWordWeight: 1.0,
          spacingTranspositionWeight: 0.5,
          mistakeExemptionCount: 0,
          ignoreChandrabindu: true,
          maxErrorPercentAllowed: 7.0,
          backspaceMode: "full",
          isDefault: false,
        },
        {
          ruleName: "UPSI Steno Evaluation Scheme",
          authorityName: "उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड",
          examType: "UPSI",
          description: "15 अशुद्धियों की छूट, 5 मिनट डिक्टेशन, 40 मिनट लिप्यंतरण, 5% त्रुटि सीमा",
          spellingErrorWeight: 1.0,
          matraErrorWeight: 0.5,
          punctuationErrorWeight: 0.5,
          addedWordWeight: 1.0,
          skippedWordWeight: 1.0,
          spacingTranspositionWeight: 0.5,
          mistakeExemptionCount: 15,
          ignoreChandrabindu: true,
          maxErrorPercentAllowed: 5.0,
          backspaceMode: "full",
          isDefault: false,
        },
      ];
      await StenoErrorRule.insertMany(defaultRules);
    }

    const rules = await StenoErrorRule.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, rules: JSON.parse(JSON.stringify(rules)) };
  } catch (err: any) {
    return { success: false, rules: [], error: err.message };
  }
}

export async function createStenoErrorRuleAction(data: any) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const rule = await StenoErrorRule.create(data);
    revalidatePath("/admin/steno/error-rules");
    revalidatePath("/manager/steno/error-rules");
    revalidatePath("/steno/admin/error-rules");
    return { success: true, rule: JSON.parse(JSON.stringify(rule)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStenoErrorRuleAction(id: string, data: any) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    const updated = await StenoErrorRule.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    revalidatePath("/admin/steno/error-rules");
    revalidatePath("/manager/steno/error-rules");
    revalidatePath("/steno/admin/error-rules");
    return { success: true, rule: JSON.parse(JSON.stringify(updated)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStenoErrorRuleAction(id: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN" && userRole !== "CONTENT_MANAGER")) {
      return { success: false, error: "Admin authorization required" };
    }

    await StenoErrorRule.findByIdAndDelete(id);
    revalidatePath("/admin/steno/error-rules");
    revalidatePath("/manager/steno/error-rules");
    revalidatePath("/steno/admin/error-rules");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}



