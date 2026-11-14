// Advisory endpoints (2026-11-14): formulas come from tools-oiyo kr-advisory-2026 via scripts/sync-tools-tax.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

async function call(path, params, method = "POST") {
  const url = new URL(path, "https://api.oiyo.net");
  const options = { method };
  if (method === "POST") {
    options.body = JSON.stringify(params);
    options.headers = { "Content-Type": "application/json" };
  } else for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const response = await worker.fetch(new Request(url, options));
  return { status: response.status, body: await response.json() };
}

const shares = { sharesOutstanding: 100000, netIncome1: 600000000, netIncome2: 500000000, netIncome3: 400000000, netAssets: 3000000000, heldShares: 60000 };

test("unlisted shares: 3:2 blend, premium only when not exempt", async () => {
  const { status, body } = await call("/v1/tax/kr/unlisted-share-valuation", shares);
  assert.equal(status, 200);
  assert.equal(body.result.perShare, 43_999);
  assert.ok(body.basis.length && body.notCovered.length && body.disclaimer);
  const prem = await call("/v1/tax/kr/unlisted-share-valuation", { ...shares, isMajorityHolder: true, premiumExempt: false });
  assert.equal(prem.body.result.perShare, Math.floor(43_999 * 1.2));
  const get = await call("/v1/tax/kr/unlisted-share-valuation", { ...shares, netIncome1: -900000000, netIncome2: 100000000, netIncome3: 100000000 }, "GET");
  assert.equal(get.body.result.perShare, 24_000);
});

test("family business deduction: cap and saving", async () => {
  const { status, body } = await call("/v1/tax/kr/family-business-inheritance", { businessValue: 10_000_000_000, unrelatedAssetRatio: 0.1, years: 15, size: "sme", otherEstate: 2_000_000_000 });
  assert.equal(status, 200);
  assert.equal(body.result.deduction, 9_000_000_000);
  assert.equal(body.result.with.calculated, 838_000_000);
  const short = await call("/v1/tax/kr/family-business-inheritance", { businessValue: 1, years: 9, size: "sme" });
  assert.equal(short.body.result.deduction, 0);
});

test("incorporation conversion: capital, deferral, relief", async () => {
  const { body } = await call("/v1/tax/kr/incorporation-conversion", { realEstateMarket: 1_000_000_000, realEstateCost: 400_000_000, holdYears: 10, otherAssets: 300_000_000, liabilities: 500_000_000 });
  assert.equal(body.result.minCapital, 800_000_000);
  assert.equal(body.result.deferred, 181_566_000);
  assert.equal(body.result.relief, 20_000_000);
});

test("dcf: direct WACC, CAPM build, and refusals", async () => {
  const base = { revenue0: 100, growth: 0.02, ebitMargin: 0.1, taxRate: 0.2, terminalGrowth: 0.02, shares: 1 };
  const direct = await call("/v1/finance/dcf-valuation", { ...base, wacc: 0.1 });
  assert.equal(direct.status, 200);
  assert.ok(Math.abs(direct.body.result.enterprise - 102) < 1e-9);
  assert.equal(direct.body.sensitivity.length, 5);
  const built = await call("/v1/finance/dcf-valuation", { ...base, riskFree: 0.03, beta: 1, marketPremium: 0.06, preTaxCostOfDebt: 0.05, debtWeight: 0 });
  assert.ok(Math.abs(built.body.wacc - 0.09) < 1e-12);
  const missing = await call("/v1/finance/dcf-valuation", base);
  assert.equal(missing.status, 400);
  const low = await call("/v1/finance/dcf-valuation", { ...base, wacc: 0.01 });
  assert.equal(low.status, 400);
});

test("unknown and missing inputs are refused", async () => {
  const unknown = await call("/v1/tax/kr/incorporation-conversion", { realEstateMarket: 1, realEstateCost: 0, holdYears: 1, typo: 1 });
  assert.equal(unknown.status, 400);
  assert.match(unknown.body.problems.join(), /typo: unknown input/);
  const size = await call("/v1/tax/kr/family-business-inheritance", { businessValue: 1, years: 10, size: "huge" });
  assert.equal(size.status, 400);
  const missing = await call("/v1/tax/kr/unlisted-share-valuation", {});
  assert.equal(missing.status, 400);
});
