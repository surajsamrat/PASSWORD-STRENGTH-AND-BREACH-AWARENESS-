import { describe, expect, it, vi } from "vitest";
import { IncomingMessage, ServerResponse, type OutgoingHttpHeaders } from "node:http";
import { Socket } from "node:net";
import type { Express } from "express";
import { createAssistantApp } from "../app";
import {
  buildNonSensitiveAssistantMetadata,
  validateClientPromptPrivacy,
} from "@/lib/security/aiAssistantClient";
import { INITIAL_HYGIENE_CHECKLIST } from "@/data/demoData";

interface DispatchedResponse {
  status: number;
  headers: OutgoingHttpHeaders;
  body: Record<string, unknown>;
}

/**
 * Invokes the Express application in-memory via Node HTTP req/res objects
 * without opening a TCP socket, testing full middleware & routing deterministically.
 */
async function invokeApp(
  app: Express,
  opts: {
    method: "GET" | "POST";
    path: string;
    body?: unknown;
    rawBody?: string;
    ip?: string;
  }
): Promise<DispatchedResponse> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = opts.method;
    req.url = opts.path;
    req.headers = {
      host: "localhost:8787",
      "x-forwarded-for": opts.ip ?? "198.51.100.10",
    };

    let payloadText = "";
    if (opts.rawBody !== undefined) {
      payloadText = opts.rawBody;
    } else if (opts.body !== undefined) {
      payloadText = JSON.stringify(opts.body);
    }

    if (payloadText) {
      req.headers["content-type"] = "application/json";
      req.headers["content-length"] = String(Buffer.byteLength(payloadText));
    }

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
      let parsed: Record<string, unknown> = {};
      try {
        parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      } catch {
        parsed = { raw };
      }
      resolve({
        status: res.statusCode,
        headers: res.getHeaders(),
        body: parsed,
      });
      return (origEnd as (...args: unknown[]) => ServerResponse)(chunk, ...rest);
    }) as typeof res.end;

    const handler = app as unknown as (
      req: IncomingMessage,
      res: ServerResponse,
      next: (err?: unknown) => void
    ) => void;
    handler(req, res, (err?: unknown) => {
      if (err) reject(err);
    });

    if (payloadText) {
      req.push(payloadText);
    }
    req.push(null);
  });
}

describe("SecureCheck AI Assistant Backend & Privacy Controls", () => {
  it("reports health without exposing API keys", async () => {
    const app = createAssistantApp({
      env: { GEMINI_API_KEY: "super-secret-key-never-exposed" },
    });
    const res = await invokeApp(app, { method: "GET", path: "/api/health" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      providerConfigured: true,
      provider: "gemini",
    });
    expect(JSON.stringify(res.body)).not.toContain("super-secret-key");
  });

  it("validates incoming requests and rejects empty messages, invalid language, and malformed JSON", async () => {
    const app = createAssistantApp({ env: {} });

    const emptyRes = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: { message: "   ", language: "en", history: [] },
    });
    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.code).toBe("INVALID_MESSAGE");

    const langRes = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: { message: "What is entropy?", language: "fr", history: [] },
    });
    expect(langRes.status).toBe(400);
    expect(langRes.body.code).toBe("INVALID_LANGUAGE");

    const malformedRes = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      rawBody: "{bad json",
    });
    expect(malformedRes.status).toBe(400);
    expect(malformedRes.body.code).toBe("MALFORMED_JSON");
  });

  it("rejects payloads containing forbidden credential fields, full SHA-1 hashes, or explicit passwords", async () => {
    const app = createAssistantApp({
      env: { GEMINI_API_KEY: "test-key" },
    });

    const forbiddenField = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: {
        message: "Analyze this",
        language: "en",
        history: [],
        password: "MyActualPassword123!",
      },
    });
    expect(forbiddenField.status).toBe(400);
    expect(forbiddenField.body.code).toBe("PRIVACY_FORBIDDEN_FIELD");

    const fullHashRes = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: {
        message: "Check 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8",
        language: "en",
        history: [],
      },
    });
    expect(fullHashRes.status).toBe(400);
    expect(fullHashRes.body.code).toBe("PRIVACY_VIOLATION");

    const passwordTextRes = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: {
        message: "my password is Summer2026! is it good?",
        language: "en",
        history: [],
      },
    });
    expect(passwordTextRes.status).toBe(400);
    expect(passwordTextRes.body.code).toBe("PRIVACY_VIOLATION");
  });

  it("returns 503 AI_NOT_CONFIGURED when no server AI API key is present", async () => {
    const app = createAssistantApp({ env: {} });
    const res = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: {
        message: "Explain why passphrases resist GPU cracking.",
        language: "en",
        history: [],
      },
    });
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("AI_NOT_CONFIGURED");
  });

  it("enforces per-IP rate limiting with 429 and Retry-After headers", async () => {
    const mockFetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "Entropy explanation." }] } }],
        }),
        { status: 200 }
      )
    );

    const app = createAssistantApp({
      rateLimitMax: 2,
      rateLimitWindowMs: 60_000,
      fetchImpl: mockFetch as typeof fetch,
      env: { GEMINI_API_KEY: "test-gemini-key" },
    });

    const r1 = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: { message: "Question 1", language: "en", history: [] },
    });
    expect(r1.status).toBe(200);
    expect(r1.headers["x-ratelimit-remaining"]).toBe("1");

    const r2 = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: { message: "Question 2", language: "hi", history: [] },
    });
    expect(r2.status).toBe(200);
    expect(r2.headers["x-ratelimit-remaining"]).toBe("0");

    const r3 = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: { message: "Question 3", language: "en", history: [] },
    });
    expect(r3.status).toBe(429);
    expect(r3.body.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(r3.headers["retry-after"]).toBeTruthy();
  });

  it("forwards sanitized metadata and keeps API keys strictly in server-side headers", async () => {
    let capturedHeaders: HeadersInit | undefined;
    let capturedBody = "";

    const mockFetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedHeaders = init?.headers;
      capturedBody = String(init?.body || "");
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "Use a 5-word passphrase and Passkeys." } }],
        }),
        { status: 200 }
      );
    });

    const app = createAssistantApp({
      fetchImpl: mockFetch as typeof fetch,
      env: {
        AI_PROVIDER: "openai",
        OPENAI_API_KEY: "sk-server-only-key",
        OPENAI_MODEL: "gpt-4o-mini",
      },
    });

    const res = await invokeApp(app, {
      method: "POST",
      path: "/api/assistant/chat",
      body: {
        message: "How can I improve my password posture?",
        language: "en",
        history: [],
        metadata: {
          strengthLevel: "weak",
          score: 32,
          length: 9,
          entropyBits: 42.5,
          breachStatus: "clean",
          weaknessCategories: ["short-length", "repeated-chars"],
        },
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("openai");
    expect(String(res.body.reply)).toContain("5-word passphrase");
    expect((capturedHeaders as Record<string, string>)?.Authorization).toBe(
      "Bearer sk-server-only-key"
    );
    expect(capturedBody).toContain("short-length");
  });

  it("client privacy helpers block sensitive prompts and strip secrets from metadata", () => {
    expect(
      validateClientPromptPrivacy(
        "Check 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8 please",
        "en"
      )
    ).toBeTruthy();
    expect(
      validateClientPromptPrivacy("my password is Secret123!", "hi")
    ).toBeTruthy();
    expect(validateClientPromptPrivacy("What is k-Anonymity?", "en")).toBeNull();

    const meta = buildNonSensitiveAssistantMetadata(
      {
        strengthLevel: "fair",
        score: 52,
        length: 12,
        entropyBits: 65,
        shannonEntropyBits: 41,
        effectiveEntropyBits: 32,
        zxcvbnScore: 2,
        zxcvbnGuessesLog10: 6.4,
        crackTimes: {
          onlineThrottled: "1 year",
          onlineUnthrottled: "1 day",
          offlineBcrypt: "5 minutes",
          offlineGpuCluster: "1 second",
        },
        breachStatus: "clean",
        breachCount: 0,
        sanitizedWeaknesses: [
          {
            id: "repeated-chars",
            severity: "medium",
            titleEn: "Repeated chars",
            titleHi: "दोहराव",
            detailEn: "...",
            detailHi: "...",
          },
        ],
        improvementSteps: [],
        assessedAt: new Date().toISOString(),
      },
      INITIAL_HYGIENE_CHECKLIST
    );

    expect(meta.weaknessCategories).toEqual(["repeated-chars"]);
    expect(meta.hygieneTotal).toBe(4);
  });
});
