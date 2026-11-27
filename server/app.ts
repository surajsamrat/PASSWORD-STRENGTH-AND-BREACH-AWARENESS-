import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { createRateLimiter } from "./middleware/rateLimit";
import {
  validateChatRequest,
  type ValidatedRequest,
} from "./middleware/validateChatRequest";
import {
  AiServiceError,
  generateAiAssistantReply,
  resolveProviderConfig,
} from "./services/aiProvider";

export interface AppServerOptions {
  corsOrigin?: string;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}

export function createAssistantApp(options?: AppServerOptions) {
  const app = express();
  const env = options?.env ?? process.env;

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: options?.corsOrigin ?? env.CORS_ORIGIN ?? "http://localhost:5173",
      methods: ["GET", "POST"],
    })
  );
  app.use(express.json({ limit: "32kb" }));

  const limiter = createRateLimiter({
    maxRequests: options?.rateLimitMax ?? Number(env.RATE_LIMIT_MAX || 15),
    windowMs: options?.rateLimitWindowMs ?? Number(env.RATE_LIMIT_WINDOW_MS || 60_000),
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    const cfg = resolveProviderConfig(env);
    res.json({
      ok: true,
      providerConfigured: cfg.provider !== "none",
      provider: cfg.provider,
    });
  });

  app.post(
    "/api/assistant/chat",
    limiter,
    validateChatRequest,
    async (req: ValidatedRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.validatedChat) {
          return res.status(400).json({
            code: "VALIDATION_MISSING",
            error: "Validated request payload missing.",
          });
        }
        const reply = await generateAiAssistantReply(req.validatedChat, {
          fetchImpl: options?.fetchImpl,
          env,
        });
        return res.json(reply);
      } catch (err) {
        return next(err);
      }
    }
  );

  // Handle malformed JSON & unexpected errors cleanly without leaking internals
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        code: "MALFORMED_JSON",
        error: "Malformed JSON request body.",
      });
    }
    if (err instanceof AiServiceError) {
      return res.status(err.statusCode).json({
        code: err.code,
        error: err.message,
      });
    }
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "An unexpected server error occurred.",
    });
  });

  return app;
}
