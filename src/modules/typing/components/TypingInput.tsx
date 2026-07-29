import React from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { cn } from '@/lib/utils';
import { mapKeyToHindi } from '../utils/hindiMapping';

/**
 * TypingInput Component
 * The main interactive zone for the typing exam.
 * Features: Backspace restriction, Keystroke logging, Responsive sizing.
 */
export const TypingInput: React.FC<{ onKeyStroke: () => void }> = ({ onKeyStroke }) => {
  const { 
    passage,
    typedText, 
    setTypedText, 
    settings, 
    isActive, 
    isFinished,
    startTest,
    incrementBackspace
  } = useTypingStore();

  const words = passage.split(/\s+/);
  const typedWords = typedText.split(/\s+/);
  const currentWordIdx = typedWords.length - 1;
  const currentWord = words[currentWordIdx] || "";
  const currentTypedWord = typedWords[currentWordIdx] || "";
  const hasError = currentTypedWord.length > 0 && !currentWord.startsWith(currentTypedWord);

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
      if (settings.backspaceMode === 'upssssc') {
        const typedWords = typedText.split(' ');
        if (typedWords.length >= 3) {
          const lockedWords = typedWords.slice(0, typedWords.length - 2);
          const lockedText = lockedWords.join(' ') + ' ';
          if (typedText.length <= lockedText.length) {
            e.preventDefault();
            return;
          }
        }
      }
      incrementBackspace();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    
    let val = e.target.value;
    const isDeletion = val.length < typedText.length;

    // 0. HINDI MAPPING LOGIC
    const isHindi = settings.language === 'Hindi' || settings.language === 'Unicode Hindi';
    if (isHindi && !isDeletion && val.length > typedText.length) {
        const lastChar = val.slice(-1);
        if (/[\x00-\x7F]/.test(lastChar) && lastChar !== ' ' && lastChar !== '\n') {
            const mapped = mapKeyToHindi(lastChar, settings.layout);
            val = val.slice(0, -1) + mapped;
        }
    }

    if (!isActive && val.length > 0) {
      startTest(); // Auto-start on first key
    }

    // 1. BACKSPACE RESTRICTION LOGIC
    if (isDeletion) {
      if (settings.backspaceMode === 'disabled') return;
      if (settings.backspaceMode === 'word') {
        // Prevent deleting the space that committed the previous word
        if (typedText.endsWith(' ') && !val.endsWith(' ')) return;
      }
      if (settings.backspaceMode === 'upssssc') {
        const typedWords = typedText.split(' ');
        if (typedWords.length >= 3) {
          const lockedWords = typedWords.slice(0, typedWords.length - 2);
          const lockedText = lockedWords.join(' ') + ' ';
          if (val.length < lockedText.length) return;
        }
      }
    }

    // 2. WORD LIMIT LOGIC
    if (settings.wordLimit > 0 && !isDeletion) {
      const currentWordCount = val.trim().split(/\s+/).length;
      if (currentWordCount > settings.wordLimit) return;
    }

    setTypedText(val);
    onKeyStroke(); // Trigger timer reset / activity check
  };

  return (
    <div className={cn(
        "flex flex-col h-full bg-[#d9ff66] rounded-3xl border-2 transition-all duration-300 shadow-lg overflow-hidden",
        hasError ? "border-rose-500 shadow-rose-200 animate-shake" : "border-black/10 focus-within:border-black/30 focus-within:shadow-2xl"
    )}>
      <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-black/5">
        <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">Type the passage below</span>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
             <span className="text-[9px] font-black text-black/40">Layout: {settings.language}</span>
          </div>
        </div>
      </div>

      <textarea
        value={typedText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={isFinished}
        spellCheck={false}
        autoFocus
        placeholder="Start typing here to begin the clock..."
        className={cn(
          "flex-1 p-6 sm:p-10 bg-transparent outline-none resize-none font-bold leading-relaxed transition-all text-black placeholder:text-black/20",
          isFinished ? "opacity-50" : "opacity-100"
        )}
        style={{ fontSize: `calc(${settings.fontSize / 100} * clamp(1.2rem, 2.5vw, 1.8rem))` }} 
      />

      <div className="px-6 py-3 bg-black/5 border-t border-black/5 flex justify-between items-center text-[9px] font-black text-black/60 uppercase tracking-widest">
        <span>Character Count: {typedText.length}</span>
        <span>Backspace Mode: {settings.backspaceMode}</span>
      </div>
    </div>
  );
};
