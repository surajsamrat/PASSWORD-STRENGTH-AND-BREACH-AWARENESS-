import type { NextFunction, Request, Response } from "express";

interface RateBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * In-memory fixed-window per-IP rate limiter middleware.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, RateBucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const clientIp =
      req.ip ||
      (typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : "") ||
      "unknown";

    // Prune expired buckets opportunistically to prevent unbounded growth
    if (buckets.size > 1000) {
      for (const [key, b] of buckets.entries()) {
        if (b.resetAt <= now) buckets.delete(key);
      }
    }

    let bucket = buckets.get(clientIp);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(clientIp, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, options.maxRequests - bucket.count);
    const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(resetSeconds));

    if (bucket.count > options.maxRequests) {
      res.setHeader("Retry-After", String(resetSeconds));
      return res.status(429).json({
        code: "RATE_LIMIT_EXCEEDED",
        error: `Too many requests. Please wait ${resetSeconds}s before trying again.`,
        retryAfterSeconds: resetSeconds,
      });
    }

    return next();
  };
}
