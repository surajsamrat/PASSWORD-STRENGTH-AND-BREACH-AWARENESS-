import { describe, expect, it, vi } from "vitest";
import {
  checkPasswordBreachKAnonymity,
  HIBP_RANGE_API_URL,
  parseHibpRangeResponse,
  sha1Hex,
} from "@/lib/security/breachChecker";

describe("HIBP k-Anonymity Breach Checker", () => {
  it("computes standard uppercase SHA-1 digests locally using Web Crypto", async () => {
    // Known SHA-1 of "password" = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    const hash = await sha1Hex("password");
    expect(hash).toBe("5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
  });

  it("detects a breached password, returns occurrence count, and sends ONLY the 5-char prefix", async () => {
    let capturedUrl = "";
    let capturedHeaders: HeadersInit | undefined;

    const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedHeaders = init?.headers;

      const body = [
        "003D68EB55068C33ACE09247EE4C639306B:3",
        "1E4C9B93F3F0682250B6CF8331B7EE68FD8:9545824",
        "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:0",
      ].join("\r\n");

      return new Response(body, { status: 200 });
    });

    const result = await checkPasswordBreachKAnonymity("password", mockFetch as typeof fetch);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(capturedUrl).toBe(`${HIBP_RANGE_API_URL}5BAA6`);
    expect(capturedUrl.slice(HIBP_RANGE_API_URL.length)).toHaveLength(5);
    expect(capturedUrl).not.toContain("1E4C9B93F3F0682250B6CF8331B7EE68FD8");
    expect((capturedHeaders as Record<string, string>)?.["Add-Padding"]).toBe("true");
    expect(result.errorMessage).toBeUndefined();
    expect(result.status).toBe("pwned");
    expect(result.prefix).toBe("5BAA6");
    expect(result.count).toBe(9545824);
    expect(result.rangeEntriesChecked).toBe(3);
    expect(result.paddedEntriesIgnored).toBe(1);
    expect(result.recommendationsEn?.length).toBeGreaterThan(0);
    expect(result.recommendationsHi?.length).toBeGreaterThan(0);
  });

  it("returns clean when password suffix is not found and ignores zero-count padded entries", async () => {
    const fullHash = await sha1Hex("timber-lantern-quartz-49!");
    const prefix = fullHash.slice(0, 5);
    const suffix = fullHash.slice(5);

    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe(`${HIBP_RANGE_API_URL}${prefix}`);
      // Include the exact target suffix with count 0 (synthetic Add-Padding entry!)
      const body = [
        "00000000000000000000000000000000001:42",
        `${suffix}:0`,
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:12",
      ].join("\n");
      return new Response(body, { status: 200 });
    });

    const result = await checkPasswordBreachKAnonymity(
      "timber-lantern-quartz-49!",
      mockFetch as typeof fetch
    );

    expect(result.status).toBe("clean");
    expect(result.prefix).toBe(prefix);
    expect(result.count).toBe(0);
    expect(result.paddedEntriesIgnored).toBe(1);
    expect(result.recommendationsEn?.length).toBeGreaterThan(0);
  });

  it("handles network failures gracefully without faking a clean result", async () => {
    const mockFetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    const result = await checkPasswordBreachKAnonymity("password", mockFetch as typeof fetch);

    expect(result.status).toBe("error");
    expect(result.prefix).toBe("5BAA6");
    expect(result.count).toBe(0);
    expect(result.errorMessage).toContain("Failed to fetch");
  });

  it("handles non-OK HTTP responses (e.g. 429 rate limit / 503) as errors", async () => {
    const mockFetch = vi.fn(async () => new Response("Rate limit exceeded", { status: 429 }));

    const result = await checkPasswordBreachKAnonymity("password", mockFetch as typeof fetch);

    expect(result.status).toBe("error");
    expect(result.errorMessage).toContain("429");
  });

  it("rejects empty or malformed HIBP range payloads as invalid responses", async () => {
    const emptyFetch = vi.fn(async () => new Response("", { status: 200 }));
    const emptyRes = await checkPasswordBreachKAnonymity("password", emptyFetch as typeof fetch);
    expect(emptyRes.status).toBe("error");
    expect(emptyRes.errorMessage).toMatch(/empty/i);

    const htmlFetch = vi.fn(async () => new Response("<html>Bad Gateway</html>", { status: 200 }));
    const htmlRes = await checkPasswordBreachKAnonymity("password", htmlFetch as typeof fetch);
    expect(htmlRes.status).toBe("error");
    expect(htmlRes.errorMessage).toMatch(/invalid response/i);
  });

  it("parseHibpRangeResponse ignores zero-count entries and matches case-insensitively", () => {
    const parsed = parseHibpRangeResponse(
      "1e4c9b93f3f0682250b6cf8331b7ee68fd8:77\n00000000000000000000000000000000000:0",
      "1E4C9B93F3F0682250B6CF8331B7EE68FD8"
    );
    expect(parsed.matchedCount).toBe(77);
    expect(parsed.validEntries).toBe(2);
    expect(parsed.paddedIgnored).toBe(1);
  });
});
