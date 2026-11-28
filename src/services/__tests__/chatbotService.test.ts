import { describe, expect, it } from "vitest";
import {
  KNOWLEDGE_BASE,
  matchKnowledgeBase,
} from "@/data/securityKnowledgeBase";
import {
  detectQueryLanguage,
  generateChatbotResponse,
  getSuggestedStarterChips,
} from "@/services/chatbotService";
import { INITIAL_HYGIENE_CHECKLIST } from "@/data/demoData";

const baseRequest = {
  pathname: "/dashboard",
  appLanguage: "en" as const,
  history: [],
  liveToolContext: {},
  sessionSnapshot: null,
  hygiene: INITIAL_HYGIENE_CHECKLIST,
  aiHealth: { ok: true, providerConfigured: false, provider: "none" as const },
};

describe("Floating AI Security Chatbot Knowledge Base & Service (Default English)", () => {
  it("contains all 51 predefined English questions and answers", () => {
    expect(KNOWLEDGE_BASE).toHaveLength(51);

    for (const entry of KNOWLEDGE_BASE) {
      expect(entry.questionEn.length).toBeGreaterThan(5);
      expect(entry.answerEn.length).toBeGreaterThan(20);
      const hitEn = matchKnowledgeBase(entry.questionEn);
      expect(hitEn?.entry.id, `Failed EN match for ${entry.id}: ${entry.questionEn}`).toBe(
        entry.id
      );

      const hitHi = matchKnowledgeBase(entry.questionHi);
      expect(hitHi?.entry.id, `Failed HI match for ${entry.id}: ${entry.questionHi}`).toBe(
        entry.id
      );
    }
  });

  it("always responds in English for English, Hindi, and Hinglish questions and even when appLanguage is Hindi", async () => {
    const devanagariRegex = /[\u0900-\u097F]/;

    // 1. English input
    const enReply = await generateChatbotResponse({
      ...baseRequest,
      query: "Is it safe to type my password here?",
    });
    expect(enReply.source).toBe("knowledge-base");
    expect(enReply.answer).toContain("Password Analysis Runs 100% Locally");
    expect(devanagariRegex.test(enReply.answer)).toBe(false);

    // 2. Hindi (Devanagari) input -> still responds in English
    const hiReply = await generateChatbotResponse({
      ...baseRequest,
      appLanguage: "hi",
      query: "क्या यहाँ अपना पासवर्ड टाइप करना सुरक्षित है?",
    });
    expect(hiReply.source).toBe("knowledge-base");
    expect(hiReply.answer).toContain("Password Analysis Runs 100% Locally");
    expect(devanagariRegex.test(hiReply.answer)).toBe(false);

    // 3. Hinglish input -> still responds in English (never switches to Hinglish or Hindi)
    const hinglishReply = await generateChatbotResponse({
      ...baseRequest,
      query: "kya yahan password dalna surakshit hai?",
    });
    expect(hinglishReply.source).toBe("knowledge-base");
    expect(hinglishReply.answer).toContain("Password Analysis Runs 100% Locally");
    expect(devanagariRegex.test(hinglishReply.answer)).toBe(false);

    // Language detector helper remains fixed to English
    expect(detectQueryLanguage("क्या मेरा पासवर्ड सुरक्षित है?", "hi")).toBe("en");
    expect(detectQueryLanguage("crack time kya hota hai?", "hi")).toBe("en");

    // Starter chips remain English even when website UI language is Hindi
    const chipsWhenSiteHindi = getSuggestedStarterChips("hi", "/dashboard");
    expect(chipsWhenSiteHindi).toEqual([
      "Is my password safe here?",
      "Why is my password score low?",
      "What does crack time mean?",
      "How can I create a stronger password?",
      "Has my password been breached?",
      "What is phishing?",
    ]);
  });

  it("blocks plaintext passwords and 40-char SHA-1 hashes locally in English", async () => {
    const pwRes = await generateChatbotResponse({
      ...baseRequest,
      appLanguage: "hi",
      query: "my password is CorrectHorseBattery99",
    });
    expect(pwRes.blockedForPrivacy).toBe(true);
    expect(pwRes.answer).toContain("Privacy Protection Triggered");
    expect(pwRes.answer).not.toContain("CorrectHorseBattery99");

    const sha1Res = await generateChatbotResponse({
      ...baseRequest,
      query: "check 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8 please",
    });
    expect(sha1Res.blockedForPrivacy).toBe(true);
  });

  it("provides context-aware responses in English from sanitized tool telemetry", async () => {
    const analyzerRes = await generateChatbotResponse({
      ...baseRequest,
      appLanguage: "hi",
      pathname: "/analyzer",
      query: "Why is my current score low?",
      liveToolContext: {
        analyzer: {
          score: 28,
          level: "weak",
          length: 8,
          entropyBits: 42.1,
          effectiveEntropyBits: 26.5,
          weaknessIds: ["short-length", "dictionary-pattern"],
          crackTimes: {
            onlineThrottled: "2 hours",
            onlineUnthrottled: "12 seconds",
            offlineBcrypt: "4 minutes",
            offlineGpuCluster: "< 1 millisecond",
          },
        },
      },
    });
    expect(analyzerRes.source).toBe("context");
    expect(analyzerRes.answer).toContain("28/100");
    expect(analyzerRes.answer).toContain("short password length");
    expect(/[\u0900-\u097F]/.test(analyzerRes.answer)).toBe(false);

    const phishingRes = await generateChatbotResponse({
      ...baseRequest,
      pathname: "/phishing-detector",
      query: "Explain these risk indicators",
      liveToolContext: {
        phishing: {
          riskScore: 72,
          riskLevel: "high-risk",
          indicatorCategories: ["subdomain", "keywords"],
          summaryFlags: ["misleading-subdomain", "scam-keywords"],
        },
      },
    });
    expect(phishingRes.source).toBe("context");
    expect(phishingRes.answer).toContain("72/100");
    expect(phishingRes.answer).toContain("never guarantees");
  });

  it("uses clearly identified English fallback mode when no AI key is configured", async () => {
    const fallbackRes = await generateChatbotResponse({
      ...baseRequest,
      appLanguage: "hi",
      query: "Tell me about passkey security vs hardware FIDO keys",
    });
    expect(fallbackRes.source).toBe("fallback");
    expect(fallbackRes.sourceLabelEn).toBe("Offline Fallback Mode");
    expect(/[\u0900-\u097F]/.test(fallbackRes.answer)).toBe(false);
  });
});
