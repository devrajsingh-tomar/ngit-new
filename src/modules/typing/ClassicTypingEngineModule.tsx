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
import { normalizeChar } from './utils/calculations';

interface ClassicTypingEngineModuleProps {
  exam?: any;
  passage: string;
  config: {
    title: string;
    duration: number;
    backspaceMode?: 'full' | 'word' | 'disabled';
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
  /** When true (default), shows the Duration & Exercise switcher bar.
   *  Set to false for practice sessions (Word/Special/Current) where
   *  the passage is already pre-selected from the selection screen. */
  showExerciseSwitcher?: boolean;
}

export const ClassicTypingEngineModule: React.FC<ClassicTypingEngineModuleProps> = ({ 
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
    backspaceCount,
    incrementBackspace,
    resetTest,
    endTest,
    isActive,
    startTest,
    timeLeft,
    isFullScreen,
    toggleFullScreen
  } = useTypingStore();

  const { resetIdleTimer } = useTimer();
  useTypingEngine();

  const passageContainerRef = useRef<HTMLDivElement>(null);

  const [passagesList, setPassagesList] = useState<any[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [internalPassage, setInternalPassage] = useState(passage);
  const [internalDuration, setInternalDuration] = useState(config.duration);
  const [internalLanguage, setInternalLanguage] = useState(config.language || 'English');
  const [internalLayout, setInternalLayout] = useState(config.layout || 'English');
  const [currentExam, setCurrentExam] = useState(exam);

  const isBookPractice = exam?.section === 'Book' || exam?.category === 'BOOK';

  // Load available exams/passages matching current criteria
  useEffect(() => {
    if (!showExerciseSwitcher) return;
    
    if (isBookPractice && exam?.bookId) {
        // For Book Practice: fetch sibling chapters from the passages API
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

    // For Gov / Special exams: fetch from exams API
    let query = '';
    if (exam) {
        const rawLang = exam.language || config.language || '';
        // Normalize all Hindi variants to "Hindi" so the API regex matches ALL of them,
        // causing all Hindi exercises (Unicode Hindi, Mangal Hindi, Krutidev Hindi, Hindi)
        // to appear together in the exercise switcher dropdown.
        const queryLang = rawLang.toLowerCase().includes('hindi') ? 'Hindi' : rawLang;
        if (exam.govExamId) {
            query = `?govExamId=${exam.govExamId}&language=${queryLang}`;
            if (exam.difficulty) query += `&difficulty=${exam.difficulty}`;
        } else if (exam.category === 'SPECIAL') {
            query = `?category=SPECIAL&language=${queryLang}`;
        }
    }

    fetch(`/api/typing/exams${query}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
           const sorted = data.sort((a,b) => a.title.localeCompare(b.title));
           setPassagesList(sorted);
           const foundIdx = sorted.findIndex(e => e._id === exam?._id);
           if (foundIdx !== -1) {
               setCurrentPassageIndex(foundIdx);
               setCurrentExam(sorted[foundIdx]);
           }
        }
      })
      .catch(e => console.error("Failed to load related exercises", e));
  }, [showExerciseSwitcher, isBookPractice, exam, config.language]);


  // Sync internal state with props if they change
  useEffect(() => {
    setInternalPassage(passage);
    setInternalDuration(config.duration);
    setInternalLanguage(config.language || 'English');
    setInternalLayout(config.layout || 'English');
    setCurrentExam(exam);
  }, [passage, config.duration, config.language, config.layout, exam]);
  
  // Handle Fullscreen natively
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

  // Sync state if user exits fullscreen via ESC key
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

  // Prevent accidental page leave during official exams
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (currentExam && isActive && !isFinished) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentExam, isActive, isFinished]);

  // Calculate current word based on spaces typed
  const typedWordsArray = typedText.split(/\s+/);
  const activeWordIndex = typedText === '' ? 0 : typedWordsArray.length - 1;

  // Auto-scroll passage area and textarea
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
    });
    // Scroll window to top so the exam starts from the top area
    window.scrollTo({ top: 0, behavior: 'instant' });

    // CRITICAL: Cleanup on unmount to prevent state leakage between exams
    return () => {
      resetTest();
      hasSubmitted.current = false;
    };
  }, [internalPassage, internalDuration, internalLanguage, internalLayout, config]);

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
        accuracy,
        errorCount,
        totalCharacters: typedText.length,
        backspaces: backspaceCount,
        submittedText: typedText,
        timeTaken: (settings.duration * 60) - timeLeft,
        examId: currentExam?._id,
        passageId: isBookPractice ? currentExam?._id : currentExam?.passageId?._id
      });
    }
  }, [isFinished, onComplete, wpm, rawWpm, accuracy, errorCount, typedText, backspaceCount, settings.duration, timeLeft, currentExam, isBookPractice]);
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive && !isFinished && timeLeft > 0) {
      startTest();
    }
    resetIdleTimer();
    setTypedText(e.target.value);
    
    // Auto-scroll typing textarea
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
      incrementBackspace();
    }
    
    // Prevent paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [fontSize, setFontSize] = useState(16);
  const [bgColor, setBgColor] = useState('#ffffff');

  const isUnicodeHindi = settings.language === 'Unicode Hindi' || settings.language === 'Hindi';
  const isKrutidev = settings.language === 'Krutidev Hindi';
  
  const typingFont = isUnicodeHindi 
    ? "'Mangal', 'Nirmala UI', 'Arial Unicode MS', sans-serif" 
    : (isKrutidev ? "'Kruti Dev 010', 'Krutidev', sans-serif" : "inherit");

  const passageWords = (internalPassage || "").trim().split(/\s+/);

  return (
    <div ref={containerRef} className={`flex flex-col bg-[#f0f0f0] font-sans ${isFullScreen ? 'h-screen' : 'min-h-screen'}`}>
      {/* Top Blue Header */}
      <div className="bg-[#007bff] text-white text-center py-2 text-sm font-bold shadow-sm">
        Typing Test Id {currentExam?.passageId?._id?.substring(0, 5) || '31848'} - {config.title}
      </div>

      {/* Second Black Header */}
      <div className="bg-black text-white px-4 py-1 text-xs font-bold">
        {currentExam?.title || 'Official Typing Test'}
      </div>

      {/* Third Header (Controls & Timer) */}
      <div className="bg-white px-6 py-2 flex justify-between items-center border-b border-gray-300 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={toggleFullScreen} className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all flex items-center gap-2 shadow-sm shadow-slate-200" title={isFullScreen ? "Exit Exam Mode" : "Activate Exam Mode"}>
               <div className={cn("w-2 h-2 rounded-full animate-pulse", isFullScreen ? "bg-rose-500" : "bg-emerald-500")} />
               {isFullScreen ? "Exit Exam Mode" : "Exam Mode"}
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-gray-50">
            <span className="text-xs font-bold text-gray-600 mr-1">Text Size:</span>
            <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded text-xs font-bold text-gray-700 shadow-sm">-</button>
            <span className="text-xs font-bold w-6 text-center text-gray-800">{fontSize}px</span>
            <button onClick={() => setFontSize(f => Math.min(32, f + 2))} className="w-5 h-5 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded text-xs font-bold text-gray-700 shadow-sm">+</button>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-gray-50">
            <span className="text-xs font-bold text-gray-600 mr-1">Bg Color:</span>
            <div className="flex gap-1">
              {['#a1c984', '#e2e8f0', '#ffffff', '#fef3c7', '#dbeafe', '#ffebcd'].map(color => (
                <button 
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={`w-5 h-5 rounded border shadow-sm transition-transform hover:scale-110 ${bgColor === color ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                  title="Change typing area color"
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm font-bold flex items-center gap-2">
            Time left:- <span className="text-lg">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-10 h-10 bg-gray-200 rounded border border-gray-400 overflow-hidden flex items-center justify-center relative">
                {userImage ? (
                   <img src={userImage} alt="Candidate" className="w-full h-full object-cover" />
                ) : (
                   <svg className="w-8 h-8 text-gray-500 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                )}
             </div>
             <span className="text-[10px] font-bold uppercase mt-1">{userName}</span>
          </div>
        </div>
      </div>

      {/* Fourth Header (Layout & Language) */}
      <div className="bg-[#007bff] text-white px-6 py-1 flex gap-8 text-xs font-bold border-b-2 border-blue-800">
        <span>Keyboard Layout: {settings.layout}</span>
        <span>Language: {settings.language}</span>
      </div>

      {/* Exercise and Duration Controls – only in official exam mode */}
      {showExerciseSwitcher && (
        <div className="bg-[#e0e0e0] border-b border-gray-400 p-2 flex flex-wrap items-center gap-6 text-sm font-bold text-gray-800 shadow-sm relative z-10 px-6">
          <div className="flex items-center gap-2">
              <span className="text-gray-700">Duration:</span>
              <select 
                value={internalDuration} 
                onChange={(e) => setInternalDuration(Number(e.target.value))}
                className="border border-gray-400 px-2 py-1 bg-white outline-none min-w-[120px] focus:ring-2 focus:ring-blue-500 cursor-pointer"
                disabled={isActive && !isFinished && typedText.length > 0}
              >
                {[1, 2, 3, 4, 5, 10, 15, 20].map(min => (
                  <option key={min} value={min}>{min} Minutes</option>
                ))}
              </select>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-[400px]">
              <span className="text-gray-700">Exercise:</span>
              <div className="flex items-center gap-1 w-full">
                 <button 
                    onClick={() => {
                       if (currentPassageIndex > 0) {
                          const newIdx = currentPassageIndex - 1;
                          setCurrentPassageIndex(newIdx);
                          const newItem = passagesList[newIdx];
                          setCurrentExam(newItem);
                          setInternalPassage(isBookPractice ? (newItem.content || '') : (newItem.passageId?.content || 'No content found'));
                          setInternalLanguage(newItem.language || config.language || 'English');
                          updateSettings({ duration: internalDuration, language: newItem.language || config.language });
                       }
                    }}
                    disabled={currentPassageIndex <= 0 || (isActive && !isFinished && typedText.length > 0)}
                    className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-3 py-1 disabled:opacity-50 transition-colors cursor-pointer"
                 >&lt;&lt;</button>
                 <select 
                    value={currentPassageIndex}
                    onChange={(e) => {
                       const newIdx = Number(e.target.value);
                       setCurrentPassageIndex(newIdx);
                        const newItem = passagesList[newIdx];
                        setCurrentExam(newItem);
                        setInternalPassage(isBookPractice ? (newItem.content || '') : (newItem.passageId?.content || 'No content found'));
                        setInternalLanguage(newItem.language || config.language || 'English');
                        updateSettings({ duration: internalDuration, language: newItem.language || config.language });

                    }}
                    disabled={isActive && !isFinished && typedText.length > 0}
                    className="border border-gray-400 px-2 py-1 bg-white outline-none flex-1 focus:ring-2 focus:ring-blue-500 min-w-0 truncate cursor-pointer"
                 >
                    {passagesList.length > 0 ? (
                      passagesList.map((p, i) => (
                         <option key={p._id || i} value={i}>
                            {isBookPractice ? `Ch. ${i + 1}/${passagesList.length} - ${p.title?.substring(0, 40)}` : `Exercise: ${i + 1}/${passagesList.length} - ${p.title?.substring(0, 30)}`}

                         </option>
                      ))
                    ) : (
                      <option value={0}>Loading Exercises...</option>
                    )}
                 </select>
                 <button 
                    onClick={() => {
                       if (currentPassageIndex < passagesList.length - 1) {
                          const newIdx = currentPassageIndex + 1;
                          setCurrentPassageIndex(newIdx);
                           const newItem = passagesList[newIdx];
                           setCurrentExam(newItem);
                           setInternalPassage(isBookPractice ? (newItem.content || '') : (newItem.passageId?.content || 'No content found'));
                           setInternalLanguage(newItem.language || config.language || 'English');
                           updateSettings({ duration: internalDuration, language: newItem.language || config.language });
                       }
                    }}
                    disabled={currentPassageIndex >= passagesList.length - 1 || (isActive && !isFinished && typedText.length > 0)}
                    className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-3 py-1 disabled:opacity-50 transition-colors cursor-pointer"
                 >&gt;&gt;</button>
              </div>
          </div>
        </div>
      )}

      {/* Main Typing Area */}
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 max-w-[1400px] mx-auto w-full min-h-0">
        {/* Passage Box */}
        <div 
            ref={passageContainerRef}
            className="flex-1 relative bg-white border border-gray-400 p-4 overflow-y-auto text-gray-800 leading-relaxed break-words scroll-smooth"
            style={{ 
              fontSize: `${fontSize}px`, 
              fontFamily: typingFont,
              minHeight: '200px',
              scrollbarWidth: settings.showScrollbar ? 'auto' : 'none'
            }}
            onCopy={(e) => config.disableCopyPaste !== false && e.preventDefault()}
        >
          {settings.highlightMode !== 'none' ? (
            passageWords.map((word, index) => {
              let className = "transition-all duration-200 ";
              
              if (settings.highlightMode === 'word') {
                if (index === activeWordIndex) {
                    className += "text-blue-600 font-bold active-word underline decoration-blue-300 decoration-2 underline-offset-4";
                } else if (index < activeWordIndex) {
                    const typedWord = typedWordsArray[index];
                    const normTypedWord = typedWord.split('').map(normalizeChar).join('');
                    const normOriginalWord = word.split('').map(normalizeChar).join('');
                    if (normTypedWord !== normOriginalWord) {
                        className += "text-red-600 font-bold underline decoration-red-400";
                    }
                }
              } 
              else if (settings.highlightMode === 'word_error') {
                 if (index < activeWordIndex) {
                    className += typedWordsArray[index] === word ? "text-emerald-600 font-bold" : "text-rose-600 font-bold underline decoration-rose-400";
                 } else if (index === activeWordIndex) {
                    const currentTyped = typedWordsArray[index] || "";
                    return (
                        <span key={index} className="active-word text-blue-600 underline decoration-blue-300 decoration-4 underline-offset-8 font-bold">
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
                                let charClass = "text-gray-400";
                                if (charIdx < currentTyped.length) {
                                    charClass = normalizeChar(char) === normalizeChar(currentTyped[charIdx]) ? "text-emerald-600" : "text-rose-600 underline";
                                } else if (charIdx === currentTyped.length) {
                                    charClass = "text-white bg-blue-600 rounded-sm ring-2 ring-blue-300";
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

        {/* Typing Box */}
        <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => config.disableCopyPaste !== false && e.preventDefault()}
            disabled={isFinished}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 border-2 border-gray-400 p-4 overflow-y-auto outline-none focus:border-blue-600 text-black font-semibold leading-relaxed resize-none shadow-inner transition-colors duration-300"
            style={{ 
              fontSize: `${fontSize + 2}px`, 
              backgroundColor: bgColor,
              scrollbarWidth: settings.showScrollbar ? 'auto' : 'none',
              fontFamily: typingFont
            }}
        />
      </div>

      {/* Footer Controls */}
      <div className="bg-[#f0f0f0] p-4 border-t border-gray-300 flex justify-center items-center relative h-16">
        <div className="flex items-center gap-4 max-w-[1400px] mx-auto w-full justify-center relative">
          <button 
            onClick={() => {
              // Navigate back to typing listing, or previous exam listing if navigated from there
              if (document.referrer && document.referrer.includes('/typing/official')) {
                router.back();
              } else {
                router.push('/typing');
              }
            }}
            className="absolute left-0 bg-[#dc3545] text-white px-8 py-2 rounded text-sm font-bold hover:bg-[#c82333] transition-colors"
          >
            Back
          </button>
          
          <button 
            onClick={() => endTest()}
            className="bg-[#337ab7] text-white px-10 py-2 rounded text-sm font-bold hover:bg-[#286090] transition-colors"
          >
            Submit Exam
          </button>
          
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to reset the test? Current progress will be lost.")) {
                resetTest();
              }
            }}
            className="absolute right-0 w-8 h-8 bg-[#9b59b6] rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-[#8e44ad] transition-colors shadow-lg"
            title="Reset Test"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
