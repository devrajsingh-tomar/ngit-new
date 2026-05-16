import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WordSet, { IWordSet } from "@/models/WordSet";
import PracticeEssay, { IPracticeEssay } from "@/models/PracticeEssay";
import CurrentPassage, { ICurrentPassage } from "@/models/CurrentPassage";
import TypingPassage from "@/models/TypingPassage";
import TypingBook from "@/models/TypingBook";
import TypingExam from "@/models/TypingExam";
import "@/models/TypingBook"; // Side-effect to ensure model is registered

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.toUpperCase();
    const cat = searchParams.get("cat");
    const val = searchParams.get("val");
    const bookId = searchParams.get("bookId");
    const lang = searchParams.get("lang");

    await connectDB();

    if (type === 'BOOK' && bookId) {
        // Ensure bookId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return NextResponse.json({ error: "Invalid Book ID" }, { status: 400 });
        }
        
        const query: any = { bookId: new mongoose.Types.ObjectId(bookId) };
        if (lang) {
            if (lang === 'Hindi') {
                query.language = { $in: ['Hindi', 'Unicode Hindi', 'Krutidev Hindi'] };
            } else {
                query.language = lang;
            }
        }
        
        console.log(`Fetching chapters for book: ${bookId}, lang: ${lang}`);
        const passages = await TypingPassage.find(query).sort({ createdAt: 1 }).lean();
        console.log(`Found ${passages.length} chapters`);
        
        return NextResponse.json(passages);
    }

    if (type === 'BOOK' && val) {
        if (!mongoose.Types.ObjectId.isValid(val as string)) {
            return NextResponse.json({ error: "Invalid chapter ID" }, { status: 400 });
        }
        const passage = await TypingPassage.findById(val)
            .populate({ path: 'bookId', model: 'TypingBook', select: '_id name' })
            .lean() as any;
        if (!passage) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        return NextResponse.json({
            title: passage.title,
            content: passage.content,
            duration: 10,
            backspaceMode: 'full',
            highlightMode: 'word',
            rawExamData: {
                _id: passage._id,
                title: passage.title,
                bookId: passage.bookId,  // populated { _id, name }
                language: passage.language,
                category: 'BOOK'
            }
        });
    }

    if (type === 'TAXONOMY') {
        const [words, essays, current, books, bookStats] = await Promise.all([
          WordSet.find().select('_id category value name language').lean(),
          PracticeEssay.find().select('_id topic title language').lean(),
          CurrentPassage.find().select('_id title language createdAt').sort({ createdAt: -1 }).lean(),
          TypingBook.find().select('_id name').lean(),
          // Aggregate languages for each book
          TypingPassage.aggregate([
            { $match: { bookId: { $exists: true } } },
            { $group: { _id: '$bookId', languages: { $addToSet: '$language' } } }
          ])
        ]);

        // Merge stats into books
        const booksWithStats = books.map((b: any) => {
            const stats = bookStats.find(s => s._id.toString() === b._id.toString());
            return {
                ...b,
                languages: stats ? stats.languages : []
            };
        });

        return NextResponse.json({ words, essays, current, books: booksWithStats });
    }

    if (type === 'WORD') {
        const set = await WordSet.findById(val).lean() as IWordSet | null;
        if (!set) return NextResponse.json({ error: "Content not found" }, { status: 404 });
        return NextResponse.json({
            title: set.name || `${set.category} Practice`,
            content: set.words.join(' '),
            duration: 5,
            backspaceMode: 'full',
            highlightMode: 'word'
        });
    }

    if (type === 'ESSAY') {
        const essay = await PracticeEssay.findById(val).lean() as IPracticeEssay | null;
        if (!essay) return NextResponse.json({ error: "Content not found" }, { status: 404 });
        return NextResponse.json({
            title: essay.title,
            content: essay.content,
            duration: 10,
            backspaceMode: 'full',
            highlightMode: 'word'
        });
    }

    if (type === 'CURRENT') {
        const passage = await CurrentPassage.findById(val).lean() as ICurrentPassage | null;
        if (!passage) return NextResponse.json({ error: "Content not found" }, { status: 404 });
        return NextResponse.json({
            title: passage.title,
            content: passage.content,
            duration: 10,
            backspaceMode: 'full',
            highlightMode: 'word'
        });
    }

    if (type === 'EXAM' && val) {
        if (!mongoose.Types.ObjectId.isValid(val)) {
            return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
        }
        const exam = await TypingExam.findById(val)
            .populate("passageId")
            .populate("rulePresetId")
            .lean() as any;
        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        
        return NextResponse.json({
            title: exam.title,
            content: exam.passageId?.content || "",
            duration: exam.duration,
            backspaceMode: exam.rulePresetId?.backspaceMode || exam.backspaceMode || 'full',
            highlightMode: exam.rulePresetId?.highlightMode || exam.highlightMode || 'word',
            rawExamData: exam
        });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
