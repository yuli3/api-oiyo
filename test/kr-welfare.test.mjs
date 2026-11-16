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

test("통상임금·포괄임금 점검 (2차)", async () => {
  const o = await call("/v1/labor/kr/ordinary-wage", { basePay: 2500000, fixedAllowances: 300000, bonusAnnual: 6000000, bonusConditional: true, overtime: 20, night: 0, holiday: 0 });
  assert.equal(o.status, 200);
  assert.equal(o.body.result.hourly, 15789);
  assert.equal(o.body.result.hourlyBefore, 13397);
  assert.ok(o.body.page.includes("ordinary-wage"));
  const f = await call("/v1/labor/kr/fixed-overtime-check", { basePay: 2508000, fixedOtPay: 300000, overtime: 30, night: 8, holiday: 8 });
  assert.equal(f.body.result.shortMonthly, 432000);
  assert.equal(f.body.result.shortTotal, 432000 * 36);
});

test("종부세·주택임대소득세 (2차)", async () => {
  const c = await call("/v1/tax/kr/comprehensive-real-estate-tax", { prices: [1500000000], oneHouse: true });
  assert.equal(c.status, 200);
  assert.equal(c.body.result.totalTax, 691200);
  assert.equal((await call("/v1/tax/kr/comprehensive-real-estate-tax", { prices: [1e9, 1e9, 1e9], oneHouse: false })).body.result.rawTax, 10800000);
  assert.equal((await call("/v1/tax/kr/comprehensive-real-estate-tax", { prices: [], oneHouse: true })).status, 400);
  const r = await call("/v1/tax/kr/housing-rental-income-tax", { houses: 2, annualRent: 12000000, deposits: 0, registered: true, otherIncome: 50000000 });
  assert.equal(r.body.result.separateTax, 739200);
  assert.equal((await call("/v1/tax/kr/housing-rental-income-tax", { houses: 3, annualRent: 12000000, deposits: 800000000, registered: false, otherIncome: 10000000 })).body.result.deemed, 9300000);
});

test("노인장기요양 본인부담 (3차)", async () => {
  const h = await call("/v1/benefits/kr/long-term-care-copay", { grade: "3", kind: "home", reduction: "none" });
  assert.equal(h.status, 200);
  assert.equal(h.body.result.copay, 229230);
  const f = await call("/v1/benefits/kr/long-term-care-copay", { grade: "1", kind: "facility", reduction: "none", days: 30, dailyExtra: 15000 });
  assert.equal(f.body.result.total, 558420 + 450000);
  assert.equal((await call("/v1/benefits/kr/long-term-care-copay", { grade: "6", kind: "home", reduction: "none" })).status, 400);
});

test("부양가족 공제 판정과 대주주 양도세 (4차)", async () => {
  const d = await call("/v1/tax/kr/dependent-deduction", { salary: 50000000, married: true, people: [
    { relation: "spouse", birthYear: 1990, wage: 5000000 },
    { relation: "child", birthYear: 2015 },
    { relation: "parent", birthYear: 1967 },
    { relation: "sibling", birthYear: 2010, livingTogether: false },
  ] });
  assert.equal(d.status, 200);
  assert.deepEqual(d.body.result.verdicts.map((v) => v.status), ["ok", "ok", "age", "living"]);
  assert.equal(d.body.result.creditChildren, 1);
  assert.ok(d.body.result.saving > 0);
  assert.equal((await call("/v1/tax/kr/dependent-deduction", { salary: 50000000, people: [{ relation: "uncle", birthYear: 1950 }] })).status, 400);
  const m = await call("/v1/tax/kr/stock-major-shareholder", { market: "kospi", heldValue: 6000000000, gain: 500000000, overOneYear: true });
  assert.equal(m.status, 200);
  assert.equal(m.body.result.total, 120312500);
  const n = await call("/v1/tax/kr/stock-major-shareholder", { market: "kosdaq", heldValue: 1000000000, heldShare: 0.01, gain: 100000000 });
  assert.equal(n.body.result.isMajor, false);
  assert.equal(n.body.result.total, 0);
});

test("노동권 묶음 A: 해고예고·휴업·육아기 단축·수습·연차 촉진", async () => {
  const d = await call("/v1/labor/kr/dismissal-notice-pay", { monthlyOrdinaryWage: 2090000, noticeDays: 10, tenureMonths: 12 });
  assert.equal(d.status, 200);
  assert.equal(d.body.result.amount, 2400000);
  const s = await call("/v1/labor/kr/shutdown-allowance", { threeMonthWages: 9200000, monthlyOrdinaryWage: 3650000, shutdownDays: 10 });
  assert.equal(s.body.result.minimum, 700000);
  const r = await call("/v1/benefits/kr/reduced-hours-childcare-pay", { monthlyOrdinaryWage: 3000000, afterHours: 20 });
  assert.equal(r.body.result.benefit, 1025000);
  const p = await call("/v1/labor/kr/probation-minimum-wage", { hourlyWage: 9300, contractMonths: 6, monthsIntoProbation: 1, simpleLabor: false });
  assert.equal(p.body.result.minimum, 10320);
  const l = await call("/v1/labor/kr/annual-leave-promotion", { kind: "annual", periodEnd: "2026-12-31" });
  assert.equal(l.status, 200);
  assert.deepEqual(l.body.result.steps.map((x) => x.due), ["2026-07-10", "2026-07-20", "2026-10-31", "2026-12-31"]);
  assert.equal((await call("/v1/labor/kr/annual-leave-promotion", { kind: "annual", periodEnd: "2026-13-45" })).status, 400);
});

test("자진퇴사 정당 사유와 하도급 직접 지급", async () => {
  const q = await call("/v1/labor/kr/voluntary-quit-unemployment", { reasons: ["unpaidWages", "commute"], months: 2, commuteHours: 2, insuredDays: 200 });
  assert.equal(q.status, 200);
  assert.equal(q.body.result.verdict, "likely");
  assert.deepEqual(q.body.result.results.map((r) => r.ok), [true, false]);
  assert.equal((await call("/v1/labor/kr/voluntary-quit-unemployment", { reasons: ["quitForFun"], insuredDays: 200 })).status, 400);
  const d = await call("/v1/business/kr/subcontract-direct-payment", { cause: "twoMissed", missedInstallments: 2, requested: true, workValue: 50000000, receivedFromPrime: 10000000, ownerUnpaidToPrime: 30000000, daysSinceDelivery: 125 });
  assert.equal(d.body.result.direct, 30000000);
  assert.equal(d.body.result.lateInterest, Math.floor((40000000 * 0.155 * 65) / 365));
});

test("가족 차용·무상 거주·저가 양수도·상가 임대료", async () => {
  const l = await call("/v1/tax/kr/family-loan-interest", { principal: 300000000, rate: 0 });
  assert.equal(l.status, 200);
  assert.equal(l.body.result.gift, 13800000);
  assert.equal(l.body.result.zeroRateMaxPrincipal, 217391304);
  assert.equal((await call("/v1/tax/kr/family-loan-interest", { principal: 300000000, rate: 2 })).status, 400);
  const u = await call("/v1/tax/kr/parent-house-free-use", { propertyValue: 1500000000, coResiding: true });
  assert.equal(u.body.result.useTaxable, false);
  const s = await call("/v1/tax/kr/family-low-price-sale", { marketValue: 1100000000, price: 700000000 });
  assert.equal(s.body.result.gift, 100000000);
  assert.equal(s.body.result.sellerRecalc, true);
  const c = await call("/v1/lease/kr/commercial-rent-increase", { region: "seoul", deposit: 100000000, monthlyRent: 5000000, newDeposit: 100000000, newMonthlyRent: 5300000, monthsSinceLast: 24 });
  assert.equal(c.body.result.verdict, "over");
  assert.equal(c.body.result.maxRent, 5250000);
  assert.equal((await call("/v1/lease/kr/commercial-rent-increase", { region: "mars", deposit: 1, monthlyRent: 1, newDeposit: 1, newMonthlyRent: 1, monthsSinceLast: 1 })).status, 400);
});
