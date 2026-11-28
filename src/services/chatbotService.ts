import { KNOWLEDGE_BASE, matchKnowledgeBase } from "@/data/securityKnowledgeBase";
import {
  buildNonSensitiveAssistantMetadata,
  sendAssistantMessage,
  validateClientPromptPrivacy,
  type AssistantHealthStatus,
  type AssistantTurnPayload,
} from "@/lib/security/aiAssistantClient";
import { generateLocalSecurityReply } from "@/lib/security/assistantEngine";
import type {
  HygieneChecklistItem,
  Language,
  LiveToolContext,
  SanitizedCredentialSnapshot,
} from "@/types/security";

export type DetectedResponseLang = "en";

export interface ChatbotServiceRequest {
  query: string;
  pathname: string;
  appLanguage: Language;
  history: AssistantTurnPayload[];
  liveToolContext: LiveToolContext;
  sessionSnapshot: SanitizedCredentialSnapshot | null;
  hygiene: HygieneChecklistItem[];
  aiHealth: AssistantHealthStatus | null;
}

export interface ChatbotServiceResponse {
  answer: string;
  source: "knowledge-base" | "context" | "ai-backend" | "fallback";
  sourceLabelEn: string;
  tags: string[];
  followUps: string[];
  blockedForPrivacy?: boolean;
}

/**
 * Fixed default response language is always English, regardless of query script or app locale.
 */
export function detectQueryLanguage(
  _query: string,
  _appLanguage?: Language
): DetectedResponseLang {
  return "en";
}

function getWeaknessLabel(id: string): string {
  const labels: Record<string, string> = {
    "common-breached-list": "common or frequently breached password",
    "dictionary-pattern": "common or dictionary words",
    "keyboard-walk": "predictable keyboard pattern",
    "sequential-chars": "sequential characters or numbers (e.g., 1234, abcd)",
    "zxcvbn-spatial-sequence": "keyboard spatial sequence",
    "repeated-chars": "repeated characters",
    "year-pattern": "predictable year or date pattern",
    "low-diversity": "limited character variety",
    "short-length": "short password length",
    length: "short password length",
    repeat: "repeated characters",
    sequence: "sequential keyboard or number patterns",
    dictionary: "common or dictionary words",
    context: "personal or context words",
    diversity: "limited character diversity",
  };
  return labels[id] ?? id.replace(/-/g, " ");
}

/**
 * Generates context-aware guidance strictly from non-sensitive telemetry and route.
 * Never fabricates scan results and never inspects plaintext passwords or URLs.
 */
function resolveContextAwareReply(
  req: ChatbotServiceRequest
): ChatbotServiceResponse | null {
  const q = req.query.toLowerCase().trim();
  const path = req.pathname;

  const asksCurrentAnalyzer =
    (path.includes("/analyzer") || path.includes("/security-report")) &&
    /(my score|current score|this password|my password score|why.*low|why.*weak|weakness|improve this|explain.*score|explain.*crack|crack time|entropy|bits|मेरे स्कोर|मेरा स्कोर|कमज़ोर|एंट्रॉपी|क्रैक|score kam|kamjor|kamzor)/.test(
      q
    );

  const analyzerData =
    req.liveToolContext.analyzer ??
    (req.sessionSnapshot
      ? {
          score: req.sessionSnapshot.score,
          level: req.sessionSnapshot.strengthLevel,
          length: req.sessionSnapshot.length,
          entropyBits: req.sessionSnapshot.entropyBits,
          effectiveEntropyBits: req.sessionSnapshot.effectiveEntropyBits,
          weaknessIds: req.sessionSnapshot.sanitizedWeaknesses.map((w) => w.id),
          crackTimes: req.sessionSnapshot.crackTimes,
        }
      : undefined);

  if (asksCurrentAnalyzer && analyzerData) {
    const weaknessList =
      analyzerData.weaknessIds.length > 0
        ? analyzerData.weaknessIds.map((id) => getWeaknessLabel(id)).join(", ")
        : "no major structural weaknesses flagged";

    const isCrackQuestion = /(crack|attack|scenario|क्रैक|हमला)/.test(q);
    const isEntropyQuestion = /(entropy|bits|एंट्रॉपी|बिट्स)/.test(q);

    if (isCrackQuestion) {
      return {
        source: "context",
        sourceLabelEn: "Analyzer Context",
        answer: `### Your Current Crack-Time Scenarios Explained
- **Analyzed baseline:** \`${analyzerData.length}\` characters • **${analyzerData.effectiveEntropyBits} effective bits** (Score: **${analyzerData.score}/100**)
- **Online Throttled:** ${analyzerData.crackTimes.onlineThrottled} *(rate-limited website logins)*
- **Offline Slow Hash (bcrypt/Argon2):** ${analyzerData.crackTimes.offlineBcrypt}
- **Offline Fast GPU Cluster:** ${analyzerData.crackTimes.offlineGpuCluster} *(worst-case weak hash leak)*

> **Reminder:** Crack-time values are approximate estimates based on idealized attack speeds — never a 100% guarantee.`,
        tags: ["Page Context", "Crack Time"],
        followUps: [
          "Is the displayed crack time guaranteed?",
          "How can I improve my password score?",
        ],
      };
    }

    if (isEntropyQuestion) {
      return {
        source: "context",
        sourceLabelEn: "Entropy Context",
        answer: `### Your Current Password Entropy Breakdown
- **Pool Entropy:** \`${analyzerData.entropyBits} bits\` *(raw character-pool math)*
- **Effective Entropy:** \`${analyzerData.effectiveEntropyBits} bits\` *(adjusted for real predictability)*
- **Observed factors:** ${weaknessList}
- **Target:** Aim for **80+ effective bits** via **16+ random characters** or a **4–5 word random passphrase**.`,
        tags: ["Page Context", "Entropy"],
        followUps: [
          "What do bits mean in password security?",
          "What is the difference between entropy and password strength?",
        ],
      };
    }

    return {
      source: "context",
      sourceLabelEn: "Analyzer Context",
      answer: `### Current Analyzer Summary (Sanitized Telemetry)
- **Strength Score:** \`${analyzerData.score}/100\` (**${analyzerData.level}**) • **Length:** \`${analyzerData.length}\` chars
- **Effective Entropy:** \`${analyzerData.effectiveEntropyBits} bits\` *(pool: ${analyzerData.entropyBits} bits)*
- **Flagged Issues:** ${weaknessList}
- **Next Step:** Increase length to **16+ characters**, remove predictable sequences or dictionary words, or switch to a **5-word random passphrase**.`,
      tags: ["Page Context", "Password Strength"],
      followUps: [
        "What does crack time actually mean?",
        "How do I use the password generator?",
      ],
    };
  }

  // Context-aware Generator explanation
  if (
    path.includes("/generator") &&
    req.liveToolContext.generator &&
    /(this page|here|generator|option|setting|length|passphrase|ambiguous|safe|इस पेज|जनरेटर|विकल्प|लंबाई)/.test(
      q
    ) &&
    !matchKnowledgeBase(req.query)
  ) {
    const gen = req.liveToolContext.generator;
    return {
      source: "context",
      sourceLabelEn: "Generator Context",
      answer: `### Your Current Password Generator Setup
- **Active Mode:** **${gen.mode === "random" ? "Random CSPRNG Password" : "Diceware Passphrase"}** (${gen.lengthOrWords} ${gen.mode === "random" ? "characters" : "words"})
- **Character sets enabled:** ${gen.enabledCharsetsCount}/4${gen.excludeAmbiguous ? " • Ambiguous characters excluded" : ""}
- **Security guarantee:** Uses Web Crypto \`crypto.getRandomValues()\` strictly in browser memory with zero storage.`,
      tags: ["Page Context", "Password Generator"],
      followUps: [
        "How long should my generated password be?",
        "How should I securely save a generated password?",
      ],
    };
  }

  // Context-aware Breach Checker explanation
  if (
    path.includes("/breach-checker") &&
    req.liveToolContext.breach &&
    /(result|status|found|clean|breach|pwned|safe|privacy|परिणाम|जांच|लीक)/.test(q) &&
    !matchKnowledgeBase(req.query)
  ) {
    const br = req.liveToolContext.breach;
    let statusLine =
      "No check has been submitted yet on this screen — enter a test password and click Check.";

    if (br.status === "pwned") {
      statusLine = `**Exposed (${br.count.toLocaleString()} occurrences):** Stop using this password immediately on all accounts and generate a new 16+ char unique replacement.`;
    } else if (br.status === "clean") {
      statusLine =
        "**Clean (0 HIBP matches):** Not found in known public breaches, *however* still verify strength and length in the Password Analyzer because simple passwords can still be cracked offline.";
    }

    return {
      source: "context",
      sourceLabelEn: "Breach Context",
      answer: `### Current Breach Check Context
${statusLine}
- **Privacy protection:** Only a **5-character SHA-1 prefix** ever leaves your browser (k-Anonymity).`,
      tags: ["Page Context", "k-Anonymity"],
      followUps: [
        "Is my password safe if no breach is found?",
        "What should I do if my password appears in a breach?",
      ],
    };
  }

  // Context-aware Phishing Detector explanation
  if (
    path.includes("/phishing-detector") &&
    req.liveToolContext.phishing &&
    /(indicator|result|score|risk|suspicious|this url|explain|risky|संकेत|जोखिम|लिंक)/.test(
      q
    ) &&
    !matchKnowledgeBase(req.query)
  ) {
    const ph = req.liveToolContext.phishing;
    const flagsText =
      ph.summaryFlags.length > 0
        ? ph.summaryFlags.join(", ")
        : "no major heuristic red flags triggered";

    return {
      source: "context",
      sourceLabelEn: "Phishing Context",
      answer: `### Current Phishing Inspection Context
- **Risk Assessment:** \`${ph.riskScore}/100\` (**${ph.riskLevel}**)
- **Triggered Indicators:** ${flagsText}
- **Categories inspected:** ${ph.indicatorCategories.join(", ") || "syntax/domain checks"}

> **Limitation Warning:** Heuristic checks look for common deception patterns — even a **0/100** result never guarantees a site is definitely safe.`,
      tags: ["Page Context", "Phishing Analysis"],
      followUps: [
        "Can a URL detector guarantee that a website is safe?",
        "What should I do if I click a phishing link?",
      ],
    };
  }

  return null;
}

const OUT_OF_SCOPE_KEYWORDS = [
  "recipe",
  "weather",
  "cricket",
  "football",
  "movie",
  "song",
  "stock price",
  "joke",
];

function isClearlyOutOfScope(query: string): boolean {
  const lower = query.toLowerCase();
  return OUT_OF_SCOPE_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Primary Chatbot Response Orchestrator (Fixed English Output):
 * 1. Client-side Privacy Firewall
 * 2. Page Context-Aware Guidance (strictly sanitized telemetry)
 * 3. Predefined 51-Q&A Cybersecurity Knowledge Base (matches EN/HI/Hinglish queries -> English answers)
 * 4. Secure Server-Side AI Provider (only if configured, English instruction)
 * 5. Clearly Identified Offline Fallback Mode (English)
 */
export async function generateChatbotResponse(
  req: ChatbotServiceRequest
): Promise<ChatbotServiceResponse> {
  // 1. Privacy Firewall — block raw passwords / full 40-char hashes immediately
  const privacyBlockMsg = validateClientPromptPrivacy(req.query, "en");
  if (privacyBlockMsg) {
    return {
      source: "knowledge-base",
      sourceLabelEn: "Privacy Guard",
      answer: `### Privacy Protection Triggered\n${privacyBlockMsg}\n\n- Use the **Password Analyzer** for local-only password checking (nothing leaves your browser).\n- Your input was blocked locally and **never saved or sent to any AI API**.`,
      tags: ["Privacy Guard", "Blocked Locally"],
      followUps: [
        "Is it safe to type my password here?",
        "Does this website store or save the passwords I test?",
      ],
      blockedForPrivacy: true,
    };
  }

  // 2. Context-aware page + non-sensitive telemetry resolution
  const contextHit = resolveContextAwareReply(req);
  if (contextHit) {
    return contextHit;
  }

  // 3. Structured 51-Q&A Knowledge Base matching (understands EN/HI/Hinglish, responds in English)
  const kbMatch = matchKnowledgeBase(req.query);
  if (kbMatch) {
    const entry = kbMatch.entry;
    return {
      source: "knowledge-base",
      sourceLabelEn: `Knowledge Base #${entry.number}`,
      answer: entry.answerEn,
      tags: entry.tags,
      followUps: entry.followUpsEn,
    };
  }

  // 4. Out-of-scope polite redirect
  if (isClearlyOutOfScope(req.query)) {
    return {
      source: "fallback",
      sourceLabelEn: "Scope Guide",
      answer:
        "I focus exclusively on **cybersecurity and SecureCheck tools** — ask me about password strength, crack times, data breaches, entropy, phishing links, or 2FA!",
      tags: ["SecureCheck Guide"],
      followUps: [
        "What are the different features available in SecureCheck?",
        "What makes a password strong?",
      ],
    };
  }

  // 5. Real AI backend integration ONLY when server-side provider key is configured
  if (req.aiHealth?.providerConfigured) {
    const metadata = buildNonSensitiveAssistantMetadata(req.sessionSnapshot, req.hygiene);
    const apiReply = await sendAssistantMessage({
      message: req.query,
      language: "en",
      history: req.history.slice(-8),
      metadata,
    });
    return {
      source: "ai-backend",
      sourceLabelEn: `${apiReply.provider.toUpperCase()} Live AI`,
      answer: apiReply.reply,
      tags: ["Live AI", apiReply.model],
      followUps: [
        "How can I improve my password score?",
        "What is Two-Factor Authentication (2FA)?",
      ],
    };
  }

  // 6. Clearly identified Offline Fallback Mode (always English; never claims live LLM when unconfigured)
  const localReply = generateLocalSecurityReply(req.query, "en");
  const fallbackNotice =
    "\n\n> *Offline Fallback Mode: Answering from SecureCheck's built-in cybersecurity knowledge base (no live cloud AI provider key is configured).*";

  return {
    source: "fallback",
    sourceLabelEn: "Offline Fallback Mode",
    answer: `${localReply.answer}${fallbackNotice}`,
    tags: [...localReply.tags, "Fallback Mode"],
    followUps: localReply.suggestedFollowUps,
  };
}

export function getSuggestedStarterChips(
  _language: Language,
  pathname: string
): string[] {
  const requiredStarterChips = [
    "Is my password safe here?",
    "Why is my password score low?",
    "What does crack time mean?",
    "How can I create a stronger password?",
    "Has my password been breached?",
    "What is phishing?",
  ];

  if (pathname.includes("/generator")) {
    return [...requiredStarterChips, "How does the password generator work?"];
  }
  if (pathname.includes("/phishing-detector")) {
    return [...requiredStarterChips, "How does the phishing URL detector work?"];
  }

  return requiredStarterChips;
}

export const TOTAL_KNOWLEDGE_BASE_QUESTIONS = KNOWLEDGE_BASE.length;
