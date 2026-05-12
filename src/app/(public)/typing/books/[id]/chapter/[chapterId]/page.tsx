"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ClassicTypingEngineModule } from "@/modules/typing/ClassicTypingEngineModule";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight, Timer, FileText, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookChapterPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const bookId = params?.id as string;
  const chapterId = params?.chapterId as string;
  const lang = searchParams.get("lang") || "English";

  const [book, setBook] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"select" | "practice">("select");
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Hindi">(lang as any);
  const [selectedLayout, setSelectedLayout] = useState<"English" | "Inscript">(lang === "Hindi" ? "Inscript" : "English");

  useEffect(() => {
    if (!bookId) return;

    // Fetch book info
    fetch("/api/typing/books")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBook(data.find((b: any) => b._id === bookId));
      });

    // Fetch all chapters of this book
    fetch(`/api/typing/practice?type=BOOK&bookId=${bookId}`)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setChapters(arr);

        // If a chapterId is in the URL, auto-load that chapter
        if (chapterId) {
          const found = arr.find((c: any) => c._id === chapterId);
          if (found) {
            setChapter(found);
            setStep("practice");
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookId, chapterId]);

  const handleChapterSelect = (c: any) => {
    setChapter(c);
    setStep("practice");
    router.replace(`/typing/books/${bookId}/chapter/${c._id}?lang=${selectedLanguage}`, { scroll: false });
  };

  const engineConfig = {
    title: chapter?.title || "",
    duration: 10,
    backspaceMode: "full" as const,
    highlightMode: "word" as const,
    wordLimit: 0,
    language: selectedLanguage,
    layout: selectedLayout as any,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f4ef] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
    </div>
  );

  // Chapter listing view
  if (step === "select") {
    return (
      <div className="min-h-screen bg-[#f5f4ef] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href={`/typing/books?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> All Books
          </Link>

          {/* Book Hero */}
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/30">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Typing Book</span>
                <h1 className="text-3xl md:text-4xl font-black mt-1">{book?.name || "Book Practice"}</h1>
                {book?.description && <p className="text-slate-400 font-medium mt-2 text-sm">{book.description}</p>}
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-amber-400">{chapters.length}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapters</div>
              </div>
            </div>

            {/* Language selector */}
            <div className="flex gap-2 mt-8 relative z-10">
              {["English", "Hindi"].map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLanguage(l as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-black text-sm transition-all",
                    selectedLanguage === l ? "bg-amber-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
                  )}
                >{l === "English" ? "🇬🇧 English" : "🇮🇳 Hindi"}</button>
              ))}
              {selectedLanguage === "Hindi" && ["Inscript", "Phonetic"].map(lay => (
                <button
                  key={lay}
                  onClick={() => setSelectedLayout(lay as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-black text-xs transition-all",
                    selectedLayout === lay ? "bg-white text-slate-900" : "bg-white/10 text-slate-300 hover:bg-white/20"
                  )}
                >{lay}</button>
              ))}
            </div>
          </div>

          {/* Chapter list */}
          {chapters.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">No Chapters Yet</h3>
              <p className="text-slate-500">Admin hasn't added any chapters to this book yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((c, i) => (
                <button
                  key={c._id}
                  onClick={() => handleChapterSelect(c)}
                  className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 flex items-center justify-between hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all group text-left"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-black text-sm flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">{c.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {c.language} · {c.wordCount} words · {c.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Timer className="w-3.5 h-3.5" /> 10 min
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Practice mode
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => { setStep("select"); setChapter(null); }}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chapters
        </button>
        <div className="flex items-center gap-2 text-xs font-black text-slate-400">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span className="text-white">{book?.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-amber-400">{chapter?.title}</span>
        </div>
      </div>

      <ClassicTypingEngineModule
        exam={{ title: chapter?.title, duration: 10, backspaceMode: "full", highlightMode: "word", wordLimit: 0, autoScroll: true, showScrollbar: true }}
        passage={chapter?.content || "Passage content unavailable."}
        config={engineConfig}
        onComplete={async (results) => {
          toast.success("Practice session complete!");
          setStep("select");
        }}
        userName={session?.user?.name || "STUDENT"}
      />
    </div>
  );
}
