import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCAGR, calculateCompoundInterest } from "../src/modules/finance.mjs";

test("calculateCAGR computes correct growth rate and doubling time", () => {
  // 10M to 20M in 5 years => CAGR ≈ 14.87%, total return 100%, Rule of 72 ≈ 4.84 years
  const res = calculateCAGR({
    initialValue: 10000000,
    finalValue: 20000000,
    years: 5,
  });

  assert.equal(res.initialValue, 10000000);
  assert.equal(res.finalValue, 20000000);
  assert.equal(res.years, 5);
  assert.equal(res.cagrPercent, 14.87);
  assert.equal(res.totalReturnPercent, 100.0);
  assert.equal(res.multiplier, 2.0);
  assert.ok(res.ruleOf72Years > 4.8 && res.ruleOf72Years < 4.9);
  assert.equal(res.annualBreakdown.length, 6); // year 0 to 5
  assert.equal(res.annualBreakdown[0].value, 10000000);
  assert.equal(res.annualBreakdown[5].value, 20000000);
});

test("calculateCAGR validates input boundaries", () => {
  assert.throws(() => calculateCAGR({ initialValue: 0, finalValue: 100, years: 1 }), /Initial value must be a positive number/);
  assert.throws(() => calculateCAGR({ initialValue: 100, finalValue: -5, years: 1 }), /Final value must be a non-negative number/);
  assert.throws(() => calculateCAGR({ initialValue: 100, finalValue: 200, years: 0 }), /Years must be a positive number/);
});

test("calculateCompoundInterest computes monthly compounding with contribution", () => {
  // Principal: 10M KRW, Rate: 7%, Years: 10, Monthly contribution: 500,000 KRW
  const res = calculateCompoundInterest({
    principal: 10000000,
    rate: 7,
    years: 10,
    monthlyContribution: 500000,
    compoundingFrequency: "monthly",
  });

  assert.equal(res.principal, 10000000);
  assert.equal(res.annualRatePercent, 7);
  assert.equal(res.years, 10);
  assert.equal(res.totalPrincipal, 10000000 + 500000 * 12 * 10); // 70M KRW
  assert.ok(res.finalBalance > res.totalPrincipal);
  assert.ok(res.totalInterest > 30000000); // compounding interest
  assert.equal(res.ruleOf72Years, 10.29);
  assert.equal(res.annualBreakdown.length, 11); // Year 0 to 10
});

test("calculateCompoundInterest computes annual compounding without contribution", () => {
  // Principal: 10M KRW, Rate: 10%, Years: 2, Annual compounding
  const res = calculateCompoundInterest({
    principal: 10000000,
    rate: 10,
    years: 2,
    monthlyContribution: 0,
    compoundingFrequency: "annually",
  });

  // 10M * 1.10 * 1.10 = 12.1M
  assert.equal(res.finalBalance, 12100000);
  assert.equal(res.totalInterest, 2100000);
  assert.equal(res.returnOnInvestmentPercent, 21.0);
});
