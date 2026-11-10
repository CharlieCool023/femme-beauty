type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/**
 * Small in-memory limiter. Good enough for a single-instance deployment;
 * swap for Upstash/Redis if this ever runs on multiple servers.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }
  return { allowed: true, remaining: limit - entry.count };
}

// Keep the map from growing forever in a long-running process.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) if (entry.resetAt < now) buckets.delete(key);
  }, 60_000);
  // Don't hold the Node process open because of this timer.
  if (typeof timer === "object" && "unref" in timer) timer.unref();
}
