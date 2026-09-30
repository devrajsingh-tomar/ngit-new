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
 * Strips edge punctuation from words (commas, periods, quotes, exclamation, question marks, purnaviram, etc.)
 */
export const cleanPunctuation = (word: string): string => {
  if (!word) return "";
  return word.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()।?"'‘“’”—–]+|[.,\/#!$%\^&\*;:{}=\-_`~()।?"'‘“’”—–]+$/g, "");
};

/**
 * Normalizes characters to ensure common symbols (quotes, apostrophes, commas, dashes)
 * and Devanagari variations (Nuktas, ZWJ/ZWNJ, Chandrabindu/Anusvara, Purnaviram)
 * match identically across English, Mangal Unicode, and Kruti Dev.
 */
export const normalizeChar = (char: string): string => {
  if (!char) return "";
  return char
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\u02BB\u02BC\u02BD\u0027\u0060]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u0022]/g, '"')
    .replace(/[\u2013\u2014\u2212\u2010\u2011]/g, "-")
    .replace(/[\uFF0C]/g, ",")
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, "") // remove zero-width & non-breaking spaces
    .replace(/[|]/g, "।")
    .replace(/[\u0970\u0966]/g, "०")
    // Devanagari Nukta Normalization (unify precomposed & decomposed nuktas)
    .replace(/\u093C/g, "") // Strip nukta mark
    .replace(/[\u0958]/g, "क")
    .replace(/[\u0959]/g, "ख")
    .replace(/[\u095A]/g, "ग")
    .replace(/[\u095B]/g, "ज")
    .replace(/[\u095C]/g, "ड")
    .replace(/[\u095D]/g, "ढ")
    .replace(/[\u095E]/g, "फ")
    // Chandrabindu to Anusvara unification
    .replace(/\u0901/g, "ं");
};

/**
 * Unicode-aware word normalizer
 */
export const normalizeWord = (w: string): string => {
  if (!w) return "";
  return w.normalize("NFC").split("").map(normalizeChar).join("");
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

  const normOrig = cleanOriginal.map(normalizeWord);
  const normTyped = committedTypedWords.map(normalizeWord);

  const statuses: ("correct" | "error" | "pending" | "active")[] = new Array(
    cleanOriginal.length
  ).fill("pending");

  let i = 0; // index in cleanOriginal
  let j = 0; // index in committedTypedWords
  let mistakes = 0;
  let correctCount = 0;

  while (i < cleanOriginal.length && j < committedTypedWords.length) {
    const o = normOrig[i];
    const t = normTyped[j];

    // 1. Direct Match (Exact or Punctuation-tolerant)
    if (o === t || (cleanPunctuation(o) !== "" && cleanPunctuation(o) === cleanPunctuation(t))) {
      statuses[i] = "correct";
      correctCount++;
      i++;
      j++;
      continue;
    }

    // 2. Accidental Space in the middle of a word (Split word: e.g. "भा" + "रत" === "भारत")
    if (j + 1 < committedTypedWords.length && normTyped[j] + normTyped[j + 1] === o) {
      mistakes += 1; // single mistake for the accidental space
      statuses[i] = "error";
      i++;
      j += 2;
      continue;
    }

    // 2b. Accidental 3-part split
    if (
      j + 2 < committedTypedWords.length &&
      normTyped[j] + normTyped[j + 1] + normTyped[j + 2] === o
    ) {
      mistakes += 1;
      statuses[i] = "error";
      i++;
      j += 3;
      continue;
    }

    // 3. Extra Word / Stray Token from accidental space (next typed matches current original)
    if (j + 1 < committedTypedWords.length && (normTyped[j + 1] === o || (cleanPunctuation(normTyped[j + 1]) !== "" && cleanPunctuation(normTyped[j + 1]) === cleanPunctuation(o)))) {
      mistakes += 1; // single mistake for stray token
      j++; // skip stray token, i stays at current original word
      continue;
    }

    // 4. Skipped Word in Passage (current typed matches next original)
    if (i + 1 < cleanOriginal.length && (t === normOrig[i + 1] || (cleanPunctuation(t) !== "" && cleanPunctuation(t) === cleanPunctuation(normOrig[i + 1])))) {
      mistakes += 1;
      statuses[i] = "error";
      i++; // advance past skipped original word
      continue;
    }

    // 5. Word Substitution / Typo (next typed matches next original)
    if (
      i + 1 < cleanOriginal.length &&
      j + 1 < committedTypedWords.length &&
      (normTyped[j + 1] === normOrig[i + 1] || (cleanPunctuation(normTyped[j + 1]) !== "" && cleanPunctuation(normTyped[j + 1]) === cleanPunctuation(normOrig[i + 1])))
    ) {
      mistakes += 1;
      statuses[i] = "error";
      i++;
      j++;
      continue;
    }

    // 6. Lookahead window (up to distance 3) to recover from multi-word drift
    let bestMatch: { di: number; dj: number } | null = null;
    for (let dist = 2; dist <= 3; dist++) {
      for (let di = 1; di <= dist; di++) {
        const dj = dist - di;
        if (dj >= 1 && i + di < cleanOriginal.length && j + dj < committedTypedWords.length) {
          if (normOrig[i + di] === normTyped[j + dj] || (cleanPunctuation(normOrig[i + di]) !== "" && cleanPunctuation(normOrig[i + di]) === cleanPunctuation(normTyped[j + dj]))) {
            bestMatch = { di, dj };
            break;
          }
        }
      }
      if (bestMatch) break;
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

export interface AlignedTranscriptWord {
  word: string;
  isCorrect: boolean;
  isHalf?: boolean;
}

export interface AlignedPassageEvaluation {
  correctWords: number;
  wrongWords: number;
  correctStrokes: number;
  wrongStrokes: number;
  fullMistakes: number;
  halfMistakes: number;
  totalErrors: number;
  extraSpacesCount: number;
  transcriptWords: AlignedTranscriptWord[];
}

/**
 * Full Passage Alignment and Evaluation for Exam Results
 * Accurately identifies correct and incorrect words without false errors or cascade penalties.
 */
export function alignFullPassage(
  passage: string,
  submittedText: string,
  options?: {
    allowHalfMistakes?: boolean;
    isHindi?: boolean;
  }
): AlignedPassageEvaluation {
  const allowHalfMistakes = options?.allowHalfMistakes !== undefined ? options.allowHalfMistakes : true;
  const isHindi = options?.isHindi || false;

  const originalWords = (passage || "").trim().split(/\s+/).filter(w => w.length > 0);
  const submittedWords = (submittedText || "").trim().split(/\s+/).filter(w => w.length > 0);

  const normOrig = originalWords.map(normalizeWord);
  const normTyped = submittedWords.map(normalizeWord);

  let i = 0;
  let j = 0;
  let correctWords = 0;
  let wrongWords = 0;
  let correctStrokes = 0;
  let wrongStrokes = 0;
  let fullMistakes = 0;
  let halfMistakes = 0;

  const transcriptWords: AlignedTranscriptWord[] = [];

  while (i < originalWords.length && j < submittedWords.length) {
    const origWord = originalWords[i];
    const typedWord = submittedWords[j];
    const o = normOrig[i];
    const t = normTyped[j];

    // 1. Direct Match (Exact character match after normalization)
    if (o === t) {
      correctWords++;
      correctStrokes += typedWord.length + 1;
      transcriptWords.push({ word: typedWord, isCorrect: true });
      i++;
      j++;
      continue;
    }

    // 1b. Punctuation / Capitalization Match (Stem matches when edge punctuation removed)
    const cleanO = cleanPunctuation(o);
    const cleanT = cleanPunctuation(t);
    if (cleanO !== "" && (cleanO === cleanT || (!isHindi && cleanO.toLowerCase() === cleanT.toLowerCase()))) {
      const isCaseOrPunctDiff = (o !== t);
      if (isCaseOrPunctDiff && allowHalfMistakes) {
        halfMistakes++;
        transcriptWords.push({ word: typedWord, isCorrect: true, isHalf: true });
      } else if (isCaseOrPunctDiff) {
        fullMistakes++;
        transcriptWords.push({ word: typedWord, isCorrect: true, isHalf: true });
      } else {
        transcriptWords.push({ word: typedWord, isCorrect: true });
      }
      correctWords++;
      correctStrokes += typedWord.length + 1;
      i++;
      j++;
      continue;
    }

    // 2. Accidental Space Split (e.g. "भा" + "रत" === "भारत") -> Single mistake, auto-syncs next words!
    if (j + 1 < submittedWords.length && (normTyped[j] + normTyped[j + 1] === o || cleanPunctuation(normTyped[j] + normTyped[j + 1]) === cleanO)) {
      fullMistakes++;
      wrongWords++;
      wrongStrokes += submittedWords[j].length + submittedWords[j + 1].length + 1;
      transcriptWords.push({ word: `${submittedWords[j]} ${submittedWords[j + 1]}`, isCorrect: false });
      i++;
      j += 2;
      continue;
    }

    // 2b. 3-part split
    if (
      j + 2 < submittedWords.length &&
      (normTyped[j] + normTyped[j + 1] + normTyped[j + 2] === o || cleanPunctuation(normTyped[j] + normTyped[j + 1] + normTyped[j + 2]) === cleanO)
    ) {
      fullMistakes++;
      wrongWords++;
      wrongStrokes += submittedWords[j].length + submittedWords[j + 1].length + submittedWords[j + 2].length + 1;
      transcriptWords.push({ word: `${submittedWords[j]} ${submittedWords[j + 1]} ${submittedWords[j + 2]}`, isCorrect: false });
      i++;
      j += 3;
      continue;
    }

    // 3. Extra Word / Stray Token from accidental space (next typed matches current original)
    if (j + 1 < submittedWords.length && (normTyped[j + 1] === o || (cleanPunctuation(normTyped[j + 1]) !== "" && cleanPunctuation(normTyped[j + 1]) === cleanO))) {
      fullMistakes++;
      wrongWords++;
      wrongStrokes += typedWord.length + 1;
      transcriptWords.push({ word: typedWord, isCorrect: false });
      j++; // skip extra token, i stays at current original word to align next word!
      continue;
    }

    // 4. Skipped Word in Passage (current typed matches next original)
    if (i + 1 < originalWords.length && (t === normOrig[i + 1] || (cleanT !== "" && cleanT === cleanPunctuation(normOrig[i + 1])))) {
      fullMistakes++;
      wrongWords++;
      wrongStrokes += origWord.length + 1;
      transcriptWords.push({ word: `[छूटा: ${origWord}]`, isCorrect: false });
      i++; // advance past skipped original word
      continue;
    }

    // 5. Word Substitution / Typo (next typed matches next original)
    if (
      i + 1 < originalWords.length &&
      j + 1 < submittedWords.length &&
      (normTyped[j + 1] === normOrig[i + 1] || (cleanPunctuation(normTyped[j + 1]) !== "" && cleanPunctuation(normTyped[j + 1]) === cleanPunctuation(normOrig[i + 1])))
    ) {
      wrongWords++;
      fullMistakes++;

      const mLen = Math.min(typedWord.length, origWord.length);
      for (let k = 0; k < mLen; k++) {
        if (typedWord[k] === origWord[k]) correctStrokes++;
        else wrongStrokes++;
      }
      wrongStrokes += Math.abs(typedWord.length - origWord.length) + 1;

      transcriptWords.push({ word: typedWord, isCorrect: false });
      i++;
      j++;
      continue;
    }

    // 6. Lookahead window (up to distance 3) to recover from multi-word drift
    let bestMatch: { di: number; dj: number } | null = null;
    for (let dist = 2; dist <= 3; dist++) {
      for (let di = 1; di <= dist; di++) {
        const dj = dist - di;
        if (dj >= 1 && i + di < originalWords.length && j + dj < submittedWords.length) {
          if (normOrig[i + di] === normTyped[j + dj] || (cleanPunctuation(normOrig[i + di]) !== "" && cleanPunctuation(normOrig[i + di]) === cleanPunctuation(normTyped[j + dj]))) {
            bestMatch = { di, dj };
            break;
          }
        }
      }
      if (bestMatch) break;
    }

    if (bestMatch) {
      for (let k = 0; k < bestMatch.dj; k++) {
        transcriptWords.push({ word: submittedWords[j + k], isCorrect: false });
        wrongWords++;
        wrongStrokes += submittedWords[j + k].length + 1;
      }
      fullMistakes += Math.max(bestMatch.di, bestMatch.dj);
      i += bestMatch.di;
      j += bestMatch.dj;
      continue;
    }

    // 7. Fallback: single word error
    wrongWords++;
    fullMistakes++;

    const mLen = Math.min(typedWord.length, origWord.length);
    for (let k = 0; k < mLen; k++) {
      if (typedWord[k] === origWord[k]) correctStrokes++;
      else wrongStrokes++;
    }
    wrongStrokes += Math.abs(typedWord.length - origWord.length) + 1;

    transcriptWords.push({ word: typedWord, isCorrect: false });
    i++;
    j++;
  }

  // Any remaining submitted words
  while (j < submittedWords.length) {
    fullMistakes++;
    wrongWords++;
    wrongStrokes += submittedWords[j].length + 1;
    transcriptWords.push({ word: submittedWords[j], isCorrect: false });
    j++;
  }

  // NOTE: Un-typed remaining original words in passage are NOT counted as mistakes!
  // In timed typing tests, candidates are only evaluated on what they attempted within the time limit.

  // Count consecutive space occurrences in submittedText as single mistakes (1 mistake per extra space press)
  const consecutiveSpaceMatches = (submittedText || "").match(/\s{2,}/g) || [];
  const extraSpacesCount = consecutiveSpaceMatches.reduce((acc, m) => acc + (m.length - 1), 0);

  const totalErrors = !allowHalfMistakes 
    ? fullMistakes + extraSpacesCount 
    : fullMistakes + (halfMistakes / 2) + extraSpacesCount;

  return {
    correctWords,
    wrongWords: wrongWords + extraSpacesCount,
    correctStrokes,
    wrongStrokes: wrongStrokes + extraSpacesCount,
    fullMistakes: fullMistakes + extraSpacesCount,
    halfMistakes,
    totalErrors,
    extraSpacesCount,
    transcriptWords,
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
