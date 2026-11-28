import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { UserMetrics } from "@/types/security";

describe("Achievements Engine", () => {
  it("evaluates security tool and hygiene achievements accurately from user metrics", () => {
    const metrics: UserMetrics = {
      passwordsAudited: 3,
      bestEntropySeen: 86,
      passwordsGenerated: 5,
      breachChecksRun: 2,
      phishingScansRun: 3,
      threatsFlagged: 1,
      xp: 450,
      usedHindiOrSwitchedLang: true,
    };

    for (const ach of ACHIEVEMENTS) {
      expect(ach.progress(metrics, 4).unlocked).toBe(true);
    }
  });
});
