import { GoogleGenAI } from "@google/genai";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  SanitizedChatMetadata,
} from "../types";

export class AiServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AiServiceError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface ProviderConfig {
  provider: "gemini" | "openai" | "none";
  model: string;
  apiKey: string;
  baseUrl?: string;
}

const PLACEHOLDER_PATTERNS = [
  "PASTE_YOUR_GEMINI_API_KEY_HERE",
  "YOUR_GEMINI_API_KEY",
  "YOUR_API_KEY",
  "REPLACE_ME",
  "CHANGEME",
];

/**
 * Ensures empty strings and template placeholders are never treated as live API keys.
 */
export function isUsableApiKey(rawKey?: string): boolean {
  const key = (rawKey || "").trim();
  if (!key) return false;
  const upper = key.toUpperCase();
  return !PLACEHOLDER_PATTERNS.some((pattern) => upper.includes(pattern));
}

export function resolveProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): ProviderConfig {
  const preferred = (env.AI_PROVIDER || "").toLowerCase().trim();
  const rawGeminiKey = (env.GEMINI_API_KEY || "").trim();
  const rawOpenaiKey = (env.OPENAI_API_KEY || "").trim();
  const geminiKey = isUsableApiKey(rawGeminiKey) ? rawGeminiKey : "";
  const openaiKey = isUsableApiKey(rawOpenaiKey) ? rawOpenaiKey : "";

  if (preferred === "openai" && openaiKey) {
    return {
      provider: "openai",
      model: (env.OPENAI_MODEL || "gpt-4o-mini").trim(),
      apiKey: openaiKey,
      baseUrl: (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
    };
  }

  if (preferred === "gemini" && geminiKey) {
    return {
      provider: "gemini",
      model: (env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim(),
      apiKey: geminiKey,
    };
  }

  if (geminiKey) {
    return {
      provider: "gemini",
      model: (env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim(),
      apiKey: geminiKey,
    };
  }

  if (openaiKey) {
    return {
      provider: "openai",
      model: (env.OPENAI_MODEL || "gpt-4o-mini").trim(),
      apiKey: openaiKey,
      baseUrl: (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
    };
  }

  return { provider: "none", model: "", apiKey: "" };
}

function buildSystemInstruction(
  _language: "en" | "hi",
  metadata?: SanitizedChatMetadata
): string {
  const langInstruction =
    "ALWAYS respond in clear, professional, easy-to-understand English, regardless of whether the user types in Hindi, Hinglish, or English. Keep technical cybersecurity explanations simple and beginner-friendly. Do not switch your response language to Hindi or Hinglish.";

  const metaSummary = metadata
    ? `\n\nOptional non-sensitive user posture metadata (no passwords or hashes are ever provided):\n${JSON.stringify(
        metadata
      )}`
    : "";

  return `You are SecureCheck AI Security Assistant, a defensive cybersecurity educator and advisor.
Your scope:
- Explain password weaknesses (short length, repeated characters, sequences, dictionary/common patterns) and password security concepts (entropy, KDFs, NIST SP 800-63B, passphrases).
- Provide actionable password improvement advice and account security recommendations (Passkeys/FIDO2, TOTP MFA, password managers, recovery backup codes, breach triage).
- Explain phishing risks (typosquatting, homographs, urgency lures, credential/OTP harvesting) and general cybersecurity awareness.
- Never ask the user to share their actual password, PIN, OTP, or complete password hash. If they offer one, refuse to inspect raw secrets and guide them to client-side tools instead.
- Never claim any password makes an account 100% or completely secure.
${langInstruction}${metaSummary}`;
}

export async function generateAiAssistantReply(
  reqData: AssistantChatRequest,
  options?: { fetchImpl?: typeof fetch; env?: NodeJS.ProcessEnv }
): Promise<AssistantChatResponse> {
  const config = resolveProviderConfig(options?.env ?? process.env);

  if (config.provider === "none" || !config.apiKey) {
    throw new AiServiceError(
      503,
      "AI_NOT_CONFIGURED",
      "Server AI provider is not configured. Paste your Gemini API key into .env and restart the backend server."
    );
  }

  const systemPrompt = buildSystemInstruction(reqData.language, reqData.metadata);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000);

  try {
    if (config.provider === "gemini") {
      const contents = [
        ...reqData.history.map((turn) => ({
          role: turn.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: turn.content }],
        })),
        { role: "user" as const, parts: [{ text: reqData.message }] },
      ];

      // Allow test injection of fetchImpl when unit-testing HTTP transport cleanly
      if (options?.fetchImpl) {
        const response = await options.fetchImpl(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            config.model
          )}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": config.apiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 700,
              },
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new AiServiceError(
            502,
            "UPSTREAM_AI_ERROR",
            `Gemini API returned HTTP ${response.status}. Check your API key or quota.`
          );
        }

        const data = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const replyText =
          data.candidates?.[0]?.content?.parts
            ?.map((p) => p.text || "")
            .join("")
            .trim() || "";

        if (!replyText) {
          throw new AiServiceError(
            502,
            "EMPTY_AI_RESPONSE",
            "Gemini returned an empty response."
          );
        }

        return {
          reply: replyText,
          provider: "gemini",
          model: config.model,
          language: "en",
        };
      }

      // Production path using the official @google/genai SDK with Flash fallback on 503/404
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      const candidateModels = Array.from(
        new Set([
          config.model,
          "gemini-3.5-flash-lite",
          "gemini-3.5-flash",
          "gemini-3.8-flash",
        ])
      );

      let lastErr: unknown;
      for (const candidateModel of candidateModels) {
        try {
          const sdkResponse = await ai.models.generateContent({
            model: candidateModel,
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.4,
              maxOutputTokens: 700,
              abortSignal: controller.signal,
            },
          });

          const replyText = (sdkResponse.text || "").trim();
          if (!replyText) {
            throw new AiServiceError(
              502,
              "EMPTY_AI_RESPONSE",
              "Gemini returned an empty response."
            );
          }

          return {
            reply: replyText,
            provider: "gemini",
            model: candidateModel,
            language: "en",
          };
        } catch (err) {
          lastErr = err;
          const status =
            typeof (err as { status?: unknown })?.status === "number"
              ? (err as { status: number }).status
              : undefined;
          // Retry next Flash model only on transient demand (503) or retired model (404)
          if (status !== 503 && status !== 404) {
            throw err;
          }
        }
      }

      throw lastErr;
    }

    // OpenAI-compatible server-side call
    const fetchImpl = options?.fetchImpl ?? globalThis.fetch;
    const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt },
          ...reqData.history,
          { role: "user", content: reqData.message },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AiServiceError(
        502,
        "UPSTREAM_AI_ERROR",
        `AI upstream provider returned HTTP ${response.status}.`
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const replyText = data.choices?.[0]?.message?.content?.trim() || "";

    if (!replyText) {
      throw new AiServiceError(
        502,
        "EMPTY_AI_RESPONSE",
        "AI provider returned an empty response."
      );
    }

    return {
      reply: replyText,
      provider: "openai",
      model: config.model,
      language: "en",
    };
  } catch (err) {
    if (err instanceof AiServiceError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new AiServiceError(504, "AI_TIMEOUT", "Gemini AI request timed out. Please try again.");
    }
    const status =
      typeof (err as { status?: unknown })?.status === "number"
        ? (err as { status: number }).status
        : undefined;
    if (status === 400 || status === 404) {
      throw new AiServiceError(
        502,
        "UPSTREAM_AI_ERROR",
        "Gemini AI request or model configuration was rejected by upstream API."
      );
    }
    if (status === 401 || status === 403) {
      throw new AiServiceError(
        502,
        "UPSTREAM_AI_ERROR",
        "Gemini API authentication failed. Please verify your GEMINI_API_KEY in .env."
      );
    }
    if (status === 429) {
      throw new AiServiceError(
        502,
        "UPSTREAM_AI_ERROR",
        "Gemini API quota or rate limit exceeded. Please wait and try again."
      );
    }
    throw new AiServiceError(
      502,
      "AI_NETWORK_ERROR",
      "Unable to reach Gemini AI service right now. You can use the Offline Guide instead."
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
