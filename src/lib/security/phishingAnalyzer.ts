import type { PhishingAnalysisResult, PhishingIndicator, RiskLevel } from "@/types/security";

const SUSPICIOUS_TLDS = new Set([
  "zip",
  "mov",
  "xyz",
  "top",
  "click",
  "gq",
  "tk",
  "ml",
  "cf",
  "ga",
  "work",
  "support",
  "rest",
  "buzz",
  "cam",
  "icu",
]);

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "rb.gy",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
]);

const HIGH_TARGET_BRANDS = [
  "google.com",
  "microsoft.com",
  "apple.com",
  "amazon.com",
  "paypal.com",
  "github.com",
  "netflix.com",
  "instagram.com",
  "facebook.com",
  "linkedin.com",
  "sbi.co.in",
  "onlinesbi.sbi",
  "hdfcbank.com",
  "icicibank.com",
  "axisbank.com",
];

const URL_SENSITIVE_TERMS = [
  "login",
  "signin",
  "verify",
  "verification",
  "update",
  "kyc",
  "suspend",
  "locked",
  "unlock",
  "confirm",
  "banking",
  "wallet",
  "otp",
  "password",
  "secure-account",
];

const PHISHING_TEXT_PATTERNS: Array<{
  id: string;
  regex: RegExp;
  weight: number;
  titleEn: string;
  titleHi: string;
  detailEn: string;
  detailHi: string;
}> = [
  {
    id: "urgency-threat",
    regex: /\b(urgent|immediately|within 24 hours|account suspended|will be closed|legal action|unauthorized login|blocked today)\b/i,
    weight: 22,
    titleEn: "High-pressure urgency or fear tactic",
    titleHi: "अत्यधिक तात्कालिकता या डर दिखाने की भाषा",
    detailEn: "Attackers fabricate artificial deadlines or account suspension threats to bypass careful verification.",
    detailHi: "हमलावर नकली समय-सीमा या खाता बंद होने की धमकी देकर सोचने का समय छीनते हैं।",
  },
  {
    id: "credential-otp-ask",
    regex: /\b(enter your otp|share otp|confirm your password|verify kyc|pin number|cvv|credit card details|bank account details)\b/i,
    weight: 28,
    titleEn: "Requests sensitive credentials, OTP, or KYC/card info",
    titleHi: "संवेदनशील पासवर्ड, OTP, KYC या कार्ड विवरण की मांग",
    detailEn: "Legitimate banks and services never ask you to submit OTPs, PINs, or passwords via links or messages.",
    detailHi: "वैध बैंक या सेवाएं कभी भी लिंक या संदेश के माध्यम से OTP, PIN या पासवर्ड नहीं मांगतीं।",
  },
  {
    id: "reward-lure",
    regex: /\b(you have won|congratulations|claim your prize|lottery|refund approved|free gift|cashback reward)\b/i,
    weight: 18,
    titleEn: "Too-good-to-be-true reward or refund lure",
    titleHi: "अविश्वसनीय इनाम या रिफंड का लालच",
    detailEn: "Unexpected prizes, refunds, or lottery claims are common social engineering hooks.",
    detailHi: "अप्रत्याशित इनाम या रिफंड का दावा आम सोशल इंजीनियरिंग जाल है।",
  },
  {
    id: "generic-greeting",
    regex: /\b(dear customer|dear user|valued member|dear account holder)\b/i,
    weight: 10,
    titleEn: "Impersonal generic greeting",
    titleHi: "सामान्य या अवैयक्तिक अभिवादन",
    detailEn: "Mass phishing campaigns often address victims as 'Dear Customer' instead of their real name.",
    detailHi: "बड़े पैमाने पर किए जाने वाले फ़िशिंग संदेश अक्सर आपके नाम के बजाय 'Dear Customer' लिखते हैं।",
  },
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  return Array.from(new Set(matches.map((u) => u.replace(/[.,;!?)]+$/, ""))));
}

function inspectSingleUrl(rawUrl: string, indicators: PhishingIndicator[]) {
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized) && /^[a-z0-9.-]+\.[a-z]{2,}/i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    indicators.push({
      id: "malformed-url",
      severity: "medium",
      category: "url",
      titleEn: "Malformed or obfuscated URL syntax",
      titleHi: "अमान्य या संदिग्ध URL संरचना",
      detailEn: "The submitted link could not be parsed cleanly as a standard web URL.",
      detailHi: "दिया गया लिंक मानक वेब URL के रूप में सही ढंग से पार्स नहीं हो सका।",
      weight: 18,
    });
    return { host: undefined, protocol: undefined };
  }

  const host = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.replace(":", "");

  if (protocol === "http") {
    indicators.push({
      id: "insecure-http",
      severity: "medium",
      category: "protocol",
      titleEn: "Unencrypted HTTP connection (no TLS/HTTPS)",
      titleHi: "असुरक्षित HTTP कनेक्शन (HTTPS एन्क्रिप्शन नहीं)",
      detailEn: "Credentials or data entered over plain HTTP can be intercepted in transit.",
      detailHi: "साधारण HTTP पर दर्ज डेटा या पासवर्ड नेटवर्क पर पढ़ा जा सकता है।",
      weight: 18,
    });
  }

  if (parsed.username || parsed.password || rawUrl.includes("@")) {
    indicators.push({
      id: "at-symbol-obfuscation",
      severity: "high",
      category: "url",
      titleEn: "Contains '@' credential redirection trick",
      titleHi: "URL में '@' रीडायरेक्शन ट्रिक मिली",
      detailEn: "Browsers ignore text before '@' in authority segments, misleading users about the true destination host.",
      detailHi: "ब्राउज़र '@' से पहले लिखे पते को अनदेखा कर देते हैं, जिससे असली डोमेन छिप जाता है।",
      weight: 32,
    });
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.startsWith("[")) {
    indicators.push({
      id: "ip-host",
      severity: "high",
      category: "domain",
      titleEn: `Uses raw IP address (${host}) instead of a domain name`,
      titleHi: `डोमेन नाम के बजाय सीधे IP पते (${host}) का उपयोग`,
      detailEn: "Legitimate consumer login portals rarely host authentication pages on raw IP addresses.",
      detailHi: "वैध सेवाएं सामान्यतः लॉगिन पेज के लिए सीधे IP पते का उपयोग नहीं करतीं।",
      weight: 30,
    });
  }

  if (host.includes("xn--")) {
    indicators.push({
      id: "punycode-homograph",
      severity: "high",
      category: "domain",
      titleEn: "Punycode / IDN homograph domain detected (xn--)",
      titleHi: "प्यूनीकोड / समान दिखने वाला होमोग्राफ़ डोमेन (xn--)",
      detailEn: "Internationalized characters can impersonate Latin letters (e.g., Cyrillic 'а' vs Latin 'a').",
      detailHi: "अंतरराष्ट्रीय वर्ण दिखने में असली डोमेन जैसे लग सकते हैं पर अलग वेबसाइट पर ले जाते हैं।",
      weight: 32,
    });
  }

  const parts = host.split(".");
  const tld = parts[parts.length - 1] || "";
  if (SUSPICIOUS_TLDS.has(tld)) {
    indicators.push({
      id: `risky-tld-${tld}`,
      severity: "medium",
      category: "domain",
      titleEn: `High-abuse top-level domain (.${tld})`,
      titleHi: `संदिग्ध या अधिक दुरुपयोग वाला डोमेन एक्सटेंशन (.${tld})`,
      detailEn: `The .${tld} TLD has elevated phishing abuse rates; verify sender authenticity carefully.`,
      detailHi: `.${tld} डोमेन का उपयोग फ़िशिंग अभियानों में अधिक देखा जाता है; स्रोत की पुष्टि करें।`,
      weight: 16,
    });
  }

  if (parts.length >= 4) {
    indicators.push({
      id: "excessive-subdomains",
      severity: "medium",
      category: "domain",
      titleEn: `Deep subdomain nesting (${parts.length} labels)`,
      titleHi: `अत्यधिक सबडोमेन स्तर (${parts.length} भाग)`,
      detailEn: "Phishers prepend brand names as subdomains (e.g., paypal.login.example.xyz) to hide the real root domain.",
      detailHi: "असली रूट डोमेन छिपाने के लिए अक्सर ब्रांड का नाम सबडोमेन में जोड़ा जाता है।",
      weight: 18,
    });
  }

  if (URL_SHORTENERS.has(host)) {
    indicators.push({
      id: "url-shortener",
      severity: "medium",
      category: "url",
      titleEn: `Uses URL shortener (${host})`,
      titleHi: `URL शॉर्टनर (${host}) का उपयोग`,
      detailEn: "Shortened links obscure the final destination domain until clicked.",
      detailHi: "शॉर्ट लिंक क्लिक करने से पहले अंतिम वेबसाइट का पता छिपा देते हैं।",
      weight: 15,
    });
  }

  // Brand typosquatting / impersonation check
  const rootDomain = parts.length >= 2 ? `${parts[parts.length - 2]}.${tld}` : host;
  for (const brand of HIGH_TARGET_BRANDS) {
    const brandLabel = brand.split(".")[0];
    if (host !== brand && !host.endsWith(`.${brand}`)) {
      const dist = levenshtein(rootDomain, brand);
      if (dist > 0 && dist <= 2) {
        indicators.push({
          id: `typosquat-${brand}`,
          severity: "high",
          category: "domain",
          titleEn: `Possible typosquatting impersonating ${brand}`,
          titleHi: `${brand} की नकल करने वाला संभावित टाइपोस्क्वैटिंग डोमेन`,
          detailEn: `Domain "${rootDomain}" differs from "${brand}" by only ${dist} character(s).`,
          detailHi: `डोमेन "${rootDomain}" असली "${brand}" से केवल ${dist} अक्षर अलग है।`,
          weight: 38,
        });
        break;
      } else if (host.includes(brandLabel) && brandLabel.length >= 4) {
        indicators.push({
          id: `brand-impersonation-${brand}`,
          severity: "high",
          category: "domain",
          titleEn: `Contains brand keyword "${brandLabel}" on non-official domain (${rootDomain})`,
          titleHi: `गैर-आधिकारिक डोमेन (${rootDomain}) में ब्रांड शब्द "${brandLabel}" शामिल है`,
          detailEn: `Official traffic for ${brand} uses ${brand}, not third-party domains containing the brand name.`,
          detailHi: `${brand} की आधिकारिक सेवाएं केवल ${brand} पर होती हैं, अन्य डोमेन पर नहीं।`,
          weight: 30,
        });
        break;
      }
    }
  }

  const fullPath = `${parsed.pathname}${parsed.search}`.toLowerCase();
  const matchedTerms = URL_SENSITIVE_TERMS.filter((t) => fullPath.includes(t));
  if (matchedTerms.length >= 2) {
    indicators.push({
      id: "url-sensitive-keywords",
      severity: "low",
      category: "url",
      titleEn: `Multiple credential-action keywords in path (${matchedTerms.slice(0, 3).join(", ")})`,
      titleHi: `URL पथ में संवेदनशील कीवर्ड (${matchedTerms.slice(0, 3).join(", ")})`,
      detailEn: "Combine this with domain verification before entering any credentials.",
      detailHi: "किसी भी जानकारी को दर्ज करने से पहले डोमेन की पूरी तरह पुष्टि करें।",
      weight: 10,
    });
  }

  return { host, protocol };
}

/**
 * Deterministic client-side URL & Message Phishing Heuristic Engine.
 */
export function analyzePhishingInput(input: {
  url?: string;
  messageText?: string;
}): PhishingAnalysisResult {
  const indicators: PhishingIndicator[] = [];
  const rawUrl = (input.url || "").trim();
  const rawText = (input.messageText || "").trim();

  const textUrls = extractUrls(rawText);
  const allUrls = Array.from(new Set([...(rawUrl ? [rawUrl] : []), ...textUrls]));

  let parsedHost: string | undefined;
  let parsedProtocol: string | undefined;

  allUrls.forEach((u, idx) => {
    const res = inspectSingleUrl(u, indicators);
    if (idx === 0) {
      parsedHost = res.host;
      parsedProtocol = res.protocol;
    }
  });

  if (rawText) {
    for (const rule of PHISHING_TEXT_PATTERNS) {
      if (rule.regex.test(rawText)) {
        indicators.push({
          id: rule.id,
          severity: rule.weight >= 25 ? "high" : rule.weight >= 15 ? "medium" : "low",
          category: "content",
          titleEn: rule.titleEn,
          titleHi: rule.titleHi,
          detailEn: rule.detailEn,
          detailHi: rule.detailHi,
          weight: rule.weight,
        });
      }
    }
  }

  // Deduplicate indicators by id
  const uniqueMap = new Map<string, PhishingIndicator>();
  for (const ind of indicators) {
    if (!uniqueMap.has(ind.id)) uniqueMap.set(ind.id, ind);
  }
  const uniqueIndicators = Array.from(uniqueMap.values());

  const totalScore = Math.min(
    100,
    uniqueIndicators.reduce((acc, item) => acc + item.weight, 0)
  );

  let riskLevel: RiskLevel = "safe";
  if (totalScore >= 60) riskLevel = "high-risk";
  else if (totalScore >= 32) riskLevel = "suspicious";
  else if (totalScore >= 12) riskLevel = "caution";

  const adviceEn: string[] = [];
  const adviceHi: string[] = [];

  if (riskLevel === "high-risk" || riskLevel === "suspicious") {
    adviceEn.push("Do not click embedded links, download attachments, or enter credentials/OTPs.");
    adviceEn.push("Navigate independently by typing the official website address or calling the official support number.");
    adviceHi.push("संदिग्ध लिंक पर क्लिक न करें, अटैचमेंट डाउनलोड न करें, और पासवर्ड/OTP न भरें।");
    adviceHi.push("आधिकारिक वेबसाइट का पता स्वयं ब्राउज़र में टाइप करके या आधिकारिक हेल्पलाइन से पुष्टि करें।");
  } else if (riskLevel === "caution") {
    adviceEn.push("Minor risk signals found. Double-check the exact root domain and sender email address before acting.");
    adviceHi.push("कुछ सामान्य जोखिम संकेत मिले हैं। आगे बढ़ने से पहले मूल डोमेन और प्रेषक के पते की पुष्टि करें।");
  } else {
    adviceEn.push("No obvious heuristic phishing signals triggered—still verify sender identity before sharing sensitive data.");
    adviceHi.push("कोई स्पष्ट फ़िशिंग संकेत नहीं मिला—फिर भी संवेदनशील जानकारी साझा करने से पहले प्रेषक की पहचान जांचें।");
  }

  return {
    riskScore: totalScore,
    riskLevel,
    parsedHost,
    parsedProtocol,
    extractedUrls: allUrls,
    indicators: uniqueIndicators,
    adviceEn,
    adviceHi,
  };
}
