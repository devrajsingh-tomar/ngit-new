"use server";

import connectDB from "@/lib/db";
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
    const seriesItem = await StenoSeries.findById(id).populate("passages").lean();
    if (!seriesItem) return { success: false, error: "Series not found" };
    return { success: true, series: JSON.parse(JSON.stringify(seriesItem)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getStenoPassageByIdAction(id: string) {
  try {
    await connectDB();
    const passage = await StenoPassage.findById(id).populate("seriesId").lean();
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
    const customTest = await StenoCustomTest.findById(id).populate("passageId").lean();
    if (!customTest) return { success: false, error: "Custom test not found" };
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    
    // 1. Steno Institute Admin Account
    const existingInst = await User.findOne({ email: "stenoinstitute@ngitedu.com" });
    if (!existingInst) {
      const hashedPassword = await bcrypt.hash("StenoInst@2026", 10);
      await User.create({
        name: "NGIT Steno Institute Admin",
        email: "stenoinstitute@ngitedu.com",
        password: hashedPassword,
        role: UserRole.STENO_ADMIN,
        isActive: true,
      });
      console.log("Seeded stenoinstitute@ngitedu.com account successfully");
    }

    // 2. NGIT Steno Module Manager Account
    const existingStenoMgr = await User.findOne({ email: "stenomanager@ngitedu.com" });
    if (!existingStenoMgr) {
      const hashedPassword = await bcrypt.hash("StenoManager@2026", 10);
      await User.create({
        name: "NGIT Steno Module Manager",
        email: "stenomanager@ngitedu.com",
        password: hashedPassword,
        role: UserRole.STENO_ADMIN,
        isActive: true,
      });
      console.log("Seeded stenomanager@ngitedu.com account successfully");
    }

    // 3. NGIT Typing Module Manager Account
    const existingTypingMgr = await User.findOne({ email: "typingmanager@ngitedu.com" });
    if (!existingTypingMgr) {
      const hashedPassword = await bcrypt.hash("TypingManager@2026", 10);
      await User.create({
        name: "NGIT Typing Module Manager",
        email: "typingmanager@ngitedu.com",
        password: hashedPassword,
        role: UserRole.TYPING_ADMIN,
        isActive: true,
      });
      console.log("Seeded typingmanager@ngitedu.com account successfully");
    }
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
      recentRank: "N/A",
    };

    let continuePractice = null;

    if (session?.user?.id) {
      const userResults = await StenoResult.find({ userId: session.user.id })
        .populate("passageId")
        .populate("examId")
        .sort({ createdAt: -1 })
        .lean();

      if (userResults.length > 0) {
        stats.testsAttempted = userResults.length;

        const totalWpm = userResults.reduce((acc, curr) => acc + (curr.speedWpm || 0), 0);
        stats.avgWpm = Math.round(totalWpm / userResults.length);
        stats.bestWpm = Math.max(...userResults.map((r) => r.speedWpm || 0));

        const totalAcc = userResults.reduce((acc, curr) => acc + (curr.accuracy || 0), 0);
        stats.avgAccuracy = Math.round(totalAcc / userResults.length);
        stats.bestAccuracy = Math.max(...userResults.map((r) => r.accuracy || 0));

        const leaderboard = await StenoResult.aggregate([
          { $group: { _id: "$userId", maxAcc: { $max: "$accuracy" }, maxSpeed: { $max: "$speedWpm" } } },
          { $sort: { maxAcc: -1, maxSpeed: -1 } },
        ]);

        const rankIndex = leaderboard.findIndex((item) => item._id.toString() === session.user.id);
        if (rankIndex !== -1) {
          stats.recentRank = `#${rankIndex + 1}`;
        }

        continuePractice = userResults[0];
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
        continuePractice: JSON.parse(JSON.stringify(continuePractice)),
        recommendedPassages: JSON.parse(JSON.stringify(recommendedPassages)),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitStenoResultAction(data: {
  passageId?: string;
  examId?: string;
  typedTranscription: string;
  speedWpm: number;
  accuracy: number;
  fullErrors: number;
  halfErrors: number;
  totalErrors: number;
  score: number;
  status: "Passed" | "Failed" | "Evaluated";
  timeSpentSeconds: number;
}) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Student login required" };
    }

    const resultDoc = await StenoResult.create({
      userId: session.user.id,
      passageId: data.passageId || null,
      examId: data.examId || null,
      typedTranscription: data.typedTranscription,
      speedWpm: data.speedWpm,
      accuracy: data.accuracy,
      fullErrors: data.fullErrors,
      halfErrors: data.halfErrors,
      totalErrors: data.totalErrors,
      score: data.score,
      status: data.status,
      timeSpentSeconds: data.timeSpentSeconds,
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
    const resultDoc = await StenoResult.findById(attemptId)
      .populate("passageId")
      .populate("examId")
      .populate("userId", "name email image")
      .lean();

    if (!resultDoc) return { success: false, error: "Result record not found" };
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
    if (!session || (userRole !== "ADMIN" && userRole !== "STENO_ADMIN")) {
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
