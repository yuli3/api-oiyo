import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";
import { TOOLS_SPEC, TOOL_ENDPOINTS } from "../src/modules/tools-spec.mjs";
import { OPENAPI_SPEC } from "../src/modules/openapi.mjs";
import { SOURCE_PAGES, mcpMedium, sourcePageUrl } from "../src/modules/source-pages.mjs";

const fixtures = {
  get_kr_minimum_wage: { year: 2027 },
  get_kr_holidays: { year: 2026 },
  check_kr_business_day: { date: "2026-10-16" },
  calculate_saju_astrology: { year: 1990, month: 5, day: 15, hour: 14 },
  calculate_unemployment_benefits: { wage: 3000000, age: "under", period: "p3" },
  calculate_weekly_allowance: { hourlyWage: 10320, hours: 20, tax: "none", employedWholeWeek: true, completedScheduledDays: true },
  calculate_overtime_pay: { hourlyWage: 10320, overtimeHours: 2 },
  calculate_net_salary: { salary: 3500000 },
  calculate_severance_pay: { startDate: "2024-01-01", endDate: "2026-01-01", threeMonthSalary: 9000000 },
  calculate_annual_leave: { yearsOfService: 2 },
  calculate_military_service: { enlistmentDate: "2026-03-01", currentDate: "2026-10-16", branch: "army" },
  calculate_gas_bill: { usageM3: 50 },
  convert_units: { value: 1, from: "m", to: "cm" },
  calculate_cagr: { initialValue: 100, finalValue: 200, years: 5 },
  calculate_compound_interest: { principal: 1000000, rate: 5, years: 10 },
  calculate_health_insurance: { businessIncome: 30000000 },
  diagnose_hug_guarantee: { officialPrice: 300000000, jeonseDeposit: 200000000 },
  calculate_capital_gains_tax: { transferPrice: 500000000, acquisitionPrice: 400000000 },
  compare_vat_tax: { revenue: 50000000 },
  calculate_inheritance_gift_tax: { assetValue: 100000000, mode: "gift", relationship: "child_adult" },
  calculate_loan_refinance: { loanBalance: 200000000, currentRate: 4.8, newRate: 3.9 },
  calculate_card_tax_deduction: { annualSalary: 50000000 },
  calculate_kr_year_end_settlement: { salary: 50000000, persons: 1, withheld: 2000000 },
  calculate_kr_freelancer_income_tax: { revenue: 30000000 },
  calculate_kr_acquisition_tax: { price: 700000000 },
  calculate_kr_property_tax: { officialPrice: 500000000 },
};

function rpcRequest(method, params = {}, headers = {}) {
  return new Request("https://api.oiyo.net/mcp", {
    method: "POST", headers: {
      "Content-Type": "application/json", Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2026-07-28", "Mcp-Method": method,
      ...(params.name ? { "Mcp-Name": params.name } : {}), ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: {
      ...params, _meta: {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientInfo": { name: "oiyo-regression", version: "1.0.0" },
        "io.modelcontextprotocol/clientCapabilities": {},
      },
    } }),
  });
}

async function rpc(method, params) {
  const response = await worker.fetch(rpcRequest(method, params));
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  return body;
}

test("MCP catalog is generated from the function schema SSOT", async () => {
  const body = await rpc("tools/list");
  assert.deepEqual(body.result.tools.map(t => t.name).sort(), TOOLS_SPEC.tools.map(t => t.function.name).sort());
  assert.deepEqual(Object.keys(TOOL_ENDPOINTS).sort(), Object.keys(fixtures).sort());
  for (const tool of body.result.tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.inputSchema.additionalProperties, false);
    const endpoint = TOOL_ENDPOINTS[tool.name];
    assert.equal(OPENAPI_SPEC.paths[endpoint.path][(endpoint.method || "GET").toLowerCase()].operationId, tool.name);
  }
});

for (const [name, args] of Object.entries(fixtures)) {
  test(`MCP ${name} returns the same data as the public REST route`, async () => {
    const { path, method = "GET" } = TOOL_ENDPOINTS[name];
    const url = new URL(path, "https://api.oiyo.net");
    const options = { method };
    if (method === "POST") {
      options.body = JSON.stringify(args); options.headers = { "Content-Type": "application/json" };
    } else for (const [key, value] of Object.entries(args)) url.searchParams.set(key, String(value));
    const rest = await worker.fetch(new Request(url, options));
    assert.equal(rest.status, 200, await rest.clone().text());
    const expected = await rest.json();
    const body = await rpc("tools/call", { name, arguments: args });
    assert.equal(body.result.isError, false);
    const { sourcePage, ...restFields } = body.result.structuredContent;
    assert.deepEqual(restFields, expected);
    assert.deepEqual(JSON.parse(body.result.content[0].text), body.result.structuredContent);
    assert.equal(sourcePage, sourcePageUrl(name, "unknown"));
    assert.equal(body.result.content[1].text, `Interactive calculator (Korean, OIYO): ${sourcePage}`);
  });
}

test("MCP transport rejects invalid origins, media, methods and oversized bodies", async () => {
  assert.equal((await worker.fetch(rpcRequest("tools/list", {}, { Origin: "https://untrusted.example" }))).status, 403);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/mcp"))).status, 405);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/mcp", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" }))).status, 415);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: " ".repeat(32769) }))).status, 413);
  const response = await worker.fetch(rpcRequest("tools/list"));
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
});

test("MCP validates arguments, unknown tools and version header mismatches", async () => {
  const bad = await rpc("tools/call", { name: "convert_units", arguments: { value: "1", from: "m", to: "cm" } });
  assert.ok(bad.error || bad.result?.isError);
  const extra = await rpc("tools/call", { name: "convert_units", arguments: { value: 1, from: "m", to: "cm", unknown: true } });
  assert.ok(extra.error || extra.result?.isError);
  const unknown = await rpc("tools/call", { name: "does_not_exist", arguments: {} });
  assert.ok(unknown.error || unknown.result?.isError);
  assert.equal((await worker.fetch(rpcRequest("tools/list", {}, { "MCP-Protocol-Version": "2025-06-18" }))).status, 400);
});

test("legacy initialize stays available without persistent sessions", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/mcp", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "legacy-test", version: "1" } } }),
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("mcp-session-id"), null);
  assert.match(await response.text(), /2025-06-18/);
});

test("every MCP tool links back to an OIYO page with pilot UTM tags", () => {
  assert.deepEqual(Object.keys(SOURCE_PAGES).sort(), Object.keys(TOOL_ENDPOINTS).sort());
  for (const name of Object.keys(TOOL_ENDPOINTS)) {
    const url = new URL(sourcePageUrl(name, "smithery"));
    assert.match(url.origin, /^https:\/\/(tools\.)?oiyo\.net$/);
    assert.ok(url.pathname.startsWith("/ko/") && url.pathname.endsWith("/"));
    assert.equal(url.searchParams.get("utm_source"), "mcp");
    assert.equal(url.searchParams.get("utm_medium"), "smithery");
    assert.equal(url.searchParams.get("utm_campaign"), "mcp-pilot");
    assert.equal(url.searchParams.get("utm_content"), name);
  }
});

test("MCP medium trusts only listed registry refs, then the client family", async () => {
  const req = (query, ua) => new Request(`https://api.oiyo.net/mcp${query}`, { method: "POST", headers: ua ? { "user-agent": ua } : {} });
  assert.equal(mcpMedium(req("?ref=glama", "Claude-User")), "glama");
  assert.equal(mcpMedium(req("?ref=<script>", "Claude-User")), "claude");
  assert.equal(mcpMedium(req("", "openai-mcp/1.0")), "chatgpt");
  assert.equal(mcpMedium(req("", "Cursor/2.1")), "cursor");
  assert.equal(mcpMedium(req("", "python-httpx/0.28")), "other");
  assert.equal(mcpMedium(req("", "")), "unknown");
  const call = await worker.fetch(new Request("https://api.oiyo.net/mcp?ref=cursor-directory", rpcRequest("tools/call", { name: "convert_units", arguments: { value: 1, from: "m", to: "cm" } })));
  const body = await call.json();
  assert.equal(new URL(body.result.structuredContent.sourcePage).searchParams.get("utm_medium"), "cursor-directory");
});

test("workers.dev host serves the same MCP tools and redirects everything else to api.oiyo.net", async () => {
  const init = { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "python-httpx/0.28.1" } };
  const list = await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/mcp", { ...init, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } } }) }));
  assert.equal(list.status, 200);
  const tools = await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/mcp", { ...init, headers: { ...init.headers, "MCP-Protocol-Version": "2025-06-18" }, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) }));
  assert.equal(tools.status, 200);
  const text = await tools.text();
  const payload = JSON.parse(text.startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data:")).slice(5));
  assert.equal(payload.result.tools.length, (await import("../src/modules/tools-spec.mjs")).TOOLS_SPEC.tools.length);
  const docs = await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/docs?x=1"));
  assert.equal(docs.status, 301);
  assert.equal(docs.headers.get("Location"), "https://api.oiyo.net/docs?x=1");
  assert.equal((await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/robots.txt"))).status, 301);
});
