import { useEffect, useRef, useState } from "react";
import { useStenoStore } from "@/store/useStenoStore";
import { evaluateStenoTranscriptionDetailed, DetailedStenoEvaluationResult } from "../utils/stenoCalculations";

export function useStenoEngine() {
  const {
    transcriptText,
    userTranscription,
    settings,
    isFinished,
    finishStenoSession,
  } = useStenoStore();

  const [timeMinutes, setTimeMinutes] = useState(0);
  const [evaluation, setEvaluation] = useState<DetailedStenoEvaluationResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Evaluation whenever user transcription or finish status changes
    if (transcriptText && userTranscription) {
      const durationMin = Math.max(0.1, timeMinutes || settings.dictationDurationSeconds / 60);
      const res = evaluateStenoTranscriptionDetailed(userTranscription, transcriptText, durationMin);
      setEvaluation(res);
    }
  }, [userTranscription, transcriptText, timeMinutes, settings.dictationDurationSeconds]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeMinutes((prev) => prev + 1 / 60);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    timeMinutes,
    evaluation,
    startTimer,
    stopTimer,
    finishSession: finishStenoSession,
  };
}
