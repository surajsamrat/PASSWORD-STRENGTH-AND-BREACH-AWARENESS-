import { describe, expect, it, vi } from "vitest";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import type { Express } from "express";
import { createAssistantApp } from "../app";
import { validateSubmittedThreatUrl } from "../services/urlThreatIntel";

async function postJson(
  app: Express,
  path: string,
  body: unknown
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = "POST";
    req.url = path;
    const payload = JSON.stringify(body);
    req.headers = {
      host: "localhost:8787",
      "x-forwarded-for": "198.51.100.88",
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(payload)),
    };

    const res = new ServerResponse(req);
    const chunks: Buffer[] = [];
    const origWrite = res.write.bind(res);
    const origEnd = res.end.bind(res);

    res.write = ((chunk: unknown, ...rest: unknown[]) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return (origWrite as (...args: unknown[]) => boolean)(chunk, ...rest);
    }) as typeof res.write;

    res.end = ((chunk?: unknown, ...rest: unknown[]) => {
      if (chunk && typeof chunk !== "function") {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      resolve({
        status: res.statusCode,
        body: raw ? (JSON.parse(raw) as Record<string, unknown>) : {},
      });
      return (origEnd as (...args: unknown[]) => ServerResponse)(chunk, ...rest);
    }) as typeof res.end;

    const handler = app as unknown as (
      r: IncomingMessage,
      s: ServerResponse,
      next: (err?: unknown) => void
    ) => void;
    handler(req, res, (err?: unknown) => {
      if (err) reject(err);
    });

    req.push(payload);
    req.push(null);
  });
}

describe("Backend URL Threat Intelligence Interface", () => {
  it("validates submitted URLs strictly and rejects unsafe schemes", () => {
    expect(validateSubmittedThreatUrl("https://example.com/path")).toBe(
      "https://example.com/path"
    );
    expect(() => validateSubmittedThreatUrl("javascript:alert(1)")).toThrow();
    expect(() => validateSubmittedThreatUrl("not valid")).toThrow();
  });

  it("returns unconfigured status cleanly when GOOGLE_SAFE_BROWSING_API_KEY is absent and never visits the suspicious URL", async () => {
    const fetchSpy = vi.fn();
    const app = createAssistantApp({
      env: {},
      fetchImpl: fetchSpy as typeof fetch,
    });

    const res = await postJson(app, "/api/phishing/threat-check", {
      url: "http://evil-phishing-target.example/login",
    });

    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(res.body.status).toBe("unconfigured");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("queries Google Safe Browsing API ONLY (never visiting the submitted URL) and distinguishes flagged vs safe", async () => {
    const suspiciousUrl = "http://phish-test-host.example/steal-otp";
    let calledEndpoint = "";

    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      calledEndpoint = String(input);
      return new Response(
        JSON.stringify({
          matches: [
            {
              threatType: "SOCIAL_ENGINEERING",
              platformType: "ANY_PLATFORM",
              threatEntryType: "URL",
            },
          ],
        }),
        { status: 200 }
      );
    });

    const app = createAssistantApp({
      env: { GOOGLE_SAFE_BROWSING_API_KEY: "test-gsb-key" },
      fetchImpl: mockFetch as typeof fetch,
    });

    const res = await postJson(app, "/api/phishing/threat-check", {
      url: suspiciousUrl,
    });

    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(true);
    expect(res.body.status).toBe("flagged");
    expect(calledEndpoint).toContain("https://safebrowsing.googleapis.com/v4/threatMatches:find");
    expect(calledEndpoint).not.toContain("phish-test-host.example");
  });

  it("rejects unsafe URI schemes with HTTP 400", async () => {
    const app = createAssistantApp({ env: {} });
    const res = await postJson(app, "/api/phishing/threat-check", {
      url: "javascript:alert(document.cookie)",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("UNSUPPORTED_URL_SCHEME");
  });
});
