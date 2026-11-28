import type { ThreatIntelResult } from "../../src/types/security";

export interface UrlThreatIntelProvider {
  readonly id: string;
  readonly displayName: string;
  isConfigured(): boolean;
  checkUrl(url: string): Promise<ThreatIntelResult>;
}

export class UrlThreatValidationError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "UrlThreatValidationError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Validates that the submitted string is a syntactically valid HTTP/HTTPS URL
 * without ever connecting to, resolving, or visiting the target URL.
 */
export function validateSubmittedThreatUrl(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new UrlThreatValidationError(
      400,
      "INVALID_URL",
      "URL must be a non-empty string."
    );
  }
  const trimmed = raw.trim();
  if (trimmed.length > 2048 || /\s/.test(trimmed)) {
    throw new UrlThreatValidationError(
      400,
      "INVALID_URL_SYNTAX",
      "URL must be at most 2048 characters and contain no whitespace."
    );
  }

  let candidate = trimmed;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new UrlThreatValidationError(
      400,
      "INVALID_URL_SYNTAX",
      "Submitted value is not a valid URL."
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UrlThreatValidationError(
      400,
      "UNSUPPORTED_URL_SCHEME",
      "Only http:// and https:// URLs can be checked against threat intelligence."
    );
  }

  return parsed.toString();
}

/**
 * Google Safe Browsing v4 Lookup API provider.
 * Queries safebrowsing.googleapis.com only; NEVER connects to the submitted URL.
 */
export class GoogleSafeBrowsingProvider implements UrlThreatIntelProvider {
  public readonly id = "google-safe-browsing";
  public readonly displayName = "Google Safe Browsing v4";
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options?: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch }) {
    const env = options?.env ?? process.env;
    this.apiKey = (env.GOOGLE_SAFE_BROWSING_API_KEY || "").trim();
    this.fetchImpl = options?.fetchImpl ?? globalThis.fetch;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async checkUrl(url: string): Promise<ThreatIntelResult> {
    if (!this.isConfigured()) {
      return {
        provider: this.id,
        providerName: this.displayName,
        configured: false,
        status: "unconfigured",
        matches: [],
        noteEn:
          "Verified Threat Intelligence API is not configured on the server (set GOOGLE_SAFE_BROWSING_API_KEY). Only client-side heuristic warnings are active.",
        noteHi:
          "सर्वर पर सत्यापित थ्रेट इंटेलिजेंस API कुंजी सेट नहीं है (GOOGLE_SAFE_BROWSING_API_KEY)। अभी केवल ह्यूरिस्टिक चेतावनी सक्रिय है।",
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(
        this.apiKey
      )}`;

      const response = await this.fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "securecheck-platform", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return {
          provider: this.id,
          providerName: this.displayName,
          configured: true,
          status: "error",
          matches: [],
          noteEn: `Threat intelligence API returned HTTP ${response.status}. Rely on heuristic inspection and independent verification.`,
          noteHi: `थ्रेट इंटेलिजेंस API ने HTTP ${response.status} लौटाया। कृपया ह्यूरिस्टिक जांच और स्वतंत्र पुष्टि पर निर्भर रहें।`,
        };
      }

      const data = (await response.json()) as {
        matches?: Array<{
          threatType?: string;
          platformType?: string;
          threatEntryType?: string;
        }>;
      };

      const matches = (data.matches ?? []).map((m) => ({
        threatType: m.threatType || "SOCIAL_ENGINEERING",
        platformType: m.platformType || "ANY_PLATFORM",
        threatEntryType: m.threatEntryType || "URL",
      }));

      if (matches.length > 0) {
        return {
          provider: this.id,
          providerName: this.displayName,
          configured: true,
          status: "flagged",
          matches,
          checkedAt: new Date().toISOString(),
          noteEn:
            "Verified Threat Intelligence flagged this URL in public threat feeds. Do NOT visit it.",
          noteHi:
            "सत्यापित थ्रेट इंटेलिजेंस ने इस URL को खतरनाक के रूप में चिह्नित किया है। इसे बिल्कुल न खोलें।",
        };
      }

      return {
        provider: this.id,
        providerName: this.displayName,
        configured: true,
        status: "safe",
        matches: [],
        checkedAt: new Date().toISOString(),
        noteEn:
          "No matches found in Google Safe Browsing right now. Note: newly launched zero-hour phishing links may not yet be indexed—detection is never guaranteed.",
        noteHi:
          "Google Safe Browsing में अभी कोई मिलान नहीं मिला। ध्यान दें: बिल्कुल नए फ़िशिंग लिंक तुरंत सूचीबद्ध नहीं होते—100% पहचान की गारंटी संभव नहीं है।",
      };
    } catch {
      return {
        provider: this.id,
        providerName: this.displayName,
        configured: true,
        status: "error",
        matches: [],
        noteEn:
          "Threat intelligence lookup failed or timed out. Never assume a link is safe when lookup fails.",
        noteHi:
          "थ्रेट इंटेलिजेंस जांच विफल रही। जांच विफल होने पर किसी भी लिंक को सुरक्षित न मानें।",
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
