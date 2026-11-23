// 2026-11-23 audit follow-up (company-brain audits/2026-11-22-faang-audit P2-12):
// the worker runs on the free plan (100k requests/day for the whole account) and had no
// per-client limit, so one script could use the day's budget for every MCP client.
// Per-IP limit via the Workers Rate Limiting binding (wrangler.jsonc "ratelimits").
// Counts are per Cloudflare location and approximate; this is a brake, not a quota.
// A missing binding (tests, local runs) or a binding error never blocks a request.

// Cheap, cacheable or ownership-probe paths that clients poll; they never count.
const EXEMPT_PATHS = new Set(["/health", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/favicon.svg", "/.well-known/glama.json"]);

export const RATE_LIMIT_RETRY_AFTER_SECONDS = 60;

export function rateLimitKey(request) {
  const ip = request.headers.get("cf-connecting-ip");
  return ip ? `ip:${ip}` : "";
}

export async function checkRateLimit(env, request) {
  const limiter = env?.RATE_LIMITER;
  if (!limiter || typeof limiter.limit !== "function") return true;
  if (request.method === "OPTIONS") return true;
  if (EXEMPT_PATHS.has(new URL(request.url).pathname)) return true;
  const key = rateLimitKey(request);
  if (!key) return true;
  try {
    const { success } = await limiter.limit({ key });
    return success !== false;
  } catch {
    return true;
  }
}

export function rateLimitedResponse(isMcp) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Retry-After": String(RATE_LIMIT_RETRY_AFTER_SECONDS),
    "Access-Control-Allow-Origin": "*",
    "X-Robots-Tag": "noindex",
  };
  const body = isMcp
    ? { jsonrpc: "2.0", id: null, error: { code: -32029, message: "Rate limit exceeded. Retry after 60 seconds." } }
    : { error: "rate_limited", message: "Too many requests from this address. Retry after 60 seconds." };
  return new Response(JSON.stringify(body), { status: 429, headers });
}
