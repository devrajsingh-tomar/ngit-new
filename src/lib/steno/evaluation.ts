/**
 * Authoritative Server-Side Steno Evaluation Engine
 * Calculates WPM, Accuracy, Mistakes, Breakdown, Word Comparison, and Detailed Error Log
 */

export interface ExamRules {
  spellingWeight: number;
  matraWeight: number;
  punctuationWeight: number;
  addedWordWeight: number;
  missingWordWeight: number;
  spacingTranspositionWeight: number;
  mistakeExemptionCount: number;
  ignoreChandrabindu: boolean;
  maxErrorPercentAllowed: number;
}

export const DEFAULT_EXAM_RULES: ExamRules = {
  spellingWeight: 1.0,
  matraWeight: 0.5,
  punctuationWeight: 0.5,
  addedWordWeight: 1.0,
  missingWordWeight: 1.0,
  spacingTranspositionWeight: 0.5,
  mistakeExemptionCount: 20,
  ignoreChandrabindu: true,
  maxErrorPercentAllowed: 5.0,
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
  effectivePenalty: number;
  mistakeExemptionCount: number;
  maxErrorPercentAllowed: number;
  mistakeBreakdown: {
    spelling: number;
    missing: number;
    added: number;
    matra: number;
    punctuation: number;
  };
  frozenWeights: {
    spellingWeight: number;
    matraWeight: number;
    punctuationWeight: number;
    addedWordWeight: number;
    missingWordWeight: number;
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
 * Normalizes text for comparison (e.g. Chandrabindu ignore option)
 */
export function normalizeWordToken(word: string, ignoreChandrabindu = true): string {
  if (!word) return "";
  let res = word;
  if (ignoreChandrabindu) {
    // Replace Chandrabindu (ँ \u0901) with Anusvara (ं \u0902)
    res = res.replace(/\u0901/g, "\u0902");
  }
  return res;
}

export function cleanOriginalPassageText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019\u201B\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u00A0\u200B\uFEFF]/g, " ")
    .replace(/[|]/g, "।")
    .replace(/\s+\d{2,4}\b/g, " ")
    .replace(/[\(\[\{]\s*\d+\s*[\)\]\}]/g, " ")
    .replace(/[\u0958]/g, "क")
    .replace(/[\u0959]/g, "ख")
    .replace(/[\u095A]/g, "ग")
    .replace(/[\u095B]/g, "ज")
    .replace(/[\u095C]/g, "ड")
    .replace(/[\u095D]/g, "ढ")
    .replace(/[\u095E]/g, "फ")
    .replace(/[\u095F]/g, "य")
    .trim();
}

function getWordSimilarityScore(orig: string, typed: string, ignoreChandrabindu = true): number {
  if (!orig || !typed) return -1;

  const normOrig = normalizeWordToken(orig, ignoreChandrabindu);
  const normTyped = normalizeWordToken(typed, ignoreChandrabindu);

  if (normOrig === normTyped) return 3;
  if (isPunctuationError(normOrig, normTyped)) return 2;
  if (isMatraError(normOrig, normTyped)) return 2;

  const longer = normOrig.length > normTyped.length ? normOrig : normTyped;
  const shorter = normOrig.length > normTyped.length ? normTyped : normOrig;
  if (longer.length === 0) return 3;

  let commonChars = 0;
  for (const c of shorter) {
    if (longer.includes(c)) commonChars++;
  }
  const ratio = commonChars / longer.length;
  if (ratio >= 0.5) return 1;

  return -1;
}

export function evaluateStenoTranscription(
  originalText: string,
  typedText: string,
  timeSpentSeconds: number,
  targetWpm: number = 80,
  rules: Partial<ExamRules> = {}
): EvaluationResult {
  const activeRules: ExamRules = {
    spellingWeight: rules.spellingWeight ?? DEFAULT_EXAM_RULES.spellingWeight,
    matraWeight: rules.matraWeight ?? DEFAULT_EXAM_RULES.matraWeight,
    punctuationWeight: rules.punctuationWeight ?? DEFAULT_EXAM_RULES.punctuationWeight,
    addedWordWeight: rules.addedWordWeight ?? DEFAULT_EXAM_RULES.addedWordWeight,
    missingWordWeight: rules.missingWordWeight ?? DEFAULT_EXAM_RULES.missingWordWeight,
    spacingTranspositionWeight: rules.spacingTranspositionWeight ?? DEFAULT_EXAM_RULES.spacingTranspositionWeight,
    mistakeExemptionCount: rules.mistakeExemptionCount ?? DEFAULT_EXAM_RULES.mistakeExemptionCount,
    ignoreChandrabindu: rules.ignoreChandrabindu ?? DEFAULT_EXAM_RULES.ignoreChandrabindu,
    maxErrorPercentAllowed: rules.maxErrorPercentAllowed ?? DEFAULT_EXAM_RULES.maxErrorPercentAllowed,
  };

  const cleanedOrig = cleanOriginalPassageText(originalText);
  const cleanedTyped = cleanOriginalPassageText(typedText || "");
  const origWords = cleanedOrig.split(/\s+/).filter(Boolean);
  const typedWords = cleanedTyped.split(/\s+/).filter(Boolean);

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

  // Needleman-Wunsch Alignment for Word Sequences
  const n = origWords.length;
  const m = typedWords.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = -i;
  for (let j = 0; j <= m; j++) dp[0][j] = -j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = getWordSimilarityScore(origWords[i - 1], typedWords[j - 1], activeRules.ignoreChandrabindu);
      const match = dp[i - 1][j - 1] + sim;
      const deleteOrig = dp[i - 1][j] - 1;
      const insertTyped = dp[i][j - 1] - 1;
      dp[i][j] = Math.max(match, deleteOrig, insertTyped);
    }
  }

  // Backtrack to build token alignment
  let i = n;
  let j = m;
  const alignment: { orig: string | null; typed: string | null }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim = getWordSimilarityScore(origWords[i - 1], typedWords[j - 1], activeRules.ignoreChandrabindu);
      if (dp[i][j] === dp[i - 1][j - 1] + sim && sim > 0) {
        alignment.unshift({ orig: origWords[i - 1], typed: typedWords[j - 1] });
        i--;
        j--;
        continue;
      }
    }
    if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] - 1)) {
      alignment.unshift({ orig: null, typed: typedWords[j - 1] });
      j--;
    } else if (i > 0) {
      alignment.unshift({ orig: origWords[i - 1], typed: null });
      i--;
    } else {
      break;
    }
  }

  // Evaluate aligned tokens
  let errorIndex = 1;

  for (const pair of alignment) {
    if (pair.orig !== null && pair.typed !== null) {
      const normOrig = normalizeWordToken(pair.orig, activeRules.ignoreChandrabindu);
      const normTyped = normalizeWordToken(pair.typed, activeRules.ignoreChandrabindu);

      if (normOrig === normTyped) {
        wordBreakdown.push({
          original: pair.orig,
          typed: pair.typed,
          type: "correct",
          category: "Correct",
        });
      } else if (isPunctuationError(normOrig, normTyped)) {
        punctuationCount++;
        const penalty = activeRules.punctuationWeight;
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
          weight: penalty >= 1.0 ? "Full" : "Half",
          penalty,
        });
      } else if (isMatraError(normOrig, normTyped)) {
        matraCount++;
        const penalty = activeRules.matraWeight;
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
          weight: penalty >= 1.0 ? "Full" : "Half",
          penalty,
        });
      } else {
        spellingCount++;
        const penalty = activeRules.spellingWeight;
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
          weight: penalty >= 1.0 ? "Full" : "Half",
          penalty,
        });
      }
    } else if (pair.orig !== null && pair.typed === null) {
      missingCount++;
      const penalty = activeRules.missingWordWeight;
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
        weight: penalty >= 1.0 ? "Full" : "Half",
        penalty,
      });
    } else if (pair.orig === null && pair.typed !== null) {
      addedCount++;
      const penalty = activeRules.addedWordWeight;
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
        weight: penalty >= 1.0 ? "Full" : "Half",
        penalty,
      });
    }
  }

  const totalMistakes = spellingCount + missingCount + addedCount + matraCount + punctuationCount;

  // Apply Mistake Exemption Discount (e.g. 20 mistakes free exemption!)
  const exemptionCount = Math.max(0, activeRules.mistakeExemptionCount || 0);
  const effectivePenalty = totalMistakes <= exemptionCount
    ? 0
    : Math.max(0, totalPenalty * ((totalMistakes - exemptionCount) / Math.max(1, totalMistakes)));

  const minutes = Math.max(timeSpentSeconds / 60, 0.1);
  const grossWpm = Math.round(typedWordCount / minutes);
  const netWpm = Math.max(0, Math.round((typedWordCount - effectivePenalty) / minutes));
  const accuracy = Math.max(
    0,
    Number((((originalWordCount - effectivePenalty) / Math.max(1, originalWordCount)) * 100).toFixed(2))
  );

  const score = Math.max(0, Math.round(accuracy * (netWpm / Math.max(1, targetWpm)) * 10));

  // Exam pass criteria: Net WPM >= 80% of target AND error % <= maxErrorPercentAllowed
  const errorPercentage = Number(((effectivePenalty / Math.max(1, originalWordCount)) * 100).toFixed(2));
  const isPassed = errorPercentage <= activeRules.maxErrorPercentAllowed && netWpm >= (targetWpm * 0.8);

  return {
    originalWordCount,
    typedWordCount,
    grossWpm,
    netWpm,
    accuracy,
    score,
    totalMistakes,
    totalPenalty,
    effectivePenalty,
    mistakeExemptionCount: exemptionCount,
    maxErrorPercentAllowed: activeRules.maxErrorPercentAllowed,
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
