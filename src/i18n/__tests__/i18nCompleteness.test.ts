import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { hi } from "@/i18n/hi";

function collectLeafPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...collectLeafPaths(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
      obj
    );
}

describe("Internationalization Completeness (English & Hindi)", () => {
  it("has identical translation key coverage across English and Hindi dictionaries", () => {
    const enKeys = collectLeafPaths(en as unknown as Record<string, unknown>);
    const hiKeys = collectLeafPaths(hi as unknown as Record<string, unknown>);

    expect(hiKeys).toEqual(enKeys);

    for (const key of enKeys) {
      const enVal = getValueAtPath(en as unknown as Record<string, unknown>, key);
      const hiVal = getValueAtPath(hi as unknown as Record<string, unknown>, key);
      expect(typeof enVal).toBe("string");
      expect(typeof hiVal).toBe("string");
      expect((enVal as string).trim().length).toBeGreaterThan(0);
      expect((hiVal as string).trim().length).toBeGreaterThan(0);
    }
  });
});
