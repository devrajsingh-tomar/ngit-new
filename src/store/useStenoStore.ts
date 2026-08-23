import { create } from "zustand";

interface StenoSettings {
  audioSpeed: number; // 0.5 to 2.0
  fontFamily: string;
  fontSize: number;
  language: "Hindi" | "English";
  targetWpm: number;
  dictationDurationSeconds: number;
}

interface StenoState {
  passageId: string | null;
  audioUrl: string;
  transcriptText: string;
  userTranscription: string;
  isAudioPlaying: boolean;
  timeElapsed: number;
  isFinished: boolean;
  settings: StenoSettings;

  setAudioUrl: (url: string) => void;
  setTranscriptText: (text: string) => void;
  setUserTranscription: (text: string) => void;
  setAudioPlaying: (playing: boolean) => void;
  setAudioSpeed: (speed: number) => void;
  updateSettings: (settings: Partial<StenoSettings>) => void;
  resetStenoSession: () => void;
  finishStenoSession: () => void;
}

const initialSettings: StenoSettings = {
  audioSpeed: 1.0,
  fontFamily: "Kruti Dev 010",
  fontSize: 18,
  language: "Hindi",
  targetWpm: 80,
  dictationDurationSeconds: 300,
};

export const useStenoStore = create<StenoState>((set) => ({
  passageId: null,
  audioUrl: "",
  transcriptText: "",
  userTranscription: "",
  isAudioPlaying: false,
  timeElapsed: 0,
  isFinished: false,
  settings: initialSettings,

  setAudioUrl: (audioUrl) => set({ audioUrl }),
  setTranscriptText: (transcriptText) => set({ transcriptText }),
  setUserTranscription: (userTranscription) => set({ userTranscription }),
  setAudioPlaying: (isAudioPlaying) => set({ isAudioPlaying }),
  setAudioSpeed: (audioSpeed) =>
    set((state) => ({ settings: { ...state.settings, audioSpeed } })),
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  resetStenoSession: () =>
    set({
      userTranscription: "",
      isAudioPlaying: false,
      timeElapsed: 0,
      isFinished: false,
    }),

  finishStenoSession: () => set({ isFinished: true, isAudioPlaying: false }),
}));
