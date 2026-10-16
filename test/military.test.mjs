import test from "node:test";
import assert from "node:assert/strict";
import { calculateMilitaryService } from "../src/modules/military.mjs";

test("calculateMilitaryService calculates army 18 months correctly", () => {
  // Enlistment: 2026-03-02
  // Discharge: 2027-09-01 (18 months - 1 day)
  const res = calculateMilitaryService({
    enlistmentDate: "2026-03-02",
    branch: "army",
    currentDate: "2026-09-02",
  });

  assert.equal(res.branch, "army");
  assert.equal(res.serviceMonths, 18);
  assert.equal(res.dischargeDate, "2027-09-01");
  assert.equal(res.totalDays, 549); // leap/non-leap day count
  assert.equal(res.servedDays, 185);
  assert.equal(res.remainingDays, 364);
  assert.equal(res.progressPercent, 33.7);
  assert.equal(res.currentRank, "일병");
  assert.equal(res.promotions.privateFirstClass, "2026-05-01");
  assert.equal(res.promotions.corporal, "2026-11-01");
  assert.equal(res.promotions.sergeant, "2027-05-01");
});

test("calculateMilitaryService calculates navy 20 months correctly", () => {
  const res = calculateMilitaryService({
    enlistmentDate: "2026-01-05",
    branch: "navy",
    currentDate: "2027-09-04",
  });

  assert.equal(res.branch, "navy");
  assert.equal(res.serviceMonths, 20);
  assert.equal(res.dischargeDate, "2027-09-04");
  assert.equal(res.remainingDays, 0);
  assert.equal(res.progressPercent, 100);
  assert.equal(res.currentRank, "전역");
});
