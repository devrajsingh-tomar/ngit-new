import React, { useEffect } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { useTimer } from './hooks/useTimer';
import { useTypingEngine } from './hooks/useTypingEngine';

// Components
import { TypingLayout } from './components/TypingLayout';
import { PassageArea } from './components/PassageArea';
import { TypingInput } from './components/TypingInput';
import { LiveDashboard, TimerDisplay } from './components/LiveDashboard';
import { Speedometer } from './components/Speedometer';
import { SettingsManager } from './components/SettingsManager';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface TypingEngineModuleProps {
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
  };
  onComplete: (results: any) => void;
}

/**
 * TypingEngineModule
 * THE MASTER COMPONENT
 * Integrates all phases into a single production-ready typing exam module.
 */
export const TypingEngineModule: React.FC<TypingEngineModuleProps> = ({ 
  passage, 
  config,
  onComplete 
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { 
    setPassage, 
    updateSettings, 
    isFinished, 
    wpm, 
    accuracy, 
    errorCount, 
    typedText,
    settings,
    rawWpm,
    backspaceCount,
    resetTest,
    isFullScreen,
    endTest,
    isActive,
    timeLeft
  } = useTypingStore();

  // Initialize Hooks
  const { resetIdleTimer } = useTimer();
  useTypingEngine();

  // Handle Native Fullscreen API on the container itself
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

  // 1. Initial Setup
  useEffect(() => {
    resetTest();
    setPassage(passage);
    updateSettings({
      duration: config.duration,
      language: config.language || 'English',
      layout: config.layout || 'English',
      backspaceMode: config.backspaceMode || 'full',
      highlightMode: config.highlightMode || 'word',
      autoScroll: config.autoScroll !== undefined ? config.autoScroll : true,
      showScrollbar: config.showScrollbar !== undefined ? config.showScrollbar : true,
    });
  }, [passage, config]);

  // 2. Handle Completion
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
      });
    }
  }, [isFinished, wpm, rawWpm, accuracy, errorCount, typedText, backspaceCount, settings, timeLeft, onComplete]);

  return (
    <div ref={containerRef} className="w-full h-full bg-white">
      <TypingLayout
        timerSlot={!isFullScreen && <TimerDisplay />}
        passageSlot={<PassageArea />}
        typingSlot={<TypingInput onKeyStroke={resetIdleTimer} />}
        statsSlot={
          <div className="space-y-6">
            {isFullScreen && <TimerDisplay />}
            <Speedometer />
            <LiveDashboard />
            {/* Submit Button */}
            {isActive && !isFinished && (
              <button
                onClick={() => endTest()}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-5 h-5" /> Submit Exam
              </button>
            )}
          </div>
        }
        settingsSlot={<SettingsManager />}
      />
    </div>
  );
};
