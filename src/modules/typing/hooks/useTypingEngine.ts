import { useEffect } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { calculateMetrics } from '../utils/calculations';

/**
 * useTypingEngine Hook
 * Orchestrates real-time calculations by bridging the store with the utility layer.
 */
export const useTypingEngine = () => {
  const { 
    typedText, 
    passage, 
    timeLeft, 
    settings, 
    isActive, 
    isFinished,
    backspaceCount,
    updateMetrics 
  } = useTypingStore();

  useEffect(() => {
    if (isActive && !isFinished && typedText.length > 0) {
      const elapsedSeconds = (settings.duration * 60) - timeLeft;
      const elapsedMinutes = elapsedSeconds / 60;

      // Run core calculations
      const metrics = calculateMetrics(typedText, passage, elapsedMinutes, (settings as any).examMode);

      // Update the global store with live stats
      updateMetrics({
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
        grossWpm: metrics.grossWpm,
        netWpm: metrics.netWpm,
        accuracy: metrics.accuracy,
        errorCount: metrics.errorCount,
        wrongWords: metrics.wrongWords,
        backspaceCount, // Could be synced from state if needed
        keystrokes: metrics.keystrokes,
        progress: metrics.progress
      });
    }
  }, [typedText, timeLeft, isActive, isFinished, passage, settings.duration, backspaceCount, updateMetrics]);
};
