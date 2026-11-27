import { jsPDF } from "jspdf";
import type {
  CrackTimeAssumption,
  HygieneChecklistItem,
  Language,
  PasswordAnalysisResult,
  PasswordImprovementPlan,
  SanitizedCredentialSnapshot,
  SecurityRiskReport,
} from "@/types/security";

const SANITIZED_WEAKNESS_TEXT: Record<
  string,
  { titleEn: string; titleHi: string; detailEn: string; detailHi: string }
> = {
  "common-breached-list": {
    titleEn: "Matches known common/leaked password pattern",
    titleHi: "आम या लीक पासवर्ड पैटर्न से मेल खाता है",
    detailEn: "Common credentials are tested first in automated credential-stuffing attacks.",
    detailHi: "स्वचालित हमलों में आम पासवर्ड सबसे पहले आज़माए जाते हैं।",
  },
  "dictionary-pattern": {
    titleEn: "Contains dictionary word or predictable root",
    titleHi: "शब्दकोश शब्द या अनुमानित पैटर्न शामिल है",
    detailEn: "Dictionary roots and leet substitutions are rapidly matched by cracking rulesets.",
    detailHi: "शब्दकोश शब्द और लीट बदलाव क्रैकिंग नियमों द्वारा आसानी से पकड़ लिए जाते हैं।",
  },
  "keyboard-walk": {
    titleEn: "Keyboard walk pattern detected",
    titleHi: "कीबोर्ड अनुक्रम पैटर्न मिला",
    detailEn: "Adjacent keyboard sequences reduce effective search space.",
    detailHi: "कीबोर्ड की क्रमिक कुंजियाँ वास्तविक सुरक्षा को कम करती हैं।",
  },
  "sequential-chars": {
    titleEn: "Sequential character or digit run detected",
    titleHi: "क्रमिक अक्षर या अंक अनुक्रम मिला",
    detailEn: "Alphabetic or numeric sequences are prioritized in cracking attempts.",
    detailHi: "क्रमिक अक्षर या अंक हमलों में पहले जांचे जाते हैं।",
  },
  "zxcvbn-spatial-sequence": {
    titleEn: "Predictable spatial/sequential structure detected",
    titleHi: "अनुमानित क्रमिक या स्थानिक संरचना मिली",
    detailEn: "Pattern analysis flagged predictable structural ordering.",
    detailHi: "पैटर्न विश्लेषण में अनुमानित संरचना मिली है।",
  },
  "repeated-chars": {
    titleEn: "Repeated characters detected",
    titleHi: "दोहराए गए अक्षर मिले",
    detailEn: "Repeated identical characters contribute minimal entropy.",
    detailHi: "दोहराए गए अक्षर बहुत कम एंट्रॉपी जोड़ते हैं।",
  },
  "year-pattern": {
    titleEn: "Calendar year pattern detected",
    titleHi: "वर्ष जैसा पैटर्न शामिल है",
    detailEn: "Four-digit years are frequently appended to weak credentials.",
    detailHi: "पासवर्ड में साल जोड़ना आम कमज़ोर पैटर्न है।",
  },
  "low-diversity": {
    titleEn: "Low unique-character diversity",
    titleHi: "अद्वितीय अक्षरों की विविधता कम है",
    detailEn: "Repeated reuse of a small character subset lowers effective entropy.",
    detailHi: "सीमित अक्षरों की पुनरावृत्ति प्रभावी एंट्रॉपी कम करती है।",
  },
  "short-length": {
    titleEn: "Length below recommended baseline",
    titleHi: "लंबाई अनुशंसित मानक से कम है",
    detailEn: "Short secrets are vulnerable to rapid offline brute-forcing.",
    detailHi: "कम लंबाई के पासवर्ड ऑफ़लाइन क्रैकिंग के प्रति संवेदनशील होते हैं।",
  },
};

/**
 * Strips any quoted fragments (`"..."`) or context tokens so raw user secrets
 * or password fragments can never appear in sanitized reports.
 */
function sanitizeWeaknessEntry(w: PasswordAnalysisResult["weaknesses"][number]) {
  if (w.id.startsWith("context-")) {
    return {
      id: "context-token",
      severity: w.severity,
      titleEn: "Contains personal context identifier",
      titleHi: "व्यक्तिगत संदर्भ जानकारी शामिल है",
      detailEn: "Credentials must never embed personal names, emails, or usernames.",
      detailHi: "पासवर्ड में कभी भी नाम, ईमेल या यूज़रनेम शामिल न करें।",
    };
  }
  const mapped = SANITIZED_WEAKNESS_TEXT[w.id];
  if (mapped) {
    return { id: w.id, severity: w.severity, ...mapped };
  }
  return {
    id: w.id,
    severity: w.severity,
    titleEn: w.titleEn.replace(/"[^"]*"/g, "[redacted]"),
    titleHi: w.titleHi.replace(/"[^"]*"/g, "[गोपनीय]"),
    detailEn: w.detailEn.replace(/"[^"]*"/g, "[redacted]"),
    detailHi: w.detailHi.replace(/"[^"]*"/g, "[गोपनीय]"),
  };
}

/**
 * Creates a strictly sanitized, memory-only snapshot of an analyzed credential.
 * Never retains the original password or any SHA-1 hash.
 */
export function createSanitizedCredentialSnapshot(
  analysis: PasswordAnalysisResult,
  improvement: PasswordImprovementPlan,
  breachInfo?: { status: "not-checked" | "pwned" | "clean" | "error"; count: number }
): SanitizedCredentialSnapshot {
  return {
    strengthLevel: analysis.level,
    score: analysis.score,
    length: analysis.length,
    entropyBits: analysis.entropyBits,
    shannonEntropyBits: analysis.shannonEntropyBits,
    effectiveEntropyBits: analysis.effectiveEntropyBits,
    zxcvbnScore: analysis.zxcvbnScore,
    zxcvbnGuessesLog10: analysis.zxcvbnGuessesLog10,
    crackTimes: { ...analysis.crackTimes },
    breachStatus: breachInfo?.status ?? "not-checked",
    breachCount: breachInfo?.count ?? 0,
    sanitizedWeaknesses: analysis.weaknesses.map(sanitizeWeaknessEntry),
    improvementSteps: improvement.actionableSteps,
    assessedAt: new Date().toISOString(),
  };
}

export const ESTIMATE_LIMITATIONS_EN = [
  "No password is ever completely secure: strong entropy reduces brute-force risk, but compromises can still occur through phishing, keyloggers, credential reuse, or unencrypted server leaks.",
  "Crack-time estimates are theoretical approximations modeled by zxcvbn under fixed attacker guess rates (10k/s slow KDF vs 10B/s fast GPU); actual resistance depends on the target service's hashing algorithm (e.g., Argon2id vs legacy MD5), salting, and hardware scaling.",
  "Entropy formulas (L * log2(N) and Shannon bits) measure theoretical character unpredictability and do not account for personal context or private leaked wordlists unless explicitly checked.",
  "Breach status via HIBP k-Anonymity reflects known public breach corpora only; an unlisted password could still appear in private or undisclosed breaches.",
];

export const ESTIMATE_LIMITATIONS_HI = [
  "कोई भी पासवर्ड कभी पूरी तरह (100%) सुरक्षित नहीं होता: उच्च एंट्रॉपी ब्रूट-फ़ोर्स जोखिम कम करती है, लेकिन फ़िशिंग, मैलवेयर या सर्वर ब्रीच से जोखिम बना रहता है।",
  "क्रैक-समय के अनुमान zxcvbn के निश्चित मॉडल (10k/सेकंड धीमा KDF बनाम 10B/सेकंड GPU) पर आधारित हैं; वास्तविक समय सेवा के हैशिंग एल्गोरिदम और हार्डवेयर पर निर्भर करता है।",
  "एंट्रॉपी सूत्र केवल सैद्धांतिक जटिलता मापते हैं और निजी या अनजाने डेटा लीक को स्वतः नहीं पकड़ते।",
  "HIBP k-Anonymity जांच केवल ज्ञात सार्वजनिक डेटा ब्रीच तक सीमित है; अनदेखे पासवर्ड भी निजी ब्रीच में मौजूद हो सकते हैं।",
];

export function buildCrackTimeAssumptions(
  snapshot: SanitizedCredentialSnapshot | null
): CrackTimeAssumption[] {
  const ct = snapshot?.crackTimes;
  return [
    {
      scenarioEn: "Offline Slow KDF (bcrypt / Argon2)",
      scenarioHi: "ऑफ़लाइन धीमा KDF (bcrypt / Argon2)",
      assumptionEn: "Assumes salted adaptive KDF @ 10,000 guesses/sec",
      assumptionHi: "10,000 अनुमान/सेकंड की दर मानकर",
      estimate: ct?.offlineBcrypt ?? "—",
    },
    {
      scenarioEn: "Offline Fast GPU Cluster (SHA-256 / MD5)",
      scenarioHi: "ऑफ़लाइन तेज़ GPU क्लस्टर",
      assumptionEn: "Assumes unsalted/fast hash @ 10,000,000,000 guesses/sec",
      assumptionHi: "10 अरब अनुमान/सेकंड की GPU दर मानकर",
      estimate: ct?.offlineGpuCluster ?? "—",
    },
    {
      scenarioEn: "Online Throttled Attack",
      scenarioHi: "ऑनलाइन सीमित हमला",
      assumptionEn: "Assumes server rate-limiting @ 100 attempts/hour",
      assumptionHi: "100 प्रयास/घंटा की सर्वर सीमा मानकर",
      estimate: ct?.onlineThrottled ?? "—",
    },
    {
      scenarioEn: "Online Unthrottled Attack",
      scenarioHi: "ऑनलाइन असीमित हमला",
      assumptionEn: "Assumes no lockout protection @ 10 attempts/sec",
      assumptionHi: "बिना लॉकआउट के 10 प्रयास/सेकंड मानकर",
      estimate: ct?.onlineUnthrottled ?? "—",
    },
  ];
}

export function buildSecurityRiskReport(params: {
  operatorName: string;
  postureScore: number;
  demoPreviewIncluded: boolean;
  credentialSnapshot: SanitizedCredentialSnapshot | null;
  hygiene: HygieneChecklistItem[];
}): SecurityRiskReport {
  const { operatorName, postureScore, demoPreviewIncluded, credentialSnapshot, hygiene } = params;

  const postureGrade: SecurityRiskReport["postureGrade"] =
    postureScore >= 85
      ? "A"
      : postureScore >= 70
      ? "B"
      : postureScore >= 50
      ? "C"
      : postureScore >= 30
      ? "D"
      : "F";

  const completed = hygiene.filter((h) => h.completed).length;

  let riskTier: SecurityRiskReport["overallAssessment"]["riskTier"] = "moderate";
  let labelEn = "Moderate Risk — Further Hardening Recommended";
  let labelHi = "मध्यम जोखिम — अतिरिक्त सुरक्षा सुधार आवश्यक";
  let summaryEn =
    "Your current posture provides partial protection, but completing hygiene controls and ensuring high-entropy unique credentials with MFA will substantially reduce account takeover risk. Remember that no password alone makes an account completely secure.";
  let summaryHi =
    "आपकी वर्तमान स्थिति आंशिक सुरक्षा प्रदान करती है, लेकिन स्वच्छता नियंत्रण और MFA के साथ अद्वितीय पासवर्ड अपनाने से जोखिम काफी कम होगा। ध्यान रखें कि कोई भी पासवर्ड अकेले पूर्ण सुरक्षा की गारंटी नहीं देता।";

  if (credentialSnapshot?.breachStatus === "pwned") {
    riskTier = "high";
    labelEn = "High Risk — Exposed Credential Detected";
    labelHi = "उच्च जोखिम — लीक पासवर्ड मिला";
    summaryEn =
      "The evaluated credential appears in public breach data and must be replaced immediately. Even strong-looking passwords fail completely once exposed in public dumps.";
    summaryHi =
      "जांचा गया पासवर्ड सार्वजनिक ब्रीच डेटा में पाया गया है और इसे तुरंत बदला जाना चाहिए। लीक होने के बाद कोई भी पासवर्ड सुरक्षित नहीं रहता।";
  } else if (
    credentialSnapshot &&
    (credentialSnapshot.strengthLevel === "very-weak" ||
      credentialSnapshot.strengthLevel === "weak")
  ) {
    riskTier = "high";
    labelEn = "High Risk — Weak Credential Structure";
    labelHi = "उच्च जोखिम — कमज़ोर पासवर्ड संरचना";
    summaryEn =
      "The evaluated credential exhibits weak patterns or insufficient entropy against offline attacks. Replace it with a longer CSPRNG password or multi-word passphrase and enable MFA.";
    summaryHi =
      "जांचा गया पासवर्ड ऑफ़लाइन हमलों के खिलाफ कमज़ोर है। इसे लंबे CSPRNG पासवर्ड या पासफ़्रेज़ से बदलें और MFA चालू करें।";
  } else if (
    postureScore >= 75 &&
    (!credentialSnapshot ||
      credentialSnapshot.strengthLevel === "strong" ||
      credentialSnapshot.strengthLevel === "very-strong")
  ) {
    riskTier = "low";
    labelEn = "Low Brute-Force Risk (Defense-in-Depth Still Required)";
    labelHi = "कम ब्रूट-फ़ोर्स जोखिम (MFA और सतर्कता अभी भी आवश्यक)";
    summaryEn =
      "Assessed metrics indicate strong resistance to offline brute-force guessing, though no credential can ever be considered completely secure against phishing, malware, or server-side breaches. Maintain unique passwords and Passkey/TOTP MFA.";
    summaryHi =
      "वर्तमान मीट्रिक ऑफ़लाइन हमलों के खिलाफ मजबूत प्रतिरोध दर्शाते हैं, हालांकि कोई भी पासवर्ड फ़िशिंग या सर्वर ब्रीच से पूरी तरह सुरक्षित नहीं होता। अद्वितीय पासवर्ड और पासकी/TOTP MFA बनाए रखें।";
  } else if (postureScore < 45) {
    riskTier = "elevated";
    labelEn = "Elevated Risk — Incomplete Security Controls";
    labelHi = "बढ़ा हुआ जोखिम — सुरक्षा नियंत्रण अधूरे हैं";
  }

  return {
    reportId: `SC-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    operatorName: operatorName || "Security Operator",
    postureScore,
    postureGrade,
    demoPreviewIncluded,
    credentialSnapshot,
    crackTimeAssumptions: buildCrackTimeAssumptions(credentialSnapshot),
    hygieneSummary: {
      completed,
      total: hygiene.length,
      items: hygiene.map((h) => ({
        id: h.id,
        titleEn: h.titleEn,
        titleHi: h.titleHi,
        completed: h.completed,
      })),
    },
    overallAssessment: {
      riskTier,
      labelEn,
      labelHi,
      summaryEn,
      summaryHi,
    },
    estimateLimitationsEn: ESTIMATE_LIMITATIONS_EN,
    estimateLimitationsHi: ESTIMATE_LIMITATIONS_HI,
  };
}

/**
 * Generates and downloads a sanitized PDF Security Risk Report using jsPDF.
 * Note: jsPDF built-in Helvetica renders ASCII/Latin text cleanly; PDF text uses
 * sanitized English report labels to prevent Devanagari font-glyph corruption while
 * preserving full bilingual UI display.
 */
export function downloadSecurityReportPdf(
  report: SecurityRiskReport,
  _lang: Language = "en"
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const maxWidth = pageWidth - margin * 2;
  let y = 48;

  const ensureSpace = (needed = 40) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 48;
    }
  };

  const addSectionTitle = (title: string) => {
    ensureSpace(36);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(14, 116, 144);
    doc.text(title, margin, y);
    y += 5;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
    doc.setTextColor(15, 23, 42);
  };

  const addParagraph = (text: string, fontSize = 9.5, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    ensureSpace(lines.length * (fontSize + 4) + 6);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize + 3.5) + 4;
  };

  // Header Banner
  doc.setFillColor(10, 17, 32);
  doc.rect(0, 0, pageWidth, 84, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(56, 189, 248);
  doc.text("SecureCheck — Security Risk Report", margin, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Report ID: ${report.reportId}  |  Generated: ${new Date(report.generatedAt).toLocaleString()}  |  Operator: ${report.operatorName}`,
    margin,
    56
  );
  doc.text(
    "Privacy Guarantee: Original passwords and complete password hashes are NEVER included in this report.",
    margin,
    70
  );

  y = 108;
  doc.setTextColor(15, 23, 42);

  // Overall Assessment
  addSectionTitle("1. Overall Security Assessment");
  addParagraph(
    `Posture Score: ${report.postureScore}/100 (Grade ${report.postureGrade})  |  Risk Tier: ${report.overallAssessment.labelEn}`,
    10,
    true
  );
  addParagraph(report.overallAssessment.summaryEn);

  // Credential Snapshot
  addSectionTitle("2. Credential Strength & Breach Status");
  const snap = report.credentialSnapshot;
  if (!snap) {
    addParagraph(
      "No in-memory credential audit has been attached to this report session yet. Run Password Analyzer or Breach Checker to include sanitized credential risk telemetry."
    );
  } else {
    const levelMap: Record<string, string> = {
      empty: "Not Evaluated",
      "very-weak": "Very Weak",
      weak: "Weak",
      fair: "Fair",
      strong: "Strong",
      "very-strong": "Very Strong",
    };
    const breachMap: Record<string, string> = {
      "not-checked": "Not Checked",
      pwned: `EXPOSED (${snap.breachCount.toLocaleString()} public breach occurrences)`,
      clean: "Not Found in HIBP Public Corpus (0 occurrences)",
      error: "Check Unavailable / Failed",
    };

    addParagraph(
      `Strength Category: ${levelMap[snap.strengthLevel] ?? snap.strengthLevel} (${snap.score}/100)  |  Length: ${snap.length} chars  |  zxcvbn Score: ${snap.zxcvbnScore}/4`,
      10,
      true
    );
    addParagraph(
      `Entropy Estimates: Pool Entropy ${snap.entropyBits} bits  |  Shannon Entropy ${snap.shannonEntropyBits} bits  |  Effective Entropy ${snap.effectiveEntropyBits} bits`
    );
    addParagraph(`Breach-Check Status (k-Anonymity): ${breachMap[snap.breachStatus]}`);

    addSectionTitle("3. Crack-Time Assumptions & Estimates");
    for (const row of report.crackTimeAssumptions) {
      addParagraph(`• ${row.scenarioEn}: ${row.estimate} (${row.assumptionEn})`);
    }

    addSectionTitle("4. Identified Weaknesses (Sanitized)");
    if (snap.sanitizedWeaknesses.length === 0) {
      addParagraph("• No common patterns, repeated runs, or sequential patterns detected.");
    } else {
      for (const w of snap.sanitizedWeaknesses) {
        addParagraph(`• [${w.severity.toUpperCase()}] ${w.titleEn}: ${w.detailEn}`);
      }
    }

    addSectionTitle("5. Improvement Recommendations");
    for (const step of snap.improvementSteps) {
      addParagraph(`• [${step.priority.toUpperCase()}] ${step.titleEn} — ${step.detailEn}`);
    }
  }

  // Hygiene Summary
  addSectionTitle(snap ? "6. Security Hygiene Controls" : "3. Security Hygiene Controls");
  addParagraph(
    `Completed ${report.hygieneSummary.completed} of ${report.hygieneSummary.total} baseline controls:`,
    9.5,
    true
  );
  for (const item of report.hygieneSummary.items) {
    addParagraph(`• [${item.completed ? "DONE" : "OPEN"}] ${item.titleEn}`);
  }

  // Limitations of Estimates
  addSectionTitle(snap ? "7. Limitations of Estimates & Disclaimers" : "4. Limitations of Estimates & Disclaimers");
  for (const lim of report.estimateLimitationsEn) {
    addParagraph(`• ${lim}`);
  }

  doc.save(`securecheck-risk-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
