import { describe, expect, it } from "vitest";
import {
  analyzePassword,
  calculatePoolEntropy,
  calculateShannonEntropy,
} from "@/lib/security/passwordAnalyzer";

describe("Smart Password Analyzer", () => {
  it("handles empty password cleanly", () => {
    const res = analyzePassword("");
    expect(res.level).toBe("empty");
    expect(res.score).toBe(0);
    expect(res.length).toBe(0);
    expect(res.entropyBits).toBe(0);
    expect(res.shannonEntropyBits).toBe(0);
    expect(res.nistCompliant).toBe(false);
    expect(res.recommendationsEn.length).toBeGreaterThan(0);
  });

  it("classifies top common passwords as very-weak and flags dictionary/common match", () => {
    const res = analyzePassword("123456");
    expect(res.level).toBe("very-weak");
    expect(res.zxcvbnScore).toBe(0);
    expect(res.hasDictionaryOrCommon).toBe(true);
    expect(res.nistCompliant).toBe(false);
    expect(res.score).toBeLessThanOrEqual(20);
    expect(res.crackTimes.offlineGpuCluster).toBeTruthy();
  });

  it("detects length, uppercase, lowercase, digits, and special characters accurately", () => {
    const res = analyzePassword("Abc1!xyz");
    expect(res.length).toBe(8);
    expect(res.hasUpper).toBe(true);
    expect(res.hasLower).toBe(true);
    expect(res.hasDigit).toBe(true);
    expect(res.hasSymbol).toBe(true);
    expect(res.poolSize).toBe(94);
  });

  it("detects repeated characters", () => {
    const res = analyzePassword("Aaaaa1111!zzzz");
    expect(res.hasRepeatedChars).toBe(true);
    expect(res.weaknesses.some((w) => w.id === "repeated-chars")).toBe(true);
  });

  it("detects sequential alphabetic, numeric, and keyboard walk patterns", () => {
    const kb = analyzePassword("qwerty99!");
    expect(kb.hasSequentialPattern).toBe(true);
    expect(kb.weaknesses.some((w) => w.id === "keyboard-walk")).toBe(true);

    const seq = analyzePassword("abcd5678!");
    expect(seq.hasSequentialPattern).toBe(true);
    expect(seq.weaknesses.some((w) => w.id === "sequential-chars")).toBe(true);
  });

  it("detects dictionary words and leet-speak common password variants", () => {
    const res = analyzePassword("P@ssw0rd123");
    expect(res.hasDictionaryOrCommon).toBe(true);
    expect(res.score).toBeLessThanOrEqual(25);
    expect(["very-weak", "weak"]).toContain(res.level);
  });

  it("integrates zxcvbn and flags personal context tokens", () => {
    const withoutContext = analyzePassword("Rivera2026!Vault");
    const withContext = analyzePassword("Rivera2026!Vault", {
      contextTokens: ["rivera"],
    });
    expect(withContext.weaknesses.some((w) => w.id === "context-rivera")).toBe(true);
    expect(withContext.zxcvbnScore).toBeLessThanOrEqual(withoutContext.zxcvbnScore);
  });

  it("calculates independent pool entropy and Shannon entropy separately", () => {
    const pool = calculatePoolEntropy("aB3!");
    expect(pool.poolSize).toBe(94);
    expect(pool.entropyBits).toBeCloseTo(4 * Math.log2(94), 0);

    const repeatedShannon = calculateShannonEntropy("aaaaaaaa");
    expect(repeatedShannon).toBe(0);

    const variedShannon = calculateShannonEntropy("abcd");
    expect(variedShannon).toBe(8);
  });

  it("evaluates weak, fair, strong, and very-strong categories properly", () => {
    const weak = analyzePassword("dragon99!");
    expect(["very-weak", "weak"]).toContain(weak.level);

    const fair = analyzePassword("Summer2026!");
    expect(fair.level).toBe("fair");

    const strongOrVeryStrong = analyzePassword("Tr0ub4dor&3!xYz");
    expect(["strong", "very-strong"]).toContain(strongOrVeryStrong.level);

    const veryStrong = analyzePassword("timber-lantern-quartz-cobalt-49!");
    expect(veryStrong.zxcvbnScore).toBe(4);
    expect(veryStrong.score).toBeGreaterThanOrEqual(85);
    expect(veryStrong.level).toBe("very-strong");
    expect(veryStrong.nistCompliant).toBe(true);
    expect(veryStrong.crackTimes.offlineBcrypt).not.toBe("—");
  });

  it("enforces strict mode (12+ char baseline)", () => {
    const strictShort = analyzePassword("X9#kL2$mP", { strictMode: true });
    expect(strictShort.weaknesses.some((w) => w.id === "short-length")).toBe(true);
    expect(strictShort.score).toBeLessThanOrEqual(62);
  });

  it("produces deterministic scores (never random) and detailed suggestions", () => {
    const first = analyzePassword("mypassword99");
    const second = analyzePassword("mypassword99");
    expect(first).toEqual(second);
    expect(first.recommendationsEn.length).toBeGreaterThan(0);
    expect(first.recommendationsHi.length).toBeGreaterThan(0);
  });
});
