"use server";

import connectDB from "@/lib/db";
import mongoose from "mongoose";
import StenoPassage from "@/models/StenoPassage";
import StenoSeries from "@/models/StenoSeries";
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
import { evaluateStenoTranscription, ExamRules } from "@/lib/steno/evaluation";

// ── PUBLIC & STUDENT STENO DATA ──

export async function getStenoPassagesAction(query?: any) {
  try {
    await connectDB();
    await seedDefaultSeriesAndPassagesAction();
    const filter: any = {};
    if (query?.isPublished !== undefined) {
      filter.isPublished = query.isPublished;
    } else {
      filter.isPublished = true;
    }
    if (query?.language) filter.language = query.language;
    if (query?.category) filter.category = query.category;
    if (query?.targetWpm) filter.targetWpm = Number(query.targetWpm);
    if (query?.seriesId) filter.seriesId = query.seriesId;

    const passages = await StenoPassage.find(filter)
      .populate("seriesId")
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return { success: true, passages: JSON.parse(JSON.stringify(passages)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoSeriesListAction(query?: any) {
  try {
    await connectDB();
    await seedDefaultSeriesAndPassagesAction();
    const filter: any = {};
    if (query?.isPublished !== undefined) filter.isPublished = query.isPublished;

    const series = await StenoSeries.find(filter)
      .populate("passages")
      .sort({ sortOrder: 1, createdAt: -1 })
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
    if (!seriesItem) {
      seriesItem = await StenoSeries.findOne({ isPublished: true }).populate("passages").lean();
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
    let passage = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      passage = await StenoPassage.findById(id).populate("seriesId").lean();
    }
    if (!passage) {
      passage = await StenoPassage.findOne({ isPublished: true }).populate("seriesId").lean();
    }
    if (!passage) return { success: false, error: "Passage not found" };
    return { success: true, passage: JSON.parse(JSON.stringify(passage)) };
  } catch (err: any) {
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
  category: string;
  seriesId?: string;
  examType?: string;
  transcriptText: string;
  wordCount: number;
  durationSeconds: number;
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

    const passage = await StenoPassage.create({
      ...data,
      seriesId: data.seriesId || null,
    });

    if (data.seriesId) {
      await StenoSeries.findByIdAndUpdate(data.seriesId, {
        $addToSet: { passages: passage._id },
      });
    }

    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno/dictation");
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

    const updated = await StenoPassage.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();

    revalidatePath("/admin/steno/passages");
    revalidatePath("/steno/dictation");
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

// ── ADMIN STENO SERIES CRUD (STEP 10) ──

export async function createStenoSeriesAction(data: {
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
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
      passages: data.passages || [],
      isPublished: data.isPublished ?? true,
      sortOrder: data.sortOrder || 0,
    });

    revalidatePath("/admin/steno/series");
    revalidatePath("/steno/series");
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
    revalidatePath("/steno/series");
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
    revalidatePath("/steno/series");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── SEEDING DEFAULT SERIES AND PASSAGES ──

export async function seedDefaultSeriesAndPassagesAction() {
  try {
    await connectDB();
    const seriesCount = await StenoSeries.countDocuments();
    if (seriesCount === 0) {
      const defaultSeries = [
        { title: "UPSSSC PYQ", description: "Previous Year Questions for UPSSSC Steno", category: "PYQ", language: "Hindi", sortOrder: 1 },
        { title: "SSC Steno PYQ", description: "Official SSC Grade C & D Previous Dictations", category: "PYQ", language: "Hindi", sortOrder: 2 },
        { title: "High Court Steno", description: "Legal & Court Room Dictations", category: "Court", language: "Hindi", sortOrder: 3 },
        { title: "Editorial", description: "Daily News & Newspaper Editorial Series", category: "Editorial", language: "Hindi", sortOrder: 4 },
        { title: "Essay Collection", description: "Curated Essays for Speed Enhancement", category: "Essay", language: "Hindi", sortOrder: 5 },
        { title: "Literature", description: "Hindi Sahitya & Literature Passages", category: "Literature", language: "Hindi", sortOrder: 6 },
        { title: "Stories", description: "Narrative Stories Dictations", category: "Stories", language: "Hindi", sortOrder: 7 },
        { title: "Magazine", description: "General Knowledge & Magazine Dictations", category: "Magazine", language: "Hindi", sortOrder: 8 },
        { title: "Custom Series", description: "Custom User & Speed Drills Series", category: "Custom", language: "English", sortOrder: 9 },
      ];

      await StenoSeries.insertMany(defaultSeries);
    }

    const passageCount = await StenoPassage.countDocuments();
    if (passageCount === 0) {
      const samplePassage = {
        title: "80 WPM Hindi Legal Dictation - Practice 1",
        language: "Hindi",
        category: "Legal",
        transcriptText: "माननीय न्यायाधीश महोदय, अभियुक्त के विरुद्ध प्रस्तुत साक्ष्य और गवाहों के बयानों से यह स्पष्ट है कि घटना के समय वह घटनास्थल पर मौजूद नहीं था। पुलिस द्वारा प्रस्तुत प्रथम सूचना रिपोर्ट में भी अनेक विरोधाभास हैं। अतः न्याय के हित में अभियुक्त को दोषमुक्त किया जाना न्यायसंगत होगा।",
        wordCount: 45,
        durationSeconds: 300,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        availableSpeeds: [40, 50, 60, 70, 80, 90, 100, 110, 120],
        targetWpm: 80,
        isPublished: true,
        sortOrder: 1,
      };
      await StenoPassage.create(samplePassage);
    }

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

    // 4. Dedicated Typing Module Manager Account
    const typingMgrPassHash = await bcrypt.hash("TypingManager@2026", 10);
    await User.findOneAndUpdate(
      { email: "typingmanager@ngitedu.com" },
      {
        $set: {
          name: "NGIT Typing Module Manager",
          email: "typingmanager@ngitedu.com",
          password: typingMgrPassHash,
          role: UserRole.TYPING_ADMIN,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("seedStenoInstituteAccountAction error:", err);
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
      const userResults = await StenoResult.find({ userId: session.user.id })
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

    const [totalAttempts, resultsDocs] = await Promise.all([
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
  totalErrors?: number;
  score?: number;
  status?: "Passed" | "Failed" | "Evaluated";
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Student login required" };
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
    if (data.examId && mongoose.Types.ObjectId.isValid(data.examId)) {
      examDoc = await StenoExam.findById(data.examId).lean();
      if (examDoc) {
        examRules = {
          spellingWeight: examDoc.spellingPenalty || "full",
          matraWeight: examDoc.matraPenalty || "half",
          punctuationWeight: examDoc.punctuationPenalty || "half",
          addedWordWeight: examDoc.addedWordPenalty || "full",
          missingWordWeight: examDoc.missingWordPenalty || "full",
        };
      }
    }

    const originalText = passageDoc?.transcriptText || passageDoc?.text || "माननीय न्यायाधीश महोदय, अभियुक्त के विरुद्ध प्रस्तुत साक्ष्य और गवाहों के बयानों से यह स्पष्ट है कि घटना के समय वह घटनास्थल पर मौजूद नहीं था।";
    const targetWpm = passageDoc?.targetWpm || examDoc?.targetWpm || 80;

    // Authoritative Server-Side Result Evaluation
    const evaluation = evaluateStenoTranscription(
      originalText,
      data.typedTranscription || "",
      data.timeSpentSeconds || 1,
      targetWpm,
      examRules
    );

    const validPassageId = (data.passageId && mongoose.Types.ObjectId.isValid(data.passageId)) ? data.passageId : (passageDoc?._id || null);
    const validExamId = (data.examId && mongoose.Types.ObjectId.isValid(data.examId)) ? data.examId : (examDoc?._id || null);

    const resultDoc = await StenoResult.create({
      userId: session.user.id,
      passageId: validPassageId,
      examId: validExamId,
      passageTitle: passageDoc?.title || "Steno Practice Passage",
      examTitle: examDoc?.title || "Standard Practice",
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

    revalidatePath("/steno/my-tests");
    revalidatePath("/steno/dashboard");
    revalidatePath("/steno/leaderboard");
    return { success: true, resultId: resultDoc._id.toString() };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoResultByIdAction(attemptId: string) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    const userRole = (session.user as any).role;
    const isOwner = resultDoc.userId?._id?.toString() === session.user.id;
    const isStaff = ["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER", "TYPING_ADMIN"].includes(userRole);

    if (!isOwner && !isStaff) {
      return { success: false, error: "Access Denied: You can only view your own test results." };
    }

    return { success: true, result: JSON.parse(JSON.stringify(resultDoc)) };
  } catch (err: any) {
    return { success: false, error: err.message };
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
    if (filters?.examId && filters.examId !== "All") {
      queryFilter.examId = filters.examId;
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

// ── ADMIN EXAM PRESETS ACTIONS (STEP 8) ──

export async function getStenoExamsAction() {
  try {
    await connectDB();
    const exams = await StenoExam.find({}).sort({ createdAt: -1 }).lean();
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
