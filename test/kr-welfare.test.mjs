// Benefit and labor-rights endpoints (2026-11-16): formulas come from tools-oiyo kr-welfare-2026 via scripts/sync-tools-tax.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

async function call(path, body) {
  const response = await worker.fetch(new Request(new URL(path, "https://api.oiyo.net"), { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }));
  return { status: response.status, body: await response.json() };
}

test("근로·자녀장려금", async () => {
  const r = await call("/v1/benefits/kr/work-child-incentive", { household: "oneEarner", income: 20000000, assets: 100000000, children: 2 });
  assert.equal(r.status, 200);
  assert.equal(r.body.result.eitc, 1900000);
  assert.equal(r.body.result.ctc, 2000000);
  assert.ok(r.body.apply.length && r.body.basis.length && r.body.page.includes("work-child"));
  assert.equal((await call("/v1/benefits/kr/work-child-incentive", { household: "x", income: 1, assets: 0, children: 0 })).status, 400);
  assert.equal((await call("/v1/benefits/kr/work-child-incentive", { household: "single", income: 1, assets: 0, children: 1.5 })).status, 400);
});

test("출산휴가·대지급금", async () => {
  const m = await call("/v1/benefits/kr/maternity-leave-pay", { monthlyWage: 3000000, priorityFirm: false });
  assert.equal(m.status, 200);
  assert.equal(m.body.result.maternity.employerPay, 6000000);
  assert.equal(m.body.result.spouse.insurance, 0);
  const g = await call("/v1/labor/kr/wage-guarantee", { kind: "insolvency", age: 35, monthlyWage: 3500000, unpaidMonths: 5, unpaidSeverance: 17500000, serviceYears: 5 });
  assert.equal(g.body.result.total, 24800000);
});

test("산재·월세·퇴직연금", async () => {
  const i = await call("/v1/labor/kr/injury-leave-pay", { threeMonthWages: 13800000, calendarDays: 92, days: 30 });
  assert.equal(i.body.result.avgDailyWage, 150000);
  assert.equal(i.body.result.total, 3150000);
  assert.equal((await call("/v1/labor/kr/injury-leave-pay", { days: 30 })).status, 400);
  const r = await call("/v1/tax/kr/monthly-rent-credit", { income: 50000000, incomeType: "wage", monthlyRent: 600000, months: 12 });
  assert.equal(r.body.result.total, 1346400);
  const p = await call("/v1/labor/kr/retirement-pension-db-dc", { monthlyWage: 4000000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.06 });
  assert.equal(p.body.result.better, "dc");
  assert.ok(p.body.result.breakEvenReturn > 0.02 && p.body.result.breakEvenReturn < 0.06);
});
