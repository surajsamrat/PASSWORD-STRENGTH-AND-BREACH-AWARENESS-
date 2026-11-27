import { describe, expect, it } from "vitest";
import { analyzePassword } from "@/lib/security/passwordAnalyzer";
import { buildPasswordImprovementPlan } from "@/lib/security/passwordImprovement";
import {
  buildSecurityRiskReport,
  createSanitizedCredentialSnapshot,
} from "@/lib/security/securityReport";
import { sha1Hex } from "@/lib/security/breachChecker";
import { INITIAL_HYGIENE_CHECKLIST } from "@/data/demoData";

describe("Smart Password Improvement & Security Risk Reports", () => {
  it("identifies weak characteristics, explains repeated/sequential patterns, and suggests unique passphrases", () => {
    const analysis = analyzePassword("aaa1234qwerty");
    const plan = buildPasswordImprovementPlan(analysis);

    expect(plan.weakCharacteristicsEn.length).toBeGreaterThan(0);
    expect(plan.lengthRecommendationEn).toMatch(/14–16/);

    const repeatedExp = plan.patternExplanations.find((p) => p.id === "repeated");
    const sequentialExp = plan.patternExplanations.find((p) => p.id === "sequential");
    expect(repeatedExp?.detected).toBe(true);
    expect(sequentialExp?.detected).toBe(true);
    expect(repeatedExp?.explanationEn.length).toBeGreaterThan(20);
    expect(sequentialExp?.explanationEn.length).toBeGreaterThan(20);

    expect(plan.passphraseSuggestions).toHaveLength(2);
    expect(plan.passphraseSuggestions[0].length).toBeGreaterThanOrEqual(20);
    expect(plan.actionableSteps.length).toBeGreaterThanOrEqual(3);
  });

  it("never includes the original password or complete SHA-1 hash in sanitized snapshots or reports", async () => {
    const secret = "QwertySecret2026!UniqueTest";
    const fullHash = await sha1Hex(secret);
    const analysis = analyzePassword(secret, { contextTokens: ["UniqueTest"] });
    const plan = buildPasswordImprovementPlan(analysis, {
      breachExposed: true,
      breachCount: 12,
    });

    const snapshot = createSanitizedCredentialSnapshot(analysis, plan, {
      status: "pwned",
      count: 12,
    });

    const report = buildSecurityRiskReport({
      operatorName: "Test Operator",
      postureScore: 60,
      demoPreviewIncluded: false,
      credentialSnapshot: snapshot,
      hygiene: INITIAL_HYGIENE_CHECKLIST,
    });

    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain("UniqueTest");
    expect(serialized.toUpperCase()).not.toContain(fullHash);
    expect(serialized.toLowerCase()).not.toContain("qwerty");
  });

  it("never claims a password is completely secure and always includes estimate limitations", () => {
    const strongSecret = "V9#kL2$mP8@qR5!wZ7&n";
    const analysis = analyzePassword(strongSecret);
    const plan = buildPasswordImprovementPlan(analysis);
    const snapshot = createSanitizedCredentialSnapshot(analysis, plan, {
      status: "clean",
      count: 0,
    });

    const report = buildSecurityRiskReport({
      operatorName: "Test Operator",
      postureScore: 92,
      demoPreviewIncluded: false,
      credentialSnapshot: snapshot,
      hygiene: INITIAL_HYGIENE_CHECKLIST.map((h) => ({ ...h, completed: true })),
    });

    expect(report.overallAssessment.summaryEn.toLowerCase()).not.toContain(
      "is completely secure"
    );
    expect(report.overallAssessment.summaryEn.toLowerCase()).toContain(
      "no credential can ever be considered completely secure"
    );
    expect(report.crackTimeAssumptions).toHaveLength(4);
    expect(report.estimateLimitationsEn.length).toBeGreaterThanOrEqual(3);
    expect(report.estimateLimitationsHi.length).toBeGreaterThanOrEqual(3);
  });
});
