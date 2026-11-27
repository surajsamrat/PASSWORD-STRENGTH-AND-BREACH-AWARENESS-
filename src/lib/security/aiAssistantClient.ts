import type {
  HygieneChecklistItem,
  Language,
  SanitizedCredentialSnapshot,
} from "@/types/security";

export interface NonSensitiveAssistantMetadata {
  strengthLevel?: string;
  score?: number;
  length?: number;
  entropyBits?: number;
  effectiveEntropyBits?: number;
  zxcvbnScore?: number;
  breachStatus?: "not-checked" | "pwned" | "clean" | "error";
  weaknessCategories?: string[];
  hygieneCompleted?: number;
  hygieneTotal?: number;
}

export interface AssistantTurnPayload {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantApiReply {
  reply: string;
  provider: "gemini" | "openai";
  model: string;
  language: Language;
}

export interface AssistantHealthStatus {
  ok: boolean;
  providerConfigured: boolean;
  provider: "gemini" | "openai" | "none";
}

export class AiAssistantClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly retryAfterSeconds?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "AiAssistantClientError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const SHA1_HEX_REGEX = /\b[0-9a-fA-F]{40}\b/;
const EXPLICIT_PASSWORD_REGEX =
  /\b(?:my\s+password\s+is|here\s+is\s+my\s+password|password\s*[:=])\s*\S+/i;

/**
 * Client-side privacy firewall: blocks transmitting raw passwords or complete 40-char hashes.
 */
export function validateClientPromptPrivacy(
  message: string,
  lang: Language
): string | null {
  if (SHA1_HEX_REGEX.test(message)) {
    return lang === "hi"
      ? "सुरक्षा अवरोध: कृपया AI सहायक को पूर्ण SHA-1 हैश न भेजें। हैश जांच के लिए ब्रीच चेकर का उपयोग करें।"
      : "Privacy Block: Never send a complete 40-character hash to the AI. Use the k-Anonymity Breach Checker instead.";
  }
  if (EXPLICIT_PASSWORD_REGEX.test(message)) {
    return lang === "hi"
      ? "सुरक्षा अवरोध: कृपया अपना वास्तविक पासवर्ड चैट में न लिखें। केवल कमज़ोरियों या सुधार पर प्रश्न पूछें।"
      : "Privacy Block: Never type or paste your actual password into AI chat. Ask about weaknesses or share sanitized metadata only.";
  }
  return null;
}

/**
 * Extracts strictly non-sensitive summary metadata (zero passwords, zero hashes).
 */
export function buildNonSensitiveAssistantMetadata(
  snapshot: SanitizedCredentialSnapshot | null,
  hygiene: HygieneChecklistItem[]
): NonSensitiveAssistantMetadata {
  const meta: NonSensitiveAssistantMetadata = {
    hygieneCompleted: hygiene.filter((h) => h.completed).length,
    hygieneTotal: hygiene.length,
  };

  if (snapshot) {
    meta.strengthLevel = snapshot.strengthLevel;
    meta.score = snapshot.score;
    meta.length = snapshot.length;
    meta.entropyBits = snapshot.entropyBits;
    meta.effectiveEntropyBits = snapshot.effectiveEntropyBits;
    meta.zxcvbnScore = snapshot.zxcvbnScore;
    meta.breachStatus = snapshot.breachStatus;
    meta.weaknessCategories = snapshot.sanitizedWeaknesses.map((w) => w.id);
  }

  return meta;
}

export async function fetchAssistantHealth(): Promise<AssistantHealthStatus | null> {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    if (!res.ok) return null;
    return (await res.json()) as AssistantHealthStatus;
  } catch {
    return null;
  }
}

export async function sendAssistantMessage(params: {
  message: string;
  language: Language;
  history: AssistantTurnPayload[];
  metadata?: NonSensitiveAssistantMetadata;
}): Promise<AssistantApiReply> {
  const privacyError = validateClientPromptPrivacy(params.message, params.language);
  if (privacyError) {
    throw new AiAssistantClientError(400, "CLIENT_PRIVACY_BLOCK", privacyError);
  }

  let response: Response;
  try {
    response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: params.message,
        language: params.language,
        history: params.history.slice(-8),
        metadata: params.metadata,
      }),
    });
  } catch {
    throw new AiAssistantClientError(
      0,
      "BACKEND_UNREACHABLE",
      params.language === "hi"
        ? "AI बैकएंड सर्वर उपलब्ध नहीं है। सुनिश्चित करें कि `npm run server` चल रहा है, या नीचे ऑफ़लाइन सलाहकार का उपयोग करें।"
        : "AI backend server is unreachable. Start it with `npm run server`, or use the Offline Playbook Advisor below."
    );
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const code =
      typeof payload.code === "string" ? payload.code : `HTTP_${response.status}`;
    const errorMsg =
      typeof payload.error === "string"
        ? payload.error
        : `Request failed with HTTP ${response.status}.`;
    const retryAfter =
      typeof payload.retryAfterSeconds === "number"
        ? payload.retryAfterSeconds
        : undefined;
    throw new AiAssistantClientError(response.status, code, errorMsg, retryAfter);
  }

  return payload as unknown as AssistantApiReply;
}
