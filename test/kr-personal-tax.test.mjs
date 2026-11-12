// Personal tax endpoints (2026-11-09): formulas come from tools-oiyo via scripts/sync-tools-tax.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as nodeModule from "node:module";
import worker from "../src/worker.mjs";
import { basicIncomeTax, earnedIncomeDeduction as toolsDeduction } from "../src/modules/vendor/tools-tax/kr-payroll-2026.mjs";
import { progressiveIncomeTax, earnedIncomeDeduction } from "../src/modules/kr-rates-2026.mjs";

async function call(path, params, method = "GET") {
  const url = new URL(path, "https://api.oiyo.net");
  const options = { method };
  if (method === "POST") {
    options.body = JSON.stringify(params);
    options.headers = { "Content-Type": "application/json" };
  } else for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const response = await worker.fetch(new Request(url, options));
  return { status: response.status, body: await response.json() };
}

test("year-end settlement: 50M salary, single, standard credit wins", async () => {
  const { status, body } = await call("/v1/tax/kr/year-end-settlement", { salary: 50_000_000, persons: 1, withheld: 2_000_000 }, "POST");
  assert.equal(status, 200);
  // 50M − 12.25M 근로소득공제 − 1.5M = 36.25M 과표; 산출 4,177,500 − 근로세액공제 660,000 − 표준 130,000
  assert.equal(body.result.taxBase, 36_250_000);
  assert.equal(body.result.calculatedTax, 4_177_500);
  assert.equal(body.result.finalTax, 3_387_500);
  assert.equal(body.result.usedStandard, true);
  assert.equal(body.result.refund.national, -1_387_500);
  assert.equal(body.taxYear, 2026);
  assert.equal(body.isEstimate, true);
  assert.ok(body.basis.length > 0 && body.disclaimer.includes("세무대리"));
});

test("freelancer 3.3%: 30M revenue with 940909 simple expense rate refunds", async () => {
  const { status, body } = await call("/v1/tax/kr/freelancer-income-tax", { revenue: 30_000_000 });
  assert.equal(status, 200);
  assert.equal(body.result.expense, 19_230_000);
  assert.equal(body.result.withheld, 900_000);
  assert.equal(body.result.determined, 486_200);
  assert.equal(body.result.due, -455_180);
});

test("acquisition tax: 700M first home uses the 6-9억 sliding rate", async () => {
  const { body } = await call("/v1/tax/kr/acquisition-tax", { price: 700_000_000 });
  assert.equal(body.result.rate, 0.0167);
  assert.equal(body.result.total, 12_859_000);
  const heavy = await call("/v1/tax/kr/acquisition-tax", { price: 700_000_000, houses: 2, regulated: true, over85: true });
  assert.equal(heavy.body.result.rate, 0.08);
  assert.equal(heavy.body.result.total, 56_000_000 + 2_800_000 + 4_200_000);
});

test("property tax: 500M one-home uses 44% ratio and special rate", async () => {
  const { body } = await call("/v1/tax/kr/property-tax", { officialPrice: 500_000_000 });
  assert.deepEqual([body.result.base, body.result.tax, body.result.total], [220_000_000, 260_000, 620_000]);
  const multi = await call("/v1/tax/kr/property-tax", { officialPrice: 500_000_000, oneHouse: false });
  assert.equal(multi.body.result.ratio, 0.6);
});

test("unknown inputs, missing inputs and unsupported years are refused, not guessed", async () => {
  const unknown = await call("/v1/tax/kr/property-tax", { officialPrice: 1, typo: 3 });
  assert.equal(unknown.status, 400);
  assert.match(unknown.body.problems.join(), /typo: unknown input/);
  const missing = await call("/v1/tax/kr/acquisition-tax", {});
  assert.equal(missing.status, 400);
  const year = await call("/v1/tax/kr/freelancer-income-tax", { revenue: 1, taxYear: 2024 });
  assert.equal(year.status, 400);
  assert.match(year.body.problems.join(), /taxYear/);
  const neg = await call("/v1/tax/kr/year-end-settlement", { salary: -1 }, "POST");
  assert.equal(neg.status, 400);
  const tooManyChildren = await call("/v1/tax/kr/year-end-settlement", { salary: 1, persons: 1, creditChildren: 2 }, "POST");
  assert.equal(tooManyChildren.status, 400);
});

test("vendored payroll formulas match the kr-rates-2026 SSOT within 1 won rounding", () => {
  for (let b = 0; b <= 2_000_000_000; b += 7_777_777) {
    assert.ok(Math.abs(basicIncomeTax(b) - progressiveIncomeTax(b)) <= 1, `tax ${b}`);
    assert.ok(Math.abs(toolsDeduction(b) - earnedIncomeDeduction(b)) <= 1, `deduction ${b}`);
  }
});

const toolsDir = process.env.OIYO_TOOLS_DIR ?? resolve(import.meta.dirname ?? ".", "../../tools-oiyo");
test("vendored files equal a fresh sync from tools-oiyo", { skip: !nodeModule.stripTypeScriptTypes || !existsSync(resolve(toolsDir, "src/lib/kr-year-end-2026.ts")) }, async () => {
  const { TOOLS_TAX_FILES, VENDOR_DIR, renderToolsTaxFile } = await import("../scripts/sync-tools-tax.mjs");
  for (const name of TOOLS_TAX_FILES) {
    assert.equal(readFileSync(resolve(VENDOR_DIR, `${name}.mjs`), "utf8"), renderToolsTaxFile(toolsDir, name), `${name} drifted: run node scripts/sync-tools-tax.mjs`);
  }
});

test("server.json for the MCP Registry matches the served tool catalog version", async () => {
  const { TOOLS_SPEC } = await import("../src/modules/tools-spec.mjs");
  const server = JSON.parse(readFileSync(new URL("../server.json", import.meta.url), "utf8"));
  assert.match(server.name, /^io\.github\.yuli3\/[a-zA-Z0-9._-]+$/);
  assert.ok(server.description.length <= 100);
  assert.equal(server.version, TOOLS_SPEC.version, "bump server.json version with tools-spec.mjs");
  assert.deepEqual(server.remotes, [
    { type: "streamable-http", url: "https://api-oiyo.861106.workers.dev/mcp" },
    { type: "streamable-http", url: "https://api.oiyo.net/mcp" },
  ]);
});
