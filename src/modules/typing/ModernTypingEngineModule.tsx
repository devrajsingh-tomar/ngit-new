"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { useTimer } from './hooks/useTimer';
import { useTypingEngine } from './hooks/useTypingEngine';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mapKeyToHindi } from './utils/hindiMapping';
import { LiveDashboard, TimerDisplay } from './components/LiveDashboard';
import { Speedometer } from './components/Speedometer';
import { cn } from '@/lib/utils';
import { Keyboard } from 'lucide-react';

interface ModernTypingEngineModuleProps {
  exam?: any;
  passage: string;
  config: {
    title: string;
    duration: number;
    backspaceMode?: 'full' | 'word' | 'disabled';
    highlightMode?: 'word' | 'word_error' | 'letter' | 'none';
    wordLimit?: number;
    language?: string;
    layout?: 'English' | 'Remington Gail' | 'Inscript' | 'Phonetic';
    autoScroll?: boolean;
    showScrollbar?: boolean;
    sourcePosition?: 'top' | 'left' | 'right' | 'bottom';
    disableCopyPaste?: boolean;
    disableRightClick?: boolean;
  };
  onComplete: (results: any) => void;
  userName?: string;
  showExerciseSwitcher?: boolean;
}

export const ModernTypingEngineModule: React.FC<ModernTypingEngineModuleProps> = ({ 
  exam,
  passage, 
  config,
  onComplete,
  userName = "STUDENT",
  showExerciseSwitcher = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const [passagesList, setPassagesList] = useState<any[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [internalPassage, setInternalPassage] = useState(passage);
  const [internalDuration, setInternalDuration] = useState(config.duration);

  useEffect(() => {
    if (!showExerciseSwitcher) return;
    fetch('/api/admin/typing/passages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
           const sorted = data.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
           setPassagesList(sorted);
           const foundIdx = sorted.findIndex(p => p.content === passage);
           if (foundIdx !== -1) {
             setCurrentPassageIndex(foundIdx);
           }
        }
      })
      .catch(e => console.error("Failed to load passages", e));
  }, [showExerciseSwitcher, passage]);

  useEffect(() => {
    setInternalPassage(passage);
    setInternalDuration(config.duration);
  }, [passage, config.duration]);
  
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

  const activeWordIndex = typedText === '' ? 0 : typedText.split(' ').length - 1;
  const typedWordsArray = typedText.split(' ');

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

  useEffect(() => {
    resetTest();
    setPassage(internalPassage);
    updateSettings({
      duration: internalDuration,
      language: config.language || 'English',
      layout: config.layout || 'English',
      backspaceMode: config.backspaceMode || 'full',
      highlightMode: config.highlightMode || 'word',
      autoScroll: config.autoScroll !== undefined ? config.autoScroll : true,
      showScrollbar: config.showScrollbar !== undefined ? config.showScrollbar : true,
      sourcePosition: config.sourcePosition || 'top',
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [internalPassage, internalDuration, config, resetTest, setPassage, updateSettings]);

  useEffect(() => {
    if (isFinished) {
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
        examId: passagesList[currentPassageIndex]?._id,
        passageId: passagesList[currentPassageIndex]?._id
      });
    }
  }, [isFinished, accuracy, backspaceCount, currentPassageIndex, errorCount, onComplete, passagesList, rawWpm, settings.duration, timeLeft, typedText.length, typedText, wpm]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive && !isFinished && timeLeft > 0) {
      startTest();
    }
    resetIdleTimer();
    
    let val = e.target.value;
    const isDeletion = val.length < typedText.length;

    const isHindi = settings.language === 'Hindi' || settings.language === 'Unicode Hindi' || settings.language === 'Krutidev Hindi';
    if (isHindi && !isDeletion && val.length > typedText.length) {
        const lastChar = val.slice(-1);
        if (/[\x00-\x7F]/.test(lastChar) && lastChar !== ' ' && lastChar !== '\n') {
            const mapped = mapKeyToHindi(lastChar, settings.layout);
            val = val.slice(0, -1) + mapped;
        }
    }

    setTypedText(val);
    
    if (inputRef.current) {
        inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (config.disableCopyPaste !== false) e.preventDefault();
    }
  };

  const [fontSize, setFontSize] = useState(16);
  const [bgColor, setBgColor] = useState('#ffffff');

  const passageWords = internalPassage.split(' ');

  return (
    <div ref={containerRef} className="flex flex-col bg-white font-sans h-screen overflow-hidden">
      
      {/* Header - Fixed Height to prevent shaking */}
      <div className="h-16 md:h-20 bg-[#007bff] text-white px-6 flex justify-between items-center shadow-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-lg uppercase tracking-tighter">{config.title}</h2>
            <div className="h-6 w-px bg-white/20" />
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
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-white" />
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

        <div 
          className={cn(
            "flex-1 p-4 md:p-6 flex gap-6 overflow-hidden bg-white",
            settings.sourcePosition === 'top' && "flex-col",
            settings.sourcePosition === 'bottom' && "flex-col-reverse",
            settings.sourcePosition === 'left' && "flex-row",
            settings.sourcePosition === 'right' && "flex-row-reverse"
          )}
          onContextMenu={(e) => config.disableRightClick !== false && e.preventDefault()}
        >
          <div 
            ref={passageContainerRef}
            className={cn(
              "relative bg-slate-50 border border-slate-200 rounded-[2rem] p-8 overflow-y-auto text-slate-800 leading-[2.5] break-words scroll-smooth shadow-sm",
              (settings.sourcePosition === 'left' || settings.sourcePosition === 'right') ? "w-1/2 h-full" : "w-full h-1/2"
            )}
            style={{ 
              fontSize: `${fontSize}px`,
              scrollbarWidth: settings.showScrollbar ? 'auto' : 'none',
              fontFamily: (settings.layout === 'Remington Gail' || settings.layout === 'Inscript' || settings.language === 'Hindi') 
                ? "'Mangal', 'Arial Unicode MS', sans-serif" 
                : "inherit"
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
                      const typedWord = typedWordsArray[index];
                      if (typedWord !== word) {
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
                                      charClass = char === currentTyped[charIdx] ? "text-emerald-600" : "text-rose-600 bg-rose-50";
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
                                      charClass = char === currentTyped[charIdx] ? "text-emerald-600" : "text-rose-600 underline";
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
                  fontFamily: (settings.layout === 'Remington Gail' || settings.layout === 'Inscript' || settings.language === 'Hindi') 
                    ? "'Mangal', 'Arial Unicode MS', sans-serif" 
                    : "inherit"
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
                Submit Performance
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
    </div>
  );
};
