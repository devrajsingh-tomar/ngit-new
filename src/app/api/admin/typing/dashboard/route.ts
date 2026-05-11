import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TypingPassage from "@/models/TypingPassage";
import TypingExam from "@/models/TypingExam";
import TypingCategory from "@/models/TypingCategory";
import WordSet from "@/models/WordSet";
import PracticeEssay from "@/models/PracticeEssay";
import CurrentPassage from "@/models/CurrentPassage";
import TypingResult from "@/models/TypingResult";
import TypingBook from "@/models/TypingBook";
import GovExam from "@/models/GovExam";
import TypingRulePreset from "@/models/TypingRulePreset";
import TypingLanguage from "@/models/TypingLanguage";
import TypingDifficulty from "@/models/TypingDifficulty";
import TypingTopic from "@/models/TypingTopic";
import TypingSetting from "@/models/TypingSetting";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Auto-seed Languages if empty
    let languages = await TypingLanguage.find().sort({ name: 1 });
    if (languages.length === 0) {
      const existingLangs = await TypingPassage.distinct("language");
      const defaultLangs = existingLangs.length > 0 ? existingLangs : ["English", "Hindi"];
      for (const lang of defaultLangs) {
        await TypingLanguage.create({ name: lang, code: lang.toLowerCase(), active: true });
      }
      languages = await TypingLanguage.find().sort({ name: 1 });
    }

    // Auto-seed Difficulties if empty
    let difficulties = await TypingDifficulty.find().sort({ name: 1 });
    if (difficulties.length === 0) {
      const defaults: any[] = [
        { name: "Easy", expectedWpm: "25-35", wordCountRange: "250-350", complexity: "Beginner", color: "emerald" },
        { name: "Medium", expectedWpm: "35-45", wordCountRange: "350-500", complexity: "Intermediate", color: "amber" },
        { name: "Hard", expectedWpm: "45+", wordCountRange: "500+", complexity: "Advanced", color: "rose" }
      ];
      for (const d of defaults) {
        await TypingDifficulty.create(d);
      }
      difficulties = await TypingDifficulty.find().sort({ name: 1 });
    }

    // Auto-seed GovExams and cleanup duplicates
    const requestedGovExams = ["AHC", "SSC", "UP Police", "UPSSSC", "KVS", "Railways", "CPCT", "Court Typing", "Steno"];
    for (const title of requestedGovExams) {
      const matches = await GovExam.find({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
      
      if (matches.length > 1) {
        // Keep the one with a logo, otherwise keep the first one
        const toKeep = matches.find(m => m.logo) || matches[0];
        const toDeleteIds = matches.filter(m => m._id.toString() !== toKeep._id.toString()).map(m => m._id);
        
        // RE-LINK: Move all tests from deleted exams to the one we are keeping
        await TypingExam.updateMany({ govExamId: { $in: toDeleteIds } }, { $set: { govExamId: toKeep._id } });
        
        // Now safe to delete duplicates
        await GovExam.deleteMany({ _id: { $in: toDeleteIds } });
      } else if (matches.length === 0) {
        await GovExam.create({ 
          title, 
          slug: title.toLowerCase().replace(/\s+/g, '-'),
          active: true,
          description: `Official typing pattern tests for ${title}.`
        });
      }
    }

    // Auto-link unlinked tests to GovExams based on Category matching
    const unlinkedTests = await TypingExam.find({ govExamId: { $exists: false } });
    if (unlinkedTests.length > 0) {
      const allGovExams = await GovExam.find();
      for (const test of unlinkedTests) {
        const match = allGovExams.find(g => g.title.toLowerCase() === test.category?.toLowerCase());
        if (match) {
          await TypingExam.updateOne({ _id: test._id }, { $set: { govExamId: match._id } });
        }
      }
    }

    const [passages, exams, categories, wordSets, essays, current, books, govExams, rulePresets, topics, settings] = await Promise.all([
      TypingPassage.find().populate({ path: "bookId", model: "TypingBook" }).sort({ createdAt: -1 }),
      TypingExam.find()
        .populate("passageId")
        .populate({ path: "bookId", strictPopulate: false })
        .populate({ path: "govExamId", strictPopulate: false })
        .populate({ path: "rulePresetId", strictPopulate: false })
        .sort({ createdAt: -1 }),
      TypingCategory.find().sort({ name: 1 }),
      WordSet.find().sort({ category: 1 }),
      PracticeEssay.find().sort({ topic: 1 }),
      CurrentPassage.find().sort({ date: -1 }),
      TypingBook.find().sort({ name: 1 }),
      GovExam.find().sort({ title: 1 }),
      TypingRulePreset.find().sort({ name: 1 }),
      TypingTopic.find().sort({ category: 1, name: 1 }),
      TypingSetting.find().sort({ key: 1 })
    ]);

    // Fetch results separately to prevent user population errors blocking the dashboard
    let results: any[] = [];
    try {
      results = await TypingResult.find().populate({ path: "userId", model: User }).sort({ createdAt: -1 }).limit(100);
    } catch (resultErr: any) {
      console.warn("Results fetch warning:", resultErr.message);
    }

    return NextResponse.json({
      passages,
      exams,
      categories,
      wordSets,
      essays,
      current,
      results,
      books,
      govExams,
      rulePresets,
      languages,
      difficulties,
      topics,
      settings
    });
  } catch (error: any) {
    console.error("DASHBOARD_FETCH_ERROR:", {
      message: error.message,
      stack: error.stack,
      error
    });
    return NextResponse.json({ error: "Failed to fetch dashboard data: " + error.message }, { status: 500 });
  }
}
