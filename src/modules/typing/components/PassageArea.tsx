import React, { useEffect, useRef, useMemo } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { cn } from '@/lib/utils';
import { alignWords, normalizeChar } from '../utils/calculations';

/**
 * PassageArea Component
 * Displays the master text for the typing exam.
 * Features: High-visibility highlighting, Responsive scaling, Auto-scroll.
 */
export const PassageArea: React.FC = () => {
  const { passage, typedText, settings, updateSettings } = useTypingStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const words = useMemo(
    () => (passage || "").trim().split(/\s+/).filter((w) => w.length > 0),
    [passage]
  );
  const alignment = useMemo(() => {
    return alignWords(words, typedText);
  }, [words, typedText]);
  const currentWordIdx = alignment.activeOriginalIndex;

  // Auto-scroll logic: Keeps the current word centered
  useEffect(() => {
    if (settings.autoScroll && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('.active-word') as HTMLElement;
      if (activeElement) {
        const container = scrollRef.current;
        const offsetTop = activeElement.offsetTop;
        const containerHalfHeight = container.clientHeight / 2;
        container.scrollTo({
          top: offsetTop - containerHalfHeight + 20, // slightly offset to keep above center
          behavior: 'smooth'
        });
      }
    }
  }, [typedText, settings.autoScroll]);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
      {/* Passage Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Exam Text Passage</span>
            <span className="text-[9px] font-bold text-slate-300">Word Count: {words.length}</span>
        </div>
        

      </div>

      {/* Scrollable Passage Content */}
      <div 
        ref={scrollRef}
        className={cn(
          "relative flex-1 p-6 sm:p-10 overflow-y-auto leading-relaxed select-none text-black",
          settings.showScrollbar ? "scrollbar-thin scrollbar-thumb-slate-200" : "scrollbar-hide"
        )}
        style={{ 
          fontSize: `calc(${settings.fontSize / 100} * clamp(1.1rem, 2.2vw, 1.6rem))`, 
          fontWeight: 500 
        }} 
      >
        <div className="flex flex-wrap gap-x-3 gap-y-4">
          {words.map((word, i) => {
            const status = alignment.alignedOriginalStatuses[i] || 'pending';

            // Previous words: Full word green/red
            if (i < currentWordIdx) {
                const isCorrect = status === 'correct';
                return (
                  <span key={i} className={cn("transition-all duration-200", isCorrect ? "text-emerald-600" : "text-rose-600 underline decoration-rose-300")}>
                    {word}
                  </span>
                );
            } 
            
            // Current word: Character-by-character feedback
            if (i === currentWordIdx) {
                const currentTypedWord = alignment.currentTypedWord;
                return (
                  <span key={i} className="active-word text-blue-600 underline decoration-blue-400 decoration-4 underline-offset-8">
                    {word.split('').map((char, charIdx) => {
                      let charClass = "text-blue-600"; // default for untyped
                      if (charIdx < currentTypedWord.length) {
                        charClass = normalizeChar(char) === normalizeChar(currentTypedWord[charIdx]) ? "text-emerald-600" : "text-rose-600 bg-rose-50 rounded-sm ring-1 ring-rose-200";
                      }
                      return <span key={charIdx} className={cn("transition-colors duration-75", charClass)}>{char}</span>;
                    })}
                  </span>
                );
            }

            // Future words: Plain black
            return (
              <span key={i} className="text-black opacity-80">
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
