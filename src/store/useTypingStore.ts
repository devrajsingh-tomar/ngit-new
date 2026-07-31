import { create } from 'zustand';

interface TypingSettings {
  language: string;
  duration: number; // minutes
  backspaceMode: 'full' | 'word' | 'disabled' | 'upssssc';
  highlightMode: 'word' | 'word_error' | 'letter' | 'none';
  autoScroll: boolean;
  wordLimit: number;
  textPosition: 'top' | 'side';
  fontSize: number;
  passageHeight: number;
  showScrollbar: boolean;
  layout: 'English' | 'Inscript';
  sourcePosition: 'top' | 'left' | 'right' | 'bottom';
  examMode: string;
}

interface TypingState {
  // Core Metrics
  passage: string;
  typedText: string;
  timeLeft: number; // seconds
  isActive: boolean;
  isFinished: boolean;
  
  // Real-time Stats
  wpm: number;
  rawWpm: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errorCount: number;
  wrongWords: number;
  backspaceCount: number;
  keystrokes: number;
  progress: number;
  currentWordIndex: number;
  isFullScreen: boolean;
  
  // Configuration
  settings: TypingSettings;

  // Actions
  setPassage: (passage: string) => void;
  setTypedText: (text: string) => void;
  updateMetrics: (metrics: {
    wpm: number;
    rawWpm: number;
    grossWpm: number;
    netWpm: number;
    accuracy: number;
    errorCount: number;
    wrongWords: number;
    backspaceCount: number;
    keystrokes: number;
    progress: number;
  }) => void;
  tick: () => void;
  startTest: () => void;
  endTest: () => void;
  resetTest: () => void;
  updateSettings: (settings: Partial<TypingSettings>) => void;
  setCurrentWordIndex: (index: number) => void;
  toggleFullScreen: () => void;
  incrementBackspace: () => void;
}

const initialSettings: TypingSettings = {
  language: 'English',
  duration: 10,
  backspaceMode: 'full',
  highlightMode: 'word',
  autoScroll: true,
  wordLimit: 0,
  textPosition: 'top',
  fontSize: 100, // percentage
  passageHeight: 50, // percentage of total height
  showScrollbar: true,
  layout: 'English',
  sourcePosition: 'top',
  examMode: 'General',
};

export const useTypingStore = create<TypingState>((set) => ({
  passage: '',
  typedText: '',
  timeLeft: 600,
  isActive: false,
  isFinished: false,
  wpm: 0,
  rawWpm: 0,
  grossWpm: 0,
  netWpm: 0,
  accuracy: 100,
  errorCount: 0,
  wrongWords: 0,
  backspaceCount: 0,
  keystrokes: 0,
  progress: 0,
  currentWordIndex: 0,
  isFullScreen: false,
  settings: {
    ...initialSettings,
    showScrollbar: true,
  },
  setPassage: (passage) => set({ passage }),

  setTypedText: (typedText) => set({ typedText }),

  updateMetrics: (metrics) => 
    set((state) => ({ ...state, ...metrics })),

  tick: () => set((state) => ({ 
    timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0 
  })),

  startTest: () => set({ isActive: true, isFinished: false }),

  endTest: () => set({ isActive: false, isFinished: true }),

  resetTest: () => set((state) => ({
    typedText: '',
    timeLeft: state.settings.duration * 60,
    isActive: false,
    isFinished: false,
    wpm: 0,
    rawWpm: 0,
    grossWpm: 0,
    netWpm: 0,
    accuracy: 100,
    errorCount: 0,
    wrongWords: 0,
    backspaceCount: 0,
    keystrokes: 0,
    progress: 0,
    currentWordIndex: 0,
    isFullScreen: false,
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
    timeLeft: newSettings.duration ? newSettings.duration * 60 : state.timeLeft,
  })),

  setCurrentWordIndex: (currentWordIndex) => set({ currentWordIndex }),

  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

  incrementBackspace: () => set((state) => ({ backspaceCount: state.backspaceCount + 1 })),
}));
