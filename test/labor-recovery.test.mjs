import test from "node:test";
import assert from "node:assert/strict";
import { calculateSeverancePay, calculateAnnualLeave } from "../src/modules/labor.mjs";
import worker from "../src/worker.mjs";

test("resignation date excluded and actual three calendar months used", () => {
  assert.equal(calculateSeverancePay({startDate:"2025-01-01",endDate:"2026-01-01"}).serviceDays,365);
  for(const [endDate,days] of [["2026-05-01",89],["2024-05-01",90],["2026-08-01",92]]) {
    const value=calculateSeverancePay({startDate:"2022-01-01",endDate,threeMonthSalary:9000000});
    assert.equal(value.threeMonthDays,days);
    assert.equal(value.dailyAverageWage,9000000/days);
  }
});
test("invalid employment dates rejected", () => {
  for(const endDate of ["2026-02-30","invalid","2024-12-31","2026-01-01T12:00:00Z"])
    assert.throws(()=>calculateSeverancePay({startDate:"2025-01-01",endDate}),RangeError);
});
test("first year requires actual perfect-attendance months", () => {
  assert.throws(()=>calculateAnnualLeave({yearsOfService:0.25}),RangeError);
  assert.equal(calculateAnnualLeave({yearsOfService:0.25,completedPerfectMonths:3}).statutoryLeaveDays,3);
});
test("HTTP passes perfect-attendance months and rejects omission", async () => {
  const base="https://api.oiyo.net/v1/labor/kr/annual-leave?yearsOfService=0.25";
  assert.equal((await worker.fetch(new Request(base))).status,400);
  const result=await worker.fetch(new Request(base+"&completedPerfectMonths=3"));
  assert.equal(result.status,200);
  assert.equal((await result.json()).statutoryLeaveDays,3);
});
