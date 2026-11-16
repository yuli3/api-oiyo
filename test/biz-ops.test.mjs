// Operating-problem endpoints (2026-11-16): formulas come from tools-oiyo biz-ops via scripts/sync-tools-tax.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

async function call(path, body) {
  const response = await worker.fetch(new Request(new URL(path, "https://api.oiyo.net"), { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }));
  return { status: response.status, body: await response.json() };
}

test("campaign supply and influencer deal", async () => {
  const c = await call("/v1/biz/campaign-supply", { demand: [100, 100, 300, 300, 100], openingStock: 100, capacityPerWeek: 150, leadTimeWeeks: 1 });
  assert.equal(c.status, 200);
  assert.equal(c.body.result.firstStockoutWeek, 4);
  assert.equal(c.body.result.extraPerWeek, 34);
  assert.ok(c.body.note && c.body.disclaimer);
  const i = await call("/v1/biz/influencer-deal", { fee: 3000000, views: 200000, clickRate: 0.02, conversionRate: 0.05, aov: 30000, grossMargin: 0.7, payee: "oneOff" });
  assert.equal(i.body.result.withholding, 264000);
  assert.ok(i.body.checklist.length >= 3);
  assert.equal((await call("/v1/biz/influencer-deal", { fee: 1, views: 1, clickRate: 2, conversionRate: 0, aov: 1, grossMargin: 0.5, payee: "freelancer" })).status, 400);
});

test("quality recovery, materials, big order", async () => {
  const q = await call("/v1/biz/quality-recovery", { lots: [{ id: "L1", units: 1000, defectRate: 0.1, shippedRatio: 0.5 }], recallCostPerUnit: 500, remakeCostPerUnit: 2000, goodStock: 600, customers: [{ name: "A", demand: 600, priority: 2, penaltyPerUnit: 1000 }, { name: "B", demand: 400, priority: 1, penaltyPerUnit: 200 }] });
  assert.equal(q.body.result.cheapestRule, "penalty");
  const m = await call("/v1/biz/alternative-materials", { currentPrice: 1000, annualVolume: 100000, candidates: [{ name: "X", unitPrice: 900, quality: 4, supply: 3, testWeeks: 6, testCost: 5000000 }], weights: { cost: 1, quality: 1, supply: 1, speed: 1 } });
  assert.equal(m.body.result.rows[0].paybackMonths, 6);
  const o = await call("/v1/biz/big-order", { capacity: 1000, existing: [{ name: "핵심", qty: 500, price: 100, unitCost: 60, penaltyPerUnit: 100, locked: true }], newOrder: { name: "대형", qty: 500, price: 110, unitCost: 60, minQty: 600 } });
  assert.equal(o.status, 400);
});

test("market test parts, rebates, acquisition", async () => {
  const t = await call("/v1/biz/market-test", { convA: 100, nA: 2000, convB: 140, nB: 2000 });
  assert.equal(t.status, 200);
  assert.equal(t.body.result.test.significantAt5pct, true);
  assert.equal(t.body.result.sampleSizePerGroup, null);
  assert.equal((await call("/v1/biz/market-test", {})).status, 400);
  assert.equal((await call("/v1/biz/market-test", { convA: 10, nA: 5, convB: 1, nB: 5 })).status, 400);
  const r = await call("/v1/biz/sales-rebates", { tiers: [{ from: 0, rate: 0.01 }, { from: 100000000, rate: 0.03 }], partners: [{ name: "D1", sales: 60000000, group: "G", related: true, paid: 1800000 }, { name: "D2", sales: 50000000, group: "G", related: true }, { name: "E", sales: 80000000, paid: 800000 }], aggregateGroups: false, armsLengthCheck: true });
  assert.ok(r.body.result.flags.some((f) => f.name === "D1" && f.level === "block"));
  assert.ok(r.body.result.taxNotes.some((n) => n.basis.includes("제29조")));
  const a = await call("/v1/biz/acquisition", { price: 10000, targetNetIncome: 1000, acquirerNetIncome: 5000, acquirerShares: 1000, sharePrice: 50, stockPortion: 0, debtRate: 0.05, taxRate: 0.2, synergy: 0, rampYears: 1, integrationCost: 0 });
  assert.equal(a.body.result.series[0].eps, 5.6);
  assert.ok(a.body.pmiTemplate.length >= 5);
});
