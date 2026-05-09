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
      // Direct Match
      if (word === originalWords[passageIdx]) {
        passageIdx++;
      } 
      // Skip-Detection: If this word matches the NEXT word in the passage, 
      // we assume the student skipped a word.
      else if (passageIdx + 1 < originalWords.length && word === originalWords[passageIdx + 1]) {
        errors++; // Count the skipped word as a full mistake
        passageIdx += 2; // Jump ahead to stay synced
      }
      // Traditional Error
      else {
        errors++;
        passageIdx++;
      }
    } else {
      // Extra words typed
      errors++;
    }
  });

  // NEW: Extra Space Penalty (Double spaces count as half mistake)
  // Each instance of consecutive spaces (2 or more) adds a 0.5 penalty
  const consecutiveSpaceMatches = typedText.match(/\s{2,}/g) || [];
  const extraSpacesPenalty = consecutiveSpaceMatches.reduce((acc, match) => acc + (match.length - 1) * 0.5, 0);
  errors += extraSpacesPenalty;



  // Gross WPM (Raw Speed): (Total Characters / 5) / Time
  const grossWpm = Math.round((totalCharacters / 5) / timeMinutes);

  // Net WPM (Adjusted Speed): Gross WPM - (Errors / Time)
  // Standard Government Formula: Net WPM = ((Total Characters / 5) - Errors) / Time
  const netWpm = Math.round(((totalCharacters / 5) - errors) / timeMinutes);

  // Accuracy: ((Correct Characters) / Total Characters) * 100
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
 * Returns state for each character in the current word
 */
export const compareCharacters = (original: string, typed: string) => {
  return original.split('').map((char, index) => {
    if (index >= typed.length) return 'pending';
    return char === typed[index] ? 'correct' : 'incorrect';
  });
};
