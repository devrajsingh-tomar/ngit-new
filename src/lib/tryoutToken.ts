import crypto from "crypto";

const TRYOUT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "ngit-tryout-secret-2026";

/**
 * Generates a cryptographically signed tryout token for a given examId.
 * Valid for 24 hours.
 */
export function signTryoutToken(examId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${examId}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", TRYOUT_SECRET).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

/**
 * Verifies if the tryout token is valid for the specified examId and has not expired.
 */
export function verifyTryoutToken(examId: string, token?: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [tokenExamId, timestampStr, signature] = parts;

    if (tokenExamId !== examId) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Token is valid for 24 hours (86,400,000 ms) with 1 minute clock drift allowance
    const maxAge = 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - timestamp > maxAge || timestamp > now + 60000) {
      return false;
    }

    const payload = `${tokenExamId}:${timestampStr}`;
    const expectedSignature = crypto.createHmac("sha256", TRYOUT_SECRET).update(payload).digest("hex");

    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}
