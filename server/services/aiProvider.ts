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

export function resolveProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): ProviderConfig {
  const preferred = (env.AI_PROVIDER || "").toLowerCase().trim();
  const geminiKey = (env.GEMINI_API_KEY || "").trim();
  const openaiKey = (env.OPENAI_API_KEY || "").trim();

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
      model: (env.GEMINI_MODEL || "gemini-2.5-flash").trim(),
      apiKey: geminiKey,
    };
  }

  if (geminiKey) {
    return {
      provider: "gemini",
      model: (env.GEMINI_MODEL || "gemini-2.5-flash").trim(),
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
  language: "en" | "hi",
  metadata?: SanitizedChatMetadata
): string {
  const langInstruction =
    language === "hi"
      ? "Respond clearly in natural, easy-to-understand Hindi (Devanagari script), keeping standard cybersecurity terms (like MFA, Passkey, OTP, k-Anonymity, zxcvbn) clear."
      : "Respond clearly in concise, structured English.";

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
  const fetchImpl = options?.fetchImpl ?? globalThis.fetch;

  if (config.provider === "none" || !config.apiKey) {
    throw new AiServiceError(
      503,
      "AI_NOT_CONFIGURED",
      "Server AI provider is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY in server environment variables."
    );
  }

  const systemPrompt = buildSystemInstruction(reqData.language, reqData.metadata);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    if (config.provider === "gemini") {
      const contents = [
        ...reqData.history.map((turn) => ({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        })),
        { role: "user", parts: [{ text: reqData.message }] },
      ];

      const response = await fetchImpl(
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
          `AI upstream provider returned HTTP ${response.status}.`
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
          "AI provider returned an empty response."
        );
      }

      return {
        reply: replyText,
        provider: "gemini",
        model: config.model,
        language: reqData.language,
      };
    }

    // OpenAI-compatible server-side call
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
      language: reqData.language,
    };
  } catch (err) {
    if (err instanceof AiServiceError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new AiServiceError(504, "AI_TIMEOUT", "AI provider request timed out.");
    }
    throw new AiServiceError(
      502,
      "AI_NETWORK_ERROR",
      "Unable to reach upstream AI provider."
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
