import type { PasswordBreachResult } from "@/types/security";

export const HIBP_RANGE_API_URL = "https://api.pwnedpasswords.com/range/";
const RANGE_LINE_REGEX = /^([0-9A-Fa-f]{35}):(\d+)$/;

const PWNED_RECOMMENDATIONS_EN = [
  "Stop using this password immediately—never use it on any new or existing account.",
  "Generate a unique 16+ character CSPRNG password or 5-word diceware passphrase.",
  "Change passwords on every account where this password (or a close variant) was reused.",
  "Enable phishing-resistant MFA (Passkey or TOTP Authenticator app) on affected accounts.",
];

const PWNED_RECOMMENDATIONS_HI = [
  "इस पासवर्ड का उपयोग तुरंत बंद करें—इसे किसी भी नए या पुराने खाते पर न रखें।",
  "16+ अक्षरों का नया CSPRNG पासवर्ड या 5 शब्दों का पासफ़्रेज़ बनाएं।",
  "उन सभी खातों का पासवर्ड बदलें जहाँ यह (या इससे मिलता-जुलता) पासवर्ड इस्तेमाल हुआ था।",
  "संबंधित खातों पर पासकी या ऑथेंटिकेटर ऐप (TOTP MFA) चालू करें।",
];

const CLEAN_RECOMMENDATIONS_EN = [
  "Not appearing in public breach dumps does not guarantee high entropy—verify strength in Password Analyzer.",
  "Ensure this password is unique and never reused across unrelated websites.",
  "Pair strong passwords with Multi-Factor Authentication (MFA) for defense-in-depth.",
];

const CLEAN_RECOMMENDATIONS_HI = [
  "सार्वजनिक ब्रीच में न मिलने का अर्थ मजबूत एंट्रॉपी नहीं है—पासवर्ड विश्लेषक में इसकी क्षमता जांचें।",
  "सुनिश्चित करें कि यह पासवर्ड अद्वितीय है और किसी अन्य वेबसाइट पर दोबारा उपयोग नहीं किया गया है।",
  "अतिरिक्त सुरक्षा के लिए हमेशा मल्टी-फैक्टर ऑथेंटिकेशन (MFA) चालू रखें।",
];

/**
 * Computes uppercase hexadecimal SHA-1 digest locally using the Web Crypto API.
 */
export async function sha1Hex(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API (crypto.subtle) is unavailable in this environment.");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await subtle.digest("SHA-1", data);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export interface ParsedRangeResult {
  matchedCount: number;
  validEntries: number;
  paddedIgnored: number;
}

/**
 * Parses an official HIBP Pwned Passwords range response (`SUFFIX:COUNT` per line)
 * and compares the target 35-character suffix locally.
 * Zero-count padded entries (`:0`) are explicitly ignored.
 */
export function parseHibpRangeResponse(
  body: string,
  targetSuffix: string
): ParsedRangeResult {
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    throw new Error("Invalid response from HIBP API: empty response body.");
  }

  const lines = trimmedBody.split(/\r?\n/);
  const upperTarget = targetSuffix.toUpperCase();
  let matchedCount = 0;
  let validEntries = 0;
  let paddedIgnored = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = RANGE_LINE_REGEX.exec(line);
    if (!match) {
      throw new Error("Invalid response format received from HIBP range endpoint.");
    }

    validEntries++;
    const lineSuffix = match[1].toUpperCase();
    const count = Number.parseInt(match[2], 10);

    if (!Number.isFinite(count) || count < 0) {
      throw new Error("Invalid occurrence count in HIBP range response.");
    }

    // Ignore zero-count synthetic entries added by HIBP Add-Padding
    if (count === 0) {
      paddedIgnored++;
      continue;
    }

    if (lineSuffix === upperTarget) {
      matchedCount = count;
    }
  }

  if (validEntries === 0) {
    throw new Error("Invalid response from HIBP API: no valid hash entries found.");
  }

  return { matchedCount, validEntries, paddedIgnored };
}

/**
 * Queries Have I Been Pwned Pwned Passwords using strict k-Anonymity.
 * Only the first 5 hex characters of the SHA-1 hash leave the browser.
 * Plaintext passwords and full hashes are never transmitted or stored.
 */
export async function checkPasswordBreachKAnonymity(
  password: string,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<PasswordBreachResult> {
  if (!password) {
    return {
      status: "error",
      prefix: "",
      count: 0,
      errorMessage: "Password input is empty.",
    };
  }

  let prefix = "";
  let suffix = "";

  try {
    const hash = await sha1Hex(password);
    prefix = hash.slice(0, 5);
    suffix = hash.slice(5);
  } catch (err) {
    return {
      status: "error",
      prefix: "",
      count: 0,
      errorMessage:
        err instanceof Error ? err.message : "Failed to compute SHA-1 locally.",
    };
  }

  try {
    if (typeof fetchImpl !== "function") {
      throw new Error("Fetch API is unavailable in this environment.");
    }

    const response = await fetchImpl(`${HIBP_RANGE_API_URL}${prefix}`, {
      method: "GET",
      headers: {
        "Add-Padding": "true",
      },
    });

    if (!response.ok) {
      return {
        status: "error",
        prefix,
        count: 0,
        errorMessage: `HIBP API responded with HTTP ${response.status}`,
      };
    }

    const body = await response.text();
    const parsed = parseHibpRangeResponse(body, suffix);
    const exposed = parsed.matchedCount > 0;

    return {
      status: exposed ? "pwned" : "clean",
      prefix,
      count: parsed.matchedCount,
      rangeEntriesChecked: parsed.validEntries,
      paddedEntriesIgnored: parsed.paddedIgnored,
      recommendationsEn: exposed ? PWNED_RECOMMENDATIONS_EN : CLEAN_RECOMMENDATIONS_EN,
      recommendationsHi: exposed ? PWNED_RECOMMENDATIONS_HI : CLEAN_RECOMMENDATIONS_HI,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unable to reach api.pwnedpasswords.com (network offline or blocked).";
    return {
      status: "error",
      prefix,
      count: 0,
      errorMessage: message,
    };
  }
}
