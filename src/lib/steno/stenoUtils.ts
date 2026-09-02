export function isRealPoster(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes("unsplash.com")) return false;
  if (trimmed.includes("steno-weekly-test-banner.jpg")) return false;
  if (trimmed.includes("steno-test-guide-banner.jpg")) return false;
  if (trimmed.includes("steno-analytics-banner.jpg")) return false;
  return true;
}

export function matchBatch(seriesBatch?: string | null, targetBatch?: string | null): boolean {
  if (!targetBatch) return true;
  const tBatch = targetBatch.toLowerCase().trim();

  if (tBatch.includes("ठाकुरद्वारा") || tBatch.includes("thakurdwara") || tBatch.includes("general")) {
    return true; // All series available in main Thakurdwara / General batch
  }

  if (!seriesBatch) return true;
  const sBatch = seriesBatch.toLowerCase().trim();

  if (sBatch === tBatch) return true;

  if (tBatch.includes("upsssc") && sBatch.includes("upsssc")) return true;
  if (tBatch.includes("ssc") && !tBatch.includes("upsssc") && sBatch.includes("ssc") && !sBatch.includes("upsssc")) return true;
  if (tBatch.includes("upsi") && sBatch.includes("upsi")) return true;
  if ((tBatch.includes("high court") || tBatch.includes("highcourt")) && (sBatch.includes("high court") || sBatch.includes("highcourt"))) return true;
  if (tBatch.includes("रामधारी खण्ड 1") && sBatch.includes("रामधारी खण्ड 1")) return true;
  if (tBatch.includes("रामधारी खण्ड 2") && sBatch.includes("रामधारी खण्ड 2")) return true;

  const cleanS = sBatch.replace(/steno|batch|बैच|स्पेशल|special/gi, "").trim();
  const cleanT = tBatch.replace(/steno|batch|बैच|स्पेशल|special/gi, "").trim();

  if (cleanS && cleanT && (cleanS === cleanT || cleanS.includes(cleanT) || cleanT.includes(cleanS))) {
    return true;
  }

  return false;
}
