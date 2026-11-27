import type { NextFunction, Request, Response } from "express";
import type {
  AssistantChatRequest,
  ChatTurn,
  SanitizedChatMetadata,
} from "../types";

const FORBIDDEN_KEYS = new Set([
  "password",
  "rawpassword",
  "plaintext",
  "hash",
  "fullhash",
  "sha1",
  "sha256",
  "secret",
  "apikey",
]);

const ALLOWED_METADATA_KEYS = new Set([
  "strengthLevel",
  "score",
  "length",
  "entropyBits",
  "effectiveEntropyBits",
  "zxcvbnScore",
  "breachStatus",
  "weaknessCategories",
  "hygieneCompleted",
  "hygieneTotal",
]);

const ALLOWED_BREACH_STATUS = new Set(["not-checked", "pwned", "clean", "error"]);
const SHA1_HEX_REGEX = /\b[0-9a-fA-F]{40}\b/;
const EXPLICIT_PASSWORD_REGEX =
  /\b(?:my\s+password\s+is|here\s+is\s+my\s+password|password\s*[:=])\s*\S+/i;

function containsForbiddenKeys(obj: unknown, depth = 0): boolean {
  if (!obj || typeof obj !== "object" || depth > 4) return false;
  if (Array.isArray(obj)) {
    return obj.some((item) => containsForbiddenKeys(item, depth + 1));
  }
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      return true;
    }
    if (val && typeof val === "object" && containsForbiddenKeys(val, depth + 1)) {
      return true;
    }
  }
  return false;
}

export function detectSensitiveDisclosure(text: string): string | null {
  if (SHA1_HEX_REGEX.test(text)) {
    return "Detected a 40-character hexadecimal hash. Never send complete password hashes to the AI.";
  }
  if (EXPLICIT_PASSWORD_REGEX.test(text)) {
    return "Detected an explicit password disclosure. Never send actual passwords to the AI—describe weaknesses or attach sanitized metadata only.";
  }
  return null;
}

function sanitizeMetadata(raw: unknown): SanitizedChatMetadata | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("metadata must be an object");
  }
  const input = raw as Record<string, unknown>;
  const clean: SanitizedChatMetadata = {};

  for (const key of Object.keys(input)) {
    if (!ALLOWED_METADATA_KEYS.has(key)) {
      throw new Error(`Unsupported metadata field: ${key}`);
    }
  }

  if (typeof input.strengthLevel === "string") {
    clean.strengthLevel = input.strengthLevel.slice(0, 24);
  }
  if (typeof input.score === "number" && Number.isFinite(input.score)) {
    clean.score = Math.max(0, Math.min(100, Math.round(input.score)));
  }
  if (typeof input.length === "number" && Number.isFinite(input.length)) {
    clean.length = Math.max(0, Math.min(256, Math.round(input.length)));
  }
  if (typeof input.entropyBits === "number" && Number.isFinite(input.entropyBits)) {
    clean.entropyBits = Math.max(0, Math.min(1000, Number(input.entropyBits.toFixed(1))));
  }
  if (
    typeof input.effectiveEntropyBits === "number" &&
    Number.isFinite(input.effectiveEntropyBits)
  ) {
    clean.effectiveEntropyBits = Math.max(
      0,
      Math.min(1000, Number(input.effectiveEntropyBits.toFixed(1)))
    );
  }
  if (typeof input.zxcvbnScore === "number" && Number.isFinite(input.zxcvbnScore)) {
    clean.zxcvbnScore = Math.max(0, Math.min(4, Math.round(input.zxcvbnScore)));
  }
  if (typeof input.breachStatus === "string" && ALLOWED_BREACH_STATUS.has(input.breachStatus)) {
    clean.breachStatus = input.breachStatus as SanitizedChatMetadata["breachStatus"];
  }
  if (Array.isArray(input.weaknessCategories)) {
    clean.weaknessCategories = input.weaknessCategories
      .filter((w): w is string => typeof w === "string")
      .slice(0, 10)
      .map((w) => w.slice(0, 64));
  }
  if (typeof input.hygieneCompleted === "number" && Number.isFinite(input.hygieneCompleted)) {
    clean.hygieneCompleted = Math.max(0, Math.min(20, Math.round(input.hygieneCompleted)));
  }
  if (typeof input.hygieneTotal === "number" && Number.isFinite(input.hygieneTotal)) {
    clean.hygieneTotal = Math.max(0, Math.min(20, Math.round(input.hygieneTotal)));
  }

  return clean;
}

export interface ValidatedRequest extends Request {
  validatedChat?: AssistantChatRequest;
}

/**
 * Validates incoming AI assistant chat requests and enforces strict privacy rules:
 * rejects actual passwords, complete hashes, forbidden keys, and malformed inputs.
 */
export function validateChatRequest(
  req: ValidatedRequest,
  res: Response,
  next: NextFunction
) {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      code: "INVALID_BODY",
      error: "Request body must be a JSON object.",
    });
  }

  if (containsForbiddenKeys(body)) {
    return res.status(400).json({
      code: "PRIVACY_FORBIDDEN_FIELD",
      error: "Sensitive credential fields (password, hash, secret) are never permitted.",
    });
  }

  const { message, language = "en", history = [], metadata } = body as Record<
    string,
    unknown
  >;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      code: "INVALID_MESSAGE",
      error: "Message must be a non-empty string.",
    });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 2000) {
    return res.status(400).json({
      code: "MESSAGE_TOO_LONG",
      error: "Message must not exceed 2000 characters.",
    });
  }

  const privacyViolation = detectSensitiveDisclosure(trimmedMessage);
  if (privacyViolation) {
    return res.status(400).json({
      code: "PRIVACY_VIOLATION",
      error: privacyViolation,
    });
  }

  if (language !== "en" && language !== "hi") {
    return res.status(400).json({
      code: "INVALID_LANGUAGE",
      error: "Language must be 'en' or 'hi'.",
    });
  }

  if (!Array.isArray(history)) {
    return res.status(400).json({
      code: "INVALID_HISTORY",
      error: "History must be an array of conversation turns.",
    });
  }

  const cleanHistory: ChatTurn[] = [];
  for (const turn of history.slice(-10)) {
    if (!turn || typeof turn !== "object") {
      return res.status(400).json({
        code: "INVALID_HISTORY_TURN",
        error: "Each history item must be an object with role and content.",
      });
    }
    const { role, content } = turn as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return res.status(400).json({
        code: "INVALID_HISTORY_TURN",
        error: "History role must be 'user' or 'assistant' and content must be text.",
      });
    }
    const trimmedTurn = content.trim();
    if (!trimmedTurn) continue;
    if (detectSensitiveDisclosure(trimmedTurn)) {
      return res.status(400).json({
        code: "PRIVACY_VIOLATION",
        error: "Conversation history contains sensitive hash or password text.",
      });
    }
    cleanHistory.push({ role, content: trimmedTurn.slice(0, 2000) });
  }

  let cleanMetadata: SanitizedChatMetadata | undefined;
  try {
    cleanMetadata = sanitizeMetadata(metadata);
  } catch (err) {
    return res.status(400).json({
      code: "INVALID_METADATA",
      error: err instanceof Error ? err.message : "Invalid metadata payload.",
    });
  }

  req.validatedChat = {
    message: trimmedMessage,
    language,
    history: cleanHistory,
    metadata: cleanMetadata,
  };

  return next();
}
