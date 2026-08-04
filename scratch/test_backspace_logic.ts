function testBackspace(typedText: string, val: string) {
  const settings = { backspaceMode: 'upssssc' };
  const isDeletion = val.length < typedText.length;

  if (isDeletion) {
    if (settings.backspaceMode === 'upssssc') {
      const typedWords = typedText.split(' ');
      if (typedWords.length >= 3) {
        const lockedWords = typedWords.slice(0, typedWords.length - 2);
        const lockedText = lockedWords.join(' ') + ' ';
        if (val.length < lockedText.length) {
          return "BLOCKED";
        }
      }
    }
  }
  return "ALLOWED";
}

// Test cases
console.log("Test 1: Deleting character from 'word1 word2 word3':", testBackspace("word1 word2 word3", "word1 word2 word")); // Should be ALLOWED
console.log("Test 2: Deleting character from 'word1 word2 w':", testBackspace("word1 word2 w", "word1 word2 ")); // Should be ALLOWED
console.log("Test 3: Deleting space from 'word1 word2 ':", testBackspace("word1 word2 ", "word1 word2")); // Should be ALLOWED
console.log("Test 4: Deleting character from 'word1 word2':", testBackspace("word1 word2", "word1 word")); // Should be ALLOWED
console.log("Test 5: Deleting space from 'word1 ':", testBackspace("word1 ", "word1")); // Should be BLOCKED
console.log("Test 6: Deleting character from 'word1 word2 word3 word4':", testBackspace("word1 word2 word3 word4", "word1 word2 word3 word")); // Should be ALLOWED
console.log("Test 7: Deleting from 'word1 word2 word3 ':", testBackspace("word1 word2 word3 ", "word1 word2 word3")); // Should be ALLOWED
console.log("Test 8: Deleting space from 'word1 word2 ':", testBackspace("word1 word2 ", "word1 word2")); // Should be ALLOWED
console.log("Test 9: Deleting from 'word1 word2 w':", testBackspace("word1 word2 w", "word1 word2 ")); // Should be ALLOWED
console.log("Test 10: Deleting space from 'word1 word2 ':", testBackspace("word1 word2 ", "word1 word2")); // Should be ALLOWED
console.log("Test 11: Deleting from 'word1 word2':", testBackspace("word1 word2", "word1 word")); // Should be ALLOWED
console.log("Test 12: Deleting space from 'word1 ':", testBackspace("word1 ", "word1")); // Should be BLOCKED
