import type {
  PhishingAnalysisResult,
  PhishingDetectionSummary,
  PhishingIndicator,
  RiskLevel,
  UrlAnatomy,
} from "@/types/security";

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
  "shop",
  "quest",
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
  "shorturl.at",
  "rebrand.ly",
  "lnkd.in",
  "tiny.cc",
  "s.id",
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

const TWO_PART_PUBLIC_SUFFIXES = new Set([
  "co.in",
  "co.uk",
  "org.in",
  "net.in",
  "gov.in",
  "ac.in",
  "com.au",
  "co.jp",
  "org.uk",
]);

const URL_SENSITIVE_TERMS = [
  "login",
  "signin",
  "verify",
  "verification",
  "update",
  "kyc",
  "suspend",
  "suspended",
  "locked",
  "unlock",
  "confirm",
  "banking",
  "wallet",
  "otp",
  "password",
  "secure-account",
  "billing",
  "refund",
  "urgent",
];

const DANGEROUS_SCHEMES = new Set(["javascript:", "data:", "vbscript:", "file:"]);

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

function isIpLiteralHost(host: string): boolean {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return true;
  if (host.startsWith("[") && host.endsWith("]")) return true;
  // Obfuscated integer / hex / octal IP representations (e.g. 2130706433 or 0x7f.0.0.1)
  if (/^\d+$/.test(host)) return true;
  if (/^(0x[0-9a-f]+|0[0-7]+|\d+)(\.(0x[0-9a-f]+|0[0-7]+|\d+)){1,3}$/i.test(host)) {
    return true;
  }
  return false;
}

function splitDomainParts(host: string): { subdomains: string; rootDomain: string } {
  if (isIpLiteralHost(host)) {
    return { subdomains: "", rootDomain: host };
  }
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) {
    return { subdomains: "", rootDomain: host };
  }
  const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  const rootLen = TWO_PART_PUBLIC_SUFFIXES.has(lastTwo) && parts.length >= 3 ? 3 : 2;
  const rootDomain = parts.slice(-rootLen).join(".");
  const subdomains = parts.slice(0, parts.length - rootLen).join(".");
  return { subdomains, rootDomain };
}

export interface UrlValidationOutcome {
  valid: boolean;
  parsed?: URL;
  errorEn?: string;
  errorHi?: string;
  unsafeScheme?: string;
}

/**
 * Validates URL syntax strictly without making any network connection.
 */
export function validateUrlSyntax(rawUrl: string): UrlValidationOutcome {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, errorEn: "URL is empty.", errorHi: "URL खाली है।" };
  }
  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      errorEn: "Invalid URL syntax: URLs cannot contain spaces or line breaks.",
      errorHi: "अमान्य URL सिंटैक्स: URL में रिक्त स्थान (Space) नहीं हो सकते।",
    };
  }

  const lower = trimmed.toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return {
        valid: false,
        unsafeScheme: scheme.replace(":", ""),
        errorEn: `Dangerous non-web scheme (${scheme}) detected—can execute scripts or local payloads.`,
        errorHi: `खतरनाक स्कीम (${scheme}) मिली—यह स्क्रिप्ट या हानिकारक पेलोड चला सकती है।`,
      };
    }
  }

  let candidate = trimmed;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    if (/^[a-z0-9.-]+\.[a-z]{2,}(?:[:/?#]|$)/i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return {
        valid: false,
        errorEn: "Invalid URL syntax: enter a complete web URL (e.g., https://example.com).",
        errorHi: "अमान्य URL सिंटैक्स: कृपया पूरा वेब पता दर्ज करें (जैसे https://example.com)।",
      };
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      valid: false,
      errorEn: "Malformed URL: could not be parsed according to RFC 3986.",
      errorHi: "विकृत URL: मानक वेब URL संरचना के अनुसार पार्स नहीं हो सका।",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      unsafeScheme: parsed.protocol.replace(":", ""),
      errorEn: `Unsupported protocol (${parsed.protocol})—only HTTP/HTTPS web URLs are valid.`,
      errorHi: `असमर्थित प्रोटोकॉल (${parsed.protocol})—केवल HTTP/HTTPS मान्य हैं।`,
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || (!isIpLiteralHost(host) && !host.includes("."))) {
    return {
      valid: false,
      errorEn: "Invalid hostname: missing top-level domain.",
      errorHi: "अमान्य होस्टनेम: टॉप-लेवल डोमेन (जैसे .com) अनुपस्थित है।",
    };
  }

  return { valid: true, parsed };
}

function inspectSingleUrl(
  rawUrl: string,
  indicators: PhishingIndicator[],
  summary: PhishingDetectionSummary
): {
  valid: boolean;
  errorEn?: string;
  errorHi?: string;
  host?: string;
  protocol?: string;
  anatomy?: UrlAnatomy;
} {
  const validation = validateUrlSyntax(rawUrl);
  if (!validation.valid || !validation.parsed) {
    if (validation.unsafeScheme) {
      summary.hasUnsafeProtocol = true;
    }
    indicators.push({
      id: validation.unsafeScheme ? "unsafe-scheme" : "malformed-url",
      severity: validation.unsafeScheme ? "high" : "medium",
      category: "syntax",
      titleEn: validation.unsafeScheme
        ? `Unsafe URI scheme (${validation.unsafeScheme}:)`
        : "Malformed or invalid URL syntax",
      titleHi: validation.unsafeScheme
        ? `असुरक्षित URI स्कीम (${validation.unsafeScheme}:)`
        : "अमान्य या संदिग्ध URL संरचना",
      detailEn: validation.errorEn || "Submitted URL failed syntax validation.",
      detailHi: validation.errorHi || "दिया गया URL सिंटैक्स जांच में विफल रहा।",
      weight: validation.unsafeScheme ? 45 : 22,
    });
    return { valid: false, errorEn: validation.errorEn, errorHi: validation.errorHi };
  }

  const parsed = validation.parsed;
  const host = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.replace(":", "");
  const { subdomains, rootDomain } = splitDomainParts(host);

  const anatomy: UrlAnatomy = {
    protocol,
    subdomains,
    rootDomain,
    port: parsed.port || "",
    pathAndQuery: `${parsed.pathname}${parsed.search}${parsed.hash}`,
  };

  if (protocol === "http") {
    summary.hasUnsafeProtocol = true;
    indicators.push({
      id: "insecure-http",
      severity: "medium",
      category: "protocol",
      titleEn: "Unencrypted HTTP connection (no TLS/HTTPS)",
      titleHi: "असुरक्षित HTTP कनेक्शन (HTTPS एन्क्रिप्शन नहीं)",
      detailEn:
        "Traffic over plain HTTP is unencrypted and can be intercepted or modified in transit.",
      detailHi: "साधारण HTTP पर भेजा गया डेटा एन्क्रिप्टेड नहीं होता और रास्ते में पढ़ा जा सकता है।",
      weight: 18,
    });
  }

  if (parsed.username || parsed.password || rawUrl.includes("@")) {
    summary.hasSuspiciousDomainPattern = true;
    indicators.push({
      id: "at-symbol-obfuscation",
      severity: "high",
      category: "domain",
      titleEn: "Contains '@' authority redirection trick",
      titleHi: "URL में '@' रीडायरेक्शन ट्रिक मिली",
      detailEn:
        "Browsers treat text before '@' as credentials and actually connect to the domain after '@', hiding the real destination.",
      detailHi: "ब्राउज़र '@' से पहले के हिस्से को अनदेखा कर '@' के बाद वाले असली डोमेन से जुड़ते हैं।",
      weight: 34,
    });
  }

  if (isIpLiteralHost(host)) {
    summary.isIpBasedHost = true;
    indicators.push({
      id: "ip-host",
      severity: "high",
      category: "ip-host",
      titleEn: `Uses raw or obfuscated IP address (${host}) instead of a domain name`,
      titleHi: `डोमेन नाम के बजाय सीधे IP पते (${host}) का उपयोग`,
      detailEn:
        "Legitimate login portals almost never host public authentication pages on raw IP addresses.",
      detailHi: "वैध सेवाएं लॉगिन पेज के लिए सीधे IP पते का उपयोग नहीं करतीं।",
      weight: 34,
    });
  }

  if (host.includes("xn--")) {
    summary.hasSuspiciousDomainPattern = true;
    indicators.push({
      id: "punycode-homograph",
      severity: "high",
      category: "domain",
      titleEn: "Punycode / IDN homograph domain detected (xn--)",
      titleHi: "प्यूनीकोड / समान दिखने वाला होमोग्राफ़ डोमेन (xn--)",
      detailEn:
        "Internationalized characters can mimic Latin letters (homograph attack) to impersonate trusted brands.",
      detailHi: "अंतरराष्ट्रीय वर्ण दिखने में असली डोमेन जैसे लग सकते हैं पर अलग वेबसाइट पर ले जाते हैं।",
      weight: 34,
    });
  }

  if (parsed.port && !["80", "443"].includes(parsed.port)) {
    summary.hasSuspiciousDomainPattern = true;
    indicators.push({
      id: "non-standard-port",
      severity: "medium",
      category: "domain",
      titleEn: `Uses non-standard network port (:${parsed.port})`,
      titleHi: `गैर-मानक नेटवर्क पोर्ट (:${parsed.port}) का उपयोग`,
      detailEn:
        "Consumer phishing kits or temporary C2 servers frequently serve pages on non-standard ports.",
      detailHi: "अस्थायी फ़िशिंग सर्वर अक्सर गैर-मानक पोर्ट पर होस्ट किए जाते हैं।",
      weight: 16,
    });
  }

  const parts = host.split(".");
  const tld = parts[parts.length - 1] || "";
  if (!isIpLiteralHost(host) && SUSPICIOUS_TLDS.has(tld)) {
    summary.hasSuspiciousDomainPattern = true;
    indicators.push({
      id: `risky-tld-${tld}`,
      severity: "medium",
      category: "domain",
      titleEn: `High-abuse top-level domain (.${tld})`,
      titleHi: `अधिक दुरुपयोग वाला डोमेन एक्सटेंशन (.${tld})`,
      detailEn: `The .${tld} TLD experiences elevated phishing abuse rates; confirm the registered organization carefully.`,
      detailHi: `.${tld} डोमेन का उपयोग फ़िशिंग अभियानों में अधिक देखा जाता है; स्रोत की पुष्टि करें।`,
      weight: 16,
    });
  }

  const rootMainLabel = rootDomain.split(".")[0] || "";
  if ((rootMainLabel.match(/-/g) || []).length >= 2) {
    summary.hasSuspiciousDomainPattern = true;
    indicators.push({
      id: "hyphenated-domain",
      severity: "medium",
      category: "domain",
      titleEn: `Multiple hyphens inside root domain (${rootDomain})`,
      titleHi: `मूल डोमेन (${rootDomain}) में कई हाइफ़न (-) का उपयोग`,
      detailEn:
        "Phishing domains frequently chain words with hyphens (e.g., bank-login-secure-update.com) to look official.",
      detailHi: "नकली डोमेन आधिकारिक दिखने के लिए अक्सर कई शब्दों को हाइफ़न से जोड़ते हैं।",
      weight: 16,
    });
  }

  if (URL_SHORTENERS.has(host)) {
    summary.isUrlShortener = true;
    indicators.push({
      id: "url-shortener",
      severity: "medium",
      category: "shortener",
      titleEn: `Uses URL shortener (${host})`,
      titleHi: `URL शॉर्टनर (${host}) का उपयोग`,
      detailEn:
        "Shortened links conceal the true destination domain until opened; expand or verify via an official source first.",
      detailHi: "शॉर्ट लिंक क्लिक करने से पहले अंतिम वेबसाइट का असली डोमेन छिपा देते हैं।",
      weight: 18,
    });
  }

  // Misleading subdomain checks
  if (subdomains) {
    const subLower = subdomains.toLowerCase();
    const impersonatedBrand = HIGH_TARGET_BRANDS.find((b) => {
      const label = b.split(".")[0];
      return rootDomain !== b && subLower.includes(label);
    });

    if (impersonatedBrand) {
      summary.hasMisleadingSubdomain = true;
      indicators.push({
        id: `misleading-subdomain-${impersonatedBrand}`,
        severity: "high",
        category: "subdomain",
        titleEn: `Misleading subdomain embeds "${impersonatedBrand.split(".")[0]}" while true root is ${rootDomain}`,
        titleHi: `भ्रामक सबडोमेन में "${impersonatedBrand.split(".")[0]}" है जबकि असली डोमेन ${rootDomain} है`,
        detailEn: `Attackers place trusted brand names inside subdomains (${subdomains}) to deceive readers—the owner of ${rootDomain} controls this page, NOT ${impersonatedBrand}.`,
        detailHi: `हमलावर भरोसेमंद ब्रांड का नाम सबडोमेन (${subdomains}) में रखते हैं; इस पेज का नियंत्रण ${rootDomain} के पास है।`,
        weight: 36,
      });
    } else if (parts.length >= 4) {
      summary.hasMisleadingSubdomain = true;
      indicators.push({
        id: "excessive-subdomains",
        severity: "medium",
        category: "subdomain",
        titleEn: `Deep subdomain nesting (${parts.length} labels; true root is ${rootDomain})`,
        titleHi: `अत्यधिक सबडोमेन स्तर (${parts.length} भाग; असली डोमेन ${rootDomain})`,
        detailEn:
          "Deep subdomain chains push the true root domain to the right to confuse mobile and hurried users.",
        detailHi: "लंबे सबडोमेन असली रूट डोमेन को दाईं ओर धकेलकर उपयोगकर्ता को भ्रमित करते हैं।",
        weight: 18,
      });
    }
  }

  // Brand typosquatting / impersonation in root domain
  if (!isIpLiteralHost(host)) {
    for (const brand of HIGH_TARGET_BRANDS) {
      const brandLabel = brand.split(".")[0];
      if (host !== brand && !host.endsWith(`.${brand}`)) {
        const dist = levenshtein(rootDomain, brand);
        if (dist > 0 && dist <= 2) {
          summary.hasSuspiciousDomainPattern = true;
          indicators.push({
            id: `typosquat-${brand}`,
            severity: "high",
            category: "domain",
            titleEn: `Possible typosquatting impersonating ${brand}`,
            titleHi: `${brand} की नकल करने वाला संभावित टाइपोस्क्वैटिंग डोमेन`,
            detailEn: `Root domain "${rootDomain}" differs from official "${brand}" by only ${dist} character(s).`,
            detailHi: `डोमेन "${rootDomain}" असली "${brand}" से केवल ${dist} अक्षर अलग है।`,
            weight: 45,
          });
          break;
        } else if (rootDomain.includes(brandLabel) && brandLabel.length >= 4) {
          summary.hasSuspiciousDomainPattern = true;
          indicators.push({
            id: `brand-impersonation-${brand}`,
            severity: "high",
            category: "domain",
            titleEn: `Embeds brand keyword "${brandLabel}" inside non-official domain (${rootDomain})`,
            titleHi: `गैर-आधिकारिक डोमेन (${rootDomain}) में ब्रांड शब्द "${brandLabel}" शामिल है`,
            detailEn: `Official services for ${brand} run on ${brand}, not third-party domains containing the brand name.`,
            detailHi: `${brand} की आधिकारिक सेवाएं केवल ${brand} पर होती हैं, अन्य डोमेन पर नहीं।`,
            weight: 32,
          });
          break;
        }
      }
    }
  }

  // Suspicious keywords across host + path + query
  const searchableUrl = `${host}${parsed.pathname}${parsed.search}`.toLowerCase();
  const matchedTerms = URL_SENSITIVE_TERMS.filter((t) => searchableUrl.includes(t));
  if (matchedTerms.length >= 1) {
    summary.hasSuspiciousKeywords = true;
    const isMulti = matchedTerms.length >= 2;
    indicators.push({
      id: "url-sensitive-keywords",
      severity: isMulti ? "medium" : "low",
      category: "keywords",
      titleEn: `Suspicious credential/action keyword(s) in URL (${matchedTerms.slice(0, 4).join(", ")})`,
      titleHi: `URL में संवेदनशील कीवर्ड (${matchedTerms.slice(0, 4).join(", ")})`,
      detailEn:
        "Phishing URLs commonly include action lures like verify, kyc, suspend, login, or otp to create urgency.",
      detailHi: "फ़िशिंग लिंक में अक्सर verify, kyc, suspend, login या otp जैसे कीवर्ड उपयोग होते हैं।",
      weight: isMulti ? 16 : 8,
    });
  }

  return {
    valid: true,
    host,
    protocol,
    anatomy,
  };
}

/**
 * Deterministic client-side Phishing URL & Message Heuristic Engine.
 * Never opens, visits, or fetches submitted URLs.
 */
export function analyzePhishingInput(input: {
  url?: string;
  messageText?: string;
}): PhishingAnalysisResult {
  const indicators: PhishingIndicator[] = [];
  const rawUrl = (input.url || "").trim();
  const rawText = (input.messageText || "").trim();

  const detectionSummary: PhishingDetectionSummary = {
    isIpBasedHost: false,
    hasMisleadingSubdomain: false,
    isUrlShortener: false,
    hasSuspiciousDomainPattern: false,
    hasSuspiciousKeywords: false,
    hasUnsafeProtocol: false,
  };

  const textUrls = extractUrls(rawText);
  const allUrls = Array.from(new Set([...(rawUrl ? [rawUrl] : []), ...textUrls]));

  let isValidUrlSyntax = rawUrl ? false : true;
  let syntaxErrorEn: string | undefined;
  let syntaxErrorHi: string | undefined;
  let parsedHost: string | undefined;
  let parsedProtocol: string | undefined;
  let urlAnatomy: UrlAnatomy | undefined;

  allUrls.forEach((u, idx) => {
    const res = inspectSingleUrl(u, indicators, detectionSummary);
    if (idx === 0) {
      isValidUrlSyntax = res.valid;
      syntaxErrorEn = res.errorEn;
      syntaxErrorHi = res.errorHi;
      parsedHost = res.host;
      parsedProtocol = res.protocol;
      urlAnatomy = res.anatomy;
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
    adviceEn.push("Do NOT open this link, download attachments, or enter credentials/OTPs.");
    adviceEn.push(
      "Navigate independently by typing the official website address or using an official saved bookmark."
    );
    adviceHi.push("इस लिंक को न खोलें, अटैचमेंट डाउनलोड न करें, और पासवर्ड/OTP न भरें।");
    adviceHi.push(
      "आधिकारिक वेबसाइट का पता स्वयं ब्राउज़र में टाइप करके या सहेजे गए बुकमार्क से पुष्टि करें।"
    );
  } else if (riskLevel === "caution") {
    adviceEn.push(
      "Heuristic caution signals detected. Confirm the true root domain and verify sender identity independently."
    );
    adviceHi.push(
      "सावधानी के संकेत मिले हैं। आगे बढ़ने से पहले असली रूट डोमेन और प्रेषक की पहचान की पुष्टि करें।"
    );
  } else {
    adviceEn.push(
      "No heuristic anomalies triggered—note that zero-hour phishing links can still appear clean, so always verify sender context."
    );
    adviceHi.push(
      "कोई ह्यूरिस्टिक संकेत नहीं मिला—फिर भी नए फ़िशिंग लिंक अनदेखे रह सकते हैं, इसलिए हमेशा स्रोत की पुष्टि करें।"
    );
  }

  return {
    isValidUrlSyntax,
    syntaxErrorEn,
    syntaxErrorHi,
    riskScore: totalScore,
    riskLevel,
    parsedHost,
    parsedProtocol,
    urlAnatomy,
    detectionSummary,
    extractedUrls: allUrls,
    indicators: uniqueIndicators,
    adviceEn,
    adviceHi,
  };
}
