"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { useTimer } from './hooks/useTimer';
import { useTypingEngine } from './hooks/useTypingEngine';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mapKeyToHindi } from './utils/hindiMapping';
import { mapEventToInscript } from './utils/InscriptEngine';
import { LiveDashboard, TimerDisplay } from './components/LiveDashboard';
import { Speedometer } from './components/Speedometer';
import { cn } from '@/lib/utils';
import { Keyboard } from 'lucide-react';
import { normalizeChar } from './utils/calculations';

interface ModernTypingEngineModuleProps {
  exam?: any;
  passage: string;
  config: {
    title: string;
    duration: number;
    backspaceMode?: 'full' | 'word' | 'disabled' | 'upssssc';
    highlightMode?: 'word' | 'word_error' | 'letter' | 'none';
    wordLimit?: number;
    language?: string;
    layout?: 'English' | 'Inscript';
    autoScroll?: boolean;
    showScrollbar?: boolean;
    sourcePosition?: 'top' | 'left' | 'right' | 'bottom';
    disableCopyPaste?: boolean;
    disableRightClick?: boolean;
  };
  onComplete: (results: any) => void;
  userName?: string;
  userImage?: string;
  showExerciseSwitcher?: boolean;
}

export const ModernTypingEngineModule: React.FC<ModernTypingEngineModuleProps> = ({ 
  exam,
  passage, 
  config,
  onComplete,
  userName = "STUDENT",
  userImage,
  showExerciseSwitcher = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasSubmitted = useRef(false);
  const router = useRouter();

  const { 
    setPassage, 
    updateSettings, 
    isFinished, 
    wpm, 
    accuracy, 
    errorCount, 
    typedText,
    setTypedText,
    settings,
    rawWpm,
    netWpm,
    grossWpm,
    backspaceCount,
    incrementBackspace,
    resetTest,
    endTest,
    isActive,
    startTest,
    timeLeft,
    isFullScreen,
  } = useTypingStore();

  const { resetIdleTimer } = useTimer();
  useTypingEngine();

  const passageContainerRef = useRef<HTMLDivElement>(null);
  const lockedLengthRef = useRef(0);

  const [passagesList, setPassagesList] = useState<any[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [internalPassage, setInternalPassage] = useState(passage);
  const [internalDuration, setInternalDuration] = useState(config.duration);
  const [internalLanguage, setInternalLanguage] = useState(config.language || 'English');
  const [internalLayout, setInternalLayout] = useState(config.layout || 'English');
  const [currentExam, setCurrentExam] = useState(exam);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [lockedTargetExam, setLockedTargetExam] = useState<any>(null);

  const isBookPractice = exam?.section === 'Book' || exam?.category === 'BOOK';
  const isOfficialExam = !!(exam?.govExamId || exam?.govExamCategoryId);

  useEffect(() => {
    if (!showExerciseSwitcher) return;
    
    if (isBookPractice && exam?.bookId) {
        const bId = typeof exam.bookId === 'object' ? exam.bookId._id : exam.bookId;
        const langParam = internalLanguage ? `&lang=${internalLanguage}` : '';
        fetch(`/api/typing/practice?type=BOOK&bookId=${bId}${langParam}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
               const sorted = data.sort((a: any, b: any) => a.title.localeCompare(b.title));
               setPassagesList(sorted);
               const foundIdx = sorted.findIndex((p: any) => p._id?.toString() === exam._id?.toString());
               if (foundIdx !== -1) {
                   setCurrentPassageIndex(foundIdx);
                   setCurrentExam(sorted[foundIdx]);
               }
            }
          })
          .catch(e => console.error("Failed to load book chapters", e));
        return;
    }

    // For Gov / Special exams: fetch all related exercises in that language stream
    let query = '';
    if (exam) {
        let gId: string | null = null;
        if (exam.govExamId) {
            if (typeof exam.govExamId === 'string') {
                gId = exam.govExamId;
            } else if (typeof exam.govExamId === 'object' && exam.govExamId !== null) {
                gId = (exam.govExamId as any)._id?.toString() || (exam.govExamId as any).id?.toString() || null;
            }
        }
        
        let cId: string | null = null;
        if (exam.govExamCategoryId) {
            if (typeof exam.govExamCategoryId === 'string') {
                cId = exam.govExamCategoryId;
            } else if (typeof exam.govExamCategoryId === 'object' && exam.govExamCategoryId !== null) {
                cId = (exam.govExamCategoryId as any)._id?.toString() || (exam.govExamCategoryId as any).id?.toString() || null;
            }
        }
        
        const catVal = exam.category || (typeof exam.govExamId === 'object' && exam.govExamId ? ((exam.govExamId as any).category || (exam.govExamId as any).title) : '') || '';
        const cat = catVal ? encodeURIComponent(catVal) : '';
        const rawLang = exam.language || config.language || 'English';
        const queryLang = rawLang.toLowerCase().includes('hindi') ? 'Hindi' : 'English';

        if (cId) {
            query = `?govExamCategoryId=${cId}&language=${queryLang}&all=true`;
        } else if (gId && cat) {
            query = `?govExamId=${gId}&category=${cat}&language=${queryLang}&all=true`;
        } else if (gId) {
            query = `?govExamId=${gId}&language=${queryLang}&all=true`;
        } else if (cat) {
            query = `?category=${cat}&language=${queryLang}&all=true`;
        } else {
            query = `?language=${queryLang}&all=true`;
        }
    }

    fetch(`/api/typing/exams${query}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
           const sorted = data.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
           setPassagesList(sorted);
           const foundIdx = sorted.findIndex((e: any) => e._id?.toString() === exam?._id?.toString());
           if (foundIdx !== -1) {
               setCurrentPassageIndex(foundIdx);
               setCurrentExam(sorted[foundIdx]);
           }
        } else if (exam) {
           setPassagesList([exam]);
           setCurrentPassageIndex(0);
        }
      })
      .catch(e => {
        console.error("Failed to load related exercises", e);
        if (exam) {
           setPassagesList([exam]);
           setCurrentPassageIndex(0);
        }
      });
  }, [showExerciseSwitcher, isBookPractice, exam]);

  useEffect(() => {
    setInternalPassage(passage);
    setInternalDuration(config.duration);
    setInternalLanguage(config.language || 'English');
    setInternalLayout(config.layout || 'English');
    setCurrentExam(exam);
  }, [passage, config.duration, config.language, config.layout, exam]);

  const selectExercise = (newItem: any, newIdx: number) => {
    if (newItem.isAccessible === false) {
       setLockedTargetExam(newItem);
       setShowPaywallModal(true);
       toast.error("🔒 Subscription required for this exercise");
       return;
    }
    setCurrentPassageIndex(newIdx);
    setCurrentExam(newItem);
    setInternalPassage(isBookPractice ? (newItem.content || '') : (newItem.passageId?.content || 'No content found'));
    
    const targetLang = newItem.language || config.language || 'English';
    const targetLayout = targetLang.toLowerCase().includes('hindi') ? 'Inscript' : 'English';
    setInternalLanguage(targetLang);
    setInternalLayout(targetLayout);
    updateSettings({ duration: internalDuration, language: targetLang, layout: targetLayout });
  };
  
  useEffect(() => {
    if (!containerRef.current) return;
    if (isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isFullScreen]);

  useEffect(() => {
    const handleFsChange = () => {
      const isCurrentlyFs = !!document.fullscreenElement;
      if (!isCurrentlyFs && isFullScreen) {
        useTypingStore.setState({ isFullScreen: false });
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullScreen]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (exam && isActive && !isFinished) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exam, isActive, isFinished]);

  const typedWordsArray = typedText.split(/\s+/);
  const activeWordIndex = typedText === '' ? 0 : (typedText.endsWith(' ') ? typedWordsArray.length - 1 : typedWordsArray.length - 1);

  useEffect(() => {
    if (settings.autoScroll && passageContainerRef.current) {
      const activeElement = passageContainerRef.current.querySelector('.active-word') as HTMLElement;
      if (activeElement) {
        const offsetTop = activeElement.offsetTop;
        const containerHalfHeight = passageContainerRef.current.clientHeight / 2;
        passageContainerRef.current.scrollTo({
          top: offsetTop - containerHalfHeight + 20,
          behavior: 'smooth'
        });
      }
    }
  }, [activeWordIndex, settings.autoScroll]);

  // Auto-scroll typing textarea whenever typedText changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  }, [typedText]);

  // 1. Initial Setup & Cleanup
  useEffect(() => {
    resetTest();
    lockedLengthRef.current = 0;
    setPassage(internalPassage);
    updateSettings({
      duration: internalDuration,
      language: (internalLanguage === 'Krutidev Hindi' || internalLanguage === 'Unicode Hindi' || internalLanguage === 'Hindi') ? 'Hindi' : internalLanguage,
      layout: internalLayout || (internalLanguage?.includes('Hindi') ? 'Inscript' : 'English'),
      backspaceMode: config.backspaceMode || 'full',
      highlightMode: config.highlightMode || 'word',
      autoScroll: config.autoScroll !== undefined ? config.autoScroll : true,
      showScrollbar: config.showScrollbar !== undefined ? config.showScrollbar : true,
      sourcePosition: config.sourcePosition || 'top',
      examMode: config.examMode || 'General',
      wordLimit: config.wordLimit || 0,
    });
    window.scrollTo({ top: 0, behavior: 'instant' });

    // CRITICAL: Cleanup on unmount to prevent state leakage between exams
    return () => {
      resetTest();
      hasSubmitted.current = false;
    };
  }, [internalPassage, internalDuration, internalLanguage, internalLayout, config, resetTest, setPassage, updateSettings]);

  // 2. Handle Completion (Only trigger if the test was actually started/active)
  useEffect(() => {
    // Only trigger completion if isFinished is true AND we have some progress/activity
    // to prevent auto-submission of previous results on mount
    if (isFinished && !hasSubmitted.current && (typedText.length > 0 || timeLeft === 0)) {
      hasSubmitted.current = true;
      toast.success("Examination Completed!");
      onComplete({
        wpm,
        rawWpm,
        netWpm,
        grossWpm,
        accuracy,
        errorCount,
        totalCharacters: typedText.length,
        backspaces: backspaceCount,
        submittedText: typedText,
        timeTaken: (settings.duration * 60) - timeLeft,
        examId: passagesList[currentPassageIndex]?._id,
        passageId: passagesList[currentPassageIndex]?._id
      });
    }
  }, [isFinished, accuracy, backspaceCount, currentPassageIndex, errorCount, onComplete, passagesList, rawWpm, netWpm, grossWpm, settings.duration, timeLeft, typedText, wpm]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive && !isFinished && timeLeft > 0) {
      startTest();
    }
    resetIdleTimer();

    const val = e.target.value;
    const isDeletion = val.length < typedText.length;

    // Enforce backspace mode restrictions on input change
    if (isDeletion) {
      if (settings.backspaceMode === 'disabled') return;
      if (settings.backspaceMode === 'word') {
        if (typedText.endsWith(' ') && !val.endsWith(' ')) return;
      }
      if (settings.backspaceMode === 'upssssc') {
        if (val.length < lockedLengthRef.current) return;
      }
    }

    setTypedText(val);

    // Update lockedLengthRef monotonically
    if (settings.backspaceMode === 'upssssc') {
      const spaceIndices: number[] = [];
      for (let i = 0; i < val.length; i++) {
        if (val[i] === ' ' || val[i] === '\n') {
          spaceIndices.push(i);
        }
      }
      const S = spaceIndices.length;
      if (S >= 2) {
        const thresh = spaceIndices[S - 2] + 1;
        lockedLengthRef.current = Math.max(lockedLengthRef.current, thresh);
      }
    }
    
    if (inputRef.current) {
        inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isActive && !isFinished && timeLeft > 0) {
      startTest();
    }
    resetIdleTimer();

    // 1. Physical Inscript Mapping (Government Exam Standard)
    if (settings.layout === 'Inscript' && settings.language === 'Hindi') {
        const mappedChar = mapEventToInscript(e);
        if (mappedChar) {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const val = typedText;
            const newVal = val.substring(0, start) + mappedChar + val.substring(end);
            
            setTypedText(newVal);
            
            // Re-sync cursor position after render
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.selectionStart = inputRef.current.selectionEnd = start + mappedChar.length;
                }
            }, 0);
            return;
        }
    }

    if (e.key === 'Backspace') {
      if (settings.backspaceMode === 'disabled') {
        e.preventDefault();
        return;
      }
      
      if (settings.backspaceMode === 'word') {
        if (typedText.endsWith(' ')) {
          e.preventDefault();
          return;
        }
      }

      if (settings.backspaceMode === 'upssssc') {
        if (typedText.length <= lockedLengthRef.current) {
          e.preventDefault();
          return;
        }
      }
      incrementBackspace();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (config.disableCopyPaste !== false) e.preventDefault();
    }
  };

  const [fontSize, setFontSize] = useState(16);
  const [bgColor, setBgColor] = useState('#ffffff');

  const isUnicodeHindi = settings.language === 'Unicode Hindi' || settings.language === 'Hindi';
  const isKrutidev = settings.language === 'Krutidev Hindi';
  const typingFont = isUnicodeHindi 
    ? "'Mangal', 'Nirmala UI', 'Arial Unicode MS', sans-serif" 
    : (isKrutidev ? "'Kruti Dev 010', 'Krutidev', sans-serif" : "inherit");

  const passageWords = (internalPassage || "").trim().split(/\s+/);

  const [instituteLogo, setInstituteLogo] = useState<string | null>(null);

  useEffect(() => {
    import('@/app/actions/layoutContent').then(({ getHeaderFooterData }) => {
      getHeaderFooterData().then(res => {
        if (res.success && res.header.logoImage) {
          setInstituteLogo(res.header.logoImage);
        }
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col bg-white font-sans h-screen overflow-hidden">
      
      {/* Header - Fixed Height to prevent shaking */}
      <div className="h-16 md:h-20 bg-[#007bff] text-white px-6 flex justify-between items-center shadow-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Institute Logo */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl overflow-hidden relative p-1">
                {instituteLogo ? (
                  <img src={instituteLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400">LOGO</span>
                  </div>
                )}
              </div>
              {/* Exam Logo */}
              {exam?.logo && (
                <div className="flex items-center gap-3">
                  <div className="w-px h-8 bg-white/20" />
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl overflow-hidden relative p-1">
                    <img src={exam.logo} alt="Exam Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
            <div className="ml-2">
              <h2 className="font-black text-sm md:text-lg uppercase tracking-tighter leading-none">{config.title}</h2>
              <p className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-widest hidden md:block">NGIT Examination Portal</p>
            </div>
            <div className="h-6 w-px bg-white/20 mx-2" />
            <div className="flex items-center gap-2">
               <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold">-</button>
               <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
               <button onClick={() => setFontSize(f => Math.min(32, f + 2))} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold">+</button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
               <span className="text-[10px] font-black uppercase opacity-60">Layout:</span>
               <span className="text-xs font-bold">{settings.layout}</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden relative border border-white/20 shadow-inner">
                  {userImage ? (
                      <img src={userImage} alt="Candidate" className="w-full h-full object-cover" />
                   ) : (
                      <Keyboard className="w-5 h-5 text-white" />
                   )}
               </div>
               <div className="text-right">
                  <p className="text-[8px] font-black opacity-60 uppercase leading-none mb-1">Student</p>
                  <p className="text-xs font-bold leading-none">{userName}</p>
               </div>
            </div>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full relative">
        <div className="hidden lg:flex w-80 bg-slate-50 border-r border-slate-200 p-6 flex-col gap-6 overflow-y-auto shrink-0">
          <TimerDisplay />
          <Speedometer />
          <LiveDashboard />
          
          <div className="mt-auto pt-6 border-t border-slate-200">
             <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Target Pattern</p>
                <p className="text-sm font-bold text-indigo-900">{exam?.examMode || 'General'} Standard</p>
             </div>
          </div>
        </div>

        <div className={cn(
          "flex-1 p-4 md:p-6 flex gap-6 overflow-hidden bg-white",
          settings.sourcePosition === 'top' && "flex-col",
          settings.sourcePosition === 'bottom' && "flex-col-reverse",
          settings.sourcePosition === 'left' && "flex-row",
          settings.sourcePosition === 'right' && "flex-row-reverse"
        )}
        onContextMenu={(e) => config.disableRightClick !== false && e.preventDefault()}
        >
          {showExerciseSwitcher && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-wrap items-center gap-6 text-sm font-bold text-slate-600 mb-2">
              <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase opacity-60">Duration:</span>
                  {isOfficialExam ? (
                    <span className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 font-extrabold select-none">
                      {internalDuration} Minutes
                    </span>
                  ) : (
                    <select 
                      value={internalDuration} 
                      onChange={(e) => setInternalDuration(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer font-bold text-slate-900"
                      disabled={isActive && !isFinished && typedText.length > 0}
                    >
                      {[1, 2, 3, 4, 5, 10, 15, 20].map(min => (
                        <option key={min} value={min}>{min} Minutes</option>
                      ))}
                    </select>
                  )}
              </div>
              <div className="flex items-center gap-3 flex-1">
                  <span className="text-[10px] font-black uppercase opacity-60">Exercise:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <button 
                        onClick={() => {
                          if (currentPassageIndex > 0) {
                              const newIdx = currentPassageIndex - 1;
                              selectExercise(passagesList[newIdx], newIdx);
                          }
                        }}
                        disabled={currentPassageIndex <= 0 || (isActive && !isFinished && typedText.length > 0)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 transition-all font-black"
                    >&larr;</button>
                    <select 
                        value={currentPassageIndex}
                        onChange={(e) => {
                          const newIdx = Number(e.target.value);
                          selectExercise(passagesList[newIdx], newIdx);
                        }}
                        disabled={isActive && !isFinished && typedText.length > 0}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer font-bold text-slate-900 truncate"
                    >
                        {passagesList.length > 0 ? (
                          passagesList.map((p, i) => {
                             const isLocked = p.isAccessible === false;
                             const langTag = p.language?.toLowerCase().includes('hindi') ? '[HI]' : '[EN]';
                             const titleText = p.title || `Passage ${i + 1}`;
                             const truncated = titleText.length > 25 ? titleText.substring(0, 25) + '...' : titleText;
                             const displayLabel = isBookPractice 
                                ? `Chapter ${i + 1} ${langTag}: ${truncated} ${isLocked ? '🔒 (Locked)' : ''}` 
                                : `Exercise ${i + 1} ${langTag}: ${truncated} ${isLocked ? '🔒 (Locked)' : ''}`;

                             return (
                                <option key={p._id || i} value={i}>
                                    {displayLabel}
                                </option>
                             );
                          })
                        ) : (
                          <option value={0}>Loading Exercises...</option>
                        )}
                    </select>
                    <button 
                        onClick={() => {
                          if (currentPassageIndex < passagesList.length - 1) {
                              const newIdx = currentPassageIndex + 1;
                              selectExercise(passagesList[newIdx], newIdx);
                          }
                        }}
                        disabled={currentPassageIndex >= passagesList.length - 1 || (isActive && !isFinished && typedText.length > 0)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 transition-all font-black"
                    >&rarr;</button>
                  </div>
              </div>
            </div>
          )}
          <div 
            ref={passageContainerRef}
            className={cn(
              "relative bg-slate-50 border border-slate-200 rounded-[2rem] p-8 overflow-y-auto text-slate-800 leading-[2.5] break-words scroll-smooth shadow-sm",
              (settings.sourcePosition === 'left' || settings.sourcePosition === 'right') ? "w-1/2 h-full" : "w-full h-1/2"
            )}
            style={{ 
              fontSize: `${fontSize}px`,
              scrollbarWidth: settings.showScrollbar ? 'auto' : 'none',
              fontFamily: typingFont
            }}
            onCopy={(e) => config.disableCopyPaste !== false && e.preventDefault()}
          >
            {settings.highlightMode !== 'none' ? (
              passageWords.map((word, index) => {
                let className = "transition-all duration-200 inline-block ";
                
                if (settings.highlightMode === 'word') {
                  if (index === activeWordIndex) {
                      className += "text-indigo-600 font-bold active-word underline decoration-indigo-300 decoration-4 underline-offset-8";
                  } else if (index < activeWordIndex) {
                      const normTypedWord = typedWordsArray[index].split('').map(normalizeChar).join('');
                      const normOriginalWord = word.split('').map(normalizeChar).join('');
                      if (normTypedWord !== normOriginalWord) {
                          className += "text-rose-600 font-bold underline decoration-rose-400";
                      }
                  }
                } 
                else if (settings.highlightMode === 'word_error') {
                   if (index < activeWordIndex) {
                      className += typedWordsArray[index] === word ? "text-emerald-600 font-bold" : "text-rose-600 font-bold underline decoration-rose-400";
                   } else if (index === activeWordIndex) {
                      const currentTyped = typedWordsArray[index] || "";
                      return (
                          <span key={index} className="active-word text-indigo-600 underline decoration-indigo-300 decoration-4 underline-offset-8 font-bold">
                              {word.split('').map((char, charIdx) => {
                                  let charClass = "";
                                  if (charIdx < currentTyped.length) {
                                    charClass = normalizeChar(char) === normalizeChar(currentTyped[charIdx]) ? "text-emerald-600" : "text-rose-600 bg-rose-50";
                                  }
                                  return <span key={charIdx} className={charClass}>{char}</span>;
                              })}
                              {" "}
                          </span>
                      );
                   }
                }
                else if (settings.highlightMode === 'letter') {
                    if (index < activeWordIndex) {
                      className += "opacity-40 ";
                    } else if (index === activeWordIndex) {
                      const currentTyped = typedWordsArray[index] || "";
                      return (
                          <span key={index} className="active-word font-bold">
                              {word.split('').map((char, charIdx) => {
                                  let charClass = "text-slate-400";
                                  if (charIdx < currentTyped.length) {
                                    charClass = normalizeChar(char) === normalizeChar(currentTyped[charIdx]) ? "text-emerald-600" : "text-rose-600 underline";
                                  } else if (charIdx === currentTyped.length) {
                                      charClass = "text-white bg-indigo-600 rounded-sm ring-4 ring-indigo-100";
                                  }
                                  return <span key={charIdx} className={charClass}>{char}</span>;
                              })}
                              {" "}
                          </span>
                      );
                    }
                }

                return (
                  <span key={index} className={className}>
                    {word}{" "}
                  </span>
                );
              })
            ) : (
              internalPassage
            )}
          </div>

          <div className={cn(
            "relative flex flex-col",
            (settings.sourcePosition === 'left' || settings.sourcePosition === 'right') ? "w-1/2 h-full" : "w-full h-1/2"
          )}>
            <textarea
                ref={inputRef}
                value={typedText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onPaste={(e) => config.disableCopyPaste !== false && e.preventDefault()}
                disabled={isFinished}
                spellCheck={false}
                autoComplete="off"
                placeholder="Start typing here..."
                className="flex-1 border-2 border-slate-200 rounded-[2rem] p-8 overflow-y-auto outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-slate-900 font-semibold leading-relaxed resize-none shadow-sm transition-all duration-300"
                style={{ 
                  fontSize: `${fontSize + 2}px`, 
                  backgroundColor: bgColor,
                  scrollbarWidth: settings.showScrollbar ? 'auto' : 'none',
                  fontFamily: typingFont
                }}
            />
            
            <div className="lg:hidden absolute bottom-6 right-6 flex items-center gap-3">
               <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-xs shadow-xl">
                  {wpm} WPM
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border-t border-slate-200 flex justify-center items-center shadow-2xl relative z-20 shrink-0">
        <div className="flex items-center gap-4 max-w-[1920px] mx-auto w-full justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-rose-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center">
               &larr;
            </div>
            Exit Exam
          </button>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => endTest()}
                className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
            >
                Submit Exam
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                   &check;
                </div>
            </button>
            
            <button 
                onClick={() => {
                if (confirm("Are you sure you want to reset the test? Current progress will be lost.")) {
                    resetTest();
                }
                }}
                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200"
                title="Reset Test"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
             Official Exam Mode <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Subscription Paywall Modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden">
             <button 
                onClick={() => setShowPaywallModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
             >
                ✕
             </button>
             
             <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
                <span className="text-3xl">🔒</span>
             </div>

             <h3 className="text-2xl font-black text-slate-900 mb-2">Exercise Locked</h3>
             <p className="text-sm font-medium text-slate-500 mb-6">
                <span className="font-bold text-slate-800">"{lockedTargetExam?.title || "This Passage"}"</span> requires an active NGIT Typing Subscription. Purchase a plan to unlock all passages!
             </p>

             <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <span className="text-emerald-500 font-extrabold">✓</span> Access 100+ Official Exam Passages
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <span className="text-emerald-500 font-extrabold">✓</span> Real Government Exam Pattern Engine
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <span className="text-emerald-500 font-extrabold">✓</span> Detailed Speed & Accuracy Reports
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <a 
                  href="/student/typing/subscribe" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  Buy Subscription Now (₹21 / Month) &rarr;
                </a>
                <button 
                  onClick={() => setShowPaywallModal(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors"
                >
                  Continue Free Practice
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
