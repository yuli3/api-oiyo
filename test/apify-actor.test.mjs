// 2026-11-25: Apify Actor (apify/) core logic, run against the real worker in-process.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker from "../src/worker.mjs";
import { DEFAULT_ENDPOINT, InputError, callTool, listTools, normalizeInput, parseRpcBody } from "../apify/src/core.mjs";
import { TOOLS_SPEC } from "../src/modules/tools-spec.mjs";

const ctx = { waitUntil() {}, passThroughOnException() {} };
const local = (url, init) => worker.fetch(new Request(url, init), {}, ctx);

test("normalizeInput: single, batch, catalog, refusals", () => {
  assert.deepEqual(normalizeInput({ tool: "get_kr_holidays", arguments: { year: 2027 } }).calls,
    [{ tool: "get_kr_holidays", arguments: { year: 2027 } }]);
  assert.equal(normalizeInput({ calls: [{ tool: "get_kr_holidays", arguments: { year: 2027 } }, { tool: "check_kr_business_day" }] }).calls.length, 2);
  assert.equal(normalizeInput({ listTools: true, tool: "x" }).listTools, true);
  assert.throws(() => normalizeInput({}), InputError);
  assert.throws(() => normalizeInput({ tool: "../etc" }), InputError);
  assert.throws(() => normalizeInput({ tool: "get_kr_holidays", arguments: [1] }), InputError);
  assert.throws(() => normalizeInput({ calls: Array.from({ length: 51 }, () => ({ tool: "get_kr_holidays" })) }), InputError);
});

test("parseRpcBody handles JSON and SSE", () => {
  assert.equal(parseRpcBody('{"id":1,"result":{}}').id, 1);
  assert.equal(parseRpcBody('event: message\ndata: {"id":2,"result":{}}\n\n').id, 2);
});

test("callTool returns structured result for a valid call", async () => {
  const item = await callTool(local, DEFAULT_ENDPOINT, { tool: "check_kr_business_day", arguments: { date: "2026-12-25" } });
  assert.equal(item.ok, true);
  assert.equal(item.result.is_business_day, false);
  assert.match(item.sourcePage, /tools\.oiyo\.net/);
});

test("callTool marks refused input as not ok (so it is not charged)", async () => {
  const item = await callTool(local, DEFAULT_ENDPOINT, { tool: "check_kr_business_day", arguments: { date: "2026-12-25", bogus: 1 } });
  assert.equal(item.ok, false);
  assert.ok(item.error);
  const unknown = await callTool(local, DEFAULT_ENDPOINT, { tool: "no_such_tool", arguments: {} });
  assert.equal(unknown.ok, false);
});

test("listTools returns the whole catalog; listings claim 300+", async () => {
  const catalog = await listTools(local, DEFAULT_ENDPOINT);
  assert.equal(catalog.length, TOOLS_SPEC.tools.length);
  const readme = readFileSync(new URL("../apify/README.md", import.meta.url), "utf8");
  const actor = JSON.parse(readFileSync(new URL("../apify/.actor/actor.json", import.meta.url), "utf8"));
  // Listings say "300+" so new tools never need a copy edit; fail only if the catalog shrinks below that.
  assert.ok(catalog.length >= 300);
  assert.ok(readme.includes("300+ deterministic calculators"));
  assert.ok(actor.description.startsWith("300+ deterministic calculators"));
  assert.ok(actor.description.length <= 300, "Apify Store description limit is 300 characters");
});

test("README examples name real tools", () => {
  const names = new Set(TOOLS_SPEC.tools.map(t => t.function.name));
  const readme = readFileSync(new URL("../apify/README.md", import.meta.url), "utf8");
  for (const [, name] of readme.matchAll(/`((?:calculate|get|check|compare)_[a-z0-9_]+)`/g)) assert.ok(names.has(name), name);
  const schema = JSON.parse(readFileSync(new URL("../apify/.actor/input_schema.json", import.meta.url), "utf8"));
  for (const [, name] of schema.properties.tool.description.matchAll(/((?:calculate|get|check)_[a-z0-9_]+)/g)) assert.ok(names.has(name), name);
});

test("Actor calls are tagged ref=apify in usage and source links", async () => {
  const { mcpMedium } = await import("../src/modules/source-pages.mjs");
  assert.equal(mcpMedium(new Request(DEFAULT_ENDPOINT, { headers: { "user-agent": "oiyo-apify-actor/1.0" } })), "apify");
});
