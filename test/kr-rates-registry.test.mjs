import test from "node:test";
import assert from "node:assert/strict";
import { koreaYear, minimumWageForYear } from "../src/modules/kr-rates-registry.mjs";
import { KR_RATES_2027 } from "../src/modules/kr-rates-2027.mjs";
import worker from "../src/worker.mjs";

test("verified minimum-wage vectors and unknown insurance remain separate", () => {
  const current = minimumWageForYear(2026), next = minimumWageForYear(2027);
  assert.equal(current.hourly, 10320);
  assert.equal(next.examples.eightHours, 85600);
  assert.equal(next.examples.month209Hours, 2236300);
  assert.equal(next.examples.month209Hours - current.examples.month209Hours, 79420);
  assert.equal(next.payrollSupported, false);
  assert.deepEqual(next.insurance, { value: null, absenceState: "not_collected", legalStatus: "unverified" });
  assert.equal(KR_RATES_2027.freelancerProposal.legalStatus, "proposal");
});

test("KST year rollover never invents a supported year", () => {
  assert.equal(koreaYear(new Date("2026-12-31T14:59:59Z")), 2026);
  assert.equal(koreaYear(new Date("2026-12-31T15:00:00Z")), 2027);
  for (const year of [2025, 2028, null, "2027", NaN, Infinity, 2027.1]) assert.throws(() => minimumWageForYear(year));
});

test("public minimum-wage endpoint refuses invalid years and keeps source metadata", async () => {
  const path = "https://api.oiyo.net/v1/labor/kr/minimum-wage";
  const response = await worker.fetch(new Request(path + "?year=2027"));
  assert.equal(response.status, 200);
  const implicit = await worker.fetch(new Request(path));
  assert.equal(implicit.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), minimumWageForYear(2027));
  for (const year of ["", "2028", "2027.5", "NaN", "Infinity"]) {
    assert.equal((await worker.fetch(new Request(path + "?year=" + year))).status, 400);
  }
  assert.equal((await worker.fetch(new Request(path, { method: "POST" }))).status, 405);
});

test("partial official insurance evidence cannot enable 2027 payroll or enact a proposal", () => {
  const next = minimumWageForYear(2027);
  assert.equal(next.insuranceEvidence.complete, false);
  assert.equal(next.insuranceEvidence.nationalPension.employee, 0.05);
  assert.equal(next.insuranceEvidence.nationalPension.total, 0.10);
  assert.equal(next.insuranceEvidence.healthInsurance.total, 0.0719);
  assert.equal(next.insuranceEvidence.healthInsurance.status, "decision_announced");
  assert.ok(next.insuranceEvidence.unresolved.includes("longTermCare"));
  assert.equal(next.insurance.value, null);
  assert.equal(next.payrollSupported, false);
  assert.equal(KR_RATES_2027.freelancerProposal.legalStatus, "proposal");
  assert.equal(Object.hasOwn(minimumWageForYear(2026), "insuranceEvidence"), false);
});
