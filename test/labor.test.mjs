import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateUnemploymentBenefits,
  calculateWeeklyAllowance,
  calculateOvertimePay,
  calculateNetSalary,
  calculateSeverancePay,
  calculateAnnualLeave,
  calculateParentalLeave,
} from "../src/modules/labor.mjs";


test("calculateUnemploymentBenefits applies floor when wage is low", () => {
  const res = calculateUnemploymentBenefits({
    monthlyWage: 1500000,
    ageGroup: "under",
    periodCode: "p1",
    hoursPerDay: 8,
  });

  assert.equal(res.year, 2026);
  assert.equal(res.scheduledDays, 120);
  assert.equal(res.limitType, "floor_applied");
  // Vectors from codex/labor-accuracy-20261017 (Codex): 2026 floor = 10,320 × 0.8 × 8.
  assert.equal(res.dailyBenefit, 66048);
  assert.equal(res.totalBenefit, 66048 * 120);
});

test("calculateUnemploymentBenefits applies cap when wage is high", () => {
  const res = calculateUnemploymentBenefits({
    monthlyWage: 6000000,
    ageGroup: "over",
    periodCode: "p5",
    hoursPerDay: 8,
  });

  assert.equal(res.scheduledDays, 270);
  assert.equal(res.limitType, "cap_applied");
  assert.equal(res.dailyBenefit, 68100); // 2026 cap
  assert.equal(res.totalBenefit, 68100 * 270);
});

test("calculateWeeklyAllowance calculates correct hours and wages", () => {
  // 2026 minimum hourly wage (vector ported from Codex labor-accuracy WIP).
  const res = calculateWeeklyAllowance({
    hourlyWage: 10320,
    weeklyHours: 20,
    taxType: "none",
  });

  assert.equal(res.isEligible, true);
  assert.equal(res.allowanceHours, 4); // (20/40) * 8
  assert.equal(res.weeklyAllowance, 41280);
  assert.equal(res.baseWeeklyWage, 206400);
  assert.equal(res.totalWeeklyWage, 247680);
});

test("calculateWeeklyAllowance returns zero allowance when under 15 hours", () => {
  const res = calculateWeeklyAllowance({
    hourlyWage: 10320,
    weeklyHours: 12,
  });

  assert.equal(res.isEligible, false);
  assert.equal(res.allowanceHours, 0);
  assert.equal(res.weeklyAllowance, 0);
  assert.equal(res.totalWeeklyWage, 123840);
});

test("calculateOvertimePay clamps below-minimum wages to 10,320 and applies premiums", () => {
  const res = calculateOvertimePay({
    hourlyWage: 10000,
    overtimeHours: 4,
    nightHours: 2,
    holidayHours8orLess: 8,
    holidayHoursOver8: 2,
  });

  assert.equal(res.baseHourlyWage, 10320);
  assert.equal(res.overtime.pay, 61920); // 4 × 10,320 × 1.5
  assert.equal(res.night.pay, 10320); // 2 × 10,320 × 0.5
  assert.equal(res.holiday.payUnder8, 123840); // 8 × 10,320 × 1.5
  assert.equal(res.holiday.payOver8, 41280); // 2 × 10,320 × 2.0
  assert.equal(res.totalExtraPay, 237360);
});

test("calculateNetSalary uses 2026 rates (audit S-1 vector: 월 350만, 비과세 20만)", () => {
  const res = calculateNetSalary({
    salary: 3500000,
    isAnnual: false,
    nonTaxable: 200000,
    dependents: 1,
  });

  assert.equal(res.year, 2026);
  assert.equal(res.ratesEffectiveFrom, "2026-01-01");
  assert.equal(res.grossMonthly, 3500000);
  assert.equal(res.taxable, 3300000);
  // Before (2025 rates): 148,500 / 116,985 / 15,150.
  assert.equal(res.insurances.nationalPension, 156750); // 3,300,000 × 9.5% = 313,500 → half
  assert.equal(res.insurances.healthInsurance, 118635); // 3,300,000 × 7.19% = 237,270 → half
  assert.equal(res.insurances.longTermCare, 15585); // 237,270 × 0.9448/7.19 = 31,178 → 31,170 → half
  assert.equal(res.insurances.employmentInsurance, 29700);
  assert.equal(res.taxes.isEstimate, true);
  assert.equal(res.taxes.incomeTax, 115170);
  assert.equal(res.taxes.localTax, 11510);
  assert.equal(res.netPayMonthly, 3052650);
});

test("calculateNetSalary pension bounds follow the pay month", () => {
  const july = calculateNetSalary({ salary: 8000000, nonTaxable: 0 });
  assert.equal(july.insurances.pensionBase, 6590000);
  assert.equal(july.insurances.nationalPension, 313025); // 6,590,000 × 9.5% = 626,050 → half
  const march = calculateNetSalary({ salary: 8000000, nonTaxable: 0, payMonth: "2026-03" });
  assert.equal(march.insurances.pensionBase, 6370000);
  assert.equal(march.insurances.nationalPension, 302575); // 6,370,000 × 9.5% = 605,150 → half
  const low = calculateNetSalary({ salary: 300000, nonTaxable: 0 });
  assert.equal(low.insurances.pensionBase, 410000);
});

test("calculateSeverancePay calculates standard 2 years severance", () => {
  const res = calculateSeverancePay({
    startDate: "2024-01-01",
    endDate: "2026-01-01",
    threeMonthSalary: 9000000, // 3M/mo
    annualBonus: 0,
    annualLeaveAllowance: 0,
    hourlyWage: 12000,
    dailyHours: 8,
  });

  assert.equal(res.year, 2026);
  assert.equal(res.isEligible, true);
  assert.ok(res.serviceDays >= 730);
  assert.ok(res.severancePay > 5500000 && res.severancePay < 6500000);
});

test("calculateSeverancePay returns zero when under 1 year", () => {
  const res = calculateSeverancePay({
    startDate: "2025-06-01",
    endDate: "2025-12-01",
    threeMonthSalary: 9000000,
  });

  assert.equal(res.isEligible, false);
  assert.equal(res.severancePay, 0);
});

test("calculateAnnualLeave determines statutory days based on service", () => {
  const firstYear = calculateAnnualLeave({ yearsOfService: 0.5, completedPerfectMonths: 6, unusedDays: 5 });
  assert.equal(firstYear.statutoryLeaveDays, 6);
  assert.equal(firstYear.unusedLeaveAllowance, 5 * 10320 * 8);

  const thirdYear = calculateAnnualLeave({ yearsOfService: 3, unusedDays: 10 });
  assert.equal(thirdYear.statutoryLeaveDays, 16); // 15 + floor(2/2) = 16
  assert.equal(thirdYear.unusedLeaveAllowance, 10 * 10320 * 8);
});

test("calculateParentalLeave pays in full with no deferred share (2025 reform, audit S-4)", () => {
  const general = calculateParentalLeave({ monthlyWage: 3000000, leaveMonths: 12 });
  assert.equal(general.totalBenefit, 23100000); // 250만×3 + 200만×3 + 160만×6
  assert.equal(general.totalDeferred, 0); // before: 5,775,000 shown as 사후지급
  assert.equal(general.totalUpfront, 23100000);

  const sixPlusSix = calculateParentalLeave({ monthlyWage: 5000000, leaveMonths: 6, isParental6Plus6: true });
  assert.deepEqual(sixPlusSix.monthlyBreakdown.map((m) => m.grossAmount), [2500000, 2500000, 3000000, 3500000, 4000000, 4500000]);
  // before: first month 2,000,000

  const lowWage = calculateParentalLeave({ monthlyWage: 600000, leaveMonths: 1 });
  assert.equal(lowWage.totalBenefit, 700000); // 하한 70만
});
