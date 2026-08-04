function getLockedLength(text: string) {
  const spaceIndices: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' || text[i] === '\n') {
      spaceIndices.push(i);
    }
  }
  
  const S = spaceIndices.length;
  if (S >= 2) {
    return spaceIndices[S - 2] + 1;
  }
  return 0;
}

class TestState {
  typedText: string = "";
  lockedLength: number = 0;

  typeText(newText: string) {
    const isDeletion = newText.length < this.typedText.length;
    if (isDeletion) {
      if (newText.length < this.lockedLength) {
        return "BLOCKED";
      }
    }
    
    this.typedText = newText;
    const thresh = getLockedLength(newText);
    this.lockedLength = Math.max(this.lockedLength, thresh);
    return "ALLOWED";
  }
}

const state = new TestState();

// 1. Type "word1"
console.log("Type 'word1':", state.typeText("word1"), `(locked: ${state.lockedLength})`);
// 2. Type "word1 "
console.log("Type 'word1 ':", state.typeText("word1 "), `(locked: ${state.lockedLength})`);
// 3. Delete space -> "word1"
console.log("Delete space -> 'word1':", state.typeText("word1"), `(locked: ${state.lockedLength})`);
// 4. Type "word1 word2"
console.log("Type 'word1 word2':", state.typeText("word1 word2"), `(locked: ${state.lockedLength})`);
// 5. Type "word1 word2 "
console.log("Type 'word1 word2 ':", state.typeText("word1 word2 "), `(locked: ${state.lockedLength})`);
// 6. Delete space -> "word1 word2"
console.log("Delete space -> 'word1 word2':", state.typeText("word1 word2"), `(locked: ${state.lockedLength})`);
// 7. Delete '2' -> "word1 word"
console.log("Delete '2' -> 'word1 word':", state.typeText("word1 word"), `(locked: ${state.lockedLength})`);
// 8. Delete all 'word' -> "word1 "
console.log("Delete all 'word' -> 'word1 ':", state.typeText("word1 "), `(locked: ${state.lockedLength})`);
// 9. Try to delete space from 'word1 ' -> "word1"
console.log("Try to delete space -> 'word1':", state.typeText("word1"), `(locked: ${state.lockedLength})`);

// 10. Start typing third word
state.typeText("word1 word2");
state.typeText("word1 word2 ");
state.typeText("word1 word2 word3");
console.log("\nType 'word1 word2 word3':", `(locked: ${state.lockedLength})`);
state.typeText("word1 word2 word3 ");
console.log("Type 'word1 word2 word3 ':", `(locked: ${state.lockedLength})`);
console.log("Try to delete 'word2 ' -> 'word1 ':", state.typeText("word1 "), `(locked: ${state.lockedLength})`);
