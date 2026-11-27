import { generatePassphrase } from "@/lib/security/passwordGenerator";
import type {
  ImprovementActionStep,
  PasswordAnalysisResult,
  PasswordImprovementPlan,
  PatternExplanation,
} from "@/types/security";

/**
 * Generates sanitized, actionable password improvement guidance without ever
 * echoing the original password or matched password substrings.
 */
export function buildPasswordImprovementPlan(
  analysis: PasswordAnalysisResult,
  options?: { breachExposed?: boolean; breachCount?: number }
): PasswordImprovementPlan {
  const weakCharacteristicsEn: string[] = [];
  const weakCharacteristicsHi: string[] = [];

  if (analysis.length > 0 && analysis.length < 14) {
    weakCharacteristicsEn.push(
      `Short length (${analysis.length} chars; 14–16+ chars recommended)`
    );
    weakCharacteristicsHi.push(
      `कम लंबाई (${analysis.length} अक्षर; कम से कम 14–16+ अक्षर अनुशंसित)`
    );
  }
  if (analysis.length > 0 && (!analysis.hasUpper || !analysis.hasLower)) {
    weakCharacteristicsEn.push("Missing uppercase or lowercase letter diversity");
    weakCharacteristicsHi.push("बड़े (Uppercase) और छोटे (Lowercase) अक्षरों का अभाव");
  }
  if (analysis.length > 0 && !analysis.hasDigit) {
    weakCharacteristicsEn.push("No numeric digits included");
    weakCharacteristicsHi.push("कोई संख्यात्मक अंक (0–9) शामिल नहीं");
  }
  if (analysis.length > 0 && !analysis.hasSymbol) {
    weakCharacteristicsEn.push("No special symbols included");
    weakCharacteristicsHi.push("कोई विशेष चिह्न (Symbols) शामिल नहीं");
  }
  if (analysis.hasRepeatedChars) {
    weakCharacteristicsEn.push("Contains repeated characters or character runs");
    weakCharacteristicsHi.push("एक ही अक्षर की बार-बार पुनरावृत्ति");
  }
  if (analysis.hasSequentialPattern) {
    weakCharacteristicsEn.push("Contains sequential or keyboard-walk patterns");
    weakCharacteristicsHi.push("क्रमिक अक्षर/अंक या कीबोर्ड पैटर्न मौजूद हैं");
  }
  if (analysis.hasDictionaryOrCommon) {
    weakCharacteristicsEn.push("Matches common password or dictionary word patterns");
    weakCharacteristicsHi.push("आम पासवर्ड या शब्दकोश शब्द पैटर्न से मेल खाता है");
  }
  if (options?.breachExposed) {
    weakCharacteristicsEn.push(
      `Previously exposed in public breach corpora (${(options.breachCount ?? 0).toLocaleString()} occurrences)`
    );
    weakCharacteristicsHi.push(
      `सार्वजनिक डेटा ब्रीच में पहले ही उजागर हो चुका है (${(options.breachCount ?? 0).toLocaleString()} बार)`
    );
  }

  const lengthRecommendationEn =
    analysis.length < 14
      ? `Target at least 14–16 characters (currently ${analysis.length}). Each extra random character exponentially increases offline brute-force cost.`
      : `Good length (${analysis.length} characters). Keep length at 14+ characters or 4–5+ random words to resist GPU clusters.`;

  const lengthRecommendationHi =
    analysis.length < 14
      ? `कम से कम 14–16 अक्षरों का लक्ष्य रखें (वर्तमान में ${analysis.length})। हर अतिरिक्त अक्षर ब्रूट-फ़ोर्स लागत को कई गुना बढ़ाता है।`
      : `अच्छी लंबाई (${analysis.length} अक्षर)। GPU हमलों से बचाव के लिए 14+ अक्षर या 4–5+ यादृच्छिक शब्द बनाए रखें।`;

  const patternExplanations: PatternExplanation[] = [
    {
      id: "repeated",
      detected: analysis.hasRepeatedChars,
      titleEn: "Why Repeated Characters Weaken Security",
      titleHi: "दोहराए गए अक्षर सुरक्षा क्यों कम करते हैं",
      explanationEn:
        "Consecutive identical characters (such as repeating one letter or digit multiple times) add almost zero unpredictability. Cracking engines compress repeated runs and test them early.",
      explanationHi:
        "लगातार एक ही अक्षर या अंक दोहराने से कोई नई जटिलता नहीं जुड़ती। क्रैकिंग टूल्स ऐसे पैटर्न को बहुत तेज़ी से पकड़ लेते हैं।",
    },
    {
      id: "sequential",
      detected: analysis.hasSequentialPattern,
      titleEn: "Why Sequential & Keyboard Patterns Are Predictable",
      titleHi: "क्रमिक और कीबोर्ड पैटर्न क्यों असुरक्षित हैं",
      explanationEn:
        "Alphabetical sequences, numeric runs, and adjacent keyboard walks follow human habits rather than randomness. Automated password crackers prioritize spatial and sequential rules before pure brute-force.",
      explanationHi:
        "क्रमिक अंक, अक्षर या कीबोर्ड की पास वाली कुंजियाँ यादृच्छिक नहीं होतीं। स्वचालित क्रैकिंग टूल्स ब्रूट-फ़ोर्स से पहले इन्हीं पैटर्न को आज़माते हैं।",
    },
    {
      id: "length",
      detected: analysis.length > 0 && analysis.length < 14,
      titleEn: "Why Length Outperforms Complex Substitutions",
      titleHi: "जटिल चिह्नों से अधिक लंबाई क्यों प्रभावी है",
      explanationEn:
        "Replacing letters with '@' or '0' in short words adds minimal entropy because cracking rulesets automatically reverse common leet substitutions. Increasing random length expands the search space exponentially.",
      explanationHi:
        "छोटे शब्दों में '@' या '0' बदलने से सुरक्षा नहीं बढ़ती क्योंकि क्रैकिंग नियम इन्हें तुरंत पहचान लेते हैं। इसके बजाय लंबाई बढ़ाना अधिक प्रभावी है।",
    },
  ];

  // Fresh CSPRNG memorable passphrases as safer alternatives (never derived from user password)
  const passphraseSuggestions = [
    generatePassphrase({
      wordCount: 5,
      separator: "-",
      capitalize: false,
      includeNumber: true,
    }),
    generatePassphrase({
      wordCount: 4,
      separator: "_",
      capitalize: true,
      includeNumber: true,
    }),
  ];

  const actionableSteps: ImprovementActionStep[] = [];

  if (options?.breachExposed) {
    actionableSteps.push({
      id: "step-replace-breached",
      priority: "high",
      titleEn: "Replace Exposed Credential Immediately",
      titleHi: "उजागर पासवर्ड को तुरंत बदलें",
      detailEn:
        "Because this credential was found in public breach data, credential-stuffing bots already test it automatically. Replace it across every site where it was used.",
      detailHi:
        "यह पासवर्ड सार्वजनिक ब्रीच में मिल चुका है, इसलिए स्वचालित बॉट्स इसका दुरुपयोग कर सकते हैं। इसे हर जगह तुरंत बदलें।",
    });
  }

  if (analysis.hasDictionaryOrCommon) {
    actionableSteps.push({
      id: "step-remove-dictionary",
      priority: "high",
      titleEn: "Eliminate Common & Dictionary Roots",
      titleHi: "आम शब्द और शब्दकोश पैटर्न हटाएं",
      detailEn:
        "Avoid single dictionary words, brand names, or leet-speak variants. Combine 4–5 unrelated random words from a diceware list instead.",
      detailHi:
        "किसी एक शब्द, नाम या लीट बदलाव का उपयोग न करें। इसके बजाय 4–5 असंबंधित यादृच्छिक शब्दों का पासफ़्रेज़ चुनें।",
    });
  }

  if (analysis.length < 14) {
    actionableSteps.push({
      id: "step-increase-length",
      priority: analysis.length < 10 ? "high" : "medium",
      titleEn: "Extend Length to 14–16+ Characters",
      titleHi: "लंबाई बढ़ाकर 14–16+ अक्षर करें",
      detailEn:
        "Use at least 14 random characters or a 5-word passphrase so offline GPU clusters cannot exhaust the keyspace.",
      detailHi:
        "कम से कम 14 यादृच्छिक अक्षर या 5 शब्दों का पासफ़्रेज़ चुनें ताकि GPU क्लस्टर इसे क्रैक न कर सकें।",
    });
  }

  if (analysis.hasRepeatedChars || analysis.hasSequentialPattern) {
    actionableSteps.push({
      id: "step-break-patterns",
      priority: "medium",
      titleEn: "Break Repeated & Sequential Patterns",
      titleHi: "दोहराव और क्रमिक पैटर्न समाप्त करें",
      detailEn:
        "Remove consecutive identical characters and predictable keyboard walks; generate characters uniformly with a CSPRNG.",
      detailHi:
        "लगातार एक जैसे अक्षर और कीबोर्ड अनुक्रम हटाएं; CSPRNG जनरेटर से यादृच्छिक पासवर्ड बनाएं।",
    });
  }

  if (!analysis.hasUpper || !analysis.hasLower || !analysis.hasDigit || !analysis.hasSymbol) {
    actionableSteps.push({
      id: "step-expand-charset",
      priority: "medium",
      titleEn: "Diversify Character Classes Unpredictably",
      titleHi: "विविध अक्षर वर्गों का उपयोग करें",
      detailEn:
        "Mix uppercase, lowercase, digits, and symbols throughout the string—or adopt a multi-word passphrase with a random separator and number.",
      detailHi:
        "बड़े/छोटे अक्षर, अंक और चिह्नों को पूरे पासवर्ड में मिलाएं—या विभाजक और अंक के साथ बहु-शब्द पासफ़्रेज़ अपनाएं।",
    });
  }

  actionableSteps.push({
    id: "step-unique-mfa",
    priority: "low",
    titleEn: "Use a Password Manager & Enable MFA / Passkeys",
    titleHi: "पासवर्ड मैनेजर और MFA / पासकी अपनाएं",
    detailEn:
      "Even a high-entropy password must remain unique to one account and paired with Passkeys or TOTP MFA to mitigate phishing and server breaches.",
    detailHi:
      "मजबूत पासवर्ड को भी केवल एक ही खाते तक सीमित रखें और फ़िशिंग से बचाव के लिए पासकी या TOTP MFA चालू करें।",
  });

  return {
    weakCharacteristicsEn,
    weakCharacteristicsHi,
    lengthRecommendationEn,
    lengthRecommendationHi,
    patternExplanations,
    passphraseSuggestions,
    actionableSteps,
  };
}
