/**
 * Core Typing Engine Logic
 * Standard: 1 Word = 5 Characters (including spaces)
 */

export interface TypingMetrics {
  wpm: number;
  rawWpm: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errorCount: number;
  wrongWords: number;
  keystrokes: number;
  progress: number;
  totalCharacters: number;
}

export interface WordAlignmentResult {
  alignedOriginalStatuses: ('correct' | 'error' | 'pending' | 'active')[];
  activeOriginalIndex: number;
  totalMistakes: number;
  correctWordsCount: number;
  wrongWordsCount: number;
  currentTypedWord: string;
}

/**
 * Normalizes characters to ensure common symbols (quotes, apostrophes, commas) 
 * match regardless of whether they are "smart/curly" or "straight".
 * Single inverted commas from Alt 039 / Alt 39 (' and smart quotes ‘ ’) are mapped to standard apostrophe '.
 */
export const normalizeChar = (char: string): string => {
  if (!char) return "";
  return char
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\u02BB\u02BC\u02BD\u0027\u0060]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u0022]/g, '"')
    .replace(/[\uFF0C]/g, ",")
    .replace(/[\u00A0\u200B\uFEFF]/g, " ")
    .replace(/[|]/g, "।")
    .replace(/[\u0958]/g, "क")
    .replace(/[\u0959]/g, "ख")
    .replace(/[\u095A]/g, "ग")
    .replace(/[\u095B]/g, "ज")
    .replace(/[\u095C]/g, "ड")
    .replace(/[\u095D]/g, "ढ")
    .replace(/[\u095E]/g, "फ");
};

/**
 * Resilient Word Alignment Engine
 * Prevents error cascading when candidates accidentally press space mid-word or double-tap space.
 * Only the accidental mistake is penalized (single mistake), while all subsequent typed content aligns cleanly.
 */
export function alignWords(
  originalWords: string[],
  typedText: string
): WordAlignmentResult {
  const cleanOriginal = originalWords.filter(w => w.length > 0);
  if (cleanOriginal.length === 0) {
    return {
      alignedOriginalStatuses: [],
      activeOriginalIndex: 0,
      totalMistakes: 0,
      correctWordsCount: 0,
      wrongWordsCount: 0,
      currentTypedWord: "",
    };
  }

  const isEndsWithSpace = typedText.endsWith(" ");
  const rawTypedWords = typedText.trim().split(/\s+/).filter(w => w.length > 0);

  // If currently typing a word (not ending with space), the last token in rawTypedWords is active/in-progress
  let committedTypedWords: string[] = [];
  let currentTypedWord = "";

  if (typedText.trim() === "") {
    committedTypedWords = [];
    currentTypedWord = "";
  } else if (isEndsWithSpace) {
    committedTypedWords = rawTypedWords;
    currentTypedWord = "";
  } else {
    committedTypedWords = rawTypedWords.slice(0, -1);
    currentTypedWord = rawTypedWords[rawTypedWords.length - 1] || "";
  }

  const norm = (w: string) => w.split("").map(normalizeChar).join("");
  const normOrig = cleanOriginal.map(norm);
  const normTyped = committedTypedWords.map(norm);

  const statuses: ("correct" | "error" | "pending" | "active")[] = new Array(
    cleanOriginal.length
  ).fill("pending");

  let i = 0; // index in cleanOriginal
  let j = 0; // index in committedTypedWords
  let mistakes = 0;
  let correctCount = 0;

  while (i < cleanOriginal.length && j < committedTypedWords.length) {
    // 1. Direct Match
    if (normOrig[i] === normTyped[j]) {
      statuses[i] = "correct";
      correctCount++;
      i++;
      j++;
      continue;
    }

    // 2. Accidental Space in the middle of a word (Split word: e.g. "भा" + "रत" === "भारत")
    if (j + 1 < committedTypedWords.length && normTyped[j] + normTyped[j + 1] === normOrig[i]) {
      mistakes += 1; // single mistake for the accidental space
      statuses[i] = "error";
      i++;
      j += 2;
      continue;
    }

    // 2b. Accidental 3-part split
    if (
      j + 2 < committedTypedWords.length &&
      normTyped[j] + normTyped[j + 1] + normTyped[j + 2] === normOrig[i]
    ) {
      mistakes += 1;
      statuses[i] = "error";
      i++;
      j += 3;
      continue;
    }

    // 3. Extra Word / Stray Token from accidental space (next typed matches current original)
    if (j + 1 < committedTypedWords.length && normTyped[j + 1] === normOrig[i]) {
      mistakes += 1; // single mistake for stray token
      j++; // skip stray token, i stays at current original word
      continue;
    }

    // 4. Skipped Word in Passage (current typed matches next original)
    if (i + 1 < cleanOriginal.length && normTyped[j] === normOrig[i + 1]) {
      mistakes += 1;
      statuses[i] = "error";
      i++; // advance past skipped original word
      continue;
    }

    // 5. Word Substitution / Typo (next typed matches next original)
    if (
      i + 1 < cleanOriginal.length &&
      j + 1 < committedTypedWords.length &&
      normTyped[j + 1] === normOrig[i + 1]
    ) {
      mistakes += 1;
      statuses[i] = "error";
      i++;
      j++;
      continue;
    }

    // 6. Lookahead window (up to 3 words) to recover from multi-word drift
    let bestMatch: { di: number; dj: number } | null = null;
    let minDistance = 999;
    for (let di = 1; di <= 3; di++) {
      for (let dj = 1; dj <= 3; dj++) {
        if (i + di < cleanOriginal.length && j + dj < committedTypedWords.length) {
          if (normOrig[i + di] === normTyped[j + dj]) {
            const dist = di + dj;
            if (dist < minDistance) {
              minDistance = dist;
              bestMatch = { di, dj };
            }
          }
        }
      }
    }

    if (bestMatch) {
      for (let k = 0; k < bestMatch.di; k++) {
        statuses[i + k] = "error";
      }
      mistakes += Math.max(bestMatch.di, bestMatch.dj);
      i += bestMatch.di;
      j += bestMatch.dj;
      continue;
    }

    // 7. Fallback: single word error
    statuses[i] = "error";
    mistakes += 1;
    i++;
    j++;
  }

  // Any remaining unaligned committed typed words count as mistakes
  if (j < committedTypedWords.length) {
    mistakes += (committedTypedWords.length - j);
  }

  // Determine activeOriginalIndex
  let activeOriginalIndex = i;
  if (activeOriginalIndex >= cleanOriginal.length) {
    activeOriginalIndex = cleanOriginal.length - 1;
  }

  // If there's an active in-progress word being typed:
  if (currentTypedWord.length > 0 && activeOriginalIndex < cleanOriginal.length) {
    statuses[activeOriginalIndex] = "active";
  }

  // Count consecutive space occurrences in typedText as single mistakes (1 mistake per extra space press)
  const consecutiveSpaceMatches = typedText.match(/\s{2,}/g) || [];
  const extraSpacesCount = consecutiveSpaceMatches.reduce((acc, m) => acc + (m.length - 1), 0);
  mistakes += extraSpacesCount;

  return {
    alignedOriginalStatuses: statuses,
    activeOriginalIndex,
    totalMistakes: mistakes,
    correctWordsCount: correctCount,
    wrongWordsCount: mistakes,
    currentTypedWord,
  };
}

/**
 * Calculates typing metrics based on the provided input and original passage
 * @param typedText The text entered by the user
 * @param passage The original text to compare against
 * @param timeMinutes Time elapsed in minutes
 * @param examMode Specific exam rule set (e.g. UPSSSC, UP_POLICE, General)
 * @returns Object containing WPM, Raw WPM, Accuracy, and Error Count
 */
export const calculateMetrics = (
  typedText: string,
  passage: string,
  timeMinutes: number,
  examMode?: string
): TypingMetrics => {
  if (timeMinutes <= 0) timeMinutes = 0.01; // Avoid division by zero
  
  const isUPSSSC = examMode === "UPSSSC";
  const originalWords = passage.trim().split(/\s+/).filter(w => w.length > 0);
  const totalCharacters = typedText.length;
  
  const alignment = alignWords(originalWords, typedText);
  const errors = alignment.totalMistakes;

  // SEPARATE LOGIC: 
  // 1. General Practice & UP Police (ASI/CO) use actual word count (1 Word = 1 Word).
  // 2. Govt Exams (SSC, UPSSSC, AHC) use official Keystrokes/5 standard.
  const typedWords = typedText.trim().split(/\s+/).filter(w => w.length > 0);
  let wordCountBase = totalCharacters / 5;
  if (examMode === "General" || examMode === "UP_POLICE" || !examMode) {
    wordCountBase = typedWords.length > 0 && typedWords[0] !== "" ? typedWords.length : 0;
  }

  const grossWpm = Math.round(wordCountBase / timeMinutes);
  let netWpm = Math.round((wordCountBase - errors) / timeMinutes);
  if (isUPSSSC) {
    // UPSSSC 5-Error Penalty Rule:
    // First 5 errors are free. For every error beyond 5, deduct 5 words.
    const penaltyWords = errors > 5 ? (errors - 5) * 5 : 0;
    netWpm = Math.round((wordCountBase - penaltyWords) / timeMinutes);
  }

  const accuracy = totalCharacters > 0 
    ? Math.max(0, Math.round(((totalCharacters - (errors * 5)) / totalCharacters) * 100)) 
    : 100;

  const progress = originalWords.length > 0
    ? Math.min(100, Math.round((alignment.correctWordsCount / originalWords.length) * 100))
    : 0;

  return {
    wpm: Math.max(0, netWpm),
    rawWpm: Math.max(0, grossWpm),
    grossWpm: Math.max(0, grossWpm),
    netWpm: Math.max(0, netWpm),
    accuracy,
    errorCount: errors,
    wrongWords: errors,
    keystrokes: totalCharacters,
    progress,
    totalCharacters
  };
};

/**
 * Detailed Character Comparison for highlighting
 */
export const compareCharacters = (original: string, typed: string) => {
  return original.split('').map((char, index) => {
    if (index >= typed.length) return 'pending';
    return normalizeChar(char) === normalizeChar(typed[index]) ? 'correct' : 'incorrect';
  });
};
