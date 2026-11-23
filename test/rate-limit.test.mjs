import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../src/worker.mjs';
import { checkRateLimit } from '../src/modules/rate-limit.mjs';

const fakeLimiter = (allow) => {
  const keys = [];
  return { keys, limit: async ({ key }) => { keys.push(key); return { success: allow }; } };
};
const req = (path, init = {}) => new Request('https://api.oiyo.net' + path, { ...init, headers: { 'cf-connecting-ip': '203.0.113.7', ...(init.headers ?? {}) } });

test('wrangler config keeps observability on and a per-IP rate limiter binding', () => {
  const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.observability.enabled, true);
  const rl = config.ratelimits.find((r) => r.name === 'RATE_LIMITER');
  assert.ok(rl, 'RATE_LIMITER binding');
  assert.match(rl.namespace_id, /^\d+$/);
  assert.ok([10, 60].includes(rl.simple.period));
  assert.ok(rl.simple.limit >= 120, 'limit must stay generous for MCP sessions');
});

test('no binding or a failing binding never blocks', async () => {
  assert.equal(await checkRateLimit(undefined, req('/v1/finance/cagr')), true);
  assert.equal(await checkRateLimit({ RATE_LIMITER: { limit: async () => { throw new Error('x'); } } }, req('/v1/finance/cagr')), true);
});

test('limiter keys by client IP and skips health, robots and preflight', async () => {
  const limiter = fakeLimiter(false);
  const env = { RATE_LIMITER: limiter };
  assert.equal(await checkRateLimit(env, req('/health')), true);
  assert.equal(await checkRateLimit(env, req('/robots.txt')), true);
  assert.equal(await checkRateLimit(env, req('/mcp', { method: 'OPTIONS' })), true);
  assert.equal(await checkRateLimit(env, new Request('https://api.oiyo.net/v1/x')), true, 'no IP header → not limited');
  assert.equal(await checkRateLimit(env, req('/v1/finance/cagr')), false);
  assert.deepEqual(limiter.keys, ['ip:203.0.113.7']);
});

test('limited REST call returns 429 JSON with Retry-After and security headers', async () => {
  const res = await worker.fetch(req('/v1/finance/cagr?initial=100&final=200&years=5'), { RATE_LIMITER: fakeLimiter(false) });
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '60');
  assert.ok(res.headers.get('Strict-Transport-Security'));
  assert.equal((await res.json()).error, 'rate_limited');
});

test('limited MCP call answers with a JSON-RPC error', async () => {
  const res = await worker.fetch(req('/mcp', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }), headers: { 'Content-Type': 'application/json' } }), { RATE_LIMITER: fakeLimiter(false) });
  assert.equal(res.status, 429);
  const body = await res.json();
  assert.equal(body.jsonrpc, '2.0');
  assert.equal(body.error.code, -32029);
});

test('allowed call goes through unchanged', async () => {
  const res = await worker.fetch(req('/health'), { RATE_LIMITER: fakeLimiter(false) });
  assert.equal(res.status, 200);
  const ok = await worker.fetch(req('/v1/finance/cagr?initial=100&final=200&years=5'), { RATE_LIMITER: fakeLimiter(true) });
  assert.notEqual(ok.status, 429);
});
