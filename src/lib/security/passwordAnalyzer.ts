import zxcvbn from "zxcvbn";
import type {
  CrackTimeEstimates,
  PasswordAnalysisResult,
  PasswordWeakness,
  StrengthLevel,
  ZxcvbnPatternSummary,
} from "@/types/security";

const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "123123",
  "baseball",
  "abc123",
  "football",
  "monkey",
  "letmein",
  "shadow",
  "master",
  "666666",
  "qwertyuiop",
  "123321",
  "mustang",
  "1234567890",
  "michael",
  "654321",
  "superman",
  "1qaz2wsx",
  "7777777",
  "fuckyou",
  "121212",
  "000000",
  "qazwsx",
  "123qwe",
  "killer",
  "trustno1",
  "jordan",
  "jennifer",
  "zxcvbnm",
  "asdfgh",
  "hunter",
  "buster",
  "soccer",
  "harley",
  "batman",
  "andrew",
  "tigger",
  "sunshine",
  "iloveyou",
  "2000",
  "charlie",
  "robert",
  "thomas",
  "hockey",
  "ranger",
  "daniel",
  "starwars",
  "klaster",
  "112233",
  "george",
  "computer",
  "michelle",
  "jessica",
  "pepper",
  "1111",
  "zxcvbn",
  "555555",
  "11111111",
  "131313",
  "freedom",
  "777777",
  "pass",
  "maggie",
  "159753",
  "aaaaaa",
  "ginger",
  "princess",
  "joshua",
  "cheese",
  "amanda",
  "summer",
  "love",
  "ashley",
  "nicole",
  "chelsea",
  "biteme",
  "matthew",
  "access",
  "yankees",
  "987654321",
  "dallas",
  "austin",
  "thunder",
  "taylor",
  "matrix",
  "admin",
  "admin123",
  "welcome",
  "welcome1",
  "password1",
  "password123",
  "passw0rd",
  "p@ssw0rd",
  "p@ssword",
  "india123",
  "changeme",
  "qwerty123",
  "root",
  "toor",
  "test123",
]);

const COMMON_DICTIONARY_ROOTS = [
  "password",
  "admin",
  "welcome",
  "secure",
  "login",
  "secret",
  "dragon",
  "master",
  "shadow",
  "monkey",
  "sunshine",
  "football",
  "cricket",
  "india",
  "mumbai",
  "delhi",
  "google",
  "matrix",
  "freedom",
  "iloveyou",
  "letmein",
  "qwerty",
  "cyber",
  "hacker",
  "bank",
  "office",
];

const KEYBOARD_ROWS = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1234567890",
  "0987654321",
  "!@#$%^&*()",
];

function normalizeLeet(input: string): string {
  return input
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!(?=[a-z])/g, "i")
    .replace(/4(?=[a-z])/g, "a")
    .replace(/3(?=[a-z])/g, "e")
    .replace(/1(?=[a-z])/g, "i")
    .replace(/0(?=[a-z])/g, "o")
    .replace(/5(?=[a-z])/g, "s")
    .replace(/7(?=[a-z])/g, "t")
    .replace(/\+(?=[a-z])/g, "t");
}

function hasKeyboardWalk(pw: string): string | null {
  const lower = pw.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const rev = row.split("").reverse().join("");
    for (let len = 4; len <= row.length; len++) {
      for (let i = 0; i <= row.length - len; i++) {
        const sub = row.slice(i, i + len);
        const subRev = rev.slice(i, i + len);
        if (lower.includes(sub)) return sub;
        if (lower.includes(subRev)) return subRev;
      }
    }
  }
  return null;
}

function hasSequentialChars(pw: string): string | null {
  const lower = pw.toLowerCase();
  let run = 1;
  let dir = 0;
  for (let i = 1; i < lower.length; i++) {
    const diff = lower.charCodeAt(i) - lower.charCodeAt(i - 1);
    if (diff === 1 || diff === -1) {
      if (dir === diff || dir === 0) {
        dir = diff;
        run++;
        if (run >= 3) {
          return pw.slice(i - run + 1, i + 1);
        }
      } else {
        dir = diff;
        run = 2;
      }
    } else {
      dir = 0;
      run = 1;
    }
  }
  return null;
}

/**
 * Calculates information-theoretic Shannon entropy across the password's character frequencies (in bits).
 */
export function calculateShannonEntropy(password: string): number {
  if (!password) return 0;
  const freq = new Map<string, number>();
  for (const ch of password) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  const len = password.length;
  let bitsPerChar = 0;
  for (const count of freq.values()) {
    const p = count / len;
    bitsPerChar -= p * Math.log2(p);
  }
  return Math.round(bitsPerChar * len * 10) / 10;
}

/**
 * Calculates independent character-pool brute-force entropy: L * log2(N).
 */
export function calculatePoolEntropy(password: string): {
  poolSize: number;
  entropyBits: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
} {
  if (!password) {
    return {
      poolSize: 0,
      entropyBits: 0,
      hasLower: false,
      hasUpper: false,
      hasDigit: false,
      hasSymbol: false,
    };
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9\s]/.test(password);
  const hasSpace = /\s/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32;
  if (hasSpace) poolSize += 1;
  if (poolSize === 0) poolSize = 26;

  const entropyBits = Math.round(password.length * Math.log2(poolSize) * 10) / 10;
  return { poolSize, entropyBits, hasLower, hasUpper, hasDigit, hasSymbol };
}

function mapLevelFromScore(score: number): StrengthLevel {
  if (score >= 85) return "very-strong";
  if (score >= 65) return "strong";
  if (score >= 43) return "fair";
  if (score >= 21) return "weak";
  return "very-weak";
}

/**
 * Performs 100% in-memory password analysis combining zxcvbn, independent entropy formulas,
 * and structural pattern detection. Never stores, logs, or transmits passwords.
 */
export function analyzePassword(
  password: string,
  options?: { contextTokens?: string[]; strictMode?: boolean }
): PasswordAnalysisResult {
  if (!password) {
    return {
      length: 0,
      poolSize: 0,
      entropyBits: 0,
      shannonEntropyBits: 0,
      effectiveEntropyBits: 0,
      score: 0,
      level: "empty",
      zxcvbnScore: 0,
      zxcvbnGuessesLog10: 0,
      zxcvbnWarning: "",
      zxcvbnSuggestions: [],
      zxcvbnPatterns: [],
      hasLower: false,
      hasUpper: false,
      hasDigit: false,
      hasSymbol: false,
      hasRepeatedChars: false,
      hasSequentialPattern: false,
      hasDictionaryOrCommon: false,
      uniqueChars: 0,
      weaknesses: [],
      recommendationsEn: [
        "Enter a password to evaluate zxcvbn resistance, entropy bits, patterns, and offline crack time.",
      ],
      recommendationsHi: [
        "zxcvbn क्षमता, एंट्रॉपी बिट्स, पैटर्न और ऑफ़लाइन क्रैक समय जांचने के लिए पासवर्ड दर्ज करें।",
      ],
      nistCompliant: false,
      crackTimes: {
        onlineThrottled: "—",
        onlineUnthrottled: "—",
        offlineBcrypt: "—",
        offlineGpuCluster: "—",
      },
    };
  }

  const contextTokens = (options?.contextTokens ?? [])
    .map((t) => t.trim())
    .filter(Boolean);

  // Run zxcvbn locally in memory (slice to 100 chars for fast deterministic zxcvbn runtime)
  const zxcvbnInput = password.length > 100 ? password.slice(0, 100) : password;
  const zx = zxcvbn(zxcvbnInput, contextTokens);

  const zxcvbnPatterns: ZxcvbnPatternSummary[] = zx.sequence.map((match) => ({
    pattern: match.pattern,
    matchedLength: match.token.length,
    dictionaryName: "dictionary_name" in match ? match.dictionary_name : undefined,
  }));

  const length = password.length;
  const uniqueChars = new Set(password).size;
  const { poolSize, entropyBits, hasLower, hasUpper, hasDigit, hasSymbol } =
    calculatePoolEntropy(password);
  const shannonEntropyBits = calculateShannonEntropy(password);

  let penaltyBits = 0;
  const weaknesses: PasswordWeakness[] = [];
  const recEn: string[] = [];
  const recHi: string[] = [];

  const lower = password.toLowerCase();
  const normalized = normalizeLeet(password);
  const normalizedStem = normalized.replace(/[\d!@#$%^&*]+$/, "");

  const isExactCommon =
    COMMON_PASSWORDS.has(lower) || COMMON_PASSWORDS.has(normalized);

  const zxHasDict = zx.sequence.some((m) => m.pattern === "dictionary");
  const matchedDictRoot =
    COMMON_DICTIONARY_ROOTS.find(
      (root) => root.length >= 4 && normalized.includes(root)
    ) ||
    (normalizedStem.length >= 4 && COMMON_PASSWORDS.has(normalizedStem)
      ? normalizedStem
      : undefined);
  const hasDictionaryOrCommon = isExactCommon || zxHasDict || Boolean(matchedDictRoot);

  if (isExactCommon) {
    penaltyBits += Math.max(entropyBits * 0.75, 35);
    weaknesses.push({
      id: "common-breached-list",
      severity: "high",
      titleEn: "Matches top known leaked/common password",
      titleHi: "सबसे आम लीक पासवर्ड सूची में शामिल",
      detailEn:
        "Attackers test common passwords and their simple digit/symbol variants first.",
      detailHi:
        "हमलावर सबसे पहले आम पासवर्ड और उनके सरल अंक/चिह्न बदलावों को आज़माते हैं।",
    });
  } else if (zxHasDict || matchedDictRoot) {
    penaltyBits += 14;
    const label = matchedDictRoot ? `("${matchedDictRoot}")` : "(dictionary match)";
    weaknesses.push({
      id: "dictionary-pattern",
      severity: "medium",
      titleEn: `Contains dictionary word or predictable pattern ${label}`,
      titleHi: `शब्दकोश शब्द या अनुमानित पैटर्न शामिल है ${label}`,
      detailEn:
        "Dictionary words and leet substitutions (@, 0, 3) are rapidly matched by zxcvbn and cracking wordlists.",
      detailHi:
        "शब्दकोश के शब्द और लीट बदलाव (@, 0, 3) क्रैकिंग वर्डलिस्ट द्वारा तेज़ी से पकड़ लिए जाते हैं।",
    });
  }

  const walk = hasKeyboardWalk(password);
  const seq = hasSequentialChars(password);
  const zxHasSeqOrSpatial = zx.sequence.some(
    (m) => m.pattern === "sequence" || m.pattern === "spatial"
  );
  const hasSequentialPattern = Boolean(walk || seq || zxHasSeqOrSpatial);

  if (walk) {
    penaltyBits += 14;
    weaknesses.push({
      id: "keyboard-walk",
      severity: "medium",
      titleEn: `Keyboard sequence detected ("${walk}")`,
      titleHi: `कीबोर्ड अनुक्रम मिला ("${walk}")`,
      detailEn: "Adjacent keyboard walks dramatically shrink the effective search space.",
      detailHi: "कीबोर्ड की क्रमिक कुंजियाँ पासवर्ड की वास्तविक सुरक्षा कम करती हैं।",
    });
  }

  if (seq) {
    penaltyBits += 12;
    weaknesses.push({
      id: "sequential-chars",
      severity: "medium",
      titleEn: `Sequential characters detected ("${seq}")`,
      titleHi: `क्रमिक अक्षर/अंक मिले ("${seq}")`,
      detailEn: "Alphabetic or numeric sequences (e.g. abc, 123, 987) are tried early in attacks.",
      detailHi: "क्रमिक अक्षर या अंक (जैसे abc, 123) हमलों में पहले जांचे जाते हैं।",
    });
  } else if (zxHasSeqOrSpatial && !walk) {
    penaltyBits += 10;
    weaknesses.push({
      id: "zxcvbn-spatial-sequence",
      severity: "medium",
      titleEn: "Predictable spatial or sequential pattern detected",
      titleHi: "अनुमान लगाने योग्य क्रमिक पैटर्न मिला",
      detailEn: "zxcvbn flagged a predictable keyboard or character sequence.",
      detailHi: "zxcvbn ने एक अनुमानित कीबोर्ड या क्रमिक पैटर्न पहचाना है।",
    });
  }

  const zxHasRepeat = zx.sequence.some((m) => m.pattern === "repeat");
  const hasRepeatedChars = /(.)\1{2,}/.test(password) || zxHasRepeat;
  if (hasRepeatedChars) {
    penaltyBits += 10;
    weaknesses.push({
      id: "repeated-chars",
      severity: "medium",
      titleEn: "Repeated characters detected",
      titleHi: "एक ही अक्षर की पुनरावृत्ति मिली",
      detailEn: "Repeated characters or blocks add very little cryptographic unpredictability.",
      detailHi: "दोहराए गए अक्षर पासवर्ड को मजबूत नहीं बनाते।",
    });
  }

  if (/(19\d\d|20[0-2]\d)/.test(password)) {
    penaltyBits += 8;
    weaknesses.push({
      id: "year-pattern",
      severity: "low",
      titleEn: "Contains a calendar year pattern",
      titleHi: "वर्ष (साल) जैसा पैटर्न शामिल है",
      detailEn: "Years (1980–2029) are frequently appended to weak passwords.",
      detailHi: "पासवर्ड में साल जोड़ना एक आम कमज़ोर पैटर्न है।",
    });
  }

  if (length >= 4 && uniqueChars / length < 0.5) {
    penaltyBits += 8;
    weaknesses.push({
      id: "low-diversity",
      severity: "low",
      titleEn: "Low character uniqueness ratio",
      titleHi: "विविध अक्षरों की कमी",
      detailEn: `Only ${uniqueChars} unique characters across ${length} positions.`,
      detailHi: `${length} में से केवल ${uniqueChars} अद्वितीय अक्षर हैं।`,
    });
  }

  for (const rawToken of contextTokens) {
    const token = rawToken.toLowerCase();
    if (token.length >= 3 && lower.includes(token)) {
      penaltyBits += 18;
      weaknesses.push({
        id: `context-${token}`,
        severity: "high",
        titleEn: `Contains personal identifier ("${rawToken}")`,
        titleHi: `व्यक्तिगत जानकारी ("${rawToken}") शामिल है`,
        detailEn: "Never include your name, username, or email fragments in a password.",
        detailHi: "पासवर्ड में कभी भी अपना नाम, यूज़रनेम या ईमेल हिस्सा शामिल न करें।",
      });
      break;
    }
  }

  const minLength = options?.strictMode ? 12 : 8;
  if (length < minLength) {
    penaltyBits += (minLength - length) * 4;
    weaknesses.push({
      id: "short-length",
      severity: length < 8 ? "high" : "medium",
      titleEn: `Length (${length}) below recommended ${minLength} characters`,
      titleHi: `लंबाई (${length}) अनुशंसित ${minLength} अक्षरों से कम है`,
      detailEn: "Length is the single strongest multiplier against offline brute-force cracking.",
      detailHi: "ऑफ़लाइन क्रैकिंग के खिलाफ लंबाई सबसे मजबूत सुरक्षा कारक है।",
    });
  }

  // Blend zxcvbn's guesses_log10 entropy estimate (~3.322 bits per log10) with penalized pool entropy
  const zxcvbnEntropyBits = Math.round(zx.guesses_log10 * Math.log2(10) * 10) / 10;
  const penalizedPoolBits = Math.max(0, entropyBits - penaltyBits);
  const effectiveEntropyBits =
    Math.round(Math.min(penalizedPoolBits, Math.max(zxcvbnEntropyBits, penalizedPoolBits * 0.7)) * 10) /
    10;

  // Compute deterministic 0..100 strength score anchored on zxcvbnScore + effectiveEntropyBits
  const baseRangeByZx: Record<0 | 1 | 2 | 3 | 4, [number, number]> = {
    0: [6, 20],
    1: [22, 42],
    2: [44, 64],
    3: [66, 84],
    4: [86, 100],
  };
  const [minBand, maxBand] = baseRangeByZx[zx.score];
  const bandRatio = Math.min(1, effectiveEntropyBits / 95);
  let score = Math.round(minBand + (maxBand - minBand) * bandRatio);

  if (isExactCommon) {
    score = Math.min(score, 15);
  }
  if (length < 8) {
    score = Math.min(score, 35);
  }
  if (options?.strictMode && length < 12) {
    score = Math.min(score, 62);
  }

  const level = mapLevelFromScore(score);

  // Build detailed bilingual suggestions combining zxcvbn feedback & structural insights
  if (zx.feedback.warning) {
    recEn.push(zx.feedback.warning);
  }
  for (const s of zx.feedback.suggestions) {
    if (!recEn.includes(s)) recEn.push(s);
  }

  if (length < 14) {
    recEn.push("Increase length to 14–16+ characters (or use a 4–5 word random passphrase).");
    recHi.push("लंबाई बढ़ाकर 14–16+ अक्षर करें (या 4–5 यादृच्छिक शब्दों का पासफ़्रेज़ चुनें)।");
  }
  if (!hasUpper || !hasLower) {
    recEn.push("Include a balanced mix of uppercase and lowercase letters.");
    recHi.push("बड़े (Uppercase) और छोटे (Lowercase) अक्षरों का संतुलित मिश्रण जोड़ें।");
  }
  if (!hasDigit || !hasSymbol) {
    recEn.push("Add unpredictable digits and special characters beyond trailing positions.");
    recHi.push("केवल अंत में जोड़ने के बजाय बीच में अंक और विशेष चिह्न (Symbols) शामिल करें।");
  }
  if (hasRepeatedChars || hasSequentialPattern) {
    recEn.push("Remove repeated characters, keyboard walks (qwerty), and sequences (123, abc).");
    recHi.push("दोहराए गए अक्षर, कीबोर्ड पैटर्न और क्रमिक अंक/अक्षर हटा दें।");
  }
  if (hasDictionaryOrCommon) {
    recEn.push("Avoid dictionary words, common passwords, and predictable leet substitutions.");
    recHi.push("शब्दकोश के शब्द, आम पासवर्ड और अनुमानित बदलावों से बचें।");
  }
  if (recEn.length === 0) {
    recEn.push("Strong resistance! Store this secret in a password manager and never reuse it.");
    recHi.push("बेहतरीन सुरक्षा! इसे पासवर्ड मैनेजर में सहेजें और कहीं और दोबारा उपयोग न करें।");
  }
  if (recHi.length === 0) {
    recHi.push("बेहतरीन सुरक्षा! इसे पासवर्ड मैनेजर में सहेजें और कहीं और दोबारा उपयोग न करें।");
  }

  const crackTimes: CrackTimeEstimates = {
    onlineThrottled: String(zx.crack_times_display.online_throttling_100_per_hour),
    onlineUnthrottled: String(zx.crack_times_display.online_no_throttling_10_per_second),
    offlineBcrypt: String(zx.crack_times_display.offline_slow_hashing_1e4_per_second),
    offlineGpuCluster: String(zx.crack_times_display.offline_fast_hashing_1e10_per_second),
  };

  const nistCompliant = length >= 8 && !isExactCommon && zx.score >= 2;

  return {
    length,
    poolSize,
    entropyBits,
    shannonEntropyBits,
    effectiveEntropyBits,
    score,
    level,
    zxcvbnScore: zx.score,
    zxcvbnGuessesLog10: Math.round(zx.guesses_log10 * 100) / 100,
    zxcvbnWarning: zx.feedback.warning || "",
    zxcvbnSuggestions: zx.feedback.suggestions || [],
    zxcvbnPatterns,
    hasLower,
    hasUpper,
    hasDigit,
    hasSymbol,
    hasRepeatedChars,
    hasSequentialPattern,
    hasDictionaryOrCommon,
    uniqueChars,
    weaknesses,
    recommendationsEn: recEn,
    recommendationsHi: recHi,
    nistCompliant,
    crackTimes,
  };
}
