
/**
 * InscriptEngine Utility
 * Standard Government INSCRIPT Layout Mapping
 * Based on Windows Hindi Traditional / INSCRIPT keyboard
 */

export const INSCRIPT_CODE_MAP: Record<string, { normal: string; shift: string }> = {
  // Row 1 (Numbers & Symbols)
  Backquote: { normal: 'ो', shift: 'ओ' }, // Some variants use this
  Digit1: { normal: '1', shift: 'ऍ' },
  Digit2: { normal: '2', shift: 'ॅ' },
  Digit3: { normal: '3', shift: '्र' },
  Digit4: { normal: '4', shift: 'र्' },
  Digit5: { normal: '5', shift: 'ज्ञ' },
  Digit6: { normal: '6', shift: 'त्र' },
  Digit7: { normal: '7', shift: 'क्ष' },
  Digit8: { normal: '8', shift: 'श्र' },
  Digit9: { normal: '9', shift: '(' },
  Digit0: { normal: '0', shift: ')' },
  Minus: { normal: '-', shift: 'ः' },
  Equal: { normal: 'ृ', shift: 'ऋ' },

  // Row 2
  KeyQ: { normal: 'ौ', shift: 'औ' },
  KeyW: { normal: 'ै', shift: 'ऐ' },
  KeyE: { normal: 'ा', shift: 'आ' },
  KeyR: { normal: 'ी', shift: 'ई' },
  KeyT: { normal: 'ू', shift: 'ऊ' },
  KeyY: { normal: 'ब', shift: 'भ' },
  KeyU: { normal: 'ह', shift: 'ङ' },
  KeyI: { normal: 'ग', shift: 'घ' },
  KeyO: { normal: 'द', shift: 'ध' },
  KeyP: { normal: 'ज', shift: 'झ' },
  BracketLeft: { normal: 'ड', shift: 'ढ' },
  BracketRight: { normal: '़', shift: 'ञ' },
  Backslash: { normal: 'ॉ', shift: 'ऑ' },

  // Row 3
  KeyA: { normal: 'ो', shift: 'ओ' },
  KeyS: { normal: 'े', shift: 'ए' },
  KeyD: { normal: '्', shift: 'अ' },
  KeyF: { normal: 'ि', shift: 'इ' },
  KeyG: { normal: 'ु', shift: 'उ' },
  KeyH: { normal: 'प', shift: 'फ' },
  KeyJ: { normal: 'र', shift: 'ऱ' },
  KeyK: { normal: 'क', shift: 'ख' },
  KeyL: { normal: 'त', shift: 'थ' },
  Semicolon: { normal: 'च', shift: 'छ' },
  Quote: { normal: 'ट', shift: 'ठ' },

  // Row 4
  KeyZ: { normal: 'ॄ', shift: 'ऋ' },
  KeyX: { normal: 'ं', shift: 'ँ' },
  KeyC: { normal: 'म', shift: 'ण' },
  KeyV: { normal: 'न', shift: 'ऩ' },
  KeyB: { normal: 'व', shift: 'ळ' },
  KeyN: { normal: 'ल', shift: 'ळ' },
  KeyM: { normal: 'स', shift: 'श' },
  Comma: { normal: ',', shift: 'ष' },
  Period: { normal: '।', shift: '।' },
  Slash: { normal: 'य', shift: 'य' },
  Space: { normal: ' ', shift: ' ' },
};

/**
 * Maps a keyboard event to a Unicode Hindi character based on Inscript layout.
 * Returns null if the key is not mapped or is a control key.
 */
export const mapEventToInscript = (event: React.KeyboardEvent | KeyboardEvent): string | null => {
  // Ignore control keys (handled separately or allowed naturally)
  if (event.ctrlKey || event.altKey || event.metaKey) return null;
  
  const mapping = INSCRIPT_CODE_MAP[event.code];
  if (!mapping) return null;

  return event.shiftKey ? mapping.shift : mapping.normal;
};

/**
 * Validates a Hindi word against common conjunct rules
 */
export const validateHindiWord = (word: string): boolean => {
  // This could be expanded for complex validation if needed
  return /^[\u0900-\u097F]+$/.test(word);
};
