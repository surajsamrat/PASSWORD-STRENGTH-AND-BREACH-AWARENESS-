import { describe, expect, it } from "vitest";
import {
  analyzePhishingInput,
  validateUrlSyntax,
} from "@/lib/security/phishingAnalyzer";

describe("Phishing URL Awareness & Heuristic Detection", () => {
  it("validates URL syntax and flags unsafe schemes or malformed strings", () => {
    expect(validateUrlSyntax("https://github.com/settings/security").valid).toBe(true);

    const jsScheme = validateUrlSyntax("javascript:alert(1)");
    expect(jsScheme.valid).toBe(false);
    expect(jsScheme.unsafeScheme).toBe("javascript");

    const malformed = analyzePhishingInput({ url: "not a valid url" });
    expect(malformed.isValidUrlSyntax).toBe(false);
    expect(malformed.syntaxErrorEn).toBeTruthy();

    const unsafeRes = analyzePhishingInput({ url: "javascript:alert(1)" });
    expect(unsafeRes.isValidUrlSyntax).toBe(false);
    expect(unsafeRes.detectionSummary.hasUnsafeProtocol).toBe(true);
    expect(unsafeRes.riskLevel).not.toBe("safe");
  });

  it("detects IP-based hosts (IPv4, IPv6, and integer IP representations)", () => {
    const ipv4 = analyzePhishingInput({ url: "http://198.51.100.42:8080/login" });
    expect(ipv4.isValidUrlSyntax).toBe(true);
    expect(ipv4.detectionSummary.isIpBasedHost).toBe(true);
    expect(ipv4.indicators.some((i) => i.id === "ip-host")).toBe(true);
    expect(ipv4.indicators.some((i) => i.id === "non-standard-port")).toBe(true);

    const decimalIp = analyzePhishingInput({ url: "http://2130706433/signin" });
    expect(decimalIp.detectionSummary.isIpBasedHost).toBe(true);
  });

  it("detects misleading subdomains and exposes true root domain in URL anatomy", () => {
    const res = analyzePhishingInput({
      url: "https://paypal.com.verify-account.xyz/signin",
    });
    expect(res.detectionSummary.hasMisleadingSubdomain).toBe(true);
    expect(res.urlAnatomy?.rootDomain).toBe("verify-account.xyz");
    expect(res.urlAnatomy?.subdomains).toBe("paypal.com");
    expect(res.riskLevel).toBe("high-risk");
  });

  it("detects URL shorteners", () => {
    const res = analyzePhishingInput({ url: "https://bit.ly/3xVerify" });
    expect(res.detectionSummary.isUrlShortener).toBe(true);
    expect(res.indicators.some((i) => i.id === "url-shortener")).toBe(true);
  });

  it("detects suspicious domain patterns (punycode, risky TLD, typosquatting, @ trick)", () => {
    const puny = analyzePhishingInput({ url: "https://xn--pple-43d.com/login" });
    expect(puny.detectionSummary.hasSuspiciousDomainPattern).toBe(true);
    expect(puny.indicators.some((i) => i.id === "punycode-homograph")).toBe(true);

    const typo = analyzePhishingInput({
      url: "https://paypa1.com/confirm/password",
    });
    expect(typo.detectionSummary.hasSuspiciousDomainPattern).toBe(true);
    expect(typo.detectionSummary.hasSuspiciousKeywords).toBe(true);
    expect(typo.riskLevel).toBe("high-risk");

    const atTrick = analyzePhishingInput({
      url: "https://google.com@evil-site.xyz/login",
    });
    expect(atTrick.indicators.some((i) => i.id === "at-symbol-obfuscation")).toBe(
      true
    );
  });

  it("classifies official legitimate URLs as safe/low-risk without claiming guaranteed safety", () => {
    const res = analyzePhishingInput({
      url: "https://github.com/settings/security",
    });
    expect(res.isValidUrlSyntax).toBe(true);
    expect(res.riskLevel).toBe("safe");
    expect(res.riskScore).toBe(0);
    expect(res.adviceEn[0].toLowerCase()).toContain("zero-hour");
  });
});
