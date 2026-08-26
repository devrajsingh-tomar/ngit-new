/**
 * Dedicated Steno Transcription Evaluation Engine (Step 12 & Step 13)
 * Completely isolated from typing engine. Uses configurable preset error weights.
 */

export interface StenoEvaluationPresetRules {
  spellingErrorWeight?: number; // e.g. 0.5 or 1.0
  matraErrorWeight?: number; // e.g. 0.5
  punctuationErrorWeight?: number; // e.g. 0.5
  addedWordWeight?: number; // e.g. 1.0
  skippedWordWeight?: number; // e.g. 1.0
  maxAllowedErrorPercent?: number; // e.g. 5.0%
}

export interface DetailedStenoEvaluationResult {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  wrongWords: number;
  addedWords: number;
  skippedWords: number;
  spellingErrors: number;
  matraErrors: number;
  punctuationErrors: number;
  totalErrors: number;
  finalScore: number;
  status: "Passed" | "Failed";
  wordBreakdown: Array<{
    original: string;
    typed: string;
    type: "correct" | "spelling" | "matra" | "punctuation" | "added" | "skipped";
  }>;
}

/**
 * Normalizes Devanagari and Steno text to canonical forms
 */
export const normalizeDevanagariCanonical = (text: string): string => {
  if (!text) return "";
  return text
    // Replace smart quotes and special dashes
    .replace(/[\u2018\u2019\u201B\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u00A0\u200B\uFEFF]/g, " ")
    // Normalize poorna viram (pipe | or \ to ।)
    .replace(/[|]/g, "।")
    // Normalize anusvara & chandrabindu variants where appropriate
    .replace(/[\u0958]/g, "क") // क़
    .replace(/[\u0959]/g, "ख") // ख़
    .replace(/[\u095A]/g, "ग") // ग़
    .replace(/[\u095B]/g, "ज") // ज़
    .replace(/[\u095C]/g, "ड") // ड़
    .replace(/[\u095D]/g, "ढ") // ढ़
    .replace(/[\u095E]/g, "फ") // फ़
    .replace(/[\u095F]/g, "य") // य़
    .trim();
};

export const normalizeStenoText = (text: string, isOriginal: boolean = false): string => {
  if (!text) return "";
  let cleaned = normalizeDevanagariCanonical(text);

  if (isOriginal) {
    // Remove standalone dictation speed/word count numbers like 350, 375, 400, 425, 450, 475, (350), [350]
    cleaned = cleaned
      .replace(/\s+\d{2,4}\b/g, " ")
      .replace(/[\(\[\{]\s*\d+\s*[\)\]\}]/g, " ");
  }

  return cleaned.trim();
};

/**
 * Checks if two words differ purely by vowel matras, anusvara, or halant
 */
export const isHindiMatraDifference = (word1: string, word2: string): boolean => {
  if (word1 === word2) return false;
  const matraRegex = /[\u093E-\u094C\u094D\u0901-\u0903\u0962\u0963]/g;
  const base1 = word1.replace(matraRegex, "");
  const base2 = word2.replace(matraRegex, "");
  return base1 === base2 && base1.length > 0;
};

/**
 * Checks if two words differ purely by punctuation marks
 */
export const isHindiPunctuationDifference = (word1: string, word2: string): boolean => {
  if (word1 === word2) return false;
  const punctRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()|"?।]/g;
  const clean1 = word1.replace(punctRegex, "");
  const clean2 = word2.replace(punctRegex, "");
  return clean1 === clean2 && clean1.length > 0;
};

function getWordSimilarityScore(orig: string, typed: string): number {
  if (!orig || !typed) return -1;
  if (orig === typed) return 3;
  if (isHindiPunctuationDifference(orig, typed)) return 2;
  if (isHindiMatraDifference(orig, typed)) return 2;

  const longer = orig.length > typed.length ? orig : typed;
  const shorter = orig.length > typed.length ? typed : orig;
  if (longer.length === 0) return 3;

  let commonChars = 0;
  for (const c of shorter) {
    if (longer.includes(c)) commonChars++;
  }
  const ratio = commonChars / longer.length;
  if (ratio >= 0.5) return 1;

  return -1;
}

export const evaluateStenoTranscriptionDetailed = (
  typedText: string,
  originalText: string,
  timeMinutes: number,
  presetRules: StenoEvaluationPresetRules = {}
): DetailedStenoEvaluationResult => {
  const {
    spellingErrorWeight = 1.0,
    matraErrorWeight = 0.5,
    punctuationErrorWeight = 0.5,
    addedWordWeight = 1.0,
    skippedWordWeight = 1.0,
    maxAllowedErrorPercent = 5.0,
  } = presetRules;

  if (timeMinutes <= 0) timeMinutes = 0.01;

  const originalWords = normalizeStenoText(originalText, true).split(/\s+/).filter(Boolean);
  const typedWords = normalizeStenoText(typedText, false).split(/\s+/).filter(Boolean);

  let correctWords = 0;
  let wrongWords = 0;
  let addedWords = 0;
  let skippedWords = 0;
  let spellingErrors = 0;
  let matraErrors = 0;
  let punctuationErrors = 0;

  const wordBreakdown: DetailedStenoEvaluationResult["wordBreakdown"] = [];

  // Needleman-Wunsch Sequence Alignment
  const n = originalWords.length;
  const m = typedWords.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = -i;
  for (let j = 0; j <= m; j++) dp[0][j] = -j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = getWordSimilarityScore(originalWords[i - 1], typedWords[j - 1]);
      const match = dp[i - 1][j - 1] + sim;
      const deleteOrig = dp[i - 1][j] - 1;
      const insertTyped = dp[i][j - 1] - 1;
      dp[i][j] = Math.max(match, deleteOrig, insertTyped);
    }
  }

  // Backtrack
  let i = n;
  let j = m;
  const alignment: { orig: string | null; typed: string | null }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim = getWordSimilarityScore(originalWords[i - 1], typedWords[j - 1]);
      if (dp[i][j] === dp[i - 1][j - 1] + sim && sim > 0) {
        alignment.unshift({ orig: originalWords[i - 1], typed: typedWords[j - 1] });
        i--;
        j--;
        continue;
      }
    }
    if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] - 1)) {
      alignment.unshift({ orig: null, typed: typedWords[j - 1] });
      j--;
    } else if (i > 0) {
      alignment.unshift({ orig: originalWords[i - 1], typed: null });
      i--;
    } else {
      break;
    }
  }

  for (const pair of alignment) {
    if (pair.orig !== null && pair.typed !== null) {
      if (pair.orig === pair.typed) {
        correctWords++;
        wordBreakdown.push({ original: pair.orig, typed: pair.typed, type: "correct" });
      } else if (isHindiPunctuationDifference(pair.orig, pair.typed)) {
        punctuationErrors++;
        wordBreakdown.push({ original: pair.orig, typed: pair.typed, type: "punctuation" });
      } else if (isHindiMatraDifference(pair.orig, pair.typed)) {
        matraErrors++;
        wrongWords++;
        wordBreakdown.push({ original: pair.orig, typed: pair.typed, type: "matra" });
      } else {
        spellingErrors++;
        wrongWords++;
        wordBreakdown.push({ original: pair.orig, typed: pair.typed, type: "spelling" });
      }
    } else if (pair.orig !== null && pair.typed === null) {
      skippedWords++;
      wordBreakdown.push({ original: pair.orig, typed: "[SKIPPED]", type: "skipped" });
    } else if (pair.orig === null && pair.typed !== null) {
      addedWords++;
      wordBreakdown.push({ original: "[ADDED]", typed: pair.typed, type: "added" });
    }
  }


  // Total error weight calculation based on preset rules
  const totalErrors =
    spellingErrors * spellingErrorWeight +
    matraErrors * matraErrorWeight +
    punctuationErrors * punctuationErrorWeight +
    addedWords * addedWordWeight +
    skippedWords * skippedWordWeight;

  const totalWords = Math.max(1, originalWords.length);
  const grossWpm = Math.round(typedWords.length / timeMinutes);

  // Net WPM = Gross WPM - (Total Errors / timeMinutes)
  const netWpm = Math.max(0, Math.round(grossWpm - totalErrors / timeMinutes));

  const errorPercentage = Math.round((totalErrors / totalWords) * 1000) / 10;
  const accuracy = Math.max(0, Math.round(100 - errorPercentage));

  const finalScore = Math.max(0, Math.round(100 - errorPercentage * 2));
  const status = errorPercentage <= maxAllowedErrorPercent ? "Passed" : "Failed";

  return {
    grossWpm,
    netWpm,
    accuracy,
    totalWords,
    correctWords,
    wrongWords,
    addedWords,
    skippedWords,
    spellingErrors,
    matraErrors,
    punctuationErrors,
    totalErrors: Math.round(totalErrors * 10) / 10,
    finalScore,
    status,
    wordBreakdown,
  };
};
