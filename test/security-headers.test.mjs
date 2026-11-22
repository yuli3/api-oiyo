import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

const env = {};

test("every response carries HSTS, nosniff and a referrer policy", async () => {
  for (const path of ["/", "/docs", "/openapi.json", "/does-not-exist"]) {
    const res = await worker.fetch(new Request(`https://api.oiyo.net${path}`), env);
    assert.equal(res.headers.get("Strict-Transport-Security"), "max-age=31536000", path);
    assert.equal(res.headers.get("X-Content-Type-Options"), "nosniff", path);
    assert.equal(res.headers.get("Referrer-Policy"), "strict-origin-when-cross-origin", path);
  }
});

test("HTML docs page cannot be framed by other sites", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/docs"), env);
  assert.match(res.headers.get("Content-Type") ?? "", /text\/html/);
  assert.equal(res.headers.get("X-Frame-Options"), "SAMEORIGIN");
});
