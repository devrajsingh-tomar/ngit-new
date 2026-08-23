// Keystroke Layout Transformers for Remington GAIL, Kruti Dev, and Inscript Devanagari

// 1. Remington GAIL & Kruti Dev 010 Layout Map
export const REMINGTON_MAP: Record<string, string> = {
  // Lowercase keys
  a: "ं",
  b: "इ",
  c: "ब",
  d: "्",
  e: "म",
  f: "ि",
  g: "ु",
  h: "प",
  i: "प",
  j: "र",
  k: "ा",
  l: "स",
  m: "ड",
  n: "द",
  o: "व",
  p: "च",
  q: "ु",
  r: "त",
  s: "े",
  t: "ज",
  u: "न",
  v: "अ",
  w: "ू",
  x: "ग",
  y: "ल",
  z: "्र",
  ";": "य",
  "'": "श",
  ",": "ए",
  ".": "ण",
  "/": "य",
  "[": "ख",
  "]": "द",
  "\\": "्",
  "`": "्",
  "-": "ः",
  "=": "ृ",

  // Uppercase keys
  A: "़",
  B: "ठ",
  C: "ब्",
  D: "अ",
  E: "म्",
  F: "इ",
  G: "उ",
  H: "फ",
  I: "प्",
  J: "श्र",
  K: "ज्ञा",
  L: "ष",
  M: "ढ",
  N: "छ",
  O: "व्",
  P: "च्",
  Q: "फ",
  R: "त्",
  S: "ै",
  T: "ज्",
  U: "न्",
  V: "ट",
  W: "ऑ",
  X: "ग्",
  Y: "ल्",
  Z: "र्",
  ":": "छ",
  '"': "ठ",
  "<": "ढ",
  ">": "झ",
  "?": "घ",
  "{": "ख्",
  "}": "ध",
  "|": "।",
  "~": "्",
  "_": "ऋ",
  "+": "ऋ",

  // Digits & Symbols
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
  "0": "०",
  "!": "!",
  "@": "ज्ञ",
  "#": "त्र",
  "$": "क्ष",
  "%": "%",
  "^": "‘",
  "&": "’",
  "*": "₹",
  "(": "(",
  ")": ")",
};

// 2. Inscript Devanagari Layout Map
export const INSCRIPT_MAP: Record<string, string> = {
  a: "ो",
  b: "व",
  c: "म",
  d: "्",
  e: "ा",
  f: "ि",
  g: "ु",
  h: "प",
  i: "ग",
  j: "र",
  k: "ा",
  l: "स",
  m: "स",
  n: "ल",
  o: "द",
  p: "ज",
  q: "ौ",
  r: "ी",
  s: "े",
  t: "ू",
  u: "ह",
  v: "न",
  w: "ै",
  x: "ं",
  y: "ब",
  z: "े",
  ";": "य",
  "'": "श्",
  ",": ",",
  ".": "।",
  "/": "य",
  "[": "ड",
  "]": "़",

  A: "ौ",
  B: "व",
  C: "ण",
  D: "अ",
  E: "आ",
  F: "इ",
  G: "उ",
  H: "फ",
  I: "घ",
  J: "्र",
  K: "आ",
  L: "ष",
  M: "श",
  N: "ळ",
  O: "ध",
  P: "झ",
  Q: "औ",
  R: "ई",
  S: "ऐ",
  T: "ऊ",
  U: "ङ",
  V: "न",
  W: "ऐ",
  X: "ँ",
  Y: "भ",
  Z: "ऐ",
  ":": "छ",
  '"': "ठ",
  "<": "ष",
  ">": "।",
  "?": "घ",
  "{": "ढ",
  "}": "ञ",
};

/**
 * Transforms a single key char into Hindi Devanagari character based on selected layout font
 */
export function mapKeystrokeToHindi(keyChar: string, fontFamily: string): string | null {
  const normFont = (fontFamily || "").toLowerCase();

  // If font is English (Arial, Times, Helvetica, Standard), do not convert
  if (normFont.includes("arial") || normFont.includes("english") || normFont.includes("sans-serif")) {
    return null; // Return null so original key is preserved
  }

  // If layout is Inscript
  if (normFont.includes("inscript")) {
    return INSCRIPT_MAP[keyChar] || null;
  }

  // Default to Remington GAIL / Kruti Dev 010 Layout (Used by Mangal Remington GAIL & Kruti Dev 010)
  return REMINGTON_MAP[keyChar] || null;
}

/**
 * Handles input transformation on textarea event for Hindi Typing
 */
export function handleHindiTextareaKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  fontFamily: string,
  currentText: string,
  setText: (newVal: string) => void
): boolean {
  // If control/alt/cmd key is held, or special navigation key (Backspace, Enter, Tab, Arrow keys), allow default browser behavior
  if (
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    e.key === "Backspace" ||
    e.key === "Enter" ||
    e.key === "Tab" ||
    e.key.startsWith("Arrow") ||
    e.key.startsWith("F") ||
    e.key === "Escape"
  ) {
    return false;
  }

  // If typing spacebar, space is space
  if (e.key === " ") {
    return false;
  }

  // Convert key char if mapped
  if (e.key.length === 1) {
    const hindiChar = mapKeystrokeToHindi(e.key, fontFamily);
    if (hindiChar) {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;

      const before = currentText.substring(0, start);
      const after = currentText.substring(end);
      const newText = before + hindiChar + after;

      setText(newText);

      // Restore cursor position right after inserted Hindi character
      setTimeout(() => {
        const newPos = start + hindiChar.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);

      return true;
    }
  }

  return false;
}
