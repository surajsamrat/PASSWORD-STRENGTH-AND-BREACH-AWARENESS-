import type { ThreatIntelResult } from "@/types/security";

export async function checkUrlThreatIntel(url: string): Promise<ThreatIntelResult> {
  try {
    const response = await fetch("/api/phishing/threat-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return {
        provider: "google-safe-browsing",
        providerName: "Google Safe Browsing v4",
        configured: false,
        status: "error",
        matches: [],
        noteEn:
          typeof data.error === "string"
            ? data.error
            : `Threat intelligence check returned HTTP ${response.status}.`,
        noteHi:
          typeof data.error === "string"
            ? data.error
            : `थ्रेट इंटेलिजेंस जांच ने HTTP ${response.status} लौटाया।`,
      };
    }

    return data as unknown as ThreatIntelResult;
  } catch {
    return {
      provider: "google-safe-browsing",
      providerName: "Google Safe Browsing v4",
      configured: false,
      status: "error",
      matches: [],
      noteEn:
        "Threat intelligence backend is offline. Client-side heuristic warnings remain active; never assume unverified links are safe.",
      noteHi:
        "थ्रेट इंटेलिजेंस बैकएंड ऑफ़लाइन है। क्लाइंट-साइड ह्यूरिस्टिक चेतावनी अभी सक्रिय है।",
    };
  }
}
