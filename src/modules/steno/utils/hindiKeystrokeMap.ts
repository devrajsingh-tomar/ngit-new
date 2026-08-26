import { mapEventToInscript } from "@/modules/typing/utils/InscriptEngine";

export type StenoTypingModeType = "unicode_hindi" | "krutidev_010" | "english";

export interface StenoTypingModeConfig {
  type: StenoTypingModeType;
  label: string;
  inputMode: "unicode" | "krutidev" | "english";
  displayFont: string;
}

export const STENO_TYPING_MODES: StenoTypingModeConfig[] = [
  {
    type: "unicode_hindi",
    label: "Hindi - Unicode / Mangal",
    inputMode: "unicode",
    displayFont: "Mangal",
  },
  {
    type: "krutidev_010",
    label: "Hindi - Kruti Dev 010",
    inputMode: "krutidev",
    displayFont: "Kruti Dev 010",
  },
  {
    type: "english",
    label: "English",
    inputMode: "english",
    displayFont: "English",
  },
];

/**
 * Resolves any font name or mode string into the canonical Steno typing mode
 * Provides 100% backward compatibility for existing exams and test configurations.
 */
export function resolveStenoTypingMode(value?: string): StenoTypingModeConfig {
  const norm = (value || "").toLowerCase().trim();
  if (
    norm === "krutidev_010" ||
    norm.includes("kruti") ||
    norm.includes("remington") ||
    norm === "legacy"
  ) {
    return STENO_TYPING_MODES[1]; // Hindi - Kruti Dev 010
  }
  if (norm === "english" || norm.includes("arial") || norm === "en") {
    return STENO_TYPING_MODES[2]; // English
  }
  // Default is Hindi - Unicode / Mangal
  return STENO_TYPING_MODES[0];
}

// 1. Complete Kruti Dev 010 Direct Key Mapping (Normal + Shift)


export const KRUTI_DEV_010_MAP: Record<string, string> = {
  // Top Row (Q to \)
  q: "कु",
  Q: "फ",
  w: "कू",
  W: "कॅ",
  e: "म",
  E: "म्",
  r: "त",
  R: "त्",
  t: "ज",
  T: "ज्",
  y: "ल",
  Y: "ल्",
  u: "न",
  U: "न्",
  i: "प",
  I: "प्",
  o: "व",
  O: "व्",
  p: "च",
  P: "च्",
  "[": "ख्",
  "{": "क्ष्",
  "]": ",",
  "}": "द्व",
  "\\": "?",
  "|": "द्य",

  // Special Keys & Numbers
  "`": "कृ",
  "~": "क्",
  "=": "त्र",
  "+": "क़",
  "-": ".",
  "_": "ऋ",
  "0": "0",
  ")": "द्ध",
  "1": "1",
  "!": "!",
  "2": "2",
  "@": "@",
  "3": "3",
  "#": "#",
  "4": "4",
  "$": "$",
  "5": "5",
  "%": "%",
  "6": "6",
  "^": "‘",
  "7": "7",
  "&": "’",
  "8": "8",
  "*": "₹",
  "9": "9",
  "(": "(",

  // Home Row (A to ')
  a: "कं",
  A: "।",
  s: "के",
  S: "कै",
  d: "क",
  D: "क्",
  f: "कि",
  F: "थ्",
  g: "ह",
  G: "ळ",
  h: "की",
  H: "भ्",
  j: "र",
  J: "श्र",
  k: "का",
  K: "ज्ञ",
  l: "स",
  L: "स्",
  ";": "य",
  ":": "रू",
  "'": "श्",
  '"': "ष्",

  // Bottom Row (Z to /)
  z: "क्र",
  Z: "र्",
  x: "ग",
  X: "ग्",
  c: "ब",
  C: "ब्",
  v: "अ",
  V: "ट",
  b: "इ",
  B: "ठ",
  n: "द",
  N: "छ",
  m: "उ",
  M: "ड",
  ",": "ए",
  "<": "ढ",
  ".": "ण्",
  ">": "झ",
  "/": "ध्",
  "?": "घ्",
};

// Aliased to REMINGTON_MAP for backward compatibility
export const REMINGTON_MAP: Record<string, string> = { ...KRUTI_DEV_010_MAP };

// 2. Inscript Devanagari Layout Map
export const INSCRIPT_MAP: Record<string, string> = {
  // Row 1 (Numbers & Symbols)
  "`": "ो",
  "~": "ओ",
  "1": "1",
  "!": "ऍ",
  "2": "2",
  "@": "ॅ",
  "3": "3",
  "#": "्र",
  "4": "4",
  "$": "र्",
  "5": "5",
  "%": "ज्ञ",
  "6": "6",
  "^": "त्र",
  "7": "7",
  "&": "क्ष",
  "8": "8",
  "*": "श्र",
  "9": "9",
  "(": "(",
  "0": "0",
  ")": ")",
  "-": "-",
  "_": "ः",
  "=": "ृ",
  "+": "ऋ",

  // Row 2
  q: "ौ",
  Q: "औ",
  w: "ै",
  W: "ऐ",
  e: "ा",
  E: "आ",
  r: "ी",
  R: "ई",
  t: "ू",
  T: "ऊ",
  y: "ब",
  Y: "भ",
  u: "ह",
  U: "ङ",
  i: "ग",
  I: "घ",
  o: "द",
  O: "ध",
  p: "ज",
  P: "झ",
  "[": "ड",
  "{": "ढ",
  "]": "़",
  "}": "ञ",
  "\\": "ॉ",
  "|": "ऑ",

  // Row 3
  a: "ो",
  A: "ओ",
  s: "े",
  S: "ए",
  d: "्",
  D: "अ",
  f: "ि",
  F: "इ",
  g: "ु",
  G: "उ",
  h: "प",
  H: "फ",
  j: "र",
  J: "ऱ",
  k: "क",
  K: "ख",
  l: "त",
  L: "थ",
  ";": "च",
  ":": "छ",
  "'": "ट",
  '"': "ठ",

  // Row 4
  z: "ॄ",
  Z: "ऋ",
  x: "ं",
  X: "ँ",
  c: "म",
  C: "ण",
  v: "न",
  V: "ऩ",
  b: "व",
  B: "ळ",
  n: "ल",
  N: "ळ",
  m: "स",
  M: "श",
  ",": ",",
  "<": "ष",
  ".": "।",
  ">": "।",
  "/": "य",
  "?": "य",
};

// 3. Physical Code Map for Kruti Dev 010 (Caps-Lock Immune)
export const KRUTI_DEV_CODE_MAP: Record<string, { normal: string; shift: string }> = {
  // Row 1 (Numbers & Special keys)
  Backquote: { normal: "कृ", shift: "क्" },
  Digit1: { normal: "1", shift: "!" },
  Digit2: { normal: "2", shift: "@" },
  Digit3: { normal: "3", shift: "#" },
  Digit4: { normal: "4", shift: "$" },
  Digit5: { normal: "5", shift: "%" },
  Digit6: { normal: "6", shift: "‘" },
  Digit7: { normal: "7", shift: "’" },
  Digit8: { normal: "8", shift: "₹" },
  Digit9: { normal: "9", shift: "(" },
  Digit0: { normal: "0", shift: "द्ध" },
  Minus: { normal: ".", shift: "ऋ" },
  Equal: { normal: "त्र", shift: "क़" },

  // Row 2 (Top Row - Q to \)
  KeyQ: { normal: "कु", shift: "फ" },
  KeyW: { normal: "कू", shift: "कॅ" },
  KeyE: { normal: "म", shift: "म्" },
  KeyR: { normal: "त", shift: "त्" },
  KeyT: { normal: "ज", shift: "ज्" },
  KeyY: { normal: "ल", shift: "ल्" },
  KeyU: { normal: "न", shift: "न्" },
  KeyI: { normal: "प", shift: "प्" },
  KeyO: { normal: "व", shift: "व्" },
  KeyP: { normal: "च", shift: "च्" },
  BracketLeft: { normal: "ख्", shift: "क्ष्" },
  BracketRight: { normal: ",", shift: "द्व" },
  Backslash: { normal: "?", shift: "द्य" },

  // Row 3 (Home Row - A to ')
  KeyA: { normal: "कं", shift: "।" },
  KeyS: { normal: "के", shift: "कै" },
  KeyD: { normal: "क", shift: "क्" },
  KeyF: { normal: "कि", shift: "थ्" },
  KeyG: { normal: "ह", shift: "ळ" },
  KeyH: { normal: "की", shift: "भ्" },
  KeyJ: { normal: "र", shift: "श्र" },
  KeyK: { normal: "का", shift: "ज्ञ" },
  KeyL: { normal: "स", shift: "स्" },
  Semicolon: { normal: "य", shift: "रू" },
  Quote: { normal: "श्", shift: "ष्" },

  // Row 4 (Bottom Row - Z to /)
  KeyZ: { normal: "क्र", shift: "र्" },
  KeyX: { normal: "ग", shift: "ग्" },
  KeyC: { normal: "ब", shift: "ब्" },
  KeyV: { normal: "अ", shift: "ट" },
  KeyB: { normal: "इ", shift: "ठ" },
  KeyN: { normal: "द", shift: "छ" },
  KeyM: { normal: "उ", shift: "ड" },
  Comma: { normal: "ए", shift: "ढ" },
  Period: { normal: "ण्", shift: "झ" },
  Slash: { normal: "ध्", shift: "घ्" },
};

// 4. Kruti Dev Alt-Codes Reference Chart
export interface KrutiDevAltCode {
  code: string;
  char: string;
  desc: string;
  example: string;
}

export const KRUTI_DEV_ALT_CODES: Record<string, KrutiDevAltCode> = {
  "0161": { code: "0161", char: "कँ", desc: "चंद्रबिंदु", example: "हूँ, नहीं" },
  "0165": { code: "0165", char: "ञ", desc: "ञ अक्षर", example: "पञ्चायत" },
  "0179": { code: "0179", char: "ङ", desc: "ङ अक्षर", example: "शङ्का, गङ्गा" },
  "0196": { code: "0196", char: "घ", desc: "घ अक्षर", example: "घर, बाघ" },
  "0197": { code: "0197", char: "ऊ", desc: "बड़ा ऊ (दीर्घ स्वर)", example: "ऊपर" },
  "0210": { code: "0210", char: "भ", desc: "भ अक्षर", example: "भारत, सभा" },
  "0216": { code: "0216", char: "क्र", desc: "क्र संयुक्त अक्षर", example: "क्रम, चक्र" },
  "0221": { code: "0221", char: "फ्र", desc: "फ्र संयुक्त अक्षर", example: "फ्रांस" },
  "0224": { code: "0224", char: "ह्न", desc: "ह्न संयुक्त अक्षर", example: "चिह्न" },
  "0225": { code: "0225", char: "ह्य", desc: "ह्य संयुक्त अक्षर", example: "सह्य" },
  "0227": { code: "0227", char: "ह्म", desc: "ह्म संयुक्त अक्षर", example: "ब्रह्म" },
  "0228": { code: "0228", char: "क्त", desc: "क्त संयुक्त अक्षर", example: "तथ्य, संपर्क, रक्त" },
  "0229": { code: "0229", char: "॰", desc: "लाघव चिह्न (संक्षेप)", example: "डॉ॰" },
  "0230": { code: "0230", char: "द्र", desc: "द्र संयुक्त अक्षर", example: "द्रव्य, समुद्र" },
  "0231": { code: "0231", char: "प्र", desc: "प्र संयुक्त अक्षर", example: "प्रश्न, प्रधान" },
  "0233": { code: "0233", char: "न्न", desc: "न्न संयुक्त अक्षर", example: "अन्न, सन्नाटा" },
  "0243": { code: "0243", char: "स्त्र", desc: "स्त्र संयुक्त अक्षर", example: "शास्त्र, अस्त्र" },
  "0244": { code: "0244", char: "क्क", desc: "क्क संयुक्त अक्षर", example: "मक्का, धक्का" },
  "0217": { code: "0217", char: "ज्ञ", desc: "ज्ञ संयुक्त अक्षर", example: "ज्ञान, विज्ञान" },
  "0226": { code: "0226", char: "श्र", desc: "श्र संयुक्त अक्षर", example: "श्री, श्रम" },
};

// Map of half consonants in Kruti Dev to their base consonants
export const HALF_TO_FULL_CONSONANT: Record<string, string> = {
  "क्": "क",
  "ख्": "ख",
  "ग्": "ग",
  "घ्": "घ",
  "च्": "च",
  "छ्": "छ",
  "ज्": "ज",
  "झ्": "झ",
  "ट्": "ट",
  "ठ्": "ठ",
  "ड्": "ड",
  "ढ्": "ढ",
  "ण्": "ण",
  "त्": "त",
  "थ्": "थ",
  "द्": "द",
  "ध्": "ध",
  "न्": "न",
  "प्": "प",
  "फ्": "फ",
  "ब्": "ब",
  "भ्": "भ",
  "म्": "म",
  "य्": "य",
  "र्": "र",
  "ल्": "ल",
  "व्": "व",
  "श्": "श",
  "ष्": "ष",
  "स्": "स",
  "ह्": "ह",
  "ळ्": "ळ",
  "क्ष्": "क्ष",
  "त्र्": "त्र",
  "ज्ञ्": "ज्ञ",
  "श्र्": "श्र",
};

// Check if character is a full Devanagari consonant
export const isDevanagariConsonant = (char: string): boolean => {
  if (!char) return false;
  return /^[क-हक़-य़ळऱ]/u.test(char);
};

/**
 * Transforms a key char into Hindi Devanagari character based on selected layout font
 */
export function mapKeystrokeToHindi(keyChar: string, fontFamily: string): string | null {
  const normFont = (fontFamily || "").toLowerCase();

  if (
    normFont.includes("arial") ||
    normFont.includes("english") ||
    (normFont.includes("sans-serif") && !normFont.includes("mangal") && !normFont.includes("kruti"))
  ) {
    return null;
  }

  if (normFont.includes("mangal") || normFont.includes("inscript") || normFont.includes("unicode")) {
    return INSCRIPT_MAP[keyChar] || null;
  }

  if (normFont.includes("kruti") || normFont.includes("remington")) {
    return KRUTI_DEV_010_MAP[keyChar] || null;
  }

  return null;
}


/**
 * Smart Kruti Dev 010 Event Transformer
 * Uses e.code and e.shiftKey for reliable physical key mapping (Caps Lock immune).
 */
export function mapEventToKrutiDev(
  e: React.KeyboardEvent | KeyboardEvent,
  beforeCursor: string
): { replacement: string; deleteCount: number } | null {
  const code = e.code;
  const isShift = !!e.shiftKey;
  const lastChar = beforeCursor.slice(-1);

  // 1. Physical key mapping via KRUTI_DEV_CODE_MAP
  const entry = KRUTI_DEV_CODE_MAP[code];
  if (entry) {
    if (!isShift) {
      // Normal Key Press (Shift NOT pressed)
      if (code === "KeyK") {
        // Complete half-consonant (e.g. क् + k -> क)
        if (beforeCursor.endsWith("्") && beforeCursor.length >= 2) {
          const baseHalf = beforeCursor.slice(-2);
          const full = HALF_TO_FULL_CONSONANT[baseHalf];
          if (full) return { replacement: full, deleteCount: 2 };
        }
        // Matra aa (ा) after consonant
        if (isDevanagariConsonant(lastChar)) {
          return { replacement: "ा", deleteCount: 0 };
        }
        return { replacement: "का", deleteCount: 0 };
      }

      if (code === "KeyF") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ि", deleteCount: 0 };
        return { replacement: "कि", deleteCount: 0 };
      }

      if (code === "KeyH") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ी", deleteCount: 0 };
        return { replacement: "की", deleteCount: 0 };
      }

      if (code === "KeyQ") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ु", deleteCount: 0 };
        return { replacement: "कु", deleteCount: 0 };
      }

      if (code === "KeyW") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ू", deleteCount: 0 };
        return { replacement: "कू", deleteCount: 0 };
      }

      if (code === "KeyS") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "े", deleteCount: 0 };
        return { replacement: "के", deleteCount: 0 };
      }

      if (code === "KeyA") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ं", deleteCount: 0 };
        return { replacement: "कं", deleteCount: 0 };
      }

      if (code === "Backquote") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ृ", deleteCount: 0 };
        return { replacement: "कृ", deleteCount: 0 };
      }

      if (code === "KeyZ") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "्र", deleteCount: 0 };
        return { replacement: "क्र", deleteCount: 0 };
      }

      return { replacement: entry.normal, deleteCount: 0 };
    } else {
      // Shift Key Press (Shift IS held down)
      if (code === "KeyW") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ॅ", deleteCount: 0 };
        return { replacement: "कॅ", deleteCount: 0 };
      }

      if (code === "KeyS") {
        if (isDevanagariConsonant(lastChar)) return { replacement: "ै", deleteCount: 0 };
        return { replacement: "कै", deleteCount: 0 };
      }

      if (code === "KeyK") {
        return { replacement: "ज्ञ", deleteCount: 0 };
      }

      return { replacement: entry.shift, deleteCount: 0 };
    }
  }

  // Fallback for keyChar
  if (e.key && e.key.length === 1) {
    return transformKrutiDevInput(beforeCursor, e.key, isShift);
  }

  return null;
}

/**
 * Smart Kruti Dev 010 string transformer fallback
 */
export function transformKrutiDevInput(
  beforeCursor: string,
  keyChar: string,
  isShiftExplicit?: boolean
): { replacement: string; deleteCount: number } {
  const lastChar = beforeCursor.slice(-1);
  const isUpper = isShiftExplicit !== undefined ? isShiftExplicit : (keyChar >= "A" && keyChar <= "Z");

  if (!isUpper) {
    const lowerKey = keyChar.toLowerCase();

    // 1. Half-consonant completion rule: Half-consonant + k -> Full consonant (e.g. क् + k = क)
    if (lowerKey === "k") {
      if (beforeCursor.endsWith("्") && beforeCursor.length >= 2) {
        const baseHalf = beforeCursor.slice(-2);
        const full = HALF_TO_FULL_CONSONANT[baseHalf];
        if (full) return { replacement: full, deleteCount: 2 };
      }
    }

    // 2. Post-base Matra Composition after Devanagari Consonant
    if (isDevanagariConsonant(lastChar)) {
      if (lowerKey === "f") return { replacement: "ि", deleteCount: 0 };
      if (lowerKey === "k") return { replacement: "ा", deleteCount: 0 };
      if (lowerKey === "h") return { replacement: "ी", deleteCount: 0 };
      if (lowerKey === "q") return { replacement: "ु", deleteCount: 0 };
      if (lowerKey === "w") return { replacement: "ू", deleteCount: 0 };
      if (lowerKey === "s") return { replacement: "े", deleteCount: 0 };
      if (lowerKey === "a") return { replacement: "ं", deleteCount: 0 };
      if (lowerKey === "`") return { replacement: "ृ", deleteCount: 0 };
      if (lowerKey === "z") return { replacement: "्र", deleteCount: 0 };
    }

    const mapped = KRUTI_DEV_010_MAP[lowerKey];
    if (mapped) return { replacement: mapped, deleteCount: 0 };
  } else {
    // Shifted key
    const upperKey = keyChar.toUpperCase();
    if (isDevanagariConsonant(lastChar)) {
      if (upperKey === "W") return { replacement: "ॅ", deleteCount: 0 };
      if (upperKey === "S") return { replacement: "ै", deleteCount: 0 };
    }
    const mapped = KRUTI_DEV_010_MAP[upperKey];
    if (mapped) return { replacement: mapped, deleteCount: 0 };
  }

  const directMapped = KRUTI_DEV_010_MAP[keyChar];
  if (directMapped) return { replacement: directMapped, deleteCount: 0 };

  return { replacement: keyChar, deleteCount: 0 };
}

/**
 * Handles input transformation on textarea event for Hindi & Kruti Dev Typing
 */
export function handleHindiTextareaKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  fontOrMode: string,
  currentText: string,
  setText: (newVal: string) => void
): boolean {
  const modeConfig = resolveStenoTypingMode(fontOrMode);

  // If English mode, do not intercept keyboard event
  if (modeConfig.type === "english") {
    return false;
  }

  // Allow standard control/navigation keys
  if (
    e.ctrlKey ||
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

  // Handle Alt-Codes on KeyUp or Alt-combination
  if (e.altKey) {
    return false;
  }

  // If typing spacebar, pass through naturally
  if (e.key === " ") {
    return false;
  }

  const textarea = e.currentTarget;
  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const before = currentText.substring(0, start);
  const after = currentText.substring(end);

  if (modeConfig.type === "unicode_hindi") {
    const mappedChar = mapEventToInscript(e);
    if (mappedChar) {
      e.preventDefault();
      const newText = before + mappedChar + after;
      setText(newText);
      setTimeout(() => {
        const newPos = start + mappedChar.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
      return true;
    }
  } else if (modeConfig.type === "krutidev_010") {
    // Kruti Dev 010 legacy layout mapping
    const res = mapEventToKrutiDev(e, before);
    if (res && res.replacement) {
      e.preventDefault();
      const cleanBefore = res.deleteCount > 0 ? before.slice(0, -res.deleteCount) : before;
      const newText = cleanBefore + res.replacement + after;
      setText(newText);
      setTimeout(() => {
        const newPos = cleanBefore.length + res.replacement.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
      return true;
    }
  }

  return false;
}



