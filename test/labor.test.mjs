import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateUnemploymentBenefits,
  calculateWeeklyAllowance,
  calculateOvertimePay,
  calculateNetSalary,
  calculateSeverancePay,
  calculateAnnualLeave,
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
  assert.equal(res.dailyBenefit, 66048); // 10320 * 0.8 * 8
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
  assert.equal(res.dailyBenefit, 68100); // 68100 cap (2026)
  assert.equal(res.totalBenefit, 68100 * 270);
});

test("calculateWeeklyAllowance calculates correct hours and wages", () => {
  // 20 hours/week, 10,320 KRW/hr
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
  assert.equal(res.totalWeeklyWage, 12 * 10320);
});

test("calculateOvertimePay computes correct 1.5x overtime and 0.5x night premiums", () => {
  const res = calculateOvertimePay({
    hourlyWage: 10000, // normalized for testing
    overtimeHours: 4,  // 4 * 10320 * 1.5 = 61920
    nightHours: 2,     // 2 * 10320 * 0.5 = 10320
    holidayHours8orLess: 8, // 8 * 10320 * 1.5 = 123840
    holidayHoursOver8: 2,   // 2 * 10320 * 2.0 = 41280
  });

  assert.equal(res.baseHourlyWage, 10320); // min wage clamp 10320
  // With 10320:
  // overtime: 4 * 10320 * 1.5 = 61920
  // night: 2 * 10320 * 0.5 = 10320
  // hol8: 8 * 10320 * 1.5 = 123840
  // holOver: 2 * 10320 * 2.0 = 41280
  // total: 61920 + 10320 + 123840 + 41280 = 237360
  assert.equal(res.overtime.pay, 61920);
  assert.equal(res.night.pay, 10320);
  assert.equal(res.holiday.payUnder8, 123840);
  assert.equal(res.holiday.payOver8, 41280);
  assert.equal(res.totalExtraPay, 237360);
});

test("calculateNetSalary computes 4 major insurances and progressive tax", () => {
  const res = calculateNetSalary({
    salary: 3500000,
    isAnnual: false,
    nonTaxable: 200000,
    dependents: 1,
  });

  assert.equal(res.year, 2026);
  assert.equal(res.grossMonthly, 3500000);
  assert.equal(res.taxable, 3300000);
  // Pension: 3300000 * 0.045 = 148500
  assert.equal(res.insurances.nationalPension, 148500);
  // Health (2026: 3.595%): 3300000 * 0.03595 = 118635
  assert.equal(res.insurances.healthInsurance, 118635);
  // Care (2026: 13.14%): 118635 * 0.1314 = 15588.639 -> 15589
  assert.equal(res.insurances.longTermCare, 15589);
  // Emp: 3300000 * 0.009 = 29700
  assert.equal(res.insurances.employmentInsurance, 29700);
  assert.ok(res.netPayMonthly > 2900000 && res.netPayMonthly < 3200000);
  assert.ok(res.deductionRatePercentage > 8 && res.deductionRatePercentage < 20);
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
  const firstYear = calculateAnnualLeave({ yearsOfService: 0.5, unusedDays: 5 });
  assert.equal(firstYear.statutoryLeaveDays, 11);
  assert.equal(firstYear.unusedLeaveAllowance, 5 * 10320 * 8);

  const thirdYear = calculateAnnualLeave({ yearsOfService: 3, unusedDays: 10 });
  assert.equal(thirdYear.statutoryLeaveDays, 16); // 15 + floor(2/2) = 16
  assert.equal(thirdYear.unusedLeaveAllowance, 10 * 10320 * 8);
});


