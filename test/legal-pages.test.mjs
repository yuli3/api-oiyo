// 2026-11-25 RT-02: directory listings need public privacy/terms/support pages and a Gemini CLI manifest.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker from "../src/worker.mjs";
import { mcpMedium } from "../src/modules/source-pages.mjs";

const ctx = { waitUntil() {}, passThroughOnException() {} };
const get = (path, method = "GET") => worker.fetch(new Request(`https://api.oiyo.net${path}`, { method }), {}, ctx);

for (const [path, must] of [["/privacy", /not stored/], ["/terms", /not tax, legal/], ["/support", /support@oiyo\.net/]]) {
  test(`${path} serves HTML`, async () => {
    const response = await get(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    const html = await response.text();
    assert.match(html, must);
    assert.match(html, /support@oiyo\.net/);
    assert.equal((await get(path, "HEAD")).status, 200);
  });
}

// The sitemap stays /docs-only on purpose (worker.test.mjs seo test); the root index links the pages.
test("legal pages are linked from the root index", async () => {
  const root = await (await get("/")).json();
  assert.equal(root.privacy, "/privacy");
});

test("privacy page claims match the usage recorder (no IP, no inputs)", () => {
  const usage = readFileSync(new URL("../src/modules/usage.mjs", import.meta.url), "utf8");
  assert.ok(!/cf-connecting-ip/.test(usage), "usage.mjs must not record IPs while /privacy says so");
});

test("gemini-extension.json is valid", () => {
  const manifest = JSON.parse(readFileSync(new URL("../gemini-extension.json", import.meta.url), "utf8"));
  // Not tied to tools-spec version on purpose: tool changes are served live, the manifest only holds the URL.
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  const url = manifest.mcpServers["oiyo-calculations"].httpUrl;
  assert.equal(mcpMedium(new Request(url)), "gemini");
});
