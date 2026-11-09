import test from "node:test";
import assert from "node:assert/strict";
import { calculateAnnualLeave } from "../src/modules/labor.mjs";

test("annual leave keeps old result and lists unknown criteria by default", () => {
  const r = calculateAnnualLeave({ yearsOfService: 3 });
  assert.equal(r.statutoryLeaveDays, 16);
  assert.equal(r.eligibility.status, "review_required");
  assert.equal(r.eligibility.isFinalDecision, false);
  assert.equal(r.eligibility.unassessedCriteria.length, 3);
});

test("under-5 workplace or below-15 weekly hours give 0 days (Art. 18(3), Decree Annex 1)", () => {
  for (const extra of [{ workplaceSize: "under_5" }, { weeklyHoursCondition: "below_15" }]) {
    const r = calculateAnnualLeave({ yearsOfService: 5, ...extra });
    assert.equal(r.statutoryLeaveDays, 0);
    assert.equal(r.eligibility.status, "conditions_not_met");
  }
  const first = calculateAnnualLeave({ yearsOfService: 0.5, completedPerfectMonths: 6, workplaceSize: "under_5" });
  assert.equal(first.statutoryLeaveDays, 0);
});

test("below-80% attendance gives one day per perfect month without the long-service bonus (Art. 60(2))", () => {
  const r = calculateAnnualLeave({ yearsOfService: 5, attendanceCondition: "below_80", completedPerfectMonths: 7, workplaceSize: "5_or_more", weeklyHoursCondition: "at_least_15" });
  assert.equal(r.statutoryLeaveDays, 7);
  assert.equal(r.eligibility.status, "self_confirmed");
  assert.throws(() => calculateAnnualLeave({ yearsOfService: 5, attendanceCondition: "below_80" }), RangeError);
});

test("all criteria confirmed returns the full entitlement", () => {
  const r = calculateAnnualLeave({ yearsOfService: 21, workplaceSize: "5_or_more", weeklyHoursCondition: "at_least_15", attendanceCondition: "at_least_80" });
  assert.equal(r.statutoryLeaveDays, 25);
  assert.equal(r.eligibility.status, "self_confirmed");
  assert.deepEqual(r.eligibility.unassessedCriteria, []);
  assert.equal(calculateAnnualLeave({ yearsOfService: 0.5, completedPerfectMonths: 2, workplaceSize: "5_or_more", weeklyHoursCondition: "at_least_15" }).eligibility.attendanceCondition, "not_applicable");
});

test("invalid enum values are rejected", () => {
  assert.throws(() => calculateAnnualLeave({ workplaceSize: "big" }), RangeError);
  assert.throws(() => calculateAnnualLeave({ weeklyHoursCondition: "yes" }), RangeError);
  assert.throws(() => calculateAnnualLeave({ attendanceCondition: "80" }), RangeError);
});
