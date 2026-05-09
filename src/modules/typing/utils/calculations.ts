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

/**
 * Normalizes characters to ensure common symbols (quotes, apostrophes, commas) 
 * match regardless of whether they are "smart/curly" or "straight".
 */
export const normalizeChar = (char: string): string => {
  if (!char) return "";
  return char
    .replace(/[\u2018\u2019\u201B\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033\u2036]/g, '"')
    .replace(/[\uFF0C]/g, ",")
    .replace(/[\u00A0]/g, " ");
};

/**
 * Calculates typing metrics based on the provided input and original passage
 * @param typedText The text entered by the user
 * @param passage The original text to compare against
 * @param timeMinutes Time elapsed in minutes
 * @returns Object containing WPM, Raw WPM, Accuracy, and Error Count
 */
export const calculateMetrics = (
  typedText: string,
  passage: string,
  timeMinutes: number
): TypingMetrics => {
  if (timeMinutes <= 0) timeMinutes = 0.01; // Avoid division by zero

  const originalWords = passage.trim().split(/\s+/);
  const typedWords = typedText.trim().split(/\s+/);
  
  let errors = 0;
  const totalCharacters = typedText.length;

  // Word-by-word error detection with skip-resilience
  let passageIdx = 0;
  typedWords.forEach((word, idx) => {
    if (passageIdx < originalWords.length) {
      const normTyped = word.split('').map(normalizeChar).join('');
      const normOriginal = originalWords[passageIdx].split('').map(normalizeChar).join('');
      const normNextOriginal = originalWords[passageIdx + 1]?.split('').map(normalizeChar).join('');

      // Direct Match
      if (normTyped === normOriginal) {
        passageIdx++;
      } 
      // Skip-Detection
      else if (passageIdx + 1 < originalWords.length && normTyped === normNextOriginal) {
        errors++; 
        passageIdx += 2; 
      }
      // Traditional Error
      else {
        errors++;
        passageIdx++;
      }
    } else {
      errors++;
    }
  });

  // NEW: Extra Space Penalty (Double spaces count as half mistake)
  const consecutiveSpaceMatches = typedText.match(/\s{2,}/g) || [];
  const extraSpacesPenalty = consecutiveSpaceMatches.reduce((acc, match) => acc + (match.length - 1) * 0.5, 0);
  errors += extraSpacesPenalty;

  const grossWpm = Math.round((totalCharacters / 5) / timeMinutes);
  const netWpm = Math.round(((totalCharacters / 5) - errors) / timeMinutes);

  const accuracy = totalCharacters > 0 
    ? Math.max(0, Math.round(((totalCharacters - errors) / totalCharacters) * 100)) 
    : 100;

  const progress = Math.min(100, Math.round((typedWords.length / originalWords.length) * 100));

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
