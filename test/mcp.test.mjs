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
  value_kr_unlisted_shares: { sharesOutstanding: 100000, netIncome1: 600000000, netIncome2: 500000000, netIncome3: 400000000, netAssets: 3000000000, heldShares: 60000 },
  calculate_kr_family_business_deduction: { businessValue: 10000000000, years: 15, size: "sme" },
  calculate_kr_incorporation_conversion: { realEstateMarket: 1000000000, realEstateCost: 400000000, holdYears: 10 },
  calculate_dcf_valuation: { revenue0: 10000000000, growth: 0.1, ebitMargin: 0.12, terminalGrowth: 0.02, shares: 1000000, wacc: 0.1 },
  evaluate_decision_tree: { question: "신규 매장?", options: [{ label: "열기", successProb: 0.4, ifSuccess: 500, ifFail: -100, cost: 50 }, { label: "보류", successProb: 1, ifSuccess: 60, ifFail: 60 }] },
  schedule_critical_path: { tasks: [{ id: "a", name: "기획", duration: 3 }, { id: "b", name: "개발", duration: 10, deps: ["a"], optimistic: 7, pessimistic: 16 }], deadline: 14, startDate: "2026-11-16", workdaysOnly: true },
  analyze_swot: { items: [{ kind: "S", text: "충성 고객", impact: 5, weight: 0.6, rating: 4 }, { kind: "T", text: "대기업 진입", impact: 4, weight: 1, rating: 2 }] },
  classify_bcg_portfolio: { units: [{ name: "매장", revenue: 3000, marketGrowth: 0.02, share: 0.18, rivalShare: 0.12 }, { name: "구독", revenue: 400, marketGrowth: 0.25, share: 0.02, rivalShare: 0.1 }] },
  map_brand_positioning: { brands: [{ name: "우리", x: -2, y: 4, ours: true }, { name: "A사", x: 7, y: 7 }, { name: "B사", x: -6, y: -5 }], idealX: 3, idealY: 6 },
  calculate_unit_economics_runway: { arpu: 50000, grossMargin: 0.7, monthlyChurn: 0.04, cac: 300000, cash: 300000000, revenue: 20000000, revenueGrowth: 0.06, expenses: 45000000, expenseGrowth: 0.01 },
  rank_priorities: { method: "weighted", criteria: [{ name: "비용", weight: 2 }, { name: "속도", weight: 1 }], options: [{ name: "X", scores: [5, 1] }, { name: "Y", scores: [2, 4] }] },
  get_kr_business_tax_calendar: { year: 2026, entity: "corp", vat: "general", employer: true, from: "2026-11-15", stage: "hire" },
  plan_campaign_supply: { demand: [100, 100, 300, 300, 100], openingStock: 100, capacityPerWeek: 150, leadTimeWeeks: 1 },
  evaluate_influencer_deal: { fee: 3000000, views: 200000, clickRate: 0.02, conversionRate: 0.05, aov: 30000, grossMargin: 0.7, payee: "freelancer" },
  plan_quality_recovery: { lots: [{ id: "L1", units: 1000, defectRate: 0.1, shippedRatio: 0.5 }], recallCostPerUnit: 500, remakeCostPerUnit: 2000, goodStock: 600, customers: [{ name: "A", demand: 600, priority: 2, penaltyPerUnit: 1000 }, { name: "B", demand: 400, priority: 1, penaltyPerUnit: 200 }] },
  compare_alternative_materials: { currentPrice: 1000, annualVolume: 100000, candidates: [{ name: "X", unitPrice: 900, quality: 4, supply: 3, testWeeks: 6, testCost: 5000000 }, { name: "Y", unitPrice: 800, quality: 2, supply: 2, testWeeks: 12, testCost: 8000000, needsFiling: true }], weights: { cost: 1, quality: 1, supply: 1, speed: 1 } },
  check_big_order_capacity: { capacity: 1000, existing: [{ name: "핵심", qty: 500, price: 100, unitCost: 60, penaltyPerUnit: 100, locked: true }, { name: "일반", qty: 300, price: 80, unitCost: 60, penaltyPerUnit: 5 }], newOrder: { name: "대형", qty: 500, price: 110, unitCost: 60 } },
  analyze_market_test: { baseline: 0.05, lift: 0.2, convA: 100, nA: 2000, convB: 140, nB: 2000 },
  check_sales_rebates: { tiers: [{ from: 0, rate: 0.01 }, { from: 100000000, rate: 0.03 }], partners: [{ name: "D1", sales: 60000000, group: "G", related: true, paid: 1800000 }, { name: "E", sales: 80000000, paid: 800000 }], aggregateGroups: false, armsLengthCheck: true },
  evaluate_acquisition: { price: 10000, targetNetIncome: 1000, acquirerNetIncome: 5000, acquirerShares: 1000, sharePrice: 50, stockPortion: 1, debtRate: 0.05, taxRate: 0.2, synergy: 0, rampYears: 1, integrationCost: 0, years: 12 },
  calculate_kr_work_child_incentive: { household: "oneEarner", income: 20000000, assets: 100000000, children: 1 },
  calculate_kr_maternity_leave_pay: { monthlyWage: 3000000, priorityFirm: true, kind: "single" },
  calculate_kr_wage_guarantee: { kind: "simpleRetired", age: 40, monthlyWage: 3000000, unpaidMonths: 3, unpaidSeverance: 9000000, serviceYears: 3 },
  calculate_kr_injury_leave_pay: { avgDailyWage: 150000, days: 30 },
  calculate_kr_monthly_rent_credit: { income: 50000000, incomeType: "wage", monthlyRent: 600000, months: 12 },
  compare_kr_retirement_pension: { monthlyWage: 4000000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.04 },
  calculate_kr_ordinary_wage: { basePay: 2500000, fixedAllowances: 300000, bonusAnnual: 6000000, bonusConditional: true, overtime: 20, night: 0, holiday: 0 },
  check_kr_fixed_overtime_pay: { basePay: 2508000, fixedOtPay: 300000, overtime: 30, night: 0, holiday: 0 },
  calculate_kr_comprehensive_real_estate_tax: { prices: [1500000000], oneHouse: true },
  calculate_kr_housing_rental_income_tax: { houses: 2, annualRent: 12000000, deposits: 0, registered: false, otherIncome: 40000000 },
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

test("MCP Origin allowlist admits Glama health checks exactly, nothing broader", async () => {
  const init = (origin, host = "https://api-oiyo.861106.workers.dev") => new Request(`${host}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Origin: origin }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "glama", version: "1" } } }) });
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    const ok = await worker.fetch(init("https://glama.ai", host));
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://glama.ai");
  }
  for (const origin of ["https://evil.example", "https://www.glama.ai", "https://glama.ai.evil.example", "http://glama.ai", "https://x.glama.ai"]) {
    assert.equal((await worker.fetch(init(origin))).status, 403, origin);
  }
});

test("/mcp/ with a trailing slash is served as MCP on workers.dev and api.oiyo.net, never redirected", async () => {
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "node" };
  const initBody = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "glama", version: "1" } } });
  const listBody = JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const count = (await import("../src/modules/tools-spec.mjs")).TOOLS_SPEC.tools.length;
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    const init = await worker.fetch(new Request(`${host}/mcp/`, { method: "POST", headers, body: initBody }));
    assert.equal(init.status, 200, host);
    assert.equal(init.headers.get("Location"), null);
    const list = await worker.fetch(new Request(`${host}/mcp/`, { method: "POST", headers: { ...headers, "MCP-Protocol-Version": "2025-06-18" }, body: listBody }));
    const text = await list.text();
    const payload = JSON.parse(text.startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data:")).slice(5));
    assert.equal(payload.result.tools.length, count);
    assert.equal((await worker.fetch(new Request(`${host}/mcp/`))).status, 405);
  }
  assert.equal((await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/mcp/sse"))).status, 301, "non-MCP subpaths keep redirecting");
});

test("/.well-known/glama.json is served on both hosts and matches the repo glama.json", async () => {
  const { readFileSync } = await import("node:fs");
  const expected = JSON.parse(readFileSync(new URL("../glama.json", import.meta.url), "utf8"));
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    const response = await worker.fetch(new Request(`${host}/.well-known/glama.json`));
    assert.equal(response.status, 200, host);
    assert.deepEqual(await response.json(), expected);
  }
});
