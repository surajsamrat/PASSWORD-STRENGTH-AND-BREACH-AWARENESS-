import { describe, expect, it, vi } from "vitest";
import {
  AMBIGUOUS_CHARS,
  generateCryptoPassword,
  generateMultiplePassphrases,
  generateMultiplePasswords,
  generatePassphrase,
  InvalidGeneratorConfigError,
  type PassphraseGenOptions,
  type PasswordGenOptions,
} from "@/lib/security/passwordGenerator";
import { analyzePassword } from "@/lib/security/passwordAnalyzer";

const BASE_OPTS: PasswordGenOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

const BASE_PHRASE_OPTS: PassphraseGenOptions = {
  wordCount: 5,
  separator: "-",
  capitalize: false,
  includeNumber: false,
};

describe("Secure Password & Passphrase Generator", () => {
  it("uses crypto.getRandomValues and never invokes Math.random", () => {
    const cryptoSpy = vi.spyOn(globalThis.crypto, "getRandomValues");
    const mathSpy = vi.spyOn(Math, "random");

    const pw = generateCryptoPassword(BASE_OPTS);
    expect(pw).toHaveLength(16);
    expect(cryptoSpy).toHaveBeenCalled();
    expect(mathSpy).not.toHaveBeenCalled();

    cryptoSpy.mockRestore();
    mathSpy.mockRestore();
  });

  it("supports custom lengths across the full 8 to 64 character range", () => {
    for (const len of [8, 12, 24, 32, 64]) {
      const pw = generateCryptoPassword({ ...BASE_OPTS, length: len });
      expect(pw).toHaveLength(len);
    }
  });

  it("guarantees at least one character from every enabled character class", () => {
    for (let i = 0; i < 10; i++) {
      const pw = generateCryptoPassword({ ...BASE_OPTS, length: 8 });
      expect(/[A-Z]/.test(pw)).toBe(true);
      expect(/[a-z]/.test(pw)).toBe(true);
      expect(/[0-9]/.test(pw)).toBe(true);
      expect(/[^a-zA-Z0-9\s]/.test(pw)).toBe(true);
    }
  });

  it("respects individual character toggles cleanly", () => {
    const digitsOnly = generateCryptoPassword({
      length: 12,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      excludeAmbiguous: false,
    });
    expect(/^[0-9]{12}$/.test(digitsOnly)).toBe(true);

    const upperLower = generateCryptoPassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: false,
      symbols: false,
      excludeAmbiguous: false,
    });
    expect(/^[A-Za-z]{20}$/.test(upperLower)).toBe(true);
  });

  it("excludes ambiguous characters when excludeAmbiguous is enabled", () => {
    const passwords = generateMultiplePasswords(
      { ...BASE_OPTS, length: 64, excludeAmbiguous: true },
      10
    );
    for (const pw of passwords) {
      for (const ch of pw) {
        expect(AMBIGUOUS_CHARS.has(ch)).toBe(false);
      }
    }
  });

  it("generates multiple distinct passwords and passphrases", () => {
    const batch = generateMultiplePasswords(BASE_OPTS, 8);
    expect(batch).toHaveLength(8);
    expect(new Set(batch).size).toBe(8);

    const phrases = generateMultiplePassphrases(BASE_PHRASE_OPTS, 5);
    expect(phrases).toHaveLength(5);
    expect(new Set(phrases).size).toBe(5);
  });

  it("generates memorable passphrases with custom word count, separator, capitalization, and number", () => {
    const phrase = generatePassphrase({
      wordCount: 4,
      separator: "_",
      capitalize: true,
      includeNumber: true,
    });
    const parts = phrase.split("_");
    expect(parts).toHaveLength(4);
    expect(parts.every((w) => /^[A-Z][a-z]+(\d{2})?$/.test(w))).toBe(true);
    expect(/\d{2}/.test(phrase)).toBe(true);
  });

  it("rejects invalid configurations explicitly", () => {
    expect(() =>
      generateCryptoPassword({
        length: 16,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      })
    ).toThrow(InvalidGeneratorConfigError);

    expect(() =>
      generateCryptoPassword({ ...BASE_OPTS, length: 7 })
    ).toThrow(InvalidGeneratorConfigError);

    expect(() =>
      generateCryptoPassword({ ...BASE_OPTS, length: 65 })
    ).toThrow(InvalidGeneratorConfigError);

    expect(() =>
      generateCryptoPassword({ ...BASE_OPTS, length: Number.NaN })
    ).toThrow(InvalidGeneratorConfigError);

    expect(() =>
      generatePassphrase({ ...BASE_PHRASE_OPTS, wordCount: 2 })
    ).toThrow(InvalidGeneratorConfigError);

    expect(() =>
      generatePassphrase({ ...BASE_PHRASE_OPTS, wordCount: 11 })
    ).toThrow(InvalidGeneratorConfigError);

    expect(() => generateMultiplePasswords(BASE_OPTS, 0)).toThrow(
      InvalidGeneratorConfigError
    );
    expect(() => generateMultiplePasswords(BASE_OPTS, 51)).toThrow(
      InvalidGeneratorConfigError
    );
  });

  it("produces strong secrets verified by analyzePassword", () => {
    const pw = generateCryptoPassword({ ...BASE_OPTS, length: 20 });
    const analysis = analyzePassword(pw);
    expect(["strong", "very-strong"]).toContain(analysis.level);
    expect(analysis.score).toBeGreaterThanOrEqual(75);
  });
});
