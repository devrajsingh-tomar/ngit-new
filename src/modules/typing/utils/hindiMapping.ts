export {
  KRUTI_DEV_010_MAP,
  KRUTI_DEV_CODE_MAP,
  REMINGTON_MAP,
  INSCRIPT_MAP,
  KRUTI_DEV_ALT_CODES,
  mapKeystrokeToHindi,
  mapEventToKrutiDev,
  transformKrutiDevInput,
  handleHindiTextareaKeyDown,
} from "@/modules/steno/utils/hindiKeystrokeMap";


import {
  KRUTI_DEV_010_MAP,
  INSCRIPT_MAP,
} from "@/modules/steno/utils/hindiKeystrokeMap";

export const mapKeyToHindi = (key: string, layout: string = "Inscript"): string => {
  const normLayout = (layout || "").toLowerCase();
  if (normLayout.includes("kruti") || normLayout.includes("remington")) {
    return KRUTI_DEV_010_MAP[key] || key;
  }
  return INSCRIPT_MAP[key] || key;
};

