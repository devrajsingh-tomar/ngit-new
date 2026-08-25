/**
 * Authoritative Server-Side Steno Evaluation Engine
 * Calculates WPM, Accuracy, Mistakes, Breakdown, Word Comparison, and Detailed Error Log
 */

export interface ExamRules {
  spellingWeight: "full" | "half" | "zero";
  matraWeight: "full" | "half" | "zero";
  punctuationWeight: "full" | "half" | "zero";
  addedWordWeight: "full" | "half" | "zero";
  missingWordWeight: "full" | "half" | "zero";
}

export const DEFAULT_EXAM_RULES: ExamRules = {
  spellingWeight: "full",
  matraWeight: "half",
  punctuationWeight: "half",
  addedWordWeight: "full",
  missingWordWeight: "full",
};

export interface WordToken {
  original: string;
  typed: string;
  type: "correct" | "spelling" | "missing" | "added" | "matra" | "punctuation";
  category: "Spelling" | "Missing" | "Added" | "Matra" | "Punctuation" | "Correct";
}

export interface ErrorLogItem {
  index: number;
  errorType: string;
  typedWord: string;
  originalWord: string;
  category: "Spelling" | "Missing" | "Added" | "Matra" | "Punctuation";
  weight: "Full" | "Half";
  penalty: number;
}

export interface EvaluationResult {
  originalWordCount: number;
  typedWordCount: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  score: number;
  totalMistakes: number;
  totalPenalty: number;
  mistakeBreakdown: {
    spelling: number;
    missing: number;
    added: number;
    matra: number;
    punctuation: number;
  };
  frozenWeights: {
    spellingWeight: string;
    matraWeight: string;
    punctuationWeight: string;
    addedWordWeight: string;
    missingWordWeight: string;
  };
  wordBreakdown: WordToken[];
  errorLog: ErrorLogItem[];
  isPassed: boolean;
}

/**
 * Checks if two words differ specifically by Hindi matras (vowels) vs general spelling
 */
function isMatraError(orig: string, typed: string): boolean {
  const matraRegex = /[\u093e-\u094c\u094d\u0901-\u0903]/g;
  const baseOrig = orig.replace(matraRegex, "");
  const baseTyped = typed.replace(matraRegex, "");
  return baseOrig === baseTyped && orig !== typed;
}

/**
 * Checks if two words differ only by punctuation marks
 */
function isPunctuationError(orig: string, typed: string): boolean {
  const punctRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()|"?।]/g;
  const cleanOrig = orig.replace(punctRegex, "");
  const cleanTyped = typed.replace(punctRegex, "");
  return cleanOrig === cleanTyped && orig !== typed;
}

/**
 * Helper to convert weight string into numeric multiplier
 */
function getWeightMultiplier(weightStr: string): number {
  if (weightStr === "full") return 1.0;
  if (weightStr === "half") return 0.5;
  return 0;
}

export function cleanOriginalPassageText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019\u201B\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033\u2036]/g, '"')
    .replace(/[\u00A0]/g, " ")
    .replace(/\s+\d{2,4}\b/g, " ")
    .replace(/[\(\[\{]\s*\d+\s*[\)\]\}]/g, " ")
    .trim();
}

export function evaluateStenoTranscription(
  originalText: string,
  typedText: string,
  timeSpentSeconds: number,
  targetWpm: number = 80,
  rules: Partial<ExamRules> = {}
): EvaluationResult {
  const activeRules: ExamRules = { ...DEFAULT_EXAM_RULES, ...rules };

  const cleanedOrig = cleanOriginalPassageText(originalText);
  const origWords = cleanedOrig.split(/\s+/).filter(Boolean);
  const typedWords = (typedText || "").trim().split(/\s+/).filter(Boolean);

  const originalWordCount = origWords.length;
  const typedWordCount = typedWords.length;

  const wordBreakdown: WordToken[] = [];
  const errorLog: ErrorLogItem[] = [];

  let spellingCount = 0;
  let missingCount = 0;
  let addedCount = 0;
  let matraCount = 0;
  let punctuationCount = 0;
  let totalPenalty = 0;

  // LCS Dynamic Programming Matrix to find optimal sequence alignment
  const n = origWords.length;
  const m = typedWords.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origWords[i - 1] === typedWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build token alignment
  let i = n;
  let j = m;
  const alignment: { orig: string | null; typed: string | null }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === typedWords[j - 1]) {
      alignment.unshift({ orig: origWords[i - 1], typed: typedWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      alignment.unshift({ orig: null, typed: typedWords[j - 1] });
      j--;
    } else {
      alignment.unshift({ orig: origWords[i - 1], typed: null });
      i--;
    }
  }

  // Evaluate aligned tokens
  let errorIndex = 1;

  for (const pair of alignment) {
    if (pair.orig !== null && pair.typed !== null) {
      if (pair.orig === pair.typed) {
        wordBreakdown.push({
          original: pair.orig,
          typed: pair.typed,
          type: "correct",
          category: "Correct",
        });
      } else if (isPunctuationError(pair.orig, pair.typed)) {
        punctuationCount++;
        const mult = getWeightMultiplier(activeRules.punctuationWeight);
        const penalty = mult;
        totalPenalty += penalty;

        wordBreakdown.push({
          original: pair.orig,
          typed: pair.typed,
          type: "punctuation",
          category: "Punctuation",
        });

        errorLog.push({
          index: errorIndex++,
          errorType: "Punctuation Error",
          typedWord: pair.typed,
          originalWord: pair.orig,
          category: "Punctuation",
          weight: mult === 1 ? "Full" : "Half",
          penalty,
        });
      } else if (isMatraError(pair.orig, pair.typed)) {
        matraCount++;
        const mult = getWeightMultiplier(activeRules.matraWeight);
        const penalty = mult;
        totalPenalty += penalty;

        wordBreakdown.push({
          original: pair.orig,
          typed: pair.typed,
          type: "matra",
          category: "Matra",
        });

        errorLog.push({
          index: errorIndex++,
          errorType: "Matra Error",
          typedWord: pair.typed,
          originalWord: pair.orig,
          category: "Matra",
          weight: mult === 1 ? "Full" : "Half",
          penalty,
        });
      } else {
        spellingCount++;
        const mult = getWeightMultiplier(activeRules.spellingWeight);
        const penalty = mult;
        totalPenalty += penalty;

        wordBreakdown.push({
          original: pair.orig,
          typed: pair.typed,
          type: "spelling",
          category: "Spelling",
        });

        errorLog.push({
          index: errorIndex++,
          errorType: "Spelling Error",
          typedWord: pair.typed,
          originalWord: pair.orig,
          category: "Spelling",
          weight: mult === 1 ? "Full" : "Half",
          penalty,
        });
      }
    } else if (pair.orig !== null && pair.typed === null) {
      missingCount++;
      const mult = getWeightMultiplier(activeRules.missingWordWeight);
      const penalty = mult;
      totalPenalty += penalty;

      wordBreakdown.push({
        original: pair.orig,
        typed: "—",
        type: "missing",
        category: "Missing",
      });

      errorLog.push({
        index: errorIndex++,
        errorType: "Missing Word",
        typedWord: "—",
        originalWord: pair.orig,
        category: "Missing",
        weight: mult === 1 ? "Full" : "Half",
        penalty,
      });
    } else if (pair.orig === null && pair.typed !== null) {
      addedCount++;
      const mult = getWeightMultiplier(activeRules.addedWordWeight);
      const penalty = mult;
      totalPenalty += penalty;

      wordBreakdown.push({
        original: "—",
        typed: pair.typed,
        type: "added",
        category: "Added",
      });

      errorLog.push({
        index: errorIndex++,
        errorType: "Added Word",
        typedWord: pair.typed,
        originalWord: "—",
        category: "Added",
        weight: mult === 1 ? "Full" : "Half",
        penalty,
      });
    }
  }

  const minutes = Math.max(timeSpentSeconds / 60, 0.1);
  const grossWpm = Math.round(typedWordCount / minutes);
  const netWpm = Math.max(0, Math.round((typedWordCount - totalPenalty) / minutes));
  const accuracy = Math.max(
    0,
    Number((((originalWordCount - totalPenalty) / Math.max(1, originalWordCount)) * 100).toFixed(2))
  );

  const totalMistakes = spellingCount + missingCount + addedCount + matraCount + punctuationCount;
  const score = Math.max(0, Math.round(accuracy * (netWpm / Math.max(1, targetWpm)) * 10));
  const isPassed = accuracy >= 80 && netWpm >= (targetWpm * 0.8);

  return {
    originalWordCount,
    typedWordCount,
    grossWpm,
    netWpm,
    accuracy,
    score,
    totalMistakes,
    totalPenalty,
    mistakeBreakdown: {
      spelling: spellingCount,
      missing: missingCount,
      added: addedCount,
      matra: matraCount,
      punctuation: punctuationCount,
    },
    frozenWeights: {
      spellingWeight: activeRules.spellingWeight,
      matraWeight: activeRules.matraWeight,
      punctuationWeight: activeRules.punctuationWeight,
      addedWordWeight: activeRules.addedWordWeight,
      missingWordWeight: activeRules.missingWordWeight,
    },
    wordBreakdown,
    errorLog,
    isPassed,
  };
}
