export type SupportedLanguage = "en" | "hi";

export interface SanitizedChatMetadata {
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

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatRequest {
  message: string;
  language: SupportedLanguage;
  history: ChatTurn[];
  metadata?: SanitizedChatMetadata;
}

export interface AssistantChatResponse {
  reply: string;
  provider: "gemini" | "openai";
  model: string;
  language: SupportedLanguage;
}

export interface ApiErrorBody {
  code: string;
  error: string;
  retryAfterSeconds?: number;
}
