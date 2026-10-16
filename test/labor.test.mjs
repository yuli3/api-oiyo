import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateUnemploymentBenefits,
  calculateWeeklyAllowance,
  calculateOvertimePay,
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
  assert.equal(res.dailyBenefit, 64192); // 10030 * 0.8 * 8
  assert.equal(res.totalBenefit, 64192 * 120);
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
  assert.equal(res.dailyBenefit, 66000); // 66000 cap
  assert.equal(res.totalBenefit, 66000 * 270);
});

test("calculateWeeklyAllowance calculates correct hours and wages", () => {
  // 20 hours/week, 10,030 KRW/hr
  const res = calculateWeeklyAllowance({
    hourlyWage: 10030,
    weeklyHours: 20,
    taxType: "none",
  });

  assert.equal(res.isEligible, true);
  assert.equal(res.allowanceHours, 4); // (20/40) * 8
  assert.equal(res.weeklyAllowance, 40120);
  assert.equal(res.baseWeeklyWage, 200600);
  assert.equal(res.totalWeeklyWage, 240720);
});

test("calculateWeeklyAllowance returns zero allowance when under 15 hours", () => {
  const res = calculateWeeklyAllowance({
    hourlyWage: 10030,
    weeklyHours: 12,
  });

  assert.equal(res.isEligible, false);
  assert.equal(res.allowanceHours, 0);
  assert.equal(res.weeklyAllowance, 0);
  assert.equal(res.totalWeeklyWage, 12 * 10030);
});

test("calculateOvertimePay computes correct 1.5x overtime and 0.5x night premiums", () => {
  const res = calculateOvertimePay({
    hourlyWage: 10000, // normalized for testing
    overtimeHours: 4,  // 4 * 10000 * 1.5 = 60000
    nightHours: 2,     // 2 * 10000 * 0.5 = 10000
    holidayHours8orLess: 8, // 8 * 10000 * 1.5 = 120000
    holidayHoursOver8: 2,   // 2 * 10000 * 2.0 = 40000
  });

  assert.equal(res.baseHourlyWage, 10030); // min wage clamp 10030
  // With 10030:
  // overtime: 4 * 10030 * 1.5 = 60180
  // night: 2 * 10030 * 0.5 = 10030
  // hol8: 8 * 10030 * 1.5 = 120360
  // holOver: 2 * 10030 * 2.0 = 40120
  // total: 60180 + 10030 + 120360 + 40120 = 230690
  assert.equal(res.overtime.pay, 60180);
  assert.equal(res.night.pay, 10030);
  assert.equal(res.holiday.payUnder8, 120360);
  assert.equal(res.holiday.payOver8, 40120);
  assert.equal(res.totalExtraPay, 230690);
});

